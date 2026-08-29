# Changelog

This is a project-level implementation history.

## Format

For meaningful changes, record:

```text
## YYYY-MM-DD — Short title

### Changed
- ...

### Security impact
- ...

### Documentation
- ...
```

## 2026-08-25 — Project context documentation established

### Added
- persistent AI-agent project context
- architecture/security documentation
- environment and authentication rules
- milestone/progress tracking
- decision log
- agent operating instructions

### Security impact
- documented AES-256-GCM requirements
- documented secret separation
- documented HttpOnly cookie authentication preference
- documented no-secret-logging rule

## 2026-08-25 — Milestone 8 RBAC

### Changed
- added centralized permission constants and role-to-permission mappings
- added reusable authorization middleware using existing memberships
- protected organization, project, environment, secret, and audit routes
- scoped audit-log reads to the authenticated member's organization

### Security impact
- unauthorized operations return a generic HTTP 403 response
- authorization failures are recorded as `PERMISSION_DENIED`
- developer and viewer capabilities are restricted server-side

### Documentation
- documented the RBAC matrix and protected routes
- reconciled the explicit RBAC M8 request with the older roadmap label for M8 frontend integration

## 2026-08-28 — Milestone 8.5 Backend hardening

### Changed
- added server-local Vitest, Supertest, and MongoDB Memory Server test infrastructure
- added encryption, authentication, API isolation, RBAC, audit, leakage, and rate-limit tests
- stopped returning access JWTs in registration/login JSON responses
- hardened cookie parsing, cookie clearing, credentialed CORS, and authentication rate limiting
- repaired expected service errors to use the existing custom `ErrorHandler`
- added OpenAPI and Postman documentation under `server/docs/`

### Security impact
- test data uses an isolated in-memory MongoDB instance and generated test keys
- normal secret responses are verified to exclude plaintext and encryption internals
- audit reads are tenant-scoped and denied operations are verified as `PERMISSION_DENIED`
- authentication errors no longer expose token details or credentials

### Documentation
- documented the M8.5 test commands, API specification, collection, and remaining production considerations

## 2026-08-29 — Local CORS origin alignment

### Changed
- aligned the backend `CORS_ORIGIN` value with the active frontend dev origin at `http://127.0.0.1:5173`
- verified the app now returns the allow-origin header for the live frontend origin instead of rejecting the request as a mismatched origin

### Security impact
- preserves credentialed cookie authentication without broadening the allowed origin list
- keeps the CORS policy explicit and scoped to the actual local dev frontend

### Documentation
- recorded the root-cause fix for the browser-origin mismatch observed during login/session verification
