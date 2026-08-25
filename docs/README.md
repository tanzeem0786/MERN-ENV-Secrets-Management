# Environment Secret Management — Project Documentation

This `docs/` folder is the persistent project context for AI coding agents.

## Purpose

These documents capture:
- project goals and scope
- architecture and security decisions
- development conventions
- authentication and environment-secret handling
- milestone/progress state
- decisions and changes
- rules for AI coding agents

## Start Here

An AI agent MUST read, in order:

1. `AGENT_INSTRUCTIONS.md`
2. `PROJECT_CONTEXT.md`
3. `ARCHITECTURE.md`
4. `SECURITY.md`
5. `CURRENT_PROGRESS.md`
6. The relevant milestone section/file
7. Any topic-specific document needed for the task

The agent MUST inspect the actual code before making implementation decisions.

## Documentation hierarchy

When documentation conflicts with reality, use this priority:

1. Actual working code and tests
2. Current environment/configuration
3. Explicit user instruction in the current task
4. Security requirements
5. Architecture documentation
6. Milestone documentation
7. Agent assumptions

When a meaningful discrepancy is discovered, do not silently ignore it. Record it in `DECISION_LOG.md` or `CHANGELOG.md` as appropriate.
