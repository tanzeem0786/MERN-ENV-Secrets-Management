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

## D008 — CLI-local session storage without browser cookie reuse

**Date:** 2026-08-30

**Decision:** Store CLI authentication state in an OS-scoped user configuration directory and persist only the server-issued access token; do not extract or copy browser cookies.

**Context:** The backend uses an HttpOnly cookie-based JWT flow for browser sessions, while the CLI must run independently and should not touch browser storage.

**Alternatives considered:** Reusing browser cookies, storing the plaintext password locally, storing tokens in the repository, or inventing a separate custom auth scheme.

**Reason:** The backend already exposes a cookie-based login/logout flow that is compatible with a CLI-driven session if the CLI stores the cookie value locally, while keeping browser credentials isolated and avoiding password persistence.

**Consequences:** Future CLI commands can authenticate by sending the stored cookie header to the backend without reading browser state. The CLI must never log credentials or tokens and must clear local session state on logout.

## D009 — Interactive credential prompts without embedded secrets

**Date:** 2026-08-31

**Decision:** The CLI login command must prompt for credentials at runtime and never hardcode or persist a password in the source tree or config file.

**Context:** The CLI earlier contained a hardcoded email and password pair, which violated the project's security requirements and contradicted the documented authentication flow.

**Alternatives considered:** Storing credentials in plaintext in code, reading from a persisted file, or silently accepting environment variables containing secrets.

**Reason:** The project explicitly prohibits secret persistence, requires no plaintext password storage, and documents an interactive login flow that keeps credentials in memory only for the duration of the request.

**Consequences:** The CLI now opens an interactive prompt for email and password, masks the password while entered, and stores only the session token returned by the backend. Any environment that cannot provide an interactive TTY will fail safely instead of embedding credentials.

## Adding decisions

For every new architectural/security decision, record:
- decision
- date
- context
- alternatives considered
- reason
- consequences

Do not overwrite historical decisions. Add a new entry when a decision changes.
