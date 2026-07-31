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

const router = express.Router();

router.post('/', authenticate, validateCreateProject, asyncHandler(createProjectController));
router.get('/', authenticate, validateProjectQuery, asyncHandler(getProjectsController));
router.get('/:id', authenticate, asyncHandler(getProjectByIdController));
router.patch('/:id', authenticate, validateUpdateProject, asyncHandler(updateProjectController));
router.delete('/:id', authenticate, asyncHandler(deleteProjectController));

export default router;
