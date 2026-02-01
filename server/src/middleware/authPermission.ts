import { Request, Response, NextFunction } from 'express';

export const authorizeRoles = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        // user is already attached to req by authenticateToken middleware
        const user = (req as any).user;

        if (!user || !roles.includes(user.role)) {
            return res.status(403).json({ error: `Access denied. Role '${user?.role}' is not authorized.` });
        }

        next();
    };
};
