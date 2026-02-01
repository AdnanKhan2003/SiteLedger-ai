import express from 'express';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User from '../models/User';
import Project from '../models/Project';
import Expense from '../models/Expense';

const router = express.Router();

router.post('/seed', async (req, res) => {
    try {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash('password123', salt); // Default password

        // 1. Clear existing Data
        await Promise.all([
            User.deleteMany({}), // Clear all users
            Project.deleteMany({}),
            Expense.deleteMany({})
        ]);

        // Drop workers collection if it exists
        try {
            if (mongoose.connection.db) {
                await mongoose.connection.db.dropCollection('workers');
                console.log('Dropped workers collection');
            }
        } catch (e) {
            // Ignore if collection doesn't exist
        }

        // 2. Create Users (Admin & Workers)
        // Admin
        const adminUser = new User({
            name: 'Aditya Verma',
            email: 'admin@sideledger.ai',
            passwordHash,
            role: 'admin'
        });
        await adminUser.save();

        // 3. Create Workers (Single User Collection)
        const workerData = [
            { name: "Rahul Sharma", email: "rahul@sideledger.ai", workerRole: "Site Supervisor", phone: "9876543220", dailyRate: 1200, status: "active" },
            { name: "Vikram Singh", email: "vikram@sideledger.ai", workerRole: "Mason", phone: "9876543221", dailyRate: 850, status: "active" },
            { name: "Amit Kumar", email: "amit@sideledger.ai", workerRole: "Helper", phone: "9876543222", dailyRate: 500, status: "active" },
            { name: "Rohan Gupta", email: "rohan@sideledger.ai", workerRole: "Electrician", phone: "9876543223", dailyRate: 950, status: "active" },
            { name: "Rajesh Kumar", email: "rajesh@sideledger.ai", workerRole: "Mason", phone: "9876543210", dailyRate: 800, status: "active" },
            { name: "Suresh Yadav", email: "suresh@sideledger.ai", workerRole: "Helper", phone: "9876543211", dailyRate: 500, status: "active" },
            { name: "Dinesh Patel", email: "dinesh@sideledger.ai", workerRole: "Carpenter", phone: "9876543212", dailyRate: 900, status: "active" },
            { name: "Manoj Singh", email: "manoj@sideledger.ai", workerRole: "Electrician", phone: "9876543213", dailyRate: 1000, status: "active" },
            { name: "Vijay Malhotra", email: "vijay@sideledger.ai", workerRole: "Plumber", phone: "9876543214", dailyRate: 950, status: "active" },
            { name: "Arjun Das", email: "arjun@sideledger.ai", workerRole: "Painter", phone: "9876543215", dailyRate: 750, status: "active" },
            { name: "Karan Johar", email: "karan@sideledger.ai", workerRole: "Supervisor", phone: "9876543216", dailyRate: 1500, status: "active" },
            { name: "Deepak Chahar", email: "deepak@sideledger.ai", workerRole: "Mason", phone: "9876543217", dailyRate: 850, status: "active" },
            { name: "Sunil Shetty", email: "sunil@sideledger.ai", workerRole: "Helper", phone: "9876543218", dailyRate: 500, status: "inactive" },
            { name: "Anil Kapoor", email: "anil@sideledger.ai", workerRole: "Site Engineer", phone: "9876543219", dailyRate: 2000, status: "active" }
        ];

        const createdUsers: any[] = [];
        const createdProjects: any[] = [];

        for (const w of workerData) {
            const user = new User({
                name: w.name,
                email: w.email,
                passwordHash,
                role: 'worker',
                phone: w.phone,
                workerRole: w.workerRole,
                dailyRate: w.dailyRate,
                status: w.status as 'active' | 'inactive'
            });
            await user.save();
            createdUsers.push(user);
        }

        // 4. Create Projects
        const projectData = [
            {
                name: "Sunshine Apartments",
                client: "DLF Builders",
                location: "Gurgaon, Sector 56",
                budget: 5000000,
                startDate: new Date("2025-01-15"),
                status: "active",
                description: "Residential complex with 4 towers."
            },
            {
                name: "Green Valley Villa",
                client: "Mr. Sharma",
                location: "Dehradun, Rajpur Road",
                budget: 12000000,
                startDate: new Date("2024-11-01"),
                status: "active",
                description: "Luxury villa construction."
            }
        ];

        const projects = await Project.insertMany(projectData);
        createdProjects.push(...projects);

        // 5. Create Expenses
        const expenseData = [
            {
                vendor: "UltraTech Cement",
                category: "materials",
                subCategory: "Cement",
                totalAmount: 45000,
                invoiceDate: new Date(),
                status: "paid",
                project: createdProjects[0]._id, // Link to Sunshine Apartments
                items: [{ name: "Cement Bags", quantity: 100, price: 450, amount: 45000 }]
            }
        ];

        await Expense.insertMany(expenseData);

        res.json({
            message: 'Database seeded successfully. Workers collection dropped!',
            users: createdUsers.length + 1,
            projects: createdProjects.length,
            expenses: expenseData.length
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Seeding failed' });
    }
});

export default router;
