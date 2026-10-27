# Contributing to Envilder

Everyone taking part in the project is expected to follow the
[Code of Conduct](CODE_OF_CONDUCT.md). How decisions are made and who does
what is described in [GOVERNANCE.md](GOVERNANCE.md). To report a
vulnerability, follow [SECURITY.md](docs/SECURITY.md) instead of opening a
public issue.

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| **Node.js** | 22.12+ | CLI, GHA, Node.js SDK, IaC, Website |
| **pnpm** | 11+ | Monorepo package manager |
| **Docker** | Latest | Acceptance tests (TestContainers) |
| **.NET** | 10+ | .NET SDK |
| **Python** | 3.11+ | Python SDK |
| **uv** | Latest | Python dependency management |

## Getting Started

```bash
# Clone and install
git clone https://github.com/macalbert/envilder.git
cd envilder
pnpm install

# Generate local .env (requires AWS credentials)
pnpm env:generate

# Run CLI tests
pnpm test

# Format and lint
pnpm format
pnpm format:check
```

## Project Structure

```txt
envilder/
├── src/envilder/          # CLI + GitHub Action (TypeScript core)
│   ├── core/              # Domain, Application, Infrastructure
│   └── apps/              # CLI, GHA, shared DI
├── src/sdks/
│   ├── nodejs/            # Node.js SDK (@envilder/sdk)
│   ├── dotnet/            # .NET SDK (Envilder NuGet)
│   ├── python/            # Python SDK (envilder PyPI)
│   ├── go/                # Go SDK (planned)
│   └── java/              # Java SDK (planned)
├── src/iac/               # AWS CDK infrastructure
├── src/website/           # Astro docs site
├── tests/                 # Mirrors src/ structure
├── e2e/                   # CLI end-to-end tests
└── github-action/         # GHA bundle (dist/)
```

## Workspaces

The repo uses **pnpm workspaces**. Each project has its own
`package.json` and build/test tooling:

| Workspace | Path | Build | Test |
|-----------|------|-------|------|
| CLI + GHA | root | `pnpm build` | `pnpm test` |
| Node.js SDK | `src/sdks/nodejs` | `pnpm -C src/sdks/nodejs build` | `pnpm -C tests/sdks/nodejs vitest run` |
| IaC | `src/iac` | `pnpm -C src/iac build` | `pnpm -C tests/iac vitest run` |
| Website | `src/website` | `pnpm -C src/website build` | `pnpm -C tests/website vitest run` |

Non-JS SDKs use the **Makefile**:

| SDK | Check | Format | Build | Test |
|-----|-------|--------|-------|------|
| .NET | `make check-sdk-dotnet` | `make format-sdk-dotnet` | `make build-sdk-dotnet` | `make test-sdk-dotnet` |
| Python | `make check-sdk-python` | `make format-sdk-python` | n/a | `make test-sdk-python` |
| Node.js | `make check-sdk-nodejs` | `make format-sdk-nodejs` | `make build-sdk-nodejs` | `make test-sdk-nodejs` |
| All | `make check-sdk` | `make format-sdk` | `make build-sdk` | `make test-sdk` |

## Development Commands

### CLI + GitHub Action

```bash
pnpm build                    # Compile TypeScript
pnpm test                     # Unit tests + coverage
pnpm test:ci                  # Tests with JUnit reporter
pnpm build:gha                # Bundle GHA with esbuild
pnpm verify:gha               # Verify GHA bundle is fresh
pnpm local:install             # Build + pack + install globally
pnpm local:test-run            # Run CLI against sample map
pnpm dev:run                   # Run CLI via tsx (dev mode)
```

### Node.js SDK

```bash
pnpm -C src/sdks/nodejs build
pnpm -C tests/sdks/nodejs vitest run --reporter=verbose
# Acceptance tests (needs Docker):
pnpm -C tests/sdks/nodejs vitest run --reporter=verbose
```

### .NET SDK

```bash
dotnet build src/sdks/dotnet/Envilder.sln
dotnet test tests/sdks/dotnet/
dotnet format src/sdks/dotnet/Envilder.sln --verify-no-changes
```

### Python SDK

```bash
make install-sdk-python        # Create venv + install deps
make test-sdk-python           # Run all tests
make check-sdk-python          # black + isort + mypy
make format-sdk-python         # Auto-format
```

