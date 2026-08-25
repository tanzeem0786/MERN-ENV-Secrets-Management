# Decision Log

Record meaningful architectural and security decisions here.

## D001 — Centralized environment validation

**Decision:** Environment variables are loaded and validated centrally with dotenv + Zod.

**Reason:** Fail fast on invalid configuration and avoid scattered raw `process.env` access.

## D002 — AES-256-GCM for managed secret encryption

**Decision:** Use AES-256-GCM.

**Reason:** Provides confidentiality and integrity/authentication.

**Required parameters:**
- 32-byte key
- random 12-byte IV per encryption
- authentication tag

## D003 — Base64 representation of encryption key

**Decision:** Store the 32-byte encryption key as Base64 text in environment configuration.

**Reason:** Raw random bytes are not convenient for `.env` transport.

## D004 — Separate JWT and encryption keys

**Decision:** `JWT_SECRET` and `SECRET_ENCRYPTION_KEY` are independent secrets.

**Reason:** Key separation limits blast radius and follows sound cryptographic practice.

## D005 — Custom application error class

**Decision:** Use a custom error class carrying an HTTP status code for expected application errors.

**Reason:** Enables centralized and consistent HTTP error handling.

## D006 — HttpOnly cookie for JWT

**Decision:** Prefer HttpOnly cookie storage rather than localStorage/sessionStorage.

**Reason:** Prevents ordinary JavaScript from reading the authentication token and reduces the impact of token theft through XSS.

## D007 — Centralized membership-based RBAC

**Date:** 2026-08-25

**Decision:** Resolve permissions from the existing organization membership role through one reusable authorization middleware. Supported roles are owner, admin, developer, and viewer.

**Alternatives considered:** Route-specific role middleware or client-provided roles.

**Reason:** A single permission registry avoids duplicated policy strings, while server-side membership lookup prevents clients from elevating their own privileges.

**Consequences:** New protected operations must register a permission and compose `authenticate` with `authorize(permission)`. Authorization denials are written to the existing audit log.

## Adding decisions

For every new architectural/security decision, record:
- decision
- date
- context
- alternatives considered
- reason
- consequences

Do not overwrite historical decisions. Add a new entry when a decision changes.
