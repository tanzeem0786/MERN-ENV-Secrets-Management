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
import { authorize } from '../../security/authorize.js';
import { PERMISSIONS } from '../../security/permissions.js';

const router = express.Router();

router.post('/', authenticate, authorize(PERMISSIONS.ENVIRONMENT_CREATE), validateCreateEnvironment, asyncHandler(createEnvironmentController));
router.get('/', authenticate, authorize(PERMISSIONS.ENVIRONMENT_READ), validateEnvironmentQuery, asyncHandler(getEnvironmentsController));
router.get('/:id', authenticate, authorize(PERMISSIONS.ENVIRONMENT_READ), asyncHandler(getEnvironmentByIdController));
router.patch('/:id', authenticate, authorize(PERMISSIONS.ENVIRONMENT_UPDATE), validateUpdateEnvironment, asyncHandler(updateEnvironmentController));
router.delete('/:id', authenticate, authorize(PERMISSIONS.ENVIRONMENT_DELETE), asyncHandler(deleteEnvironmentController));

export default router;
