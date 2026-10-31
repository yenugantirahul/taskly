import express, { type Express } from 'express';

export async function createApp(): Promise<Express> {
  const app = express();

  // Don't advertise the framework in response headers
  app.disable('x-powered-by');

  app.use(express.json({ limit: '1mb' }));

  // Liveness probe — answers as long as the process is up
  app.get('/server/ping', (_req, res) => {
    res.type('text/plain').send('pong');
  });

  return app;
}
