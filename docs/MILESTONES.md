# Milestones

This document is the high-level implementation roadmap. The repository's actual code and `CURRENT_PROGRESS.md` determine what has already been completed.

## Milestone 1 — Project foundation

Objectives:
- establish repository structure
- initialize backend/frontend
- establish development scripts
- establish module conventions
- configure Git hygiene

## Milestone 2 — Environment configuration

Objectives:
- centralized environment loading
- Zod validation
- required variables
- fail-fast startup behavior
- safe `.env` handling

## Milestone 3 — Secret/key management foundation

Objectives:
- separate configuration secrets from managed application secrets
- establish `SECRET_ENCRYPTION_KEY`
- enforce Base64 → exactly 32-byte validation
- establish secure key generation
- prevent key exposure

## Milestone 4 — Encryption

Objectives:
- AES-256-GCM
- random 12-byte IV per encryption
- authentication tag
- encrypt/decrypt utility
- authenticated decryption
- safe database representation

## Milestone 5 — Authentication

Objectives:
- user registration/login as required
- password hashing
- JWT authentication
- secure cookie storage
- authentication middleware
- logout

## Milestone 6 — Authorization

Objectives:
- ownership/access checks
- roles/permissions if required
- protected secret operations
- server-side enforcement

## Milestone 7 — Secret management API

Objectives:
- create/update/delete/list secret metadata
- encrypt on write
- decrypt only on authorized reveal
- avoid leaking plaintext
- validation and consistent errors

## Milestone 8 — Frontend integration

> Roadmap reconciliation: the explicit current task defines Milestone 8 as RBAC. The RBAC implementation is complete; frontend integration remains a later task.

Objectives:
- authentication UI
- secret management UI
- API integration
- safe error handling
- appropriate loading/empty/error states

## Milestone 8.5 — Backend hardening, testing, and API documentation

Status: Complete

Completed:
- server-local Vitest, Supertest, and MongoDB Memory Server setup
- authentication, encryption, CRUD, RBAC, tenant-isolation, leakage, audit, validation, and rate-limit tests
- OpenAPI specification and exportable Postman collection
- safer cookie handling and removal of access tokens from JSON responses

Remaining production hardening includes distributed rate-limit storage, CSRF protection for cross-site cookie deployments, and broader coverage reporting.

## Milestone 9 — Hardening

Objectives:
- security review
- sensitive logging review
- cookie/CORS review
- validation review
- authorization review
- dependency review
- production configuration review

## Milestone completion rule

A milestone is complete only when:
- implementation exists
- relevant tests/checks pass
- security requirements are met
- documentation reflects the actual implementation
- `CURRENT_PROGRESS.md` is updated
