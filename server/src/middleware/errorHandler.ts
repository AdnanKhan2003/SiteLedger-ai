import { Request, Response, NextFunction } from 'express';
import APIError from '../lib/APIError';

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof APIError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            errors: err.errors,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        });
    }

    
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    
    return res.status(statusCode).json({
        success: false,
        message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
};

export default errorHandler;
