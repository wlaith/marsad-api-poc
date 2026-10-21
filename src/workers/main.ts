import { connect, QUEUE } from '../adapters/rabbitmq.js';
import { handleMessage, stats } from './commentWorker.js';

const { channel } = await connect();
await channel.prefetch(10);
await channel.consume(QUEUE, (message) => { if (message) void handleMessage(channel, message); });
console.log('worker consuming', QUEUE);

setInterval(() => console.log('stats', stats), 5000);