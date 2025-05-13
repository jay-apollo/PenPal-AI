import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.number().default(5000),
  SESSION_SECRET: z.string().min(32),
  DATABASE_URL: z.string().url(),
  OPENAI_API_KEY: z.string().optional(),
  CORS_ORIGIN: z.string().url().default('http://localhost:5000'),
  RATE_LIMIT_WINDOW_MS: z.number().default(15 * 60 * 1000), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.number().default(100),
  SESSION_TTL: z.number().default(86400000), // 1 day
});

function validateEnv() {
  const env = {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT ? parseInt(process.env.PORT) : undefined,
    SESSION_SECRET: process.env.SESSION_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    CORS_ORIGIN: process.env.CORS_ORIGIN,
    RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS ? parseInt(process.env.RATE_LIMIT_WINDOW_MS) : undefined,
    RATE_LIMIT_MAX_REQUESTS: process.env.RATE_LIMIT_MAX_REQUESTS ? parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) : undefined,
    SESSION_TTL: process.env.SESSION_TTL ? parseInt(process.env.SESSION_TTL) : undefined,
  };

  return envSchema.parse(env);
}

export const config = validateEnv();

export const isDev = config.NODE_ENV === 'development';
export const isProd = config.NODE_ENV === 'production';
export const isTest = config.NODE_ENV === 'test'; 