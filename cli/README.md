# MERNSecrets CLI

This CLI provides the authenticated command entry point for the MERNSecrets platform.

## Purpose

The CLI authenticates against the existing backend API and uses the current cookie-based JWT flow to list the projects and environments available to the authenticated user.

This milestone implements project and environment listing only. It does not fetch secrets, decrypt values, generate `.env` files, or execute arbitrary commands.

## Installation

```bash
cd cli
npm install
```

## Local execution

```bash
node src/index.js --help
node src/index.js projects --help
node src/index.js env --help
node src/index.js env list --project my-project
```

## Authentication flow

```bash
mernsecrets login
```

The command prompts for:
- email
- password

The password is never echoed and is not stored.

The CLI stores only the authenticated session token in the OS user configuration directory. The repository is never used as storage for credentials.

### Default API base URL

```bash
http://localhost:4000/api
```

This can be overridden with:

```bash
MERNSECRETS_API_URL=http://localhost:4000/api mernsecrets login
```

## Session storage

Credentials are persisted in an OS-scoped user config directory rather than inside the project repository:

- Windows: `%APPDATA%\mernsecrets\session.json`
- macOS: `~/Library/Application Support/mernsecrets/session.json`
- Linux: `~/.config/mernsecrets/session.json`

The stored session contains only the required access token and user email. It does not store the password.

## Commands

- `mernsecrets login` — authenticate the CLI with the backend API
- `mernsecrets logout` — clear the local CLI session and logout from the backend when possible
- `mernsecrets projects` — list projects visible to the authenticated user
- `mernsecrets env list --project <project>` — list environments for the named project
- `mernsecrets pull` — placeholder for future secret retrieval
- `mernsecrets run` — placeholder for future secure command execution

## Example usage

```bash
mernsecrets login
mernsecrets projects
mernsecrets env list --project ecommerce-api
```

## Current status

Implemented in this milestone:
- CLI login/logout authentication flow
- project listing from the authenticated backend API
- environment listing for a selected project using the existing project ID lookup flow
- secure local session storage outside the repository

Not implemented yet:
- secret retrieval
- secret decryption
- environment file generation
- project creation/update/delete commands
- command execution
- browser cookie extraction
- credential or password persistence

## Security notes

- no passwords are stored locally
- no tokens are printed to the terminal
- no browser cookies are accessed
- the CLI does not inspect browser storage or Chrome/Edge/Firefox cookie stores
- the session file is written with restrictive permissions where supported

## Planned milestones

- M10.4 → Secret Pull
- M10.5 → Secure Run
- M10.6 → CLI Security & Testing
