# Frontend / Backend Contract

## Trust boundary

The frontend is a client and must be considered untrusted.

Backend responsibilities:
- authentication
- authorization
- validation
- encryption/decryption
- secret access
- business rules

Frontend responsibilities:
- UI
- user interaction
- API calls
- display of safe API responses
- client-side convenience validation

## Authentication

The frontend should not need to read JWTs when HttpOnly cookie authentication is used.

Requests requiring authentication should send credentials according to the configured frontend HTTP client and CORS policy.

## Secrets

The frontend should never receive:
- `SECRET_ENCRYPTION_KEY`
- `JWT_SECRET`
- database URI
- server credentials

Plaintext managed secret values should only be returned when the user explicitly performs an authorized reveal operation.

## Error handling

The frontend should consume stable API error responses rather than depending on backend stack traces or library-specific exception formats.

## CORS

`CORS_ORIGIN` controls the allowed frontend origin(s).

Do not use permissive wildcard CORS for credentialed authentication.

When cookies are used, frontend/backend CORS and credential settings must be configured consistently.
