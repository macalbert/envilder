---
name: core-testing
description: "Apply Envilder testing conventions when a verification contract selects Vitest unit tests, integration tests, or LocalStack e2e evidence for command handlers, domain entities, adapters, CLI, or GitHub Action flows."
argument-hint: "feature or file under test"
---

# Envilder Testing Conventions

## Outcome

Produce behavioral verification that matches Envilder standards and protects
the risk identified by an approved `VerificationContract`.

## When To Use

- Establishing, reusing, or updating tests for application or domain behavior
- Updating tests after refactors in CLI, GHA, infrastructure, or ports
- Reviewing whether test style is consistent before opening a PR
- Diagnosing test infrastructure after consumer evidence proved insufficient

## Inputs

- Target behavior, file, or feature to test
- Test level: unit, integration, or e2e
- Any error paths or edge conditions to validate

## Procedure

1. Read the approved intent, behavior, invariants, and verification strategy.
   - Do not add a test when a compiler, schema, direct workflow, existing
     baseline, or other oracle protects the requirement more directly.
2. Classify the justified test level.
   - Use unit tests for pure domain or application behavior with stable ports.
   - Use mocked port contracts (`vi.fn()`) for application handlers.
   - Use integration or e2e tests when cloud, DI, CLI, GitHub Action, or
     cross-layer wiring is the actual risk.
3. Create or update only the verification artifacts required by the contract.
   - App and domain tests: `tests/` mirrored to `src/` structure.
   - E2E tests: `e2e/` using LocalStack/TestContainers.
4. Name tests using the required pattern.
   - `Should_<Expected>_When_<Condition>`
   - Example: `Should_ThrowError_When_SSMParameterIsNotFound`
5. Write tests with explicit AAA sections.
   - Add comment markers in each test block:
     - `// Arrange`
     - `// Act`
     - `// Assert`
   - **Each marker appears at most once per test.** If you need to
     test two actions or two assertions on different behaviors,
     write two separate tests.
6. Mock at the port boundary for application tests.
   - Build test doubles by implementing domain port interfaces.
   - Prefer `vi.fn()` to control behavior and assertions.
7. Validate primary success and failure paths required by the contract.
   - Success path (expected output/state change)
   - Domain error path (invalid input, missing parameter, etc.)
   - Empty/no-op behavior where relevant
8. Keep assertions behavior-focused.
   - Assert effects and interactions, not implementation details.
   - Verify calls to injected ports and logger where behavior requires it.
9. For test-support changes, run a production-behavior consumer or direct
   workflow first. Add a focused support test only for a documented diagnostic
   precision gap.
10. Run the targeted contract command and assigned broader gates.
   - `pnpm test`
   - `pnpm lint`
   - For CI parity when needed: `pnpm test:ci`

## Decision Points

- If a business rule is pure and deterministic: use a domain unit test.
- If orchestration calls multiple ports: test command handler with mocked
  dependencies.
- If AWS integration semantics are the risk: add or update e2e with LocalStack.
- Require e2e only when behavior changes cannot be proven confidently with unit
   tests.
- If only formatting/import changes occurred: update tests only when behavior
  changed or snapshots/assertions became stale.
- If the intent is `PURE_REFACTOR`: establish a green baseline and keep
  behavioral tests unchanged.
- If the intent is `NON_BEHAVIORAL_CHANGE`: do not manufacture a test.

## Completion Criteria

- Test names follow `Should_<Expected>_When_<Condition>`
- AAA markers are present, clear, and appear at most once each per test
- Positive and negative paths are both covered
- No mandatory coverage percentage threshold is enforced by this skill
- Verification rejects the incorrect or previous behavior for the expected
  reason when a negative signal is practical
- Tests run green locally with `pnpm test`
- No type/lint regressions from test changes (`pnpm lint`)

## Quick Prompt Examples

- "Use testing-conventions for `PullSecretsToEnvCommandHandler` and add missing error-path tests."
- "Apply testing-conventions to review `tests/envilder/apps/gha/entry/Gha.test.ts` for naming and AAA compliance."
- "Use testing-conventions to design e2e coverage for SSM not-found behavior."

## Anti-Pattern: Duplicate Act/Assert Blocks

**Wrong**: two Acts and Asserts in one test:

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

**Correct**: split into two focused tests:

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
