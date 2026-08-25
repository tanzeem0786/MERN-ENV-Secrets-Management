import Project from '../modules/projects/project.model.js';
import Environment from '../modules/environments/environment.model.js';
import Secret from '../modules/secrets/secret.model.js';
import Membership from '../modules/organizations/membership.model.js';
import { logActivity } from '../modules/audit/audit.service.js';
import { roleHasPermission } from './roles.js';

const getOrganizationId = async (req) => {
  const directOrganizationId = req.params.organizationId || req.body?.organizationId || req.query.organizationId;
  if (directOrganizationId) return directOrganizationId;

  if (req.params.id) {
    if (req.baseUrl.endsWith('/projects')) return (await Project.findById(req.params.id))?.organizationId;
    if (req.baseUrl.endsWith('/environments')) {
      const environment = await Environment.findById(req.params.id);
      return (await Project.findById(environment?.projectId))?.organizationId;
    }
    if (req.baseUrl.endsWith('/secrets')) {
      const secret = await Secret.findById(req.params.id);
      const environment = await Environment.findById(secret?.environmentId);
      return (await Project.findById(environment?.projectId))?.organizationId;
    }
  }

  if (req.query.projectId) return (await Project.findById(req.query.projectId))?.organizationId;
  if (req.query.environmentId) {
    const environment = await Environment.findById(req.query.environmentId);
    return (await Project.findById(environment?.projectId))?.organizationId;
  }

  return null;
};

const recordDenied = async (req, permission, organizationId) => {
  try {
    await logActivity({
      userId: req.user?._id,
      organizationId,
      action: 'PERMISSION_DENIED',
      resourceType: 'authorization',
      resourceName: permission,
      status: 'denied',
      ipAddress: req.ip,
      userAgent: req.get('user-agent') || '',
      metadata: { permission },
    });
  } catch {
    // Authorization failures must remain 403 even if audit persistence fails.
  }
};

export const authorize = (permission) => async (req, res, next) => {
  const organizationId = await getOrganizationId(req);
  const membership = organizationId
    ? await Membership.findOne({ organizationId, userId: req.user._id })
    : await Membership.findOne({ userId: req.user._id });

  if (!membership || !roleHasPermission(membership.role, permission)) {
    await recordDenied(req, permission, organizationId || membership?.organizationId);
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  req.membership = membership;
  req.organizationId = membership.organizationId;
  next();
};
