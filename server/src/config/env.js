import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z
    .string()
    .min(1, 'PORT is required')
    .regex(/^[0-9]+$/, 'PORT must be a numeric string'),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  CORS_ORIGIN: z.string().min(1, 'CORS_ORIGIN is required'),
  JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
  JWT_EXPIRES_IN: z.string().default('1h'),
  SECRET_ENCRYPTION_KEY: z.string().min(1, 'SECRET_ENCRYPTION_KEY is required'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const errorMessages = parsed.error.errors.map((issue) => issue.message).join('; ');
  throw new Error(`Environment validation failed: ${errorMessages}`);
}

export const env = {
  NODE_ENV: parsed.data.NODE_ENV,
  PORT: Number(parsed.data.PORT),
  MONGODB_URI: parsed.data.MONGODB_URI,
  CORS_ORIGIN: parsed.data.CORS_ORIGIN,
  JWT_SECRET: parsed.data.JWT_SECRET,
  JWT_EXPIRES_IN: parsed.data.JWT_EXPIRES_IN,
};
