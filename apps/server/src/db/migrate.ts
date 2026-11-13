import { fileURLToPath } from "node:url";
import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";

export async function runMigrations(): Promise<void> {
  // A direct connection is required: transaction poolers cannot retain session locks.
  const connectionString = process.env.MIGRATION_DATABASE_URL ?? process.env.DATABASE_URL;
  if (!connectionString) throw new Error("A database URL is required for migrations");
  const client = new pg.Client({
    connectionString,
    connectionTimeoutMillis: 10_000,
    statement_timeout: 120_000,
  });
  try {
    await client.connect();
    await client.query("SELECT pg_advisory_lock(hashtext('taskly:schema-migrations'))");
    await migrate(drizzle(client), {
      migrationsFolder: fileURLToPath(new URL("../../drizzle/", import.meta.url)),
    });
    console.log("Database migrations complete");
  } finally {
    // Closing the session releases the advisory lock even if migration fails.
    await client.end();
  }
}
