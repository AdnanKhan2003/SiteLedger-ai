import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey123';

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

    if (!token) {
        return res.status(401).json({ error: 'Access denied, token missing' });
    }

    try {
        const verified = jwt.verify(token, JWT_SECRET);
        (req as any).user = verified;
        next();
    } catch (err) {
        res.status(403).json({ error: 'Invalid token' });
    }
};
