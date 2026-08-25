# Error Handling

## Goal

Provide predictable HTTP errors without leaking sensitive implementation details.

## Custom error class

The project uses a custom error class pattern instead of relying only on:

```js
throw new Error("...");
```

Conceptually:

```js
class ErrorHandler extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}
```

The exact class name and fields must follow the actual implementation.

## When to use custom errors

Use the custom error for expected application conditions:

```js
throw new ErrorHandler("User not found", 404);
```

```js
throw new ErrorHandler("Invalid credentials", 401);
```

```js
throw new ErrorHandler("Forbidden", 403);
```

## Unexpected errors

Unexpected programming/runtime errors should reach the centralized error middleware.

Do not catch every error just to convert it into a generic custom error.

Doing so can hide useful debugging information internally and blur the distinction between expected and unexpected failures.

## Central error middleware

Expected shape:

```text
error
 |
 +--> known application error
 |       |
 |       +--> statusCode
 |
 +--> unknown error
         |
         +--> 500
```

Production response should contain a safe message.

Development mode may expose more diagnostic information if intentionally configured, but secrets and credentials must never be exposed.

## Error response consistency

Use a consistent API structure, for example:

```json
{
  "success": false,
  "message": "User not found"
}
```

Exact response shape should follow the current API contract.

## Validation errors

Validation failures should produce a client error status, normally 400 or 422 depending on the established API convention.

Do not return raw Zod internals unless they are intentionally transformed into a stable public format.
