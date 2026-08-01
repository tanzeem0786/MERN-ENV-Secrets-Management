import {
  createSecret,
  listSecrets,
  revealSecret,
  updateSecret,
  deleteSecret,
} from './secret.service.js';

export const createSecretController = async (req, res) => {
  const secret = await createSecret(req.body, req.user);
  res.status(201).json({ success: true, message: 'Secret created', data: { secret } });
};

export const listSecretsController = async (req, res) => {
  const secrets = await listSecrets(req.query.environmentId, req.user);
  res.json({ success: true, message: 'Secrets retrieved', data: { secrets } });
};

export const revealSecretController = async (req, res) => {
  const secret = await revealSecret(req.params.id, req.user);
  res.json({ success: true, message: 'Secret revealed', data: { secret } });
};

export const updateSecretController = async (req, res) => {
  const secret = await updateSecret(req.params.id, req.body, req.user);
  res.json({ success: true, message: 'Secret updated', data: { secret } });
};

export const deleteSecretController = async (req, res) => {
  await deleteSecret(req.params.id, req.user);
  res.json({ success: true, message: 'Secret deleted' });
};
