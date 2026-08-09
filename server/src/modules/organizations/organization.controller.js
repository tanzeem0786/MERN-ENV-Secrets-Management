import {
  createOrganization,
  getMyOrganizations,
  getOrganizationById,
  updateOrganization,
  deleteOrganization,
} from './organization.service.js';

export const createOrgController = async (req, res) => {
  const org = await createOrganization(req.body, req.user, res);
  res.status(201).json({ success: true, message: 'Organization created', data: { organization: org } });
};

export const getMyOrgsController = async (req, res) => {
  const orgs = await getMyOrganizations(req.user);
  res.json({ success: true, message: 'Organizations retrieved', data: { organizations: orgs } });
};

export const getOrgByIdController = async (req, res) => {
  const org = await getOrganizationById(req.params.id, req.user);
  res.json({ success: true, message: 'Organization retrieved', data: { organization: org } });
};

export const updateOrgController = async (req, res) => {
  const org = await updateOrganization(req.params.id, req.body, req.user);
  res.json({ success: true, message: 'Organization updated', data: { organization: org } });
};

export const deleteOrgController = async (req, res) => {
  await deleteOrganization(req.params.id, req.user);
  res.json({ success: true, message: 'Organization deleted' });
};
