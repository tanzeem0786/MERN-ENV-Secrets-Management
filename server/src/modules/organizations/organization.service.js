import Organization from './organization.model.js';
import Membership from './membership.model.js';
import mongoose from 'mongoose';

const generateSlug = (name) => {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');
  return base || `org-${Date.now()}`;
};

const ensureUniqueSlug = async (base) => {
  let slug = base;
  let count = 0;
  while (await Organization.findOne({ slug })) {
    count += 1;
    slug = `${base}-${Math.random().toString(36).substring(2, 8)}${count}`;
    if (count > 10) slug = `${base}-${Date.now()}`;
  }
  return slug;
};

export const createOrganization = async ({ name }, user) => {
  const base = generateSlug(name);
  const slug = await ensureUniqueSlug(base);

  const org = await Organization.create({ name, slug, ownerId: user._id });

  try {
    await Membership.create({ userId: user._id, organizationId: org._id, role: 'owner' });
  } catch (err) {
    // rollback organization if membership creation fails
    await Organization.findByIdAndDelete(org._id);
    const error = new Error('Failed to create membership for organization');
    error.statusCode = 500;
    throw error;
  }

  return org;
};

export const getMyOrganizations = async (user) => {
  // Find memberships for the user and populate the organization
  const memberships = await Membership.find({ userId: user._id }).populate('organizationId');
  return memberships.map((m) => m.organizationId).filter(Boolean);
};

export const getOrganizationById = async (id, user) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Invalid organization id');
    error.statusCode = 400;
    throw error;
  }

  const org = await Organization.findById(id);
  if (!org) {
    const error = new Error('Organization not found');
    error.statusCode = 404;
    throw error;
  }

  // Verify that user is a member of the organization
  const membership = await Membership.findOne({ userId: user._id, organizationId: org._id });
  if (!membership) {
    const error = new Error('Access denied');
    error.statusCode = 403;
    throw error;
  }

  return org;
};

export const updateOrganization = async (id, updates, user) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Invalid organization id');
    error.statusCode = 400;
    throw error;
  }

  const org = await Organization.findById(id);
  if (!org) {
    const error = new Error('Organization not found');
    error.statusCode = 404;
    throw error;
  }

  // Only owner may update
  if (org.ownerId.toString() !== user._id.toString()) {
    const error = new Error('Only the organization owner may update the organization');
    error.statusCode = 403;
    throw error;
  }

  if (updates.name) {
    const base = generateSlug(updates.name);
    const slug = await ensureUniqueSlug(base);
    org.name = updates.name;
    org.slug = slug;
  }

  await org.save();
  return org;
};

export const deleteOrganization = async (id, user) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Invalid organization id');
    error.statusCode = 400;
    throw error;
  }

  const org = await Organization.findById(id);
  if (!org) {
    const error = new Error('Organization not found');
    error.statusCode = 404;
    throw error;
  }

  // Only owner may delete
  if (org.ownerId.toString() !== user._id.toString()) {
    const error = new Error('Only the organization owner may delete the organization');
    error.statusCode = 403;
    throw error;
  }

  // Delete memberships and organization
  await Membership.deleteMany({ organizationId: org._id });
  await Organization.findByIdAndDelete(org._id);

  return;
};
