# Security Requirements

## Threat model

Assume:
- frontend input can be manipulated
- requests can be replayed
- users can attempt unauthorized resource access
- database contents can be exposed
- logs can be exposed
- source code can be exposed
- an attacker may exploit XSS/CSRF/misconfiguration
- developers may accidentally commit secrets

The application should minimize blast radius.

## Secrets at rest

Managed secrets must be encrypted using AES-256-GCM.

Required:
- 32-byte key
- cryptographically random IV for every encryption
- authentication tag
- authenticated decryption

Never use:
- plaintext database storage
- deterministic encryption without a justified design
- AES-ECB
- static/reused GCM IVs

## Key management

`SECRET_ENCRYPTION_KEY` is a Base64-encoded 32-byte key.

Generate it with a secure random source, for example:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Production secret material should be provided through a secret-management system/environment injection mechanism where available.

Never commit it.

## JWT

JWT signing secret must be separate from the encryption key.

Preferred browser storage:
- HttpOnly cookie
- Secure in production
- appropriate SameSite setting
- short-lived access token

Avoid:
- localStorage
- sessionStorage

because JavaScript-accessible token storage increases the impact of XSS.

## Cookies

Production authentication cookies should use:

```text
HttpOnly = true
Secure = true
SameSite = appropriate policy
```

Do not choose `SameSite=None` unless cross-site cookie behavior is actually required and CSRF protections are addressed.

## CSRF

When cookie-based authentication is used, evaluate CSRF protection based on deployment topology and SameSite configuration.

If cross-site requests are required, add an explicit CSRF mitigation strategy rather than assuming CORS is CSRF protection.

## Passwords

Passwords must never be stored in plaintext.

Use an established password hashing algorithm/library such as bcrypt/Argon2 according to the project's existing dependency and design.

Never log passwords.

## Authorization

Authentication answers:
> Who are you?

Authorization answers:
> Are you allowed to do this?

Both must be enforced server-side.

Never trust:
- role values supplied by the client
- user IDs supplied without ownership checks
- hidden frontend UI state

## Logging

Never log:
- passwords
- JWTs
- refresh tokens
- encryption keys
- plaintext managed secrets
- database credentials
- complete authorization headers

## Production errors

Do not expose:
- stack traces
- filesystem paths
- database error internals
- secret values
- implementation details

Use centralized error handling.

## Dependency security

Prefer established, maintained packages.

Before adding a package, check whether:
- Node.js built-ins already provide the feature
- an existing project dependency already provides it

Avoid unnecessary dependency growth.
