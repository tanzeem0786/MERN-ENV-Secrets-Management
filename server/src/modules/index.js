import express from 'express';
import healthRouter from './health/health.route.js';
import authRouter from './auth/auth.routes.js';

const router = express.Router();

router.use('/health', healthRouter);
router.use('/auth', authRouter);

export default router;
