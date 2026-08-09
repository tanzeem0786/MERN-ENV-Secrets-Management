import { z } from 'zod';
import ErrorHandler from '../../middleware/errorHandler.js';
import formatError from '../../utils/formatError.js';

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

export const validateCreateProject = (req, res, next) => {
  try {
    req.body = createSchema.parse(req.body);
    return next();
  } catch (err) {
    const errorMessage = formatError(err);
    return res.status(400).json({
      success: false,
      message: errorMessage
    });
    // return next(new ErrorHandler(errorMessage, 400));
  }
};

export const validateUpdateProject = (req, res, next) => {
  try {
    req.body = updateSchema.parse(req.body);
    return next();
  } catch (err) {
    const errorMessage = formatError(err);
    return res.status(400).json({
      success: false,
      message: errorMessage
    });
    // return next(new ErrorHandler(errorMessage, 400));
  }
};

export const validateProjectQuery = (req, res, next) => {
  try {
    req.query = querySchema.parse(req.query);
    return next();
  } catch (err) {
    const errorMessage = formatError(err);
    return res.status(400).json({
      success: false,
      message: errorMessage
    });
    // return next(new ErrorHandler(errorMessage, 400));
  }
};
