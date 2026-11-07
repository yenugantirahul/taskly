import { db } from "../db/index.js";
import { users, passwordCredentials } from "../db/schema.js";
import { AppError } from "../utils/AppError.js";
import { RegisterInput } from "../validators/auth.schema.js";
import { hash } from "@node-rs/argon2"; // or bcrypt

export async function registerUser(input: RegisterInput) {
  const passwordHash = await hash(input.password);

  try {
    return await db.transaction(async (tx) => {
      const [user] = await tx
        .insert(users)
        .values({ name: input.name, email: input.email })
        .returning({ id: users.id, email: users.email, name: users.name });

      await tx
        .insert(passwordCredentials)
        .values({ userId: user.id, passwordHash });
      return user;
    });
  } catch (err: any) {
    if (err?.code === "23505")
      throw new AppError(409, "EMAIL_TAKEN", "Email already registered");
    throw err;
  }
}
