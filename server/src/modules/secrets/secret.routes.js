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
import { authorize } from '../../security/authorize.js';
import { PERMISSIONS } from '../../security/permissions.js';

const router = express.Router();

router.post('/', authenticate, authorize(PERMISSIONS.SECRET_CREATE), validateCreateSecret, asyncHandler(createSecretController));
router.get('/', authenticate, authorize(PERMISSIONS.SECRET_READ), validateSecretQuery, asyncHandler(listSecretsController));
router.post('/:id/reveal', authenticate, authorize(PERMISSIONS.SECRET_REVEAL), asyncHandler(revealSecretController));
router.patch('/:id', authenticate, authorize(PERMISSIONS.SECRET_UPDATE), validateUpdateSecret, asyncHandler(updateSecretController));
router.delete('/:id', authenticate, authorize(PERMISSIONS.SECRET_DELETE), asyncHandler(deleteSecretController));

export default router;
