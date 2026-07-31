import {
  createEnvironment,
  getEnvironmentsForProject,
  getEnvironmentById,
  updateEnvironment,
  deleteEnvironment,
} from './environment.service.js';

export const createEnvironmentController = async (req, res) => {
  const environment = await createEnvironment(req.body, req.user);
  res.status(201).json({ success: true, message: 'Environment created', data: { environment } });
};

export const getEnvironmentsController = async (req, res) => {
  const environments = await getEnvironmentsForProject(req.query.projectId, req.user);
  res.json({ success: true, message: 'Environments retrieved', data: { environments } });
};

export const getEnvironmentByIdController = async (req, res) => {
  const environment = await getEnvironmentById(req.params.id, req.user);
  res.json({ success: true, message: 'Environment retrieved', data: { environment } });
};

export const updateEnvironmentController = async (req, res) => {
  const environment = await updateEnvironment(req.params.id, req.body, req.user);
  res.json({ success: true, message: 'Environment updated', data: { environment } });
};

export const deleteEnvironmentController = async (req, res) => {
  await deleteEnvironment(req.params.id, req.user);
  res.json({ success: true, message: 'Environment deleted' });
};
