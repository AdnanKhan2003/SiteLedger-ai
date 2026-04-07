import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { authenticateToken } from '../middleware/auth';
import asyncHandler from '../lib/asyncHandler';
import APIResponse from '../lib/APIResponse';
import APIError from '../lib/APIError';
import { authRateLimiter } from '../middleware/rateLimiter';
import { clearAnalyticsCache } from '../lib/redis';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey123';


router.post('/register', authRateLimiter, asyncHandler(async (req, res) => {
    const { name, email, password, phone, specialty, workerRole, dailyRate, photoUrl } = req.body;

    if (!name || !email || !password) {
        throw new APIError(400, 'Name, email, and password are required');
    }

    const existing = await User.findOne({ email });
    if (existing) throw new APIError(400, 'Email already exists');

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({
        name,
        email,
        passwordHash,
        role: 'worker', // Public registration always creates workers; admins are created separately
        phone,
        specialty,
        workerRole,
        dailyRate: dailyRate ? Number(dailyRate) : undefined,
        photoUrl,
        status: 'active'
    });
    await newUser.save();
    await clearAnalyticsCache();

    const token = jwt.sign({ id: newUser._id, name: newUser.name, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json(new APIResponse(201, { 
        token, 
        user: { 
            id: newUser._id, 
            name: newUser.name, 
            email: newUser.email, 
            role: newUser.role,
            phone: newUser.phone,
            workerRole: newUser.workerRole,
            specialty: newUser.specialty,
            dailyRate: newUser.dailyRate,
            photoUrl: newUser.photoUrl,
            status: newUser.status
        } 
    }, "Registration successful"));
}));


router.post('/login', authRateLimiter, asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) throw new APIError(401, 'Invalid credentials');

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) throw new APIError(401, 'Invalid credentials');

    const token = jwt.sign({ id: user._id, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json(new APIResponse(200, {
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            workerRole: user.workerRole,
            specialty: user.specialty,
            dailyRate: user.dailyRate,
            photoUrl: user.photoUrl,
            status: user.status
        }
    }, "Login successful"));
}));



router.get('/me', authenticateToken, asyncHandler(async (req: any, res) => {
    const user = await User.findById(req.user.id).select('-passwordHash');
    res.json(new APIResponse(200, user));
}));

export default router;
