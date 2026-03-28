import Redis from 'ioredis';
import { REDIS_URL } from '../constants/env';

const redis = new Redis(REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false
});

redis.on('connect', () => {
    console.log('Redis connected successfully');
});

redis.on('error', (err) => {
    console.error('Redis connection error:', err);
});

export const clearAnalyticsCache = async () => {
  try {
    await redis.del("dashboard:stats");
    await redis.del("analytics:profitability");
  } catch (err) {
    console.error("Redis Cache Invalidation Error:", err);
  }
};

export default redis;
