# ADR-0002: Test Tooling per Stack

## Status

Accepted

## Context

Envilder is a multi-runtime project with a TypeScript core (CLI + GHA),
runtime SDKs (.NET, Python, Node.js, planned Go and Java), and IaC (AWS CDK).
Each stack has its own ecosystem of testing tools. We need consistent
conventions across stacks while using idiomatic libraries in each language.

Key requirements:

- **AAA pattern** enforced across all stacks
- **Test doubles** must follow the same taxonomy (Fake, Dummy, Stub, Spy, Mock)
- **Container-based acceptance tests** share the same infrastructure
  (see [ADR-0001](./0001-sdk-acceptance-test-infrastructure.md))
- **No test data generation library** in TypeScript or Python — inline
  construction is sufficient given the small domain surface

## Decision

### TypeScript (Core + Node.js SDK + IaC)

| Category | Tool | Rationale |
| -------- | ---- | --------- |
| Framework | Vitest 4.x | Native ESM, fast HMR, built-in coverage, single dependency |
| Assertions | `expect` (Vitest built-in) | Zero extra dependency, rich matchers |
| Mocking | `vi.fn()` / `vi.mock()` | Built into Vitest, no external mock library needed |
| Coverage | `@vitest/coverage-v8` | V8 provider, outputs text + html + json |
| Containers | `testcontainers` + `@testcontainers/localstack` | Language-native TestContainers API |
| CDK assertions | `aws-cdk-lib/assertions` (`Template.fromStack`) | Official CDK assertion library |
| Linting | Biome + Secretlint | Single tool for format + lint; Secretlint for credential detection |

### .NET SDK

| Category | Tool | Rationale |
| -------- | ---- | --------- |
| Framework | xUnit v3 | Modern, extensible, `Timeout` support, no `[Theory]` boilerplate for simple cases |
| Assertions | AwesomeAssertions | Fluent syntax (`.Should().Be()`), better failure messages than xUnit Assert |
| Mocking | NSubstitute | Clean syntax (`Arg.Any<T>()`), no `.Object` property like Moq |
| Test data (dummies) | AutoFixture | Auto-generates objects without manual setup |
| Test data (fakes) | Bogus | Realistic data via Mother pattern (seeded `Faker`) |
| Containers | Testcontainers + Testcontainers.LocalStack | Language-native TestContainers for .NET |
| Coverage | `dotnet test --collect` | Built-in, no extra dependency |

### Python SDK

| Category | Tool | Rationale |
| -------- | ---- | --------- |
| Framework | pytest ≥ 8.0 | De facto standard, fixture-based DI, rich plugin ecosystem |
| Assertions | `assert` (built-in) | pytest rewrites asserts for clear failure output |
| Mocking | `unittest.mock` (Mock, AsyncMock) | Stdlib, no extra dependency, sufficient for our needs |
| Containers | `testcontainers[localstack]` | Python TestContainers with LocalStack support |
| Type checking | mypy (strict) | Catches type errors before runtime |
| Formatting | black + isort | Deterministic formatting, import sorting |
| Type stubs | `boto3-stubs[ssm]` | IDE autocomplete and mypy checking for boto3 |

## Consequences

### Positive

- Each stack uses idiomatic, community-standard tools — no exotic choices.
- Vitest covers TypeScript core, Node.js SDK, and IaC from a single config
  (workspace-aware via `pnpm-workspace.yaml`).
- Test double taxonomy (Fake/Dummy/Stub/Spy/Mock) is stack-independent — the
  concept transfers, only the library differs.

### Negative

- No shared test data generation library for TypeScript or Python. If domain
  models grow significantly, reconsider adding one.
- `unittest.mock` is less ergonomic than NSubstitute. Acceptable given
  Python SDK's small surface.

## When to Reconsider

- If a new stack needs a test data generation library (e.g., Go's `gofakeit`)
- If Vitest drops v8 coverage provider support
- If xUnit v3 introduces breaking changes requiring migration
