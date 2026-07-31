import { getHealthStatus } from './health.service.js';

export const healthController = async (req, res) => {
  const health = await getHealthStatus();
  res.json(health);
};
