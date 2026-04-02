import * as dotenv from 'dotenv';
dotenv.config();

import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import videoRoutes from './routes/video.routes';

const app = new Hono();

app.get('/', (c) => {
  return c.text('Tesla Theater API is running!');
});

app.route('/videos', videoRoutes);

const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
console.log(`Starting server on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
