import { z } from 'zod';

export const commentEventSchema = z.object({
  externalCommentId: z.string().min(1),
  externalPostId: z.string().min(1),
  text: z.string().min(1).max(8000),
  commentedAt: z.iso.datetime(),
  parentExternalId: z.string().min(1).nullable().optional(),
  hidden: z.boolean().default(false),
});
export type CommentEvent = z.infer<typeof commentEventSchema>;