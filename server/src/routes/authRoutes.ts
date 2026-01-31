import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey123';

// REGISTER
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check existing
        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ error: 'Email already exists' });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Create User
        const newUser = new User({
            name,
            email,
            passwordHash
        });
        await newUser.save();

        // Create Token
        const token = jwt.sign({ id: newUser._id, name: newUser.name, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({ token, user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role } });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// LOGIN
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // FIND USER
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: 'User not found' });

        // VALIDATE PASSWORD
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

        // CREATE TOKEN
        const token = jwt.sign({ id: user._id, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

        res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// GET ME
router.get('/me', authenticateToken, async (req: any, res) => {
    try {
        const user = await User.findById(req.user.id).select('-passwordHash');
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: 'Server Error' });
    }
});

export default router;
