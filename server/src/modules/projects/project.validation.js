import { z } from 'zod';

const createSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(50, 'Name must be 50 characters or less'),
  description: z.string().max(300, 'Description must be 300 characters or less').optional(),
  organizationId: z.string().min(1, 'organizationId is required'),
});

const updateSchema = z.object({
  name: z.string().min(3).max(50).optional(),
  description: z.string().max(300).optional(),
});

const querySchema = z.object({
  organizationId: z.string().min(1, 'organizationId query param is required'),
});

const formatError = (error) => {
  if (error?.issues) return error.issues.map((issue) => issue.message).join('; ');
  return error.message || 'Invalid request';
};

export const validateCreateProject = (req, res, next) => {
  try {
    req.body = createSchema.parse(req.body);
    return next();
  } catch (err) {
    const error = new Error(formatError(err));
    error.statusCode = 400;
    return next(error);
  }
};

export const validateUpdateProject = (req, res, next) => {
  try {
    req.body = updateSchema.parse(req.body);
    return next();
  } catch (err) {
    const error = new Error(formatError(err));
    error.statusCode = 400;
    return next(error);
  }
};

export const validateProjectQuery = (req, res, next) => {
  try {
    req.query = querySchema.parse(req.query);
    return next();
  } catch (err) {
    const error = new Error(formatError(err));
    error.statusCode = 400;
    return next(error);
  }
};
