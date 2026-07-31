import {
  createProject,
  getProjectsForOrganization,
  getProjectById,
  updateProject,
  deleteProject,
} from './project.service.js';

export const createProjectController = async (req, res) => {
  const project = await createProject(req.body, req.user);
  res.status(201).json({ success: true, message: 'Project created', data: { project } });
};

export const getProjectsController = async (req, res) => {
  const projects = await getProjectsForOrganization(req.query.organizationId, req.user);
  res.json({ success: true, message: 'Projects retrieved', data: { projects } });
};

export const getProjectByIdController = async (req, res) => {
  const project = await getProjectById(req.params.id, req.user);
  res.json({ success: true, message: 'Project retrieved', data: { project } });
};

export const updateProjectController = async (req, res) => {
  const project = await updateProject(req.params.id, req.body, req.user);
  res.json({ success: true, message: 'Project updated', data: { project } });
};

export const deleteProjectController = async (req, res) => {
  await deleteProject(req.params.id, req.user);
  res.json({ success: true, message: 'Project deleted' });
};
