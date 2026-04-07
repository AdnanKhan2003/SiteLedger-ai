import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import logger from './lib/logger';

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

import { FRONTEND_URL } from './constants/env';

const app: Application = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    FRONTEND_URL,
    'https://site-ledger-ai.vercel.app'
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.vercel.app')) {
            callback(null, true);
        } else {
            logger.warn(`[CORS REJECTED] Origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));
app.use(helmet());
app.use(morgan('combined', {
    stream: { write: (message: string) => logger.http(message.trim()) }
}));



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
    logger.error(`[UNHANDLED REJECTION] ${err.message}`, { stack: err.stack });
    process.exit(1);
});

process.on('uncaughtException', (err: any) => {
    logger.error(`[UNCAUGHT EXCEPTION] ${err.message}`, { stack: err.stack });
    process.exit(1);
});
