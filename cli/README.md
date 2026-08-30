# MERNSecrets CLI

This is the foundation for the MERNSecrets command-line interface.

## Purpose

The CLI provides a structured command entry point for future product workflows such as login, project inspection, environment access, and secret retrieval.

This milestone intentionally implements only the command surface and help output. No authentication, secret retrieval, or runtime execution is implemented yet.

## Installation

```bash
cd cli
npm install
```

## Local execution

```bash
node src/index.js --help
node src/index.js --version
```

## Commands

- `mernsecrets login` — authenticate with the MERNSecrets API (placeholder)
- `mernsecrets logout` — end the current CLI session (placeholder)
- `mernsecrets projects` — list or inspect projects (placeholder)
- `mernsecrets env` — inspect environment-related commands (placeholder)
- `mernsecrets pull` — fetch secrets and environment data (planned)
- `mernsecrets run` — execute project workflows (planned)

## Current status

The following functionality is intentionally not implemented in this milestone:

- credential storage
- API authentication
- secret retrieval
- secret decryption
- environment file generation
- child process execution
- configuration persistence

## Planned milestones

- CLI auth and session handling
- project and environment listing
- safe secret retrieval
- execution workflow support
- encrypted local configuration management
