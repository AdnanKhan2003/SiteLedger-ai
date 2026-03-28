import { Request, Response, NextFunction } from 'express';
import APIError from '../lib/APIError';

const notFound = (req: Request, res: Response, next: NextFunction) => {
    next(new APIError(404, `Not Found - ${req.originalUrl}`));
};

export default notFound;
