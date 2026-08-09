import { z } from 'zod';
import ErrorHandler from '../../middleware/errorHandler.js';
import formatError from '../../utils/formatError.js';

const createSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(30, 'Name must be 30 characters or less'),
  description: z.string().max(300, 'Description must be 300 characters or less').optional(),
  projectId: z.string().min(1, 'projectId is required'),
});

const updateSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(30, 'Name must be 30 characters or less').optional(),
  description: z.string().max(300, 'Description must be 300 characters or less').optional(),
});

const querySchema = z.object({
  projectId: z.string().min(1, 'projectId query param is required'),
});


export const validateCreateEnvironment = (req, res, next) => {
  try {
    req.body = createSchema.parse(req.body);
    return next();
  } catch (err) {
    const errorMessage = formatError(err);
    return res.status(400).json({
      success: false,
      message: errorMessage,
    });
    // return next(new ErrorHandler(errorMessage, 400));
  }
};

export const validateUpdateEnvironment = (req, res, next) => {
  try {
    req.body = updateSchema.parse(req.body);
    return next();
  } catch (err) {
    const errorMessage = formatError(err);
    return res.status(400).json({
      success: false,
      message: errorMessage,
    });
    // return next(new ErrorHandler(errorMessage, 400));
  }
};

export const validateEnvironmentQuery = (req, res, next) => {
  try {
    req.query = querySchema.parse(req.query);
    return next();
  } catch (err) {
    const errorMessage = formatError(err);
    return res.status(400).json({
      success: false,
      message: errorMessage,
    });
    // return next(new ErrorHandler(errorMessage, 400));
  }
};
