import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";

import { env } from "../config/env.js";
import * as schema from "./schema.js";

export const pool = new pg.Pool({
  connectionString: env.DATABASE_URL,
  max: 10,
  connectionTimeoutMillis: 5_000,
  idleTimeoutMillis: 30_000,
});

export const db = drizzle({ client: pool, schema });

export async function checkDbConnection(): Promise<void> {
  await pool.query("SELECT 1");
}

export async function closeDbConnection(): Promise<void> {
  await pool.end();
}
