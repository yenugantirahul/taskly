import { db } from "../db/index.js";
import { users, passwordCredentials, emailVerificationTokens } from "../db/schema.js";
import { AppError } from "../utils/AppError.js";
import { generateToken, hashToken } from "../utils/Auth.js";
import { RegisterInput } from "../validators/auth.schema.js";
import { hash } from "@node-rs/argon2"; // or bcrypt

export async function registerUser(input: RegisterInput) {
  const passwordHash = await hash(input.password);
  const token = generateToken();

  try {
    return await db.transaction(async (tx) => {
      const [user] = await tx
        .insert(users)
        .values({ name: input.name, email: input.email })
        .returning({ id: users.id, email: users.email, name: users.name });

      await tx
        .insert(passwordCredentials)
        .values({ userId: user.id, passwordHash });

      await tx.insert(emailVerificationTokens).values({
        userId: user.id,
        email: user.email,
        tokenHash: hashToken(token),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      });

      return user;
    });
  } catch (err: any) {
    if (err?.code === "23505")
      throw new AppError(409, "EMAIL_TAKEN", "Email already registered");
    throw err;
  }
}


