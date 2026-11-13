import { startServer } from './server.js';
import { env } from './config/env.js';
import { runMigrations } from './db/migrate.js';

async function start(): Promise<void> {
  if (env.MIGRATE_ON_START) await runMigrations();
  await startServer();
}

start().catch((err) => {
  console.error('Failed to start server', err);
  process.exit(1);
});
