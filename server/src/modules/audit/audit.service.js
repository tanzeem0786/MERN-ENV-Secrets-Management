import AuditLog from './audit.model.js';

const sanitizeMetadata = (metadata) => {
  if (!metadata || typeof metadata !== 'object') return {};

  const safe = {};
  for (const [key, value] of Object.entries(metadata)) {
    if (typeof value === 'string') {
      safe[key] = value;
      continue;
    }

    if (typeof value === 'number' || typeof value === 'boolean' || value === null) {
      safe[key] = value;
      continue;
    }

    if (Array.isArray(value)) {
      safe[key] = value.slice(0, 10).map((item) => {
        if (typeof item === 'string') return item;
        if (typeof item === 'number' || typeof item === 'boolean' || item === null) return item;
        return String(item);
      });
      continue;
    }

    safe[key] = String(value);
  }

  return safe;
};

export const logActivity = async ({
  userId,
  organizationId,
  projectId,
  environmentId,
  secretId,
  action,
  resourceType,
  resourceName,
  status = 'success',
  ipAddress = '',
  userAgent = '',
  metadata = {},
}) => {
  const safeMetadata = sanitizeMetadata(metadata);

  return AuditLog.create({
    userId,
    organizationId,
    projectId,
    environmentId,
    secretId,
    action,
    resourceType,
    resourceName,
    status,
    ipAddress,
    userAgent,
    metadata: safeMetadata,
  });
};

export const getAuditLogs = async ({ userId, action, projectId, page = 1, limit = 20 }) => {
  const filter = {};
  if (userId) filter.userId = userId;
  if (action) filter.action = action;
  if (projectId) filter.projectId = projectId;

  const pageNumber = Math.max(1, Number(page) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(limit) || 20));

  const [logs, total] = await Promise.all([
    AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .lean(),
    AuditLog.countDocuments(filter),
  ]);

  return {
    logs,
    pagination: {
      page: pageNumber,
      limit: pageSize,
      total,
      pages: Math.ceil(total / pageSize),
    },
  };
};
