import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import app from './app';
import connectDB from './config/db';
import logger from './lib/logger';

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

connectDB().then(() => {
    server.listen(PORT, () => {
        logger.info(`Server running on port ${PORT}`);
    });
});
