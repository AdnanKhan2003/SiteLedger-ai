import winston from 'winston';

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

const isProduction = process.env.NODE_ENV === 'production';

const devFormat = combine(
    colorize({ all: true }),
    timestamp({ format: 'HH:mm:ss' }),
    errors({ stack: true }),
    printf(({ level, message, timestamp, stack }) => {
        return stack
            ? `[${timestamp}] ${level}: ${message}\n${stack}`
            : `[${timestamp}] ${level}: ${message}`;
    })
);

const prodFormat = combine(
    timestamp(),
    errors({ stack: true }),
    json()
);

const logger = winston.createLogger({
    level: isProduction ? 'info' : 'debug',
    format: isProduction ? prodFormat : devFormat,
    transports: [
        new winston.transports.Console(),
    ],
    exitOnError: false,
});

export default logger;
