import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import redis from '../lib/redis';
import APIError from '../lib/APIError';

const rateLimiter = (windowMs: number, max: number, message: string) => {
    return rateLimit({
        windowMs,
        max,
        standardHeaders: true,
        legacyHeaders: false,
        store: new RedisStore({
            // @ts-ignore
            sendCommand: (...args: string[]) => redis.call(...args),
        }),
        handler: (req, res, next) => {
            next(new APIError(429, message));
        },
    });
};

export const authRateLimiter = rateLimiter(
    15 * 60 * 1000, 
    20, 
    "Too many login attempts, please try again after 15 minutes"
);
