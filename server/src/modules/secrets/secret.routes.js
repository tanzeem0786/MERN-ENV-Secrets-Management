import express from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import {
  createSecretController,
  listSecretsController,
  revealSecretController,
  updateSecretController,
  deleteSecretController,
} from './secret.controller.js';
import { validateCreateSecret, validateUpdateSecret, validateSecretQuery } from './secret.validation.js';
import { authenticate } from '../auth/auth.middleware.js';

const router = express.Router();

router.post('/', authenticate, validateCreateSecret, asyncHandler(createSecretController));
router.get('/', authenticate, validateSecretQuery, asyncHandler(listSecretsController));
router.post('/:id/reveal', authenticate, asyncHandler(revealSecretController));
router.patch('/:id', authenticate, validateUpdateSecret, asyncHandler(updateSecretController));
router.delete('/:id', authenticate, asyncHandler(deleteSecretController));

export default router;
