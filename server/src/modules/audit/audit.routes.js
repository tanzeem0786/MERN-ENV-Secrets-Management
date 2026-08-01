import express from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { getAuditLogsController } from './audit.controller.js';
import { authenticate } from '../auth/auth.middleware.js';

const router = express.Router();

router.get('/', authenticate, asyncHandler(getAuditLogsController));

export default router;
