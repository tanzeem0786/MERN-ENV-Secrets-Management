import Organization from './organization.model.js';
import Membership from './membership.model.js';
import mongoose from 'mongoose';
import ErrorHandler from '../../middleware/errorHandler.js';

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

export const createOrganization = async ({ name }, user, res) => {
  const base = generateSlug(name);
  const slug = await ensureUniqueSlug(base);

  const org = await Organization.create({ name, slug, ownerId: user._id });

  try {
    await Membership.create({ userId: user._id, organizationId: org._id, role: 'owner' });
  } catch (err) {
    // rollback organization if membership creation fails
    await Organization.findByIdAndDelete(org._id);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to Create Membership for Organisation!",
    });
    // return next(new ErrorHandler("Failed to Create Membership for Organization!", 500));
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
    return next(new ErrorHandler("Invalid Organization ID!", 400));
  }

  const org = await Organization.findById(id);
  if (!org) {
    return next(new ErrorHandler("Organization Not Found!", 404));
  }

  // Verify that user is a member of the organization
  const membership = await Membership.findOne({ userId: user._id, organizationId: org._id });
  if (!membership) {
    return next(new ErrorHandler("Access Denied!", 403));
  }

  return org;
};

export const updateOrganization = async (id, updates, user) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorHandler("Invalid Organization ID!", 400));
  }

  const org = await Organization.findById(id);
  if (!org) {
    return next(new ErrorHandler("Organization Not Found!", 404));
  }

  // Only owner may update
  if (org.ownerId.toString() !== user._id.toString()) {
    return next(new ErrorHandler("Only the Organization Owner may Update the Organization", 403));
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
    return next(new ErrorHandler("Invalid Organization ID!", 400));
  }

  const org = await Organization.findById(id);
  if (!org) {
    return next(new ErrorHandler("Organization Not Found!", 404));
  }

  // Only owner may delete
  if (org.ownerId.toString() !== user._id.toString()) {
    return next(new ErrorHandler("Only the Organization Owner may Delete the organization", 403));
  }

  // Delete memberships and organization
  await Membership.deleteMany({ organizationId: org._id });
  await Organization.findByIdAndDelete(org._id);

  return;
};
