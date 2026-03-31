import { createClient, RedisClientType } from 'redis';
import { env } from '../config/env';
import { logger } from './logger';

let redisClient: RedisClientType;

export async function connectRedis(): Promise<RedisClientType> {
  if (redisClient) {
    return redisClient;
  }

  redisClient = createClient({
    url: env.REDIS_URL,
    socket: {
      reconnectStrategy: (retries) => {
        if (retries > 10) {
          logger.error('Redis: max reconnect attempts reached');
          return new Error('Max Redis reconnect attempts reached');
        }
        return Math.min(retries * 100, 3000);
      },
    },
  }) as RedisClientType;

  redisClient.on('error', (err: Error) => {
    logger.error(`Redis client error: ${err.message}`);
  });

  redisClient.on('connect', () => {
    logger.info('Redis: connected');
  });

  redisClient.on('reconnecting', () => {
    logger.warn('Redis: reconnecting...');
  });

  redisClient.on('ready', () => {
    logger.info('Redis: ready');
  });

  await redisClient.connect();
  return redisClient;
}

export function getRedisClient(): RedisClientType {
  if (!redisClient) {
    throw new Error('Redis client not initialized. Call connectRedis() first.');
  }
  return redisClient;
}

export async function disconnectRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    logger.info('Redis: disconnected');
  }
}

export default { connectRedis, getRedisClient, disconnectRedis };
