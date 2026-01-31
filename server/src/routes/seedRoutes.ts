import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';

const router = express.Router();

router.post('/seed', async (req, res) => {
    try {
        // Clear existing users? Maybe optional, but for clean seed let's do it or just check if they exist.
        // For this request, let's just create if not exists.

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash('password123', salt); // Default password

        // Remove old users if they exist
        await User.deleteMany({ email: { $in: ['priya@sideledger.ai', 'sneha@sideledger.ai'] } });

        const users = [
            { name: 'Aditya Verma', email: 'admin@sideledger.ai', role: 'admin' },
            { name: 'Rahul Sharma', email: 'rahul@sideledger.ai', role: 'worker' },
            { name: 'Vikram Singh', email: 'vikram@sideledger.ai', role: 'worker' },
            { name: 'Amit Kumar', email: 'amit@sideledger.ai', role: 'worker' },
            { name: 'Rohan Gupta', email: 'rohan@sideledger.ai', role: 'worker' }
        ];

        const createdUsers = [];

        for (const u of users) {
            let user = await User.findOne({ email: u.email });
            if (!user) {
                user = new User({
                    name: u.name,
                    email: u.email,
                    passwordHash,
                    role: u.role
                });
                await user.save();
                createdUsers.push(user);
            }
        }

        res.json({ message: 'Database seeded successfully', created: createdUsers });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Seeding failed' });
    }
});

export default router;
