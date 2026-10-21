import Fastify from 'fastify';
import { healthRoutes } from './routes/health.js';
import { commentRoutes } from './routes/comment.js';

export function buildApp() {
  const app = Fastify({ logger: true });
  app.register(healthRoutes);
  app.register(commentRoutes);
  return app;   
}