import { buildApp } from './app.js';
import { config } from '../config.js';
import { connect } from '../adapters/rabbitmq.js';

const { channel } = await connect();
await buildApp(channel).listen({ port: config.port, host: '0.0.0.0' });
