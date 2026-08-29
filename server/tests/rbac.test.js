import { describe, expect, it } from 'vitest';
import { PERMISSIONS } from '../src/security/permissions.js';
import { ROLE_PERMISSIONS, ROLES, roleHasPermission } from '../src/security/roles.js';

const allowed = {
  owner: Object.values(PERMISSIONS),
  admin: [
    PERMISSIONS.PROJECT_CREATE, PERMISSIONS.PROJECT_UPDATE, PERMISSIONS.PROJECT_DELETE,
    PERMISSIONS.ENVIRONMENT_CREATE, PERMISSIONS.ENVIRONMENT_UPDATE, PERMISSIONS.ENVIRONMENT_DELETE,
    PERMISSIONS.SECRET_CREATE, PERMISSIONS.SECRET_UPDATE, PERMISSIONS.SECRET_DELETE,
    PERMISSIONS.SECRET_REVEAL, PERMISSIONS.AUDIT_READ,
  ],
  developer: [PERMISSIONS.SECRET_CREATE, PERMISSIONS.SECRET_UPDATE, PERMISSIONS.SECRET_REVEAL, PERMISSIONS.AUDIT_READ],
  viewer: [PERMISSIONS.ORGANIZATION_READ, PERMISSIONS.PROJECT_READ, PERMISSIONS.ENVIRONMENT_READ, PERMISSIONS.SECRET_READ, PERMISSIONS.AUDIT_READ],
};

describe('centralized RBAC matrix', () => {
  it('defines every supported role', () => {
    expect(Object.keys(ROLE_PERMISSIONS)).toEqual(Object.values(ROLES));
  });

  for (const [role, permissions] of Object.entries(allowed)) {
    it(`${role} has only the documented permissions`, () => {
      for (const permission of permissions) expect(roleHasPermission(role, permission)).toBe(true);
    });
  }

  it('denies destructive and member operations to developer and viewer', () => {
    for (const role of [ROLES.DEVELOPER, ROLES.VIEWER]) {
      expect(roleHasPermission(role, PERMISSIONS.PROJECT_DELETE)).toBe(false);
      expect(roleHasPermission(role, PERMISSIONS.MEMBER_INVITE)).toBe(false);
      expect(roleHasPermission(role, PERMISSIONS.ROLE_UPDATE)).toBe(false);
    }
  });

  it('does not allow admins to change ownership or roles', () => {
    expect(roleHasPermission(ROLES.ADMIN, PERMISSIONS.ROLE_UPDATE)).toBe(false);
    expect(roleHasPermission(ROLES.ADMIN, PERMISSIONS.MEMBER_INVITE)).toBe(false);
  });
});