### Website

```bash
pnpm -C src/website dev        # Local dev server
pnpm -C src/website build      # Production build
```

### Infrastructure (CDK)

```bash
pnpm -C src/iac build
pnpm -C tests/iac vitest run
```

## Coding Standards

Contributions must follow the style guide of each language, as decided in
[ADR-0004](docs/adr/0004-code-quality-tooling.md). The tools are the
reference: if they pass, the style is right.

| Language | Style guide | Check |
|----------|-------------|-------|
| TypeScript | [Biome](https://biomejs.dev/) rules in [`biome.json`](biome.json), `tsc` strict mode | `pnpm format:check` and `pnpm lint` |
| C# | [.NET coding conventions](https://learn.microsoft.com/dotnet/csharp/fundamentals/coding-style/coding-conventions) as configured in [`.editorconfig`](src/sdks/dotnet/.editorconfig) | `make check-sdk-dotnet` |
| Python | [PEP 8](https://peps.python.org/pep-0008/) through [black](https://black.readthedocs.io/) and isort, typed with mypy strict mode ([`pyproject.toml`](src/sdks/python/pyproject.toml)) | `make check-sdk-python` |
| Markdown | [markdownlint](https://github.com/DavidAnson/markdownlint) rules in [`.markdownlint.json`](.markdownlint.json) | `markdownlint "**/*.md"` |

CI runs these checks on every pull request and fails on any violation.
Architecture and naming conventions are described in
[`docs/architecture/README.md`](docs/architecture/README.md).

## Quality Gates

Before pushing, ensure:

```bash
pnpm format:check              # Biome format verification
pnpm lint                      # Secretlint + Biome + tsc
pnpm test                      # Unit tests + coverage
```

The pre-commit hook (via Lefthook) runs Biome check + commitlint
automatically.

## Commit Conventions

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```txt
<type>(<scope>): <description>
```

**Types**: `feat`, `fix`, `refactor`, `test`, `docs`, `style`,
`chore`, `ci`, `perf`, `revert`

**Scopes**: `cli`, `gha`, `sdk-node`, `sdk-dotnet`, `sdk-python`,
`iac`, `website`, `ci`, `dx`

**Examples**:

```txt
feat(sdk-node): add Azure Key Vault support
fix(cli): handle missing SSM parameter gracefully
test(sdk-dotnet): add acceptance tests for profile auth
docs(website): update changelog for v0.9.3
ci(coverage): add Node.js SDK to coverage report
```

## Test Conventions

- **Policy**: new features and bug fixes must come with automated tests
  that cover the change. Pull requests that only touch docs are exempt.
- **Naming**: `Should_<Expected>_When_<Condition>`
- **Structure**: AAA pattern with explicit `// Arrange`, `// Act`,
  `// Assert` markers (each at most once per test)
- **Frameworks**: Vitest (TS), xUnit + NSubstitute (.NET),
  pytest (Python)

## CI Workflows

| Workflow | Trigger | Scope |
|----------|---------|-------|
| `tests.yml` | PR (CLI paths) | CLI + GHA unit/e2e tests |
| `tests-nodejs-sdk.yml` | PR (SDK paths) | Node.js SDK tests |
| `tests-dotnet-sdk.yml` | PR (.NET paths) | .NET SDK tests |
| `tests-python-sdk.yml` | PR (Python paths) | Python SDK tests |
| `tests-website.yml` | PR (website paths) | Website build check |
| `coverage-report.yml` | Push to main | All coverage → GH Pages |
| `publish-npm.yml` | Push to main | CLI npm publish |
| `publish-npm-sdk.yml` | Push to main (SDK paths) | Node.js SDK npm publish |
| `publish-nuget.yml` | Tag `sdk-dotnet/v*` | .NET NuGet publish |
| `publish-pypi.yml` | Tag `sdk-python/v*` | Python PyPI publish |
| `publish-action.yml` | Manual dispatch (`version`) | GitHub Action release + major tag (`v0`) |
| `publish-website.yml` | Push to main | Website deploy |

## Adding a New SDK

See the [SDK Release Checklist](.github/skills/sdk-release-checklist/SKILL.md)
for the full checklist covering code, tests, CI, website, and i18n.
