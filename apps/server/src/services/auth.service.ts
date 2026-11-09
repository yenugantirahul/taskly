import { db } from "../db/index.js";
import { users, passwordCredentials, emailVerificationTokens } from "../db/schema/index.js";
import { AppError } from "../utils/AppError.js";
import { generateToken, hashToken } from "../utils/Auth.js";
import { LoginInput, RegisterInput } from "../validators/auth.schema.js";
import { hash } from "@node-rs/argon2"; // or bcrypt
import { sendVerificationEmail } from "./email.service.js";
import { and, eq, gt, isNull, sql } from "drizzle-orm";
import { RegisterResult } from "../types/auth.types.js";
import { verify } from "@node-rs/argon2";
import { createSession } from "./session.service.js";

const VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours



export async function registerUser(input: RegisterInput): Promise<RegisterResult> {
  const passwordHash = await hash(input.password);
  const token = generateToken();

  let user;

  try {
    user = await db.transaction(async (tx) => {
      const [existing] = await tx
        .select({
          id: users.id,
          emailVerifiedAt: users.emailVerifiedAt,
        })
        .from(users)
        .where(eq(sql`lower(${users.email})`, input.email.toLowerCase()))
        .for("update");

      if (existing?.emailVerifiedAt) {
        throw new AppError(409, "EMAIL_TAKEN", "Email already registered");
      }

      // Create a new user or update an unverified user
      const [user] = existing
        ? await tx
          .update(users)
          .set({ name: input.name })
          .where(eq(users.id, existing.id))
          .returning({
            id: users.id,
            email: users.email,
            name: users.name,
          })
        : await tx
          .insert(users)
          .values({ name: input.name, email: input.email })
          .returning({
            id: users.id,
            email: users.email,
            name: users.name,
          });

      // Create or replace password credentials
      await tx
        .insert(passwordCredentials)
        .values({ userId: user.id, passwordHash })
        .onConflictDoUpdate({
          target: passwordCredentials.userId,
          set: { passwordHash, passwordChangedAt: new Date() },
        });

      // Invalidate previous verification tokens
      if (existing) {
        await tx
          .delete(emailVerificationTokens)
          .where(eq(emailVerificationTokens.userId, user.id));
      }

      // Generate a fresh verification record
      await tx.insert(emailVerificationTokens).values({
        userId: user.id,
        email: user.email,
        tokenHash: hashToken(token),
        expiresAt: new Date(Date.now() + VERIFICATION_TTL_MS),
      });

      return user;
    });
  } catch (err: any) {
    if ((err?.cause?.code ?? err?.code) === "23505") {
      throw new AppError(409, "EMAIL_TAKEN", "Email already registered");
    }
    throw err;
  }

  await sendVerificationEmail(input.email, token);
  return user;
}




export async function verifyEmail(token: string): Promise<void> {
  const tokenHash = hashToken(token);

  await db.transaction(async (tx) => {
    // Delete only a matching, unexpired token.
    // RETURNING gives us the record that was consumed.
    const [verification] = await tx
      .delete(emailVerificationTokens)
      .where(
        and(
          eq(emailVerificationTokens.tokenHash, tokenHash),
          gt(emailVerificationTokens.expiresAt, new Date()),
        ),
      )
      .returning({
        userId: emailVerificationTokens.userId,
        email: emailVerificationTokens.email,
      });

    if (!verification) {
      throw new AppError(
        400,
        "INVALID_VERIFICATION_TOKEN",
        "This verification link is invalid or has expired.",
      );
    }

    const [verifiedUser] = await tx
      .update(users)
      .set({ emailVerifiedAt: new Date() })
      .where(
        and(
          eq(users.id, verification.userId),
          eq(users.email, verification.email),
          eq(users.isActive, true),
          isNull(users.emailVerifiedAt),
        ),
      )
      .returning({ id: users.id });

    if (!verifiedUser) {
      throw new AppError(
        400,
        "INVALID_VERIFICATION_TOKEN",
        "This verification link is no longer valid.",
      );
    }
  });
}



export async function login(input: LoginInput) {
  const [user] = await db.select().from(users).where(eq(users.email, input.email));
  if (!user) {
    throw new AppError(
      400,
      "EMAIL_INVALID",
      "User with this email does not exists",
    );
  }

  const [credentials] = await db.select()
    .from(passwordCredentials)
    .where(eq(passwordCredentials.userId, user.id)).limit(1)


  if (!credentials || !(await verify(credentials.passwordHash, input.password))) {
    throw new AppError(
      401,
      "INVALID_CREDENTIALS",
      "Invalid email or password",
    );
  }

  const session = await createSession(user.id)

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    },
    session,
  }
}
