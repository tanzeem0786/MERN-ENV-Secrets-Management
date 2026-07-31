import express from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { healthController } from './health.controller.js';

const router = express.Router();

router.get('/', asyncHandler(healthController));

export default router;
