import { createClient } from "redis";
import { env } from "../config/env.js";

type RedisClient = ReturnType<typeof createClient>;

// null when REDIS_URL isn't set, which turns every cache call into a no-op.
const client: RedisClient | null = env.REDIS_URL
    ? createClient({
          url: env.REDIS_URL,
          // Fail fast instead of queueing commands while Redis is down,
          // so requests fall back to Postgres immediately.
          disableOfflineQueue: true,
          socket: {
              connectTimeout: 2_000,
              reconnectStrategy: (retries) => Math.min(retries * 200, 5_000),
          },
      })
    : null;

// Without an error listener, a Redis outage would crash the process.
// Log only the first error of an outage so a down Redis doesn't flood the logs.
let loggedOutage = false;
client?.on("error", (err: Error) => {
    if (!loggedOutage) console.error("Redis error:", err.message);
    loggedOutage = true;
});
client?.on("ready", () => {
    if (loggedOutage) console.log("Redis reconnected");
    loggedOutage = false;
});

// Redis is a cache, not a requirement: if it's down at startup the server
// still starts and the client keeps retrying in the background.
export async function connectRedis(): Promise<void> {
    if (!client) return;
    client.connect().then(
        () => console.log("Connected to Redis"),
        (err: Error) => console.error("Redis unavailable, continuing without cache:", err.message),
    );
}

export async function closeRedis(): Promise<void> {
    if (client?.isOpen) await client.close();
}

// The helpers below never throw. If Redis is down they behave like a cache
// miss, and the caller goes to Postgres as if there were no cache.

export async function cacheGet<T>(key: string): Promise<T | null> {
    if (!client?.isReady) return null;
    try {
        const raw = await client.get(key);
        return raw ? (JSON.parse(raw) as T) : null;
    } catch {
        return null;
    }
}

export async function cacheSet(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    if (!client?.isReady || ttlSeconds <= 0) return;
    try {
        await client.set(key, JSON.stringify(value), { expiration: { type: "EX", value: ttlSeconds } });
    } catch {
        // A failed cache write is harmless: the next read just misses.
    }
}

export async function cacheDel(...keys: string[]): Promise<void> {
    if (!client?.isReady || keys.length === 0) return;
    try {
        await client.del(keys);
    } catch {
        // The entry expires on its own; that's why cache TTLs are kept short.
    }
}
