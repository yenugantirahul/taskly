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
import { createSession, revokeSession } from "./session.service.js";

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



// Hash compared against when the email is unknown, so a missing account takes
// as long to reject as a wrong password and response timing can't reveal
// which emails are registered.
// Computed on first use so importing this module stays cheap.
let dummyPasswordHash: Promise<string> | undefined;
function getDummyPasswordHash(): Promise<string> {
  return (dummyPasswordHash ??= hash(generateToken()));
}

function invalidCredentials(): AppError {
  return new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password");
}

export async function login(input: LoginInput, meta: { userAgent?: string } = {}) {
  const [account] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      isActive: users.isActive,
      emailVerifiedAt: users.emailVerifiedAt,
      passwordHash: passwordCredentials.passwordHash,
    })
    .from(users)
    .leftJoin(passwordCredentials, eq(passwordCredentials.userId, users.id))
    .where(eq(sql`lower(${users.email})`, input.email.toLowerCase()))
    .limit(1);

  let passwordOk = false;
  if (account?.passwordHash) {
    passwordOk = await verify(account.passwordHash, input.password);
  } else {
    await verify(await getDummyPasswordHash(), input.password);
  }

  // Unknown email, missing credentials and wrong password all look the same.
  if (!account || !passwordOk || !account.isActive) {
    throw invalidCredentials();
  }

  // Only reveal verification status once the password is proven correct.
  if (!account.emailVerifiedAt) {
    throw new AppError(
      403,
      "EMAIL_NOT_VERIFIED",
      "Please verify your email before signing in. Check your inbox for the link.",
    );
  }

  const session = await createSession(account.id, meta.userAgent);

  return {
    user: { id: account.id, name: account.name, email: account.email },
    session,
  };
}

export async function logout(token: string): Promise<void> {
  await revokeSession(token);
}
