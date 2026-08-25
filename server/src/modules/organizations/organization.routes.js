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
import { authorize } from '../../security/authorize.js';
import { PERMISSIONS } from '../../security/permissions.js';

const router = express.Router();

// All endpoints require authentication
router.post('/', authenticate, validateCreateOrganization, asyncHandler(createOrgController));
router.get('/mine', authenticate, authorize(PERMISSIONS.ORGANIZATION_READ), asyncHandler(getMyOrgsController));
router.get('/:id', authenticate, authorize(PERMISSIONS.ORGANIZATION_READ), asyncHandler(getOrgByIdController));
router.put('/:id', authenticate, authorize(PERMISSIONS.ORGANIZATION_UPDATE), validateUpdateOrganization, asyncHandler(updateOrgController));
router.delete('/:id', authenticate, authorize(PERMISSIONS.ORGANIZATION_DELETE), asyncHandler(deleteOrgController));

export default router;
