import mongoose from 'mongoose';
import logger from '../lib/logger';

const connectDB = async (): Promise<void> => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI || '');
        logger.info(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error: any) {
        logger.error(`MongoDB connection error: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;
