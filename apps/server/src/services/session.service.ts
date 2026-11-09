import { db } from "../db/index.js";
import { sessions } from "../db/schema/index.js";
import { generateToken, hashToken } from "../utils/Auth.js";

type CreateSessionResult = {
    token: string;
    expiresAt: Date;
};

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
