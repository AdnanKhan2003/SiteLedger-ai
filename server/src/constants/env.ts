import dotenv from "dotenv";

dotenv.config();

const getEnv = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;

  if (!value) {
    throw new Error(`Missing Environment Variable for ${key}`);
  }

  return value;
};

const PORT = getEnv("PORT", "5000");
const MONGODB_URI = getEnv("MONGODB_URI", process.env.MONGO_URI || "");
const FRONTEND_URL = getEnv("FRONTEND_URL", "http://localhost:3000");
const JWT_SECRET = getEnv("JWT_SECRET", "supersecretkey123");
const NODE_ENV = getEnv("NODE_ENV", "development");
const GEMINI_API_KEY = getEnv("GEMINI_API_KEY", "");
const REDIS_URL = getEnv("REDIS_URL", "redis://localhost:6379");

export {
  PORT,
  MONGODB_URI,
  FRONTEND_URL,
  JWT_SECRET,
  NODE_ENV,
  GEMINI_API_KEY,
  REDIS_URL,
};
