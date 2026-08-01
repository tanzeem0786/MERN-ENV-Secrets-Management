import mongoose from 'mongoose';
import Project from './project.model.js';
import Organization from '../organizations/organization.model.js';
import Membership from '../organizations/membership.model.js';
import { logActivity } from '../audit/audit.service.js';

const generateSlug = (name) => {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');
  return base || `project-${Date.now()}`;
};

const ensureUniqueSlug = async (organizationId, base, ignoreId = null) => {
  let slug = base;
  let count = 0;
  const query = { organizationId, slug };

  while (await Project.findOne(ignoreId ? { ...query, _id: { $ne: ignoreId } } : query)) {
    count += 1;
    slug = `${base}-${Math.random().toString(36).substring(2, 8)}${count}`;
    if (count > 10) slug = `${base}-${Date.now()}`;
    query.slug = slug;
  }
  return slug;
};

const verifyOrganizationAccess = async (organizationId, user) => {
  if (!mongoose.Types.ObjectId.isValid(organizationId)) {
    const error = new Error('Invalid organizationId');
    error.statusCode = 400;
    throw error;
  }

  const organization = await Organization.findById(organizationId);
  if (!organization) {
    const error = new Error('Organization not found');
    error.statusCode = 404;
    throw error;
  }

  const membership = await Membership.findOne({ organizationId, userId: user._id });
  if (!membership) {
    const error = new Error('Access denied');
    error.statusCode = 403;
    throw error;
  }

  return organization;
};

export const createProject = async ({ name, description, organizationId }, user) => {
  const organization = await verifyOrganizationAccess(organizationId, user);

  const baseSlug = generateSlug(name);
  const slug = await ensureUniqueSlug(organization._id, baseSlug);

  const project = await Project.create({
    name,
    description: description || '',
    slug,
    organizationId: organization._id,
    createdBy: user._id,
  });

  await logActivity({
    userId: user._id,
    organizationId: organization._id,
    projectId: project._id,
    action: 'PROJECT_CREATED',
    resourceType: 'project',
    resourceName: project.name,
    metadata: { organizationId: organization._id.toString() },
  });

  return project;
};

export const getProjectsForOrganization = async (organizationId, user) => {
  await verifyOrganizationAccess(organizationId, user);
  return Project.find({ organizationId }).sort({ createdAt: -1 });
};

export const getProjectById = async (projectId, user) => {
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    const error = new Error('Invalid project id');
    error.statusCode = 400;
    throw error;
  }

  const project = await Project.findById(projectId);
  if (!project) {
    const error = new Error('Project not found');
    error.statusCode = 404;
    throw error;
  }

  await verifyOrganizationAccess(project.organizationId, user);
  return project;
};

export const updateProject = async (projectId, updates, user) => {
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    const error = new Error('Invalid project id');
    error.statusCode = 400;
    throw error;
  }

  const project = await Project.findById(projectId);
  if (!project) {
    const error = new Error('Project not found');
    error.statusCode = 404;
    throw error;
  }

  await verifyOrganizationAccess(project.organizationId, user);

  if (updates.name) {
    const baseSlug = generateSlug(updates.name);
    project.slug = await ensureUniqueSlug(project.organizationId, baseSlug, project._id);
    project.name = updates.name;
  }

  if (typeof updates.description === 'string') {
    project.description = updates.description;
  }

  await project.save();

  await logActivity({
    userId: user._id,
    organizationId: project.organizationId,
    projectId: project._id,
    action: 'PROJECT_UPDATED',
    resourceType: 'project',
    resourceName: project.name,
    metadata: { updatedFields: Object.keys(updates) },
  });

  return project;
};

export const deleteProject = async (projectId, user) => {
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    const error = new Error('Invalid project id');
    error.statusCode = 400;
    throw error;
  }

  const project = await Project.findById(projectId);
  if (!project) {
    const error = new Error('Project not found');
    error.statusCode = 404;
    throw error;
  }

  await verifyOrganizationAccess(project.organizationId, user);
  await Project.findByIdAndDelete(project._id);

  await logActivity({
    userId: user._id,
    organizationId: project.organizationId,
    projectId: project._id,
    action: 'PROJECT_DELETED',
    resourceType: 'project',
    resourceName: project.name,
    metadata: { organizationId: project.organizationId.toString() },
  });
};
