# Environment Configuration

## Centralized configuration

Environment variables are loaded and validated in the backend configuration module.

Do not access sensitive configuration directly throughout the codebase.

Preferred:

```js
import { env } from "../config/env.js";
```

Then:

```js
env.JWT_SECRET
```

rather than:

```js
process.env.JWT_SECRET
```

in arbitrary modules.

## Validation

Zod validates:
- required variables
- enum values
- numeric strings
- non-empty strings
- defaults

The application should fail fast during startup when required configuration is invalid.

## Current variables

```text
NODE_ENV
PORT
MONGODB_URI
CORS_ORIGIN
JWT_SECRET
JWT_EXPIRES_IN
SECRET_ENCRYPTION_KEY
```

## SECRET_ENCRYPTION_KEY

Expected format:

```text
Base64 encoding of exactly 32 raw bytes
```

Generate:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Do not use a manually typed phrase.

## JWT_SECRET

Must be a strong cryptographically random secret suitable for JWT signing.

Do not reuse `SECRET_ENCRYPTION_KEY`.

## .env files

Development configuration may be stored locally in an ignored environment file according to the repository convention.

Never commit real production secrets.

## Path handling

Environment file loading must use a path that is deterministic for the project layout.

Do not assume a relative dotenv path is relative to the source file. Node/dotenv path resolution depends on the process working directory.

If path robustness is needed, resolve from the module location using ESM-safe path utilities.

## Startup behavior

Configuration validation should happen before services that depend on it start.

An invalid encryption key should prevent the application from starting.
