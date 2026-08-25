import express from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { getAuditLogsController } from './audit.controller.js';
import { authenticate } from '../auth/auth.middleware.js';
import { authorize } from '../../security/authorize.js';
import { PERMISSIONS } from '../../security/permissions.js';

const router = express.Router();

router.get('/', authenticate, authorize(PERMISSIONS.AUDIT_READ), asyncHandler(getAuditLogsController));

export default router;
