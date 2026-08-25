# Authentication

## Authentication architecture

The preferred architecture is cookie-based JWT authentication.

```text
Login
  |
  v
Verify credentials
  |
  v
Generate access JWT
  |
  v
Set HttpOnly cookie
```

Browser requests automatically include the cookie when configured correctly.

## Access token

Recommended properties:
- short-lived
- signed using `JWT_SECRET`
- stored in an HttpOnly cookie
- Secure in production
- appropriate SameSite policy

The frontend should not need to read the access token.

## Refresh tokens

If/when implemented:
- use a longer-lived refresh token
- store it in an HttpOnly cookie
- rotate/revoke refresh tokens as appropriate
- store only a hashed representation server-side when persistence is required
- invalidate the refresh token on logout/revocation

## JWT payload

Keep JWT payload minimal.

Do not put:
- passwords
- secret values
- encryption keys
- sensitive personal data
- large objects

Typical claims may include:
- user ID
- role/permissions where appropriate
- issued-at
- expiration

Authorization must still be enforced server-side.

## Authentication middleware

Expected flow:

```text
Request
  |
  v
Read auth cookie
  |
  v
Verify JWT
  |
  v
Find/validate user as required
  |
  v
Attach authenticated identity to request
  |
  v
Next middleware/controller
```

## Logout

Logout should:
- clear the authentication cookie
- revoke/invalidate refresh state if refresh tokens are implemented

## Credential errors

Do not unnecessarily reveal whether a username/email exists during authentication if that would create an account-enumeration issue.

Use generic authentication failure messages where appropriate.
