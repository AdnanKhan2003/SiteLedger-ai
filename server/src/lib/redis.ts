import Redis from 'ioredis';
import { REDIS_URL, NODE_ENV } from '../constants/env';

let redis: Redis | null = null;
let isRedisConnected = false;

try {
    if (REDIS_URL && (REDIS_URL !== 'redis://localhost:6379' || NODE_ENV === 'development')) {
        redis = new Redis(REDIS_URL, {
            maxRetriesPerRequest: 1,
            enableReadyCheck: false,
            connectTimeout: 5000,
            retryStrategy: (times) => {
                if (times > 3) return null; // stop retrying after 3 times if it fails
                return Math.min(times * 50, 2000);
            }
        });

        redis.on('connect', () => {
            isRedisConnected = true;
            console.log('Redis connected successfully');
        });

        redis.on('error', (err) => {
            isRedisConnected = false;
            console.error('Redis connection error (Caching disabled):', err.message);
        });
    } else {
        console.log('Redis URL not provided or in production without external Redis. Caching disabled.');
    }
} catch (err) {
    console.error('Failed to initialize Redis:', err);
}

export const clearAnalyticsCache = async () => {
  if (!redis || !isRedisConnected) return;
  try {
    await redis.del("dashboard:stats");
    await redis.del("analytics:profitability");
  } catch (err) {
    console.error("Redis Cache Invalidation Error:", err);
  }
};

export { isRedisConnected };
export default redis;
