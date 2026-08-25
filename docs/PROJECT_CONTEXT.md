# Project Context

## Project

**Environment Secret Management**

A security-focused MERN application for managing application/environment secrets in a controlled way.

## Primary objective

Build a portfolio-quality application demonstrating practical backend security, environment configuration management, authenticated secret storage, authorization, encryption, validation, error handling, and a clean frontend/backend architecture.

This is intentionally more substantial than a basic CRUD application.

## Core concepts

The system deals with two different categories of sensitive information:

1. **Application configuration**
   - environment variables
   - database configuration
   - JWT configuration
   - CORS configuration
   - encryption configuration

2. **Managed secrets**
   - values entered by authorized users
   - values that must be encrypted at rest
   - values that should only be revealed to authorized users

These must never be confused with each other.

## Security objective

The application should follow defense-in-depth principles:

- validate configuration at startup
- keep secrets out of source control
- encrypt sensitive managed values at rest
- use authenticated encryption
- authenticate users securely
- authorize operations server-side
- protect JWTs from JavaScript access
- avoid sensitive logging
- centralize error handling
- validate request input
- apply secure production cookie/configuration settings

## Expected technology direction

Backend:
- Node.js
- Express
- MongoDB / Mongoose
- ES Modules
- Zod
- dotenv
- Node.js `crypto`

Frontend:
- React-based frontend
- API-driven communication with backend

Exact package versions and framework choices must be taken from the actual repository rather than assumed from this document.

## Current environment configuration

The backend currently has a centralized environment module using Zod validation and dotenv.

Expected variables:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=...
CORS_ORIGIN=...
JWT_SECRET=...
JWT_EXPIRES_IN=1h
SECRET_ENCRYPTION_KEY=...
```

Do not copy these values into documentation with real secrets.

## Important distinction

`JWT_SECRET` and `SECRET_ENCRYPTION_KEY` have different purposes.

- `JWT_SECRET` signs/verifies JWTs.
- `SECRET_ENCRYPTION_KEY` encrypts managed secret values using AES-256-GCM.

They must not be reused for each other.

## Project philosophy

Prefer:
- explicitness
- secure defaults
- centralized configuration
- small composable modules
- predictable API behavior
- testable business logic
- minimal duplication
- documented security decisions
