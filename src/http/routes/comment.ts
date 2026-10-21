import type { FastifyInstance } from 'fastify';
import { commentEventSchema } from '../../domain/comment.js';
import { publishCommentEvent } from '../../adapters/rabbitmq.js';


export async function commentRoutes(app: FastifyInstance) {
  app.post('/events/comment', async (req, reply) => {
    const parsed = commentEventSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'invalid_payload', details: parsed.error.issues });
    }
    try {
      await publishCommentEvent(app.mq, parsed.data);
    } catch (err) {
      req.log.error(err, 'publish failed');
      return reply.code(503).send({ error: 'queue_unavailable' });
    }
    return reply.code(202).send({ accepted: true });
  });
}