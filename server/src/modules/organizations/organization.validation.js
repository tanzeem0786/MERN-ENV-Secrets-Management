import { z } from 'zod';

const createSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(50, 'Name must be 50 characters or less'),
});

const updateSchema = z.object({
  name: z.string().min(3).max(50).optional(),
});

const formatError = (error) => {
  if (error?.issues) return error.issues.map((i) => i.message).join('; ');
  return error.message || 'Invalid request';
};

export const validateCreateOrganization = (req, res, next) => {
  try {
    req.body = createSchema.parse(req.body);
    return next();
  } catch (err) {
    const error = new Error(formatError(err));
    error.statusCode = 400;
    return next(error);
  }
};

export const validateUpdateOrganization = (req, res, next) => {
  try {
    req.body = updateSchema.parse(req.body);
    return next();
  } catch (err) {
    const error = new Error(formatError(err));
    error.statusCode = 400;
    return next(error);
  }
};
