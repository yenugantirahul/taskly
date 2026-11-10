import { db } from "../db/index.js";
import { sessions, users } from "../db/schema/index.js";
import { eq } from "drizzle-orm";
import type { CurrentUser } from "../types/auth.types.js";
import { generateToken, hashToken } from "../utils/Auth.js";

type CreateSessionResult = {
    token: string;
    expiresAt: Date;
};

export async function getSessionUser(token: string): Promise<CurrentUser | null> {
    const [session] = await db
        .select({
            user: { id: users.id, name: users.name, email: users.email },
            expiresAt: sessions.expiresAt,
            revokedAt: sessions.revokedAt,
            isActive: users.isActive,
        })
        .from(sessions)
        .innerJoin(users, eq(sessions.userId, users.id))
        .where(eq(sessions.tokenHash, hashToken(token)))
        .limit(1);

    if (!session || session.revokedAt !== null ||
        session.expiresAt.getTime() <= Date.now() || !session.isActive) {
        return null;
    }

    return session.user;
}

export async function createSession(
    userId: string,
): Promise<CreateSessionResult> {
    const token = generateToken();

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await db.insert(sessions).values({
        userId,
        tokenHash: hashToken(token),
        expiresAt,
    });

    return { token, expiresAt };
}
