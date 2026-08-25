import express from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import {
  createProjectController,
  getProjectsController,
  getProjectByIdController,
  updateProjectController,
  deleteProjectController,
} from './project.controller.js';
import {
  validateCreateProject,
  validateUpdateProject,
  validateProjectQuery,
} from './project.validation.js';
import { authenticate } from '../auth/auth.middleware.js';
import { authorize } from '../../security/authorize.js';
import { PERMISSIONS } from '../../security/permissions.js';

const router = express.Router();

router.post('/', authenticate, authorize(PERMISSIONS.PROJECT_CREATE), validateCreateProject, asyncHandler(createProjectController));
router.get('/', authenticate, authorize(PERMISSIONS.PROJECT_READ), validateProjectQuery, asyncHandler(getProjectsController));
router.get('/:id', authenticate, authorize(PERMISSIONS.PROJECT_READ), asyncHandler(getProjectByIdController));
router.patch('/:id', authenticate, authorize(PERMISSIONS.PROJECT_UPDATE), validateUpdateProject, asyncHandler(updateProjectController));
router.delete('/:id', authenticate, authorize(PERMISSIONS.PROJECT_DELETE), asyncHandler(deleteProjectController));

export default router;
