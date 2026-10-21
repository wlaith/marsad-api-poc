import pg from 'pg';
import { config } from '../config.js';
import type { CommentEvent } from '../domain/comment.js';

export const pool = new pg.Pool({ connectionString: config.databaseUrl });

// prevents duplicate comments from being inserted into the database
export async function insertComment(c: CommentEvent): Promise<boolean> {
  const r = await pool.query(
    `insert into comments
       (external_comment_id, external_post_id, text, commented_at, parent_external_id, hidden)
     values ($1,$2,$3,$4,$5,$6)
     on conflict (external_comment_id) do nothing`,
    [c.externalCommentId, c.externalPostId, c.text, c.commentedAt, c.parentExternalId ?? null, c.hidden],
  );
  return r.rowCount === 1;
}