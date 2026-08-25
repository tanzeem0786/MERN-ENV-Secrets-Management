# Database

## Technology

MongoDB with Mongoose is the intended persistence layer.

The actual schemas in the repository are authoritative.

## Secret record principles

A managed secret record should separate:
- identity/metadata
- ownership/access information
- encrypted value
- IV
- authentication tag
- timestamps

Conceptually:

```text
Secret
├── name
├── description/metadata
├── owner/access scope
├── encryptedValue
├── iv
├── authTag
├── createdAt
└── updatedAt
```

Exact field names must follow the current implementation.

## Encryption storage

Never store the plaintext secret alongside the encrypted value.

The encryption key must not be stored in MongoDB.

## Sensitive fields

Consider minimizing exposure through:
- schema transforms
- selective projections
- response DTOs
- explicit decryption only when needed

## Database errors

Database errors should be handled centrally and mapped to safe API responses.

Do not return raw MongoDB error details to clients in production.
