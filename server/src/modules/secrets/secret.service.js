import mongoose from 'mongoose';
import Secret from './secret.model.js';
import Environment from '../environments/environment.model.js';
import Project from '../projects/project.model.js';
import Organization from '../organizations/organization.model.js';
import Membership from '../organizations/membership.model.js';
import { encrypt, decrypt } from '../../security/encryption.js';
import { logActivity } from '../audit/audit.service.js';

const ensureUniqueKey = async (environmentId, key, ignoreId = null) => {
  const query = { environmentId, key };
  if (ignoreId) query._id = { $ne: ignoreId };
  const existing = await Secret.findOne(query);
  if (existing) {
    const err = new Error('A secret with that key already exists in this environment');
    err.statusCode = 409;
    throw err;
  }
};

const verifyOrganizationMembership = async (organizationId, user) => {
  if (!mongoose.Types.ObjectId.isValid(organizationId)) {
    const error = new Error('Invalid organization id');
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

const verifyProjectAndEnvironmentAccess = async (projectId, environmentId, user) => {
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

  await verifyOrganizationMembership(project.organizationId, user);

  if (environmentId) {
    if (!mongoose.Types.ObjectId.isValid(environmentId)) {
      const error = new Error('Invalid environment id');
      error.statusCode = 400;
      throw error;
    }

    const environment = await Environment.findById(environmentId);
    if (!environment) {
      const error = new Error('Environment not found');
      error.statusCode = 404;
      throw error;
    }

    if (environment.projectId.toString() !== project._id.toString()) {
      const error = new Error('Environment does not belong to the specified project');
      error.statusCode = 400;
      throw error;
    }

    return { project, environment };
  }

  return { project };
};

export const createSecret = async ({ key, value, description, environmentId }, user) => {
  const environment = await Environment.findById(environmentId);
  if (!environment) {
    const error = new Error('Environment not found');
    error.statusCode = 404;
    throw error;
  }

  const project = await Project.findById(environment.projectId);
  if (!project) {
    const error = new Error('Project not found');
    error.statusCode = 404;
    throw error;
  }

  await verifyOrganizationMembership(project.organizationId, user);

  await ensureUniqueKey(environment._id, key);

  // Encrypt value
  const { encryptedValue, iv, authTag } = encrypt(value);

  const secret = await Secret.create({
    key: key.trim(),
    encryptedValue,
    iv,
    authTag,
    description: description || '',
    environmentId: environment._id,
    createdBy: user._id,
  });

  await logActivity({
    userId: user._id,
    organizationId: project.organizationId,
    projectId: project._id,
    environmentId: environment._id,
    secretId: secret._id,
    action: 'SECRET_CREATED',
    resourceType: 'secret',
    resourceName: secret.key,
    metadata: { environmentId: environment._id.toString() },
  });

  // Do not return sensitive fields
  const obj = secret.toObject();
  delete obj.encryptedValue;
  delete obj.iv;
  delete obj.authTag;

  return obj;
};

export const listSecrets = async (environmentId, user) => {
  const environment = await Environment.findById(environmentId);
  if (!environment) {
    const error = new Error('Environment not found');
    error.statusCode = 404;
    throw error;
  }

  const project = await Project.findById(environment.projectId);
  if (!project) {
    const error = new Error('Project not found');
    error.statusCode = 404;
    throw error;
  }

  await verifyOrganizationMembership(project.organizationId, user);

  const secrets = await Secret.find({ environmentId }).select('key description createdAt updatedAt');
  return secrets;
};

export const revealSecret = async (secretId, user) => {
  if (!mongoose.Types.ObjectId.isValid(secretId)) {
    const error = new Error('Invalid secret id');
    error.statusCode = 400;
    throw error;
  }

  const secret = await Secret.findById(secretId);
  if (!secret) {
    const error = new Error('Secret not found');
    error.statusCode = 404;
    throw error;
  }

  const environment = await Environment.findById(secret.environmentId);
  if (!environment) {
    const error = new Error('Environment not found');
    error.statusCode = 404;
    throw error;
  }

  const project = await Project.findById(environment.projectId);
  if (!project) {
    const error = new Error('Project not found');
    error.statusCode = 404;
    throw error;
  }

  try {
    await verifyOrganizationMembership(project.organizationId, user);

    // Decrypt value
    const plaintext = decrypt(secret.encryptedValue, secret.iv, secret.authTag);

    await logActivity({
      userId: user._id,
      organizationId: project.organizationId,
      projectId: project._id,
      environmentId: environment._id,
      secretId: secret._id,
      action: 'SECRET_REVEALED',
      resourceType: 'secret',
      resourceName: secret.key,
      metadata: { environmentId: environment._id.toString() },
    });

    return { key: secret.key, value: plaintext, description: secret.description, createdAt: secret.createdAt, updatedAt: secret.updatedAt };
  } catch (error) {
    await logActivity({
      userId: user._id,
      organizationId: project.organizationId,
      projectId: project._id,
      environmentId: environment._id,
      secretId: secret._id,
      action: 'SECRET_REVEAL_DENIED',
      resourceType: 'secret',
      resourceName: secret.key,
      status: 'denied',
      metadata: { environmentId: environment._id.toString(), reason: error.message },
    });
    throw error;
  }
};

export const updateSecret = async (secretId, updates, user) => {
  if (!mongoose.Types.ObjectId.isValid(secretId)) {
    const error = new Error('Invalid secret id');
    error.statusCode = 400;
    throw error;
  }

  const secret = await Secret.findById(secretId);
  if (!secret) {
    const error = new Error('Secret not found');
    error.statusCode = 404;
    throw error;
  }

  const environment = await Environment.findById(secret.environmentId);
  if (!environment) {
    const error = new Error('Environment not found');
    error.statusCode = 404;
    throw error;
  }

  const project = await Project.findById(environment.projectId);
  if (!project) {
    const error = new Error('Project not found');
    error.statusCode = 404;
    throw error;
  }

  await verifyOrganizationMembership(project.organizationId, user);

  if (updates.key && updates.key !== secret.key) {
    await ensureUniqueKey(secret.environmentId, updates.key, secret._id);
    secret.key = updates.key.trim();
  }

  if (typeof updates.description === 'string') {
    secret.description = updates.description;
  }

  if (updates.value) {
    const { encryptedValue, iv, authTag } = encrypt(updates.value);
    secret.encryptedValue = encryptedValue;
    secret.iv = iv;
    secret.authTag = authTag;
  }

  await secret.save();

  await logActivity({
    userId: user._id,
    organizationId: project.organizationId,
    projectId: project._id,
    environmentId: environment._id,
    secretId: secret._id,
    action: 'SECRET_UPDATED',
    resourceType: 'secret',
    resourceName: secret.key,
    metadata: { environmentId: environment._id.toString() },
  });

  const obj = secret.toObject();
  delete obj.encryptedValue;
  delete obj.iv;
  delete obj.authTag;
  return obj;
};

export const deleteSecret = async (secretId, user) => {
  if (!mongoose.Types.ObjectId.isValid(secretId)) {
    const error = new Error('Invalid secret id');
    error.statusCode = 400;
    throw error;
  }

  const secret = await Secret.findById(secretId);
  if (!secret) {
    const error = new Error('Secret not found');
    error.statusCode = 404;
    throw error;
  }

  const environment = await Environment.findById(secret.environmentId);
  if (!environment) {
    const error = new Error('Environment not found');
    error.statusCode = 404;
    throw error;
  }

  const project = await Project.findById(environment.projectId);
  if (!project) {
    const error = new Error('Project not found');
    error.statusCode = 404;
    throw error;
  }

  await verifyOrganizationMembership(project.organizationId, user);

  await Secret.findByIdAndDelete(secret._id);

  await logActivity({
    userId: user._id,
    organizationId: project.organizationId,
    projectId: project._id,
    environmentId: environment._id,
    secretId: secret._id,
    action: 'SECRET_DELETED',
    resourceType: 'secret',
    resourceName: secret.key,
    metadata: { environmentId: environment._id.toString() },
  });
};
