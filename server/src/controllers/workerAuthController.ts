import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';

// Worker self-registration
export const registerWorker = async (req: Request, res: Response) => {
    try {
        const { name, email, password, phone, specialty, workerRole, dailyRate } = req.body;

        // Validation
        if (!name || !email || !password || !phone || !specialty || !workerRole || !dailyRate) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create User with worker fields
        const user = await User.create({
            name,
            email,
            passwordHash,
            role: 'worker',
            phone,
            workerRole,
            specialty,
            dailyRate: Number(dailyRate),
            status: 'active'
        });

        // Generate token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'Worker account created successfully',
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
                status: user.status
            }
        });
    } catch (error: any) {
        console.error('Worker registration error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};
