import { runMigrations } from "./db/migrate.js";

runMigrations().catch((error) => {
  console.error("Database migration failed", error);
  process.exitCode = 1;
});
