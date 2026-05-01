# AGENTS.md

Multi-runtime secret management platform. Centralizes environment variables from
AWS SSM Parameter Store or Azure Key Vault via a Git-versioned map-file format.

## Setup

- **Runtime**: Node.js 22+, pnpm 9+
- **Optional** (for e2e tests): Docker (LocalStack for AWS, Lowkey Vault for Azure)
- Install: `pnpm install`

## Build & Validate

```bash
pnpm build              # TypeScript compilation
pnpm test               # Vitest with coverage
pnpm lint               # Secretlint + Biome check + tsc --noEmit (read-only)
pnpm format:check       # Biome format check (read-only)
pnpm build:gha          # Bundle GitHub Action into github-action/dist/index.js
pnpm verify:gha         # Fails if GHA bundle is stale
```

Always run before committing: `pnpm lint && pnpm test && pnpm verify:gha`

## SDK Workspaces

| SDK | Path | Build | Test |
|-----|------|-------|------|
| .NET | `src/sdks/dotnet/` | `dotnet build src/sdks/dotnet/Envilder.sln` | `dotnet test tests/sdks/dotnet/` |
| Python | `src/sdks/python/` | — | `make test-sdk-python` (requires `uv`, Docker) |
| Node.js | `src/sdks/nodejs/` | `cd src/sdks/nodejs && pnpm build` | `cd tests/sdks/nodejs && pnpm vitest run` |

## Project Structure

```text
src/envilder/apps/cli/       CLI entry point (commander)
src/envilder/apps/gha/       GitHub Action entry point
src/envilder/apps/shared/    Shared DI container configuration
src/envilder/core/domain/    Pure business logic, ports, errors
src/envilder/core/application/ Command/Handler use cases
src/envilder/core/infrastructure/ Provider adapters (AWS, Azure)
src/sdks/{dotnet,python,nodejs}/ Independent runtime SDKs
src/website/                 Astro documentation website
tests/                       Mirrors src/ structure
e2e/                         End-to-end tests (TestContainers)
```

## Gotchas

- After any code change touching CLI or GHA, run `pnpm build:gha` — CI will
  reject stale bundles via `pnpm verify:gha`.
- `pnpm format` **writes** files (Biome --write). Use `pnpm format:check` for
  validation only.
- SDKs are independent — they share the map-file format but have zero code
  dependency on the TypeScript core.
- E2E tests require Docker running (LocalStack + Lowkey Vault containers).

## Architecture Reference

Detailed architecture, DI patterns, coding conventions, and extension guides
are in `.github/copilot-instructions.md`. Path-specific rules are in
`.github/instructions/`. Custom agent definitions are in `.github/agents/`.

## Mandatory Skill Loading

**Before performing any task**, check if a relevant skill applies in
`.github/skills/`. If it does, load and follow its procedure completely.

Critical skills that are commonly missed:

| Task | Skill to load |
|------|---------------|
| Creating/updating a PR | `workflow-pr-sync` |
| Committing code | `workflow-smart-commit` |
| Writing tests | `common-testing-conventions` + stack-specific (`core-testing`, `python-testing`, `dotnet-test-doubles`) |
| Reviewing code | `code-review-perspectives` |
| Investigating bugs | `code-bug-investigation` |
| Making design decisions | `common-architecture-decisions` (check ADRs first) |
| Touching security-sensitive code | `common-security` |

**Never skip a skill's template, checklist, or procedure.** If a skill defines
a mandatory format (e.g., PR body template, commit message format, test naming),
follow it exactly.
