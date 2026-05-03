# ADR-0006: Monorepo Structure

## Status

Accepted

## Context

Envilder is a multi-component product: a TypeScript CLI, a GitHub Action,
runtime SDKs in multiple languages (.NET, Python, Node.js, Go, Java, PHP,
Rust), a documentation website, and infrastructure-as-code. These components
share the map-file format as a universal contract and are released independently.

A decision is needed on whether all components live in a single repository or
are split across multiple repositories.

## Decision

### 1. All Components in a Single Repository

Every component of the Envilder project lives in one Git repository:

| Component | Path | Build System |
| --------- | ---- | ------------ |
| CLI (TypeScript) | `src/envilder/` | pnpm (root) |
| GitHub Action | `github-action/` | ncc bundle |
| Website (Astro) | `src/website/` | pnpm workspace |
| IaC (CDK) | `src/iac/` | pnpm workspace |
| SDK .NET | `src/sdks/dotnet/` | dotnet |
| SDK Python | `src/sdks/python/` | uv |
| SDK Node.js | `src/sdks/nodejs/` | pnpm workspace |
| SDK Go | `src/sdks/go/` | go modules |
| SDK Java/Kotlin | `src/sdks/java/` | Maven/Gradle |
| SDK PHP (planned) | `src/sdks/php/` | Composer |
| SDK Rust (planned) | `src/sdks/rust/` | Cargo |

### 2. Independent Releases per Component

Each shipped component (CLI, GHA, SDKs) has its own:

- **Version source file** (package.json, .csproj, pyproject.toml, etc.)
- **Changelog** (`docs/changelogs/{component}.md`)
- **Git tag** following `{component}/v{semver}` (e.g., `sdk-dotnet/v1.2.0`)
- **CI release workflow** triggered by version-bump detection on push to `main`
  (the workflow publishes, then creates the component tag post-publish)

Components are never forced to release together. A change to the Python SDK
does not require a new CLI release.

### 3. No Monorepo Orchestrator

Each SDK uses its native build system directly (dotnet, uv, cargo, go, etc.).
There is no Nx, Turborepo, Bazel, or other orchestrator layer. `pnpm
workspaces` is used only for TypeScript components that benefit from it.

## Rationale

| Reason | Detail |
| ------ | ------ |
| Atomic cross-component changes | A single PR can touch CLI + SDK + docs + website together |
| Conformance sharing | Map-file spec, test fixtures, and examples are shared without submodules |
| Unified CI | One pipeline sees everything — a CLI change can trigger SDK tests |
| Single source of truth | One ROADMAP, one changelog index, one architectural vision |
| Contributor simplicity | One `git clone`, one repo to understand the full project |

## Alternatives Considered

### Multi-repo (one repo per SDK)

Each SDK lives in its own GitHub repository with its own CI, issues, and
releases.

**Rejected:** Fragments the product vision. Cross-component changes require
coordinated PRs across repos. Shared fixtures need git submodules or duplicated
files. Multiplies CI configuration. Complicates onboarding — contributors need
to clone N repos to understand the product.

### Monorepo with heavy tooling (Nx, Turborepo, Bazel)

Add a build orchestrator to manage cross-component dependencies, caching, and
task scheduling.

**Rejected:** Over-engineering for the current project size. Each SDK has its
own native build system (dotnet, uv, cargo, go) that works independently.
Adding an orchestrator creates a learning curve for contributors and adds a
maintenance burden without proportional benefit.

### Git submodules for SDKs

Keep SDKs in separate repos but reference them as submodules in the main repo.

**Rejected:** Submodules add operational complexity (sync issues, nested
clones, detached HEAD confusion). The DX for contributors is significantly
worse. Updates require multi-step workflows instead of simple commits.

## Consequences

### Positive

- One clone to get everything — fast onboarding
- Shared CI infrastructure — one set of workflows, reusable across components
- Atomic PRs across components — no coordination overhead
- Single point of documentation and architectural decisions
- Encourages consistency — conventions are visible and enforceable repo-wide

### Negative

- Repository size grows over time (mitigated by sparse checkout if needed)
- CI must be selective — running all tests on every PR is wasteful (solved with
  path-based triggers)
- Go module path requires vanity import (envilder.com/go) since the repo path
  would be too long
- Contributors who only care about one SDK still clone the full repo

## When to Reconsider

All known alternatives (multi-repo, submodules, heavy orchestrators) are
objectively worse for this project's size, team, and release model. Splitting
the monorepo would be a step backwards in developer experience and operational
simplicity.

The only valid reason to reconsider would be the emergence of a repository
strategy that is objectively superior for multi-component projects with
independent releases — which does not exist today.

Practical scenarios that might force adaptation (not abandonment):

- Git performance degradation due to size — mitigate with sparse checkout
  before considering a split
- CI bottlenecks from unrelated components — solve with path-based triggers,
  not repository splitting
