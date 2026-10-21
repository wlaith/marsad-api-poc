import type { FastifyInstance } from 'fastify';
import { commentEventSchema } from '../../domain/comment.js';

export async function commentRoutes(app: FastifyInstance) {
  app.post('/events/comment', async (req, reply) => {
    const parsed = commentEventSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'invalid_payload', details: parsed.error.issues });
    }
    return reply.code(202).send({ accepted: true });
  });
}