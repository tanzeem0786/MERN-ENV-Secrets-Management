import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

const formatError = (error) => {
  if (error?.issues) {
    return error.issues.map((issue) => issue.message).join('; ');
  }
  return error.message || 'Invalid request';
};

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
