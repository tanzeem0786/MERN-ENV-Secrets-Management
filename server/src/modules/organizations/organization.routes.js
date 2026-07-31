import express from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import {
  createOrgController,
  getMyOrgsController,
  getOrgByIdController,
  updateOrgController,
  deleteOrgController,
} from './organization.controller.js';
import { validateCreateOrganization, validateUpdateOrganization } from './organization.validation.js';
import { authenticate } from '../auth/auth.middleware.js';

const router = express.Router();

// All endpoints require authentication
router.post('/', authenticate, validateCreateOrganization, asyncHandler(createOrgController));
router.get('/mine', authenticate, asyncHandler(getMyOrgsController));
router.get('/:id', authenticate, asyncHandler(getOrgByIdController));
router.put('/:id', authenticate, validateUpdateOrganization, asyncHandler(updateOrgController));
router.delete('/:id', authenticate, asyncHandler(deleteOrgController));

export default router;
