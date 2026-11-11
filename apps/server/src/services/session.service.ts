import { db } from "../db/index.js";
import { sessions, users } from "../db/schema/index.js";
import { and, eq, isNull } from "drizzle-orm";
import type { CurrentUser } from "../types/auth.types.js";
import { generateToken, hashToken } from "../utils/Auth.js";
import { cacheDel, cacheGet, cacheSet } from "../cache/redis.js";

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// How long a valid session stays cached in Redis. Also the longest a session
// could keep working if a cache delete is ever missed, so keep it short.
const SESSION_CACHE_TTL_S = 60;

type CachedSession = { user: CurrentUser; expiresAt: number };

// Keyed by the token HASH: the raw token never leaves this process.
const sessionKey = (tokenHash: string) => `session:${tokenHash}`;

// Session tokens are 32 random bytes encoded as base64url.
export const SESSION_TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;
export const SESSION_COOKIE = "session";

type CreateSessionResult = {
    token: string;
    expiresAt: Date;
};

export async function getSessionUser(token: string): Promise<CurrentUser | null> {
    const tokenHash = hashToken(token);

    // 1. Cache hit: no Postgres query.
    const cached = await cacheGet<CachedSession>(sessionKey(tokenHash));
    if (cached && cached.expiresAt > Date.now()) return cached.user;

    // 2. Cache miss (or Redis down): check the session in Postgres.
    const [session] = await db
        .select({
            user: { id: users.id, name: users.name, email: users.email },
            expiresAt: sessions.expiresAt,
            revokedAt: sessions.revokedAt,
            isActive: users.isActive,
        })
        .from(sessions)
        .innerJoin(users, eq(sessions.userId, users.id))
        .where(eq(sessions.tokenHash, tokenHash))
        .limit(1);

    if (!session || session.revokedAt !== null ||
        session.expiresAt.getTime() <= Date.now() || !session.isActive) {
        // Invalid sessions are never cached, so random tokens can't fill Redis.
        return null;
    }

    // 3. Cache it, but never past the session's own expiry.
    const expiresAt = session.expiresAt.getTime();
    const ttl = Math.min(SESSION_CACHE_TTL_S, Math.floor((expiresAt - Date.now()) / 1000));
    await cacheSet(sessionKey(tokenHash), { user: session.user, expiresAt } satisfies CachedSession, ttl);

    return session.user;
}

export async function createSession(
    userId: string,
    userAgent?: string,
): Promise<CreateSessionResult> {
    const token = generateToken();

    const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

    await db.insert(sessions).values({
        userId,
        tokenHash: hashToken(token),
        expiresAt,
        userAgent: userAgent?.slice(0, 512) ?? null,
    });

    return { token, expiresAt };
}

// Marks the session revoked so the token stops working even if a copy of the
// cookie survives somewhere. Unknown or already-revoked tokens are a no-op.
export async function revokeSession(token: string): Promise<void> {
    const tokenHash = hashToken(token);
    await db
        .update(sessions)
        .set({ revokedAt: new Date() })
        .where(and(eq(sessions.tokenHash, tokenHash), isNull(sessions.revokedAt)));
    // Database first, then cache, so a request in between can't re-cache it as valid.
    await cacheDel(sessionKey(tokenHash));
}

// Call when a user is deactivated, changes their password, or logs out
// everywhere. Postgres already lists every session of a user, so Redis
// needs no extra per-user index.
export async function clearUserSessionsFromCache(userId: string): Promise<void> {
    const rows = await db
        .select({ tokenHash: sessions.tokenHash })
        .from(sessions)
        .where(eq(sessions.userId, userId));
    await cacheDel(...rows.map((row) => sessionKey(row.tokenHash)));
}
