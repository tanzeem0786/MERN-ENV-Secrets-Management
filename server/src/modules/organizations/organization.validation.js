import { z } from 'zod';
import ErrorHandler from '../../middleware/errorHandler.js';
import formatError from '../../utils/formatError.js';

const createSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(50, 'Name must be 50 characters or less'),
});

const updateSchema = z.object({
  name: z.string().min(3).max(50).optional(),
});

export const validateCreateOrganization = (req, res, next) => {
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

export const validateUpdateOrganization = (req, res, next) => {
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
