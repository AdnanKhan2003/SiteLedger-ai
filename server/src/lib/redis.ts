import Redis from 'ioredis';
import { REDIS_URL, NODE_ENV } from '../constants/env';
import logger from './logger';

let redis: Redis | null = null;
let isRedisConnected = false;

try {
    if (REDIS_URL && (REDIS_URL !== 'redis://localhost:6379' || NODE_ENV === 'development')) {
        redis = new Redis(REDIS_URL, {
            maxRetriesPerRequest: 1,
            enableReadyCheck: false,
            connectTimeout: 5000,
            retryStrategy: (times) => {
                if (times > 3) return null;
                return Math.min(times * 50, 2000);
            }
        });

        redis.on('connect', () => {
            isRedisConnected = true;
            logger.info('Redis connected successfully');
        });

        redis.on('error', (err) => {
            isRedisConnected = false;
            logger.error(`Redis connection error (Caching disabled): ${err.message}`);
        });
    } else {
    logger.warn('Redis URL not provided or in production without external Redis. Caching disabled.');
    }
} catch (err) {
    logger.error('Failed to initialize Redis:', err);
}

export const clearAnalyticsCache = async () => {
  if (!redis || !isRedisConnected) return;
  try {
    await redis.del(
      "dashboard:stats",
      "analytics:profitability",
      "analytics:costs:month",
      "analytics:costs:alltime"
    );
  } catch (err) {
    logger.error('Redis Cache Invalidation Error:', err);
  }
};

export { isRedisConnected };
export default redis;
