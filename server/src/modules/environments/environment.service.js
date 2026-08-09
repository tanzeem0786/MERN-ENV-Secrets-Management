import mongoose from 'mongoose';
import Environment from './environment.model.js';
import Project from '../projects/project.model.js';
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
  return base || `environment-${Date.now()}`;
};

const ensureUniqueSlug = async (projectId, base, ignoreId = null) => {
  let slug = base;
  let count = 0;
  const query = { projectId, slug };

  while (await Environment.findOne(ignoreId ? { ...query, _id: { $ne: ignoreId } } : query)) {
    count += 1;
    slug = `${base}-${Math.random().toString(36).substring(2, 8)}${count}`;
    if (count > 10) slug = `${base}-${Date.now()}`;
    query.slug = slug;
  }

  return slug;
};

const ensureUniqueName = async (projectId, name, ignoreId = null) => {
  const normalized = name.trim();
  const query = {
    projectId,
    name: new RegExp(`^${normalized.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'),
  };
  if (ignoreId) query._id = { $ne: ignoreId };

  const existing = await Environment.findOne(query);
  if (existing) {
    return next(new ErrorHandler("An environment with that name already exists in this project!", 409));
  }
};

const verifyOrganizationMembership = async (organizationId, user) => {
  if (!mongoose.Types.ObjectId.isValid(organizationId)) {
    return next(new ErrorHandler("Invalid Organization ID!", 400));
  }

  const organization = await Organization.findById(organizationId);
  if (!organization) {
    return next(new ErrorHandler("Organization Not Found!", 404));
  }

  const membership = await Membership.findOne({ organizationId, userId: user._id });
  if (!membership) {
    return next(new ErrorHandler("Access Denied!", 403));
  }

  return organization;
};

const verifyProjectAccess = async (projectId, user) => {
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    return next(new ErrorHandler("Invalid Project ID!", 400));
  }

  const project = await Project.findById(projectId);
  if (!project) {
    return next(new ErrorHandler("Project Not Found!", 404));
  }

  await verifyOrganizationMembership(project.organizationId, user);
  return project;
};

const verifyEnvironmentAccess = async (environmentId, user) => {
  if (!mongoose.Types.ObjectId.isValid(environmentId)) {
    return next(new ErrorHandler("Invalid Environment ID!", 400));
  }

  const environment = await Environment.findById(environmentId);
  if (!environment) {
    return next(new ErrorHandler("Environment Not Found!", 404));
  }

  await verifyProjectAccess(environment.projectId, user);
  return environment;
};

export const createEnvironment = async ({ name, description, projectId }, user) => {
  const project = await Project.findById(projectId);
  if (!project) {
    return next(new ErrorHandler("Project Not Found!", 404));
  }

  await verifyOrganizationMembership(project.organizationId, user);
  await ensureUniqueName(project._id, name);

  const baseSlug = generateSlug(name);
  const slug = await ensureUniqueSlug(project._id, baseSlug);

  const environment = await Environment.create({
    name: name.trim(),
    slug,
    description: description || '',
    projectId: project._id,
    createdBy: user._id,
  });

  await logActivity({
    userId: user._id,
    organizationId: project.organizationId,
    projectId: environment.projectId,
    environmentId: environment._id,
    action: 'ENVIRONMENT_CREATED',
    resourceType: 'environment',
    resourceName: environment.name,
    metadata: { projectId: project._id.toString() },
  });

  return environment;
};

export const getEnvironmentsForProject = async (projectId, user) => {
  await verifyProjectAccess(projectId, user);
  return Environment.find({ projectId }).sort({ createdAt: -1 });
};

export const getEnvironmentById = async (environmentId, user) => {
  const environment = await verifyEnvironmentAccess(environmentId, user);
  return environment;
};

export const updateEnvironment = async (environmentId, updates, user) => {
  const environment = await verifyEnvironmentAccess(environmentId, user);

  if (updates.name) {
    await ensureUniqueName(environment.projectId, updates.name, environment._id);
    const baseSlug = generateSlug(updates.name);
    environment.slug = await ensureUniqueSlug(environment.projectId, baseSlug, environment._id);
    environment.name = updates.name.trim();
  }

  if (typeof updates.description === 'string') {
    environment.description = updates.description;
  }

  await environment.save();

  const project = await Project.findById(environment.projectId);
  await logActivity({
    userId: user._id,
    organizationId: project?.organizationId,
    projectId: environment.projectId,
    environmentId: environment._id,
    action: 'ENVIRONMENT_UPDATED',
    resourceType: 'environment',
    resourceName: environment.name,
    metadata: { updatedFields: Object.keys(updates) },
  });

  return environment;
};

export const deleteEnvironment = async (environmentId, user) => {
  const environment = await verifyEnvironmentAccess(environmentId, user);
  const project = await Project.findById(environment.projectId);
  await Environment.findByIdAndDelete(environment._id);

  await logActivity({
    userId: user._id,
    organizationId: project?.organizationId,
    projectId: environment.projectId,
    environmentId: environment._id,
    action: 'ENVIRONMENT_DELETED',
    resourceType: 'environment',
    resourceName: environment.name,
    metadata: { projectId: environment.projectId.toString() },
  });
};
