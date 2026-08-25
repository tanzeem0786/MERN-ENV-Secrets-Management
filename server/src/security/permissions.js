export const PERMISSIONS = Object.freeze({
  ORGANIZATION_READ: 'organization:read',
  ORGANIZATION_UPDATE: 'organization:update',
  ORGANIZATION_DELETE: 'organization:delete',
  PROJECT_READ: 'project:read',
  PROJECT_CREATE: 'project:create',
  PROJECT_UPDATE: 'project:update',
  PROJECT_DELETE: 'project:delete',
  ENVIRONMENT_READ: 'environment:read',
  ENVIRONMENT_CREATE: 'environment:create',
  ENVIRONMENT_UPDATE: 'environment:update',
  ENVIRONMENT_DELETE: 'environment:delete',
  SECRET_READ: 'secret:read',
  SECRET_CREATE: 'secret:create',
  SECRET_UPDATE: 'secret:update',
  SECRET_DELETE: 'secret:delete',
  SECRET_REVEAL: 'secret:reveal',
  AUDIT_READ: 'audit:read',
  MEMBER_INVITE: 'member:invite',
  MEMBER_REMOVE: 'member:remove',
  ROLE_UPDATE: 'role:update',
});

export const ALL_PERMISSIONS = Object.freeze(Object.values(PERMISSIONS));
