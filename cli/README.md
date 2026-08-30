# MERNSecrets CLI

This CLI provides the authenticated command entry point for the MERNSecrets platform.

## Purpose

The CLI is designed to authenticate against the existing backend API, persist a local session cookie, and support future project/environment/secret workflows without extracting browser credentials.

This milestone implements the CLI authentication flow only. It does not fetch secrets, manage environment files, or execute arbitrary commands.

## Installation

```bash
cd cli
npm install
```

## Local execution

```bash
node src/index.js --help
node src/index.js --version
node src/index.js login --help
node src/index.js logout --help
```

## Authentication flow

```bash
mernsecrets login
```

The command prompts for:
- email
- password

The password is never echoed and is not persisted after the login request completes.

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
- `mernsecrets projects` — placeholder for future project workflows
- `mernsecrets env` — placeholder for future environment workflows
- `mernsecrets pull` — placeholder for future secret retrieval
- `mernsecrets run` — placeholder for future secure command execution

## Current status

Implemented in this milestone:
- CLI login with hidden password input
- secure local session storage outside the repository
- logout that clears local state and calls the backend logout endpoint when possible

Not implemented yet:
- secret retrieval
- secret decryption
- environment file generation
- project or environment API usage
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

- M10.3 → Projects & Environments
- M10.4 → Secret Pull
- M10.5 → Secure Run
- M10.6 → CLI Security & Testing
