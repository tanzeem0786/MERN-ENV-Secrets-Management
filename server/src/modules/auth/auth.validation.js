import { z } from 'zod';
import formatError from '../../utils/formatError.js';

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

export const validateRegister = (req, res, next) => {
  try {
    req.body = registerSchema.parse(req.body);
    return next();
  } catch (err) {
    const error = new Error(formatError(err));
    error.statusCode = 400;
    return next(error);
  }
};

export const validateLogin = (req, res, next) => {
  try {
    req.body = loginSchema.parse(req.body);
    return next();
  } catch (err) {
    const error = new Error(formatError(err));
    error.statusCode = 400;
    return next(error);
  }
};
