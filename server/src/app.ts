import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import attendanceRoutes from './routes/attendanceRoutes';
import expenseRoutes from './routes/expenseRoutes';
import projectRoutes from './routes/projectRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import authRoutes from './routes/authRoutes';
import workerAuthRoutes from './routes/workerAuthRoutes';
import seedRoutes from './routes/seedRoutes';
import userRoutes from './routes/userRoutes';
import invoiceRoutes from './routes/invoiceRoutes';
import aiRoutes from './routes/aiRoutes';

const app: Application = express();

const frontendUrl = process.env.FRONTEND_URL || 'https://site-ledger-ai.vercel.app';

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000', frontendUrl],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(helmet());
app.use(morgan('dev'));

// Debug Logging
app.use((req, res, next) => {
    console.log(`[SERVER-INCOMING] ${req.method} ${req.url}`);
    next();
});

// Routes

app.use('/api/attendance', attendanceRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/users', userRoutes);
app.use('/api/worker-auth', workerAuthRoutes); // Public worker registration
app.use('/api/test', seedRoutes);
app.use('/api/ai', aiRoutes);




app.get('/', (req: Request, res: Response) => {
    res.send('SideLedger AI API is running');
});

// Global Error Handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Server Error', error: err.message });
});

export default app;
