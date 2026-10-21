import type amqp from 'amqplib';
import { commentEventSchema } from '../domain/comment.js';
import { insertComment } from '../adapters/postgres.js';

export async function handleMessage(channel: amqp.Channel, message: amqp.ConsumeMessage) {
  let event;
  try {
    event = commentEventSchema.parse(JSON.parse(message.content.toString()));
  } catch {
    channel.nack(message, false, false); // bad message: drop it, never requeue
    return;
  }
  try {
    await insertComment(event);
    channel.ack(message);                 // ack only after the database write succeeded
  } catch (err) {
    console.error('insert failed', err);
    channel.nack(message, false, true);   // temporary failure (DB down): put it back
  }
}