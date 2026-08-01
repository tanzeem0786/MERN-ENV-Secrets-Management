import { z } from 'zod';

const createSchema = z.object({
  key: z.string().min(2, 'Key must be at least 2 characters').max(100, 'Key must be 100 characters or less'),
  value: z.string().min(1, 'Value is required'),
  description: z.string().max(300, 'Description must be 300 characters or less').optional(),
  environmentId: z.string().min(1, 'environmentId is required'),
});

const updateSchema = z.object({
  key: z.string().min(2).max(100).optional(),
  value: z.string().min(1).optional(),
  description: z.string().max(300).optional(),
});

const querySchema = z.object({
  environmentId: z.string().min(1, 'environmentId query param is required'),
});

const formatError = (error) => {
  if (error?.issues) return error.issues.map((i) => i.message).join('; ');
  return error.message || 'Invalid request';
};

export const validateCreateSecret = (req, res, next) => {
  try {
    req.body = createSchema.parse(req.body);
    return next();
  } catch (err) {
    const error = new Error(formatError(err));
    error.statusCode = 400;
    return next(error);
  }
};

export const validateUpdateSecret = (req, res, next) => {
  try {
    req.body = updateSchema.parse(req.body);
    return next();
  } catch (err) {
    const error = new Error(formatError(err));
    error.statusCode = 400;
    return next(error);
  }
};

export const validateSecretQuery = (req, res, next) => {
  try {
    req.query = querySchema.parse(req.query);
    return next();
  } catch (err) {
    const error = new Error(formatError(err));
    error.statusCode = 400;
    return next(error);
  }
};
