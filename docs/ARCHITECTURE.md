# Architecture

## High-level architecture

```text
React Frontend
      |
      | HTTPS / HTTP in development
      v
Express API
      |
      +--> Middleware
      |      +--> CORS
      |      +--> Authentication
      |      +--> Authorization
      |      +--> Validation
      |      +--> Central Error Handler
      |
      +--> Controllers
      |
      +--> Services
      |
      +--> Models
      |
      v
MongoDB

Sensitive managed secret values
      |
      v
AES-256-GCM encryption
      |
      v
Encrypted value + IV + authentication tag
```

## Layer responsibilities

### Routes

Routes define:
- HTTP method
- URL
- middleware ordering
- controller handler

Routes should not contain business logic.

### Middleware

Middleware handles cross-cutting concerns:
- authentication
- authorization
- validation
- error handling
- request-level security

### Controllers

Controllers:
- receive HTTP input
- call services
- shape HTTP responses

Controllers should remain thin.

### Services

Services contain business logic:
- authentication logic
- secret management
- encryption/decryption orchestration
- database operations when appropriate

### Models

Models define persistence structures and database-level constraints.

### Config

Configuration modules:
- load environment variables
- validate them
- expose typed/normalized configuration

Business logic should not repeatedly read raw environment variables.

## Secret-management flow

```text
Authenticated User
       |
       v
Create/Update Secret
       |
       v
Validate request
       |
       v
Authorize user
       |
       v
Encrypt plaintext
       |
       +--> random IV
       +--> AES-256-GCM
       +--> authentication tag
       |
       v
Store ciphertext + IV + authTag
```

Read flow:

```text
Request
  |
  v
Authenticate
  |
  v
Authorize
  |
  v
Fetch encrypted record
  |
  v
Decrypt using server-side encryption key
  |
  v
Return plaintext only when explicitly authorized
```

## Security boundary

The frontend is untrusted.

The server must perform:
- authentication
- authorization
- validation
- decryption
- secret access control

The frontend must never contain:
- `JWT_SECRET`
- `SECRET_ENCRYPTION_KEY`
- database credentials
- production service credentials

## Data flow principle

Only send the minimum sensitive data required by the requested operation.

Do not return decrypted secret values in list endpoints unless the API contract explicitly requires it.
