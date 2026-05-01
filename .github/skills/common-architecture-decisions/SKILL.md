---
name: common-architecture-decisions
description: >-
  Index of Architecture Decision Records (ADRs) for cross-cutting technical
  decisions. Use when making design choices, reviewing proposals for consistency
  with prior decisions, or onboarding to understand why specific tools or
  patterns were chosen. Covers test tooling, SDK architecture, code quality,
  and acceptance test infrastructure.
user-invocable: false
---

# Architecture Decision Records

This skill provides an index of ADRs that document cross-cutting technical
decisions in the Envilder project. Load this skill to understand the rationale
behind tooling choices and architectural patterns before proposing changes.

## When to Use

- Before proposing a new library or tool (check if there's an existing decision)
- When reviewing code that seems inconsistent with project conventions
- When adding a new SDK and need to follow established patterns
- When onboarding and need to understand "why" behind technical choices
- Before writing tests — check ADR-0002 for the correct tooling per stack

## ADR Index

| ADR | Title | Scope | Key Decision |
| --- | ----- | ----- | ------------ |
| [ADR-0001](../../../docs/architecture/adr/0001-sdk-acceptance-test-infrastructure.md) | SDK Acceptance Test Infrastructure | All SDKs | TestContainers + LocalStack + Lowkey Vault; container wrappers with explicit lifecycle; `secrets-map.json` as single source for test tokens |
| [ADR-0002](../../../docs/architecture/adr/0002-test-tooling-per-stack.md) | Test Tooling per Stack | All stacks | Vitest (TS), xUnit+NSubstitute+AwesomeAssertions (NET), pytest+unittest.mock (Py) |
| [ADR-0003](../../../docs/architecture/adr/0003-sdk-architecture-pattern.md) | SDK Architecture Pattern | All SDKs | Three-layer (Domain→App→Infra), no DI framework, facade as primary API, internal factory |
| [ADR-0004](../../../docs/architecture/adr/0004-code-quality-tooling.md) | Code Quality and Formatting | All stacks | Biome (TS), dotnet format (.NET), black+isort (Py); Secretlint for credentials |

## Quick Reference: Test Doubles per Stack

| Stack | Mock/Spy | Stub | Fake (data) | Dummy |
| ----- | -------- | ---- | ----------- | ----- |
| TypeScript | `vi.fn()` / `vi.mock()` | `vi.fn().mockResolvedValue()` | inline | inline |
| .NET | NSubstitute (`Received()`) | NSubstitute (`.Returns()`) | Bogus (Mother pattern) | AutoFixture |
| Python | `unittest.mock.Mock` / `AsyncMock` | `Mock(return_value=...)` | inline / fixtures | inline |

## Quick Reference: Container Testing

| Stack | Package | AWS | Azure |
| ----- | ------- | --- | ----- |
| TypeScript | `testcontainers` | `@testcontainers/localstack` | Custom (Lowkey Vault) |
| .NET | `Testcontainers` | `Testcontainers.LocalStack` | Custom (Lowkey Vault) |
| Python | `testcontainers` | `testcontainers[localstack]` | Custom (Lowkey Vault) |

## Rules

1. **Before adding a new testing tool**: Check ADR-0002. If not listed, propose
   an ADR amendment or new ADR.
2. **Before changing SDK public API surface**: Check ADR-0003. All SDKs must
   follow the same facade/builder/client pattern.
3. **Before changing formatters or linters**: Check ADR-0004. Changes affect CI
   and all contributors.
4. **Before changing acceptance test infrastructure**: Check ADR-0001. Container
   wrappers, token resolution, and CI patterns are standardized.

## Creating a New ADR

Use the format in `docs/architecture/adr/`:

```markdown
# ADR-NNNN: Title

## Status
Proposed | Accepted | Deprecated | Superseded by ADR-XXXX

## Context
Why this decision is needed.

## Decision
What we chose and the details.

## Consequences
### Positive
### Negative

## When to Reconsider
```

Number sequentially. Keep scope focused — one decision per ADR.
