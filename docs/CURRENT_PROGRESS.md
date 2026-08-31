# Current Progress

> This file is intentionally maintained as the project's live status document.

## Current milestone

Update this section whenever work moves forward.

```text
Current milestone: M10.2
Status: In progress
```

### CLI authentication

The CLI now supports a minimal authenticated session flow using the backend's existing cookie-based login/logout endpoints without extracting browser credentials. The CLI persists only the server-issued access token in an OS-scoped configuration directory and does not store the user's password.

The login command now prompts for email and password interactively instead of relying on any embedded credentials and never persists the password to disk.

## Completed / known implementation

### Environment validation

Implemented centralized environment validation using dotenv + Zod.

Known variables:
- NODE_ENV
- PORT
- MONGODB_URI
- CORS_ORIGIN
- JWT_SECRET
- JWT_EXPIRES_IN
- SECRET_ENCRYPTION_KEY

### Encryption

Implemented AES-256-GCM encryption utility.

Current properties:
- AES-256-GCM
- 12-byte random IV
- 16-byte authentication tag
- Base64 serialization
- strict 32-byte decoded key validation

### Error handling

A custom `ErrorHandler` class has been introduced and applied instead of relying exclusively on `throw new Error()`.

The exact implementation in the repository is authoritative.

### Authentication

JWT authentication is part of the project design.

Preferred storage is HttpOnly cookie rather than localStorage/sessionStorage.

### Role-based access control

Implemented centralized permissions for `owner`, `admin`, `developer`, and `viewer` memberships. Existing organization, project, environment, secret, and audit routes now enforce permissions server-side. Authorization failures return HTTP 403 and create `PERMISSION_DENIED` audit entries.

### Backend hardening and testing

Implemented server-local Vitest, Supertest, and MongoDB Memory Server coverage for authentication, tenant isolation, CRUD flows, secret leakage, encryption integrity, RBAC, audit behavior, validation, and rate limiting. Added OpenAPI and Postman documentation under `server/docs/`.

### Local frontend origin alignment

Verified the backend CORS configuration matches the live Vite frontend origin (`http://127.0.0.1:5173`) so credentialed cookie-based requests are accepted without an origin mismatch.

## Important open items

Verify in the actual code before claiming completion:

- [ ] exact login/register implementation
- [ ] exact cookie configuration
- [ ] refresh-token strategy
- [x] authorization/ownership checks
- [ ] secret CRUD implementation
- [ ] reveal-secret endpoint security
- [ ] CSRF strategy for deployment topology
- [x] security-focused tests
- [x] production hardening
- [ ] frontend integration
- [x] documentation/code consistency

## Agent update rule

After meaningful implementation:
- update this file
- mark completed items only after verifying the actual code/tests
- do not claim a feature is complete based only on intent
