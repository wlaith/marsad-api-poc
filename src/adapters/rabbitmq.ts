import amqp from 'amqplib';
import { config } from '../config.js';
import type { CommentEvent } from '../domain/comment.js';

export const QUEUE = 'comments.received';

export async function connect() {
  const connection = await amqp.connect(config.rabbitUrl);
  const channel = await connection.createConfirmChannel();
  await channel.assertQueue(QUEUE, { durable: true });
  return {  connection,channel };
}

export async function publishCommentEvent(channel: amqp.ConfirmChannel, e: CommentEvent) {
  channel.sendToQueue(QUEUE, Buffer.from(JSON.stringify(e)), { persistent: true });
  await channel.waitForConfirms();
}