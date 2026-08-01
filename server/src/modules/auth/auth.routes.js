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

const router = express.Router();

router.post('/register', validateRegister, asyncHandler(registerController));
router.post('/login', validateLogin, asyncHandler(loginController));
router.post('/logout', authenticate, asyncHandler(logoutController));
router.get('/me', authenticate, asyncHandler(meController));

export default router;
