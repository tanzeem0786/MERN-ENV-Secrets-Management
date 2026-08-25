# API Conventions

## General principles

- RESTful resource naming
- consistent HTTP status codes
- predictable JSON response structures
- validation at request boundaries
- centralized error handling
- authentication/authorization middleware before protected controllers

## Typical status codes

```text
200 OK
201 Created
204 No Content
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
422 Unprocessable Entity (if adopted)
500 Internal Server Error
```

Use the project's established convention if it differs.

## Response principle

Do not expose encrypted implementation details unnecessarily.

For secret list endpoints, return metadata rather than decrypted secret values unless explicitly required.

## Protected routes

Expected ordering:

```text
Route
  |
  v
Authentication
  |
  v
Authorization
  |
  v
Validation
  |
  v
Controller
```

The exact order can differ when a validation step is intentionally safe before authentication, but protected business operations must not be reachable without proper authorization.

## Input validation

Validate:
- body
- params
- query
- relevant headers/cookies

Do not trust frontend validation.

## Resource ownership

Whenever a user accesses a resource by ID, verify that they are authorized to access that resource.

Do not assume that knowing an ID grants access.

## Secret reveal endpoints

If an endpoint returns plaintext secret material:
- require authentication
- require authorization
- avoid logging the value
- avoid caching sensitive responses
- return only what is required

## RBAC

Protected organization resources use the membership role stored in `Membership`. The supported roles are `owner`, `admin`, `developer`, and `viewer`.

| Permission | Owner | Admin | Developer | Viewer |
| --- | --- | --- | --- | --- |
| Project read/create/update/delete | Yes | Yes | Read | Read |
| Environment read/create/update/delete | Yes | Yes | Read | Read |
| Secret read/create/update/delete/reveal | Yes | Yes | Read/create/update/reveal | Read |
| Audit read | Yes | Yes | Yes | Yes |
| Member and role management | Yes | No | No | No |

Authorization middleware runs after authentication and before validation/controllers. A denied request returns:

```json
{
  "success": false,
  "message": "Forbidden"
}
```

The response is always HTTP `403`, and the denial is recorded as `PERMISSION_DENIED` in the audit log.

### Protected routes

| Method | Route | Permission |
| --- | --- | --- |
| GET | `/api/organizations/:id` | `organization:read` |
| PUT | `/api/organizations/:id` | `organization:update` |
| DELETE | `/api/organizations/:id` | `organization:delete` |
| GET/POST/PATCH/DELETE | `/api/projects` or `/api/projects/:id` | Corresponding `project:*` permission |
| GET/POST/PATCH/DELETE | `/api/environments` or `/api/environments/:id` | Corresponding `environment:*` permission |
| GET/POST/PATCH/DELETE | `/api/secrets` or `/api/secrets/:id` | Corresponding `secret:*` permission |
| POST | `/api/secrets/:id/reveal` | `secret:reveal` |
| GET | `/api/audit-logs` | `audit:read` |
