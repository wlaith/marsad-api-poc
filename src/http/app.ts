import Fastify from 'fastify';
import type { ConfirmChannel } from 'amqplib';
import { healthRoutes } from './routes/health.js';
import { commentRoutes } from './routes/comment.js';

declare module 'fastify' {
  interface FastifyInstance {
    mq: ConfirmChannel;
  }
}

export function buildApp(mq: ConfirmChannel) {
  const app = Fastify({ logger: true });
  app.decorate('mq', mq);
  app.register(healthRoutes);
  app.register(commentRoutes);
  return app;
}
