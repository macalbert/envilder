# ADR-0004: Code Quality and Formatting Tooling

## Status

Accepted

## Context

A multi-language monorepo needs deterministic formatting and linting to
eliminate style debates in reviews and ensure CI reproducibility. Each
language has its own ecosystem of tools, but the principles are shared:

- **Format on save** — no manual formatting ever
- **Lint in CI** — check-only, fail the build on violations
- **Credential detection** — prevent secrets from being committed

## Decision

### TypeScript (Core + SDKs + IaC + Website)

| Tool | Purpose | Config |
| ---- | ------- | ------ |
| Biome | Format + lint (replaces ESLint + Prettier) | `biome.json` at root |
| Secretlint | Credential detection in all files | `.secretlintrc.json` |
| `tsc --noEmit` | Type checking without compilation | `tsconfig.json` |

**Scripts:**

- `pnpm format` — writes: `biome check --write --unsafe && biome format --write`
- `pnpm format:check` — check-only (CI)
- `pnpm lint` — check-only: `secretlint "**/*" && biome check && tsc --noEmit`

**Biome rules** (from `biome.json`):

- Single quotes, semicolons, 2-space indent, 80-char line width
- Trailing commas enforced
- `unsafeParameterDecoratorsEnabled: true` (for InversifyJS decorators)

### .NET SDK

| Tool | Purpose | Config |
| ---- | ------- | ------ |
| `dotnet format` | Format + style enforcement | `.editorconfig` + `Directory.Build.props` |
| Microsoft.VisualStudio.Threading.Analyzers | Async correctness | PackageReference |

**Scripts:**

- `dotnet format src/sdks/dotnet/Envilder.sln` — writes
- `dotnet format src/sdks/dotnet/Envilder.sln --verify-no-changes` — check-only (CI)

### Python SDK

| Tool | Purpose | Config |
| ---- | ------- | ------ |
| black | Code formatter | `pyproject.toml` |
| isort | Import sorting (black-compatible profile) | `pyproject.toml` |
| mypy (strict) | Static type analysis | `pyproject.toml` |

**Scripts** (via Makefile with `uv run`):

- `make format-sdk-python` — writes: `black . && isort .`
- `make check-sdk-python` — check-only: `black --check && isort --check && mypy --strict`

### Pre-commit Hooks

Configured via `lefthook.yml`:

- Runs format + lint on staged files before commit
- Blocks commits with credential violations

## Consequences

### Positive

- Zero style discussions in PRs — tool decides, humans accept
- CI catches violations before review — no manual formatting requests
- Secretlint prevents accidental credential leaks across all file types
- Single tool per language (Biome replaces ESLint+Prettier+import-sort)

### Negative

- Biome doesn't cover all ESLint rules. Acceptable for this project's needs.
- Python requires two tools (black + isort) where one would be ideal.
  Ruff could replace both in the future.

## When to Reconsider

- If Ruff reaches maturity for format + import sort → replace black + isort
- If Biome adds Python/Go support → evaluate as single multi-language tool
- If the team grows and wants stricter lint rules (e.g., complexity limits)
