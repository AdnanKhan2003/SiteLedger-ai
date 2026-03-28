import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import attendanceRoutes from './routes/attendanceRoutes';
import expenseRoutes from './routes/expenseRoutes';
import projectRoutes from './routes/projectRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import authRoutes from './routes/authRoutes';

import userRoutes from './routes/userRoutes';
import invoiceRoutes from './routes/invoiceRoutes';
import aiRoutes from './routes/aiRoutes';
import healthRoutes from './routes/healthRoutes';
import errorHandler from './middleware/errorHandler';
import notFound from './middleware/notFound';

const app: Application = express();

const frontendUrl = process.env.FRONTEND_URL || 'https://site-ledger-ai.vercel.app';


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


app.use((req, res, next) => {
    console.log(`[SERVER-INCOMING] ${req.method} ${req.url}`);
    next();
});



app.use('/api/attendance', attendanceRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/users', userRoutes);

app.use('/api/ai', aiRoutes);
app.use('/api/health', healthRoutes);




app.get('/', (req: Request, res: Response) => {
    res.send('SideLedger AI API is running');
});


app.use(notFound);
app.use(errorHandler);

export default app;

process.on('unhandledRejection', (err: any) => {
    console.error(`[UNHANDLED REJECTION] ${err.message}`);
    process.exit(1);
});

process.on('uncaughtException', (err: any) => {
    console.error(`[UNCAUGHT EXCEPTION] ${err.message}`);
    process.exit(1);
});
