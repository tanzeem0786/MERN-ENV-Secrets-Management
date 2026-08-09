import { z } from 'zod';
import ErrorHandler from '../../middleware/errorHandler.js';
import formatError from '../../utils/formatError.js';

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

export const validateCreateSecret = (req, res, next) => {
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

export const validateUpdateSecret = (req, res, next) => {
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

export const validateSecretQuery = (req, res, next) => {
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
