import express from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import {
  createEnvironmentController,
  getEnvironmentsController,
  getEnvironmentByIdController,
  updateEnvironmentController,
  deleteEnvironmentController,
} from './environment.controller.js';
import {
  validateCreateEnvironment,
  validateUpdateEnvironment,
  validateEnvironmentQuery,
} from './environment.validation.js';
import { authenticate } from '../auth/auth.middleware.js';

const router = express.Router();

router.post('/', authenticate, validateCreateEnvironment, asyncHandler(createEnvironmentController));
router.get('/', authenticate, validateEnvironmentQuery, asyncHandler(getEnvironmentsController));
router.get('/:id', authenticate, asyncHandler(getEnvironmentByIdController));
router.patch('/:id', authenticate, validateUpdateEnvironment, asyncHandler(updateEnvironmentController));
router.delete('/:id', authenticate, asyncHandler(deleteEnvironmentController));

export default router;
