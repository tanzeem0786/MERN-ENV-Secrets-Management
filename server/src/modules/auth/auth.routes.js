import express from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import {
  registerController,
  loginController,
  logoutController,
  meController,
} from './auth.controller.js';
import { validateRegister, validateLogin } from './auth.validation.js';
import { authenticate } from './auth.middleware.js';
import { createRateLimiter } from '../../middleware/rateLimit.js';

const authenticationRateLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 10 });

const router = express.Router();

router.post('/register', authenticationRateLimiter, validateRegister, asyncHandler(registerController));
router.post('/login', authenticationRateLimiter, validateLogin, asyncHandler(loginController));
router.post('/logout', authenticate, asyncHandler(logoutController));
router.get('/me', authenticate, asyncHandler(meController));

export default router;
