import { Request, Response } from 'express';
import mongoose from 'mongoose';
import redis from '../lib/redis';
import asyncHandler from '../lib/asyncHandler';
import APIResponse from '../lib/APIResponse';

export const getHealth = asyncHandler(async (req: Request, res: Response) => {
    const healthData: any = {
        status: 'UP',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        checks: {
            database: 'DOWN',
            redis: 'DOWN'
        }
    };

    if (mongoose.connection.readyState === 1) {
        healthData.checks.database = 'UP';
    }

    try {
        const redisStatus = await redis.ping();
        if (redisStatus === 'PONG') {
            healthData.checks.redis = 'UP';
        }
    } catch (err) {
        healthData.checks.redis = 'DOWN';
    }

    if (healthData.checks.database === 'DOWN' || healthData.checks.redis === 'DOWN') {
        healthData.status = 'DEGRADED';
    }

    res.json(new APIResponse(200, healthData, 'Health check successful'));
});
