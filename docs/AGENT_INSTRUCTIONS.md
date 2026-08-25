# AI Agent Instructions

## Role

You are working on the **Environment Secret Management** project, a security-focused MERN application.

Your job is to implement requested changes safely, consistently, and incrementally. Do not behave like a generic code generator.

## Mandatory startup procedure

Before changing code:

1. Read this file.
2. Read `PROJECT_CONTEXT.md`.
3. Read `ARCHITECTURE.md`.
4. Read `SECURITY.md`.
5. Read `CURRENT_PROGRESS.md`.
6. Read the relevant topic document(s).
7. Inspect the actual repository structure and relevant source files.
8. Determine whether the documentation matches the implementation.
9. Identify dependencies and existing patterns before introducing new ones.

Do not start implementation based only on the task description.

## Source-of-truth rule

If docs and code disagree:

- inspect code and tests first;
- do not blindly overwrite working code;
- determine whether the code or documentation is stale;
- ask for clarification if the conflict changes architecture/security behavior;
- otherwise preserve working behavior and update documentation after the decision.

## Implementation rules

- Make the smallest coherent change that solves the requested problem.
- Do not rewrite unrelated modules.
- Do not introduce a new library when an existing dependency or native Node.js API already solves the problem.
- Reuse existing utilities, middleware, schemas, services, and conventions.
- Keep controllers thin; put business logic in services.
- Validate external input at application boundaries.
- Never trust client-provided authorization claims.
- Never log secrets, passwords, JWTs, encryption keys, refresh tokens, or sensitive plaintext.
- Never hardcode secrets.
- Never commit `.env`, production secrets, private keys, or generated credentials.
- Never weaken validation merely to make development work.
- Never silently change security-sensitive defaults.
- Never expose internal stack traces or sensitive implementation details in production API responses.

## Environment rules

All environment variables must be accessed through the centralized environment configuration module after validation.

Do not scatter raw `process.env.X` access throughout business logic.

Required environment variables currently include:

- `NODE_ENV`
- `PORT`
- `MONGODB_URI`
- `CORS_ORIGIN`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `SECRET_ENCRYPTION_KEY`

`SECRET_ENCRYPTION_KEY` is a Base64-encoded 32-byte key for AES-256-GCM.

Generate production encryption keys using a cryptographically secure random generator. Never invent a human-readable production key.

## Error handling rules

Use the project's custom error class (`ErrorHandler` / `AppError`, depending on the current implementation) for expected application errors that need an HTTP status.

Examples:
- validation failures
- authentication failures
- authorization failures
- not-found errors
- conflict errors

Unexpected programming/runtime errors should be allowed to reach the centralized error middleware unless there is a specific reason to wrap them.

Never expose stack traces in production responses.

## Authentication rules

JWTs must not be stored in `localStorage` or `sessionStorage` for this security-sensitive application.

Preferred architecture:
- short-lived access JWT
- HttpOnly cookie
- `Secure` in production
- appropriate `SameSite` policy
- refresh-token mechanism when implemented
- refresh-token revocation/rotation where supported

The browser should not need JavaScript access to the access token.

## Encryption rules

Secrets stored by the application must be encrypted with authenticated encryption.

Current intended primitive:

- AES-256-GCM
- 32-byte raw encryption key
- Base64 representation in environment configuration
- fresh random 12-byte IV per encryption
- authentication tag stored with ciphertext
- ciphertext, IV, and auth tag may be stored together
- encryption key must never be stored alongside encrypted application data

Never reuse an IV with the same AES-GCM key.

## Agent behavior

Before implementation, explain internally:

- what files are involved
- what existing behavior must remain
- what security properties must be preserved
- what tests/verification are needed

Do not create speculative abstractions.

After implementation:

1. Run relevant tests/lint/type checks if available.
2. Review the diff.
3. Check for accidental secret exposure.
4. Update `CURRENT_PROGRESS.md` if project state changed.
5. Update `CHANGELOG.md` for meaningful implementation changes.
6. Update `DECISION_LOG.md` when a new architectural/security decision is made.

## Milestone discipline

Milestones are implemented sequentially unless explicitly instructed otherwise.

Do not skip a milestone requirement just because a later milestone could implement it differently.

If the current code has already partially implemented a future feature, preserve it and reconcile it with the milestone plan rather than duplicating it.

## Git discipline

Do not create commits unless explicitly requested.

Before suggesting a commit:
- verify the diff
- ensure secrets are not staged
- ensure generated/build files are not accidentally included
- summarize the changes

## When uncertain

Do not guess about:
- authentication semantics
- authorization rules
- encryption behavior
- secret storage
- database schema changes
- destructive migrations
- production configuration

Ask for clarification when the uncertainty can materially affect security or data integrity.
