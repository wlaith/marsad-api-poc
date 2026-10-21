import type amqp from 'amqplib';
import { commentEventSchema } from '../domain/comment.js';
import { insertComment } from '../adapters/postgres.js';
import { alreadySeen, markSeen } from '../adapters/redis.js';

export const stats = { inserted: 0, skippedByRedis: 0, skippedByPostgres: 0 };


export async function handleMessage(channel: amqp.Channel, message: amqp.ConsumeMessage) {
  let event;
  try {
    event = commentEventSchema.parse(JSON.parse(message.content.toString()));
  } catch {
    channel.nack(message, false, false); // bad message: drop it, never requeue
    return;
  }
  try { 
    if (await alreadySeen(event.externalCommentId)) {
      stats.skippedByRedis++;
      channel.ack(message);
      return;
    }
    const inserted = await insertComment(event);
    await markSeen(event.externalCommentId); 
    if (inserted) stats.inserted++; else stats.skippedByPostgres++;
    channel.ack(message);
  } catch (err) {
    console.error('processing failed', err);
    channel.nack(message, false, true);   // temporary failure (DB down): put it back
  }
}