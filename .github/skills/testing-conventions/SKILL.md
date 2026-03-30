---
name: testing-conventions
description: "Apply Envilder testing conventions for Vitest unit tests and LocalStack e2e tests. Use when adding or updating tests for command handlers, domain entities, adapters, CLI, or GitHub Action flows."
argument-hint: "feature or file under test"
---

# Envilder Testing Conventions

## Outcome

Produce tests that match Envilder standards for naming, structure, and
confidence level across unit, integration, and e2e coverage.

## When To Use

- Adding tests for new application handlers or domain behavior
- Updating tests after refactors in CLI, GHA, infrastructure, or ports
- Reviewing whether test style is consistent before opening a PR

## Inputs

- Target behavior, file, or feature to test
- Test level: unit, integration, or e2e
- Any error paths or edge conditions to validate

## Procedure

1. Classify the test level and strategy.
   - Use unit tests by default for domain/application logic.
   - Use mocked port contracts (`vi.fn()`) for application handlers.
   - Use e2e tests only when real AWS SSM behavior must be validated.
2. Create test files in the matching test tree.
   - App and domain tests: `tests/` mirrored to `src/` structure.
   - E2E tests: `e2e/` using LocalStack/TestContainers.
3. Name tests using the required pattern.
   - `Should_<Expected>_When_<Condition>`
   - Example: `Should_ThrowError_When_SSMParameterIsNotFound`
4. Write tests with explicit AAA sections.
   - Add comment markers in each test block:
     - `// Arrange`
     - `// Act`
     - `// Assert`
   - **Each marker appears at most once per test.** If you need to
     test two actions or two assertions on different behaviors,
     write two separate tests.
5. Mock at the port boundary for application tests.
   - Build test doubles by implementing domain port interfaces.
   - Prefer `vi.fn()` to control behavior and assertions.
6. Validate primary success and failure paths.
   - Success path (expected output/state change)
   - Domain error path (invalid input, missing parameter, etc.)
   - Empty/no-op behavior where relevant
7. Keep assertions behavior-focused.
   - Assert effects and interactions, not implementation details.
   - Verify calls to injected ports and logger where behavior requires it.
8. Run verification commands before completion.
   - `pnpm test`
   - `pnpm lint`
   - For CI parity when needed: `pnpm test:ci`

## Decision Points

- If business rule is pure and deterministic: test at domain layer first.
- If orchestration calls multiple ports: test command handler with mocked
  dependencies.
- If AWS integration semantics are the risk: add or update e2e with LocalStack.
- Require e2e only when behavior changes cannot be proven confidently with unit
   tests.
- If only formatting/import changes occurred: update tests only when behavior
  changed or snapshots/assertions became stale.

## Completion Criteria

- Test names follow `Should_<Expected>_When_<Condition>`
- AAA markers are present, clear, and appear at most once each per test
- Positive and negative paths are both covered
- No mandatory coverage percentage threshold is enforced by this skill
- Tests run green locally with `pnpm test`
- No type/lint regressions from test changes (`pnpm lint`)

## Quick Prompt Examples

- "Use testing-conventions for `PullSecretsToEnvCommandHandler` and add missing error-path tests."
- "Apply testing-conventions to review `tests/envilder/apps/gha/Gha.test.ts` for naming and AAA compliance."
- "Use testing-conventions to design e2e coverage for SSM not-found behavior."

## Anti-Pattern: Duplicate Act/Assert Blocks

**Wrong** — two Acts and Asserts in one test:

```typescript
it('Should_HandleParameters_When_Called', async () => {
  // Arrange
  const mockData = { KEY: '/ssm/path' };

  // Act
  await handler.handle(commandA);

  // Assert
  expect(mockStore.saveEnvironment).toHaveBeenCalledOnce();

  // Act
  await handler.handle(commandB);

  // Assert
  expect(mockStore.saveEnvironment).toHaveBeenCalledTimes(2);
});
```

**Correct** — split into two focused tests:

```typescript
it('Should_SaveEnvironment_When_CommandAProvided', async () => {
  // Arrange
  const mockData = { KEY: '/ssm/path' };

  // Act
  await handler.handle(commandA);

  // Assert
  expect(mockStore.saveEnvironment).toHaveBeenCalledOnce();
});

it('Should_SaveEnvironment_When_CommandBProvided', async () => {
  // Arrange
  const mockData = { KEY: '/ssm/path' };

  // Act
  await handler.handle(commandB);

  // Assert
  expect(mockStore.saveEnvironment).toHaveBeenCalledOnce();
});
```
