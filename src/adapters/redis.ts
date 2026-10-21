import { Redis } from 'ioredis';
import { config } from '../config.js';
export const redis = new Redis(config.redisUrl);

export const alreadySeen = async (id: string) => (await redis.exists(`seen:comment:${id}`)) === 1;
export const markSeen = (id: string) => redis.set(`seen:comment:${id}`, '1', 'EX', 3600);