import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import redis, { isRedisConnected } from '../lib/redis';
import APIError from '../lib/APIError';

const rateLimiter = (windowMs: number, max: number, message: string) => {
    const options: any = {
        windowMs,
        max,
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req: any, res: any, next: any) => {
            next(new APIError(429, message));
        },
    };

    if (redis && isRedisConnected) {
        options.store = new RedisStore({
            // @ts-ignore
            sendCommand: (...args: string[]) => redis.call(...args),
        });
    }

    return rateLimit(options);
};

export const authRateLimiter = rateLimiter(
    15 * 60 * 1000,
    20,
    "Too many login attempts, please try again after 15 minutes"
);
