---
name: typescript-testing
description: Mandatory testing conventions for TypeScript stacks (Vitest for CLI/SDK/Website, Jest for CDK). Use for unit, integration, or E2E tests with Vitest, Jest, or Playwright.
---

# Testing Conventions (TypeScript)

This skill defines the **MANDATORY** testing conventions for TypeScript projects.
These are **rules**, not guidelines.

---

## Documentation Rules

### NO Comments Except AAA Markers

* **Do NOT write explanatory comments** — code must be self-explanatory
* **Only `// Arrange`, `// Act`, `// Assert`** comments are allowed in tests
* The test name `Should_X_When_Y` already documents the intent

**Exception — SDK public API:** Code under `src/sdks/*/` consumed by
external developers (facade classes, public entry points) **SHOULD** have
JSDoc with usage examples. This exception does **not** apply to tests or
internal helpers.

---

## Stacks Overview

| Stack | Test Runner | Location |
| ----- | ----------- | -------- |
| CLI / Core | Vitest | `tests/envilder/` |
| Node.js SDK | Vitest | `tests/sdks/nodejs/` |
| Website | Vitest | `tests/website/` |
| CDK (IaC) | Jest | `tests/iac/` |
| E2E | Vitest + TestContainers | `e2e/` |

---

## Core Principles

### 1. AAA Pattern (Arrange – Act – Assert)

**ALL tests MUST follow the AAA pattern**, separated by inline comments.

#### Rules

* Each phase **MUST** be separated with comments
* **Never mix phases**
* **Each comment (`// Arrange`, `// Act`, `// Assert`) appears AT MOST ONCE
  per test** — if you need two actions or two asserts, write two tests
* **Act = one single invocation on the SUT.** Multiple statements in Act only
  if they are genuinely part of the same logical action (rare and exceptional).
  Two independent operations = two tests.
* **All assertions belong in Assert only.** No `expect()` in Arrange or Act.
  If you feel tempted to assert in Arrange (precondition check), extract it to
  a separate test or use a guard clause that throws — not an assertion.
* **AAA markers are mandatory in ALL tests** — including structural guards,
  static completeness checks, and data validation tests. No exceptions.
* **No `if`, `switch`, or conditional logic** inside Arrange, Act, or Assert
* **No `try/catch/finally`** inside tests — use `beforeEach`/`afterEach` for
  teardown
* **No `// Act & Assert` combined blocks** — Act and Assert are ALWAYS separate
* For exceptions: `expect(() => action()).toThrow()` or
  `await expect(asyncAction()).rejects.toThrow()`
* Omit comment if section is empty
* If a test needs branching, split it into separate tests (one per scenario)

#### Vitest Example

```typescript
it('Should_GenerateEnvFile_When_ValidParametersProvided', async () => {
  // Arrange
  mockStore.getMapping.mockResolvedValue({ KEY: '/ssm/path' });
  mockProvider.getSecret.mockResolvedValue('value');

  // Act
  await sut.handle(command);

  // Assert
  expect(mockStore.saveEnvironment).toHaveBeenCalled();
});
```

---

### 2. Test Naming Convention

Test names **MUST** follow exactly:

```text
Should_{ExpectedBehavior}_When_{Condition}
```

#### Rules

* **PascalCase** for both parts
* **NO** natural language sentences in `it()` descriptions
* **NO** vague names (`Should_Work`, `TestHandler`)
* **NO** missing `When` clause

#### Good Examples

| Test Name | Scenario |
| --------- | -------- |
| `Should_ThrowError_When_SSMParameterIsNotFound` | Error path |
| `Should_ReturnMaskedValue_When_SecretIsLoaded` | Success path |
| `Should_ReturnEmptyMap_When_NoMappingsExist` | Edge case |

---

## Variable Naming (MANDATORY)

| Purpose | Name |
| ------- | ---- |
| Subject under test | `sut` |
| Expected value | `expected` |
| Actual result | `actual` |

No creativity allowed here.

---

## Mocking (Vitest)

### Port Test Doubles

```typescript
const mockProvider: ISecretProvider = {
  getSecret: vi.fn(),
};

const mockStore: IVariableStore = {
  getMapping: vi.fn(),
  saveEnvironment: vi.fn(),
};

const mockLogger: ILogger = {
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};
```

### Controlling Behavior

```typescript
vi.mocked(mockProvider.getSecret).mockResolvedValue('secret-value');
vi.mocked(mockProvider.getSecret).mockRejectedValue(new Error('not found'));
vi.mocked(mockStore.getMapping).mockResolvedValue({ KEY: '/path' });
```

### Verifying Interactions

```typescript
expect(mockProvider.getSecret).toHaveBeenCalledWith('/ssm/path');
expect(mockProvider.getSecret).toHaveBeenCalledTimes(1);
expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining('success'));
```

---

## Exception Testing

**Act and Assert MUST be separate.** Wrap the action in Act, assert in Assert.

### ✅ CORRECT — separate Act and Assert

```typescript
it('Should_ThrowInvalidArgument_When_ProviderIsUnsupported', () => {
  // Arrange
  const config = { provider: 'unsupported' };

  // Act
  const act = () => createProvider(config);

  // Assert
  expect(act).toThrow(InvalidArgumentError);
});
```

### ✅ CORRECT — async exceptions

```typescript
it('Should_ThrowParameterNotFound_When_SSMKeyIsMissing', async () => {
  // Arrange
  mockProvider.getSecret.mockRejectedValue(new ParameterNotFoundError('/missing'));

  // Act
  const act = sut.handle(command);

  // Assert
  await expect(act).rejects.toThrow(ParameterNotFoundError);
});
```

### ❌ FORBIDDEN — combined Act & Assert

```typescript
it('Should_ThrowError_When_Invalid', () => {
  // Act & Assert   ← NEVER DO THIS
  expect(() => sut.handle(bad)).toThrow();
});
```

---

## Test Class Structure

### CLI / Core (Vitest + InversifyJS handlers)

```typescript
describe('PullSecretsToEnvCommandHandler', () => {
  let sut: PullSecretsToEnvCommandHandler;
  let mockStore: { getMapping: Mock; saveEnvironment: Mock };
  let mockProvider: { getSecret: Mock };
  let mockLogger: { info: Mock; warn: Mock; error: Mock };

  beforeEach(() => {
    mockStore = { getMapping: vi.fn(), saveEnvironment: vi.fn() };
    mockProvider = { getSecret: vi.fn() };
    mockLogger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };
    sut = new PullSecretsToEnvCommandHandler(
      mockProvider,
      mockStore,
      mockLogger,
    );
  });

  it('Should_GenerateEnvFile_When_ValidParametersProvided', async () => {
    // Arrange
    mockStore.getMapping.mockResolvedValue({ KEY: '/ssm/path' });
    mockProvider.getSecret.mockResolvedValue('value');

    // Act
    await sut.handle(command);

    // Assert
    expect(mockStore.saveEnvironment).toHaveBeenCalled();
  });
});
```

### Node.js SDK (Vitest, no DI)

```typescript
describe('EnvilderClient', () => {
  it('Should_ResolveSecrets_When_ProviderReturnsValues', async () => {
    // Arrange
    const mockProvider: ISecretProvider = {
      getSecrets: vi.fn().mockResolvedValue(new Map([['KEY', 'value']])),
    };
    const sut = new EnvilderClient(mockProvider);

    // Act
    const actual = await sut.resolveSecrets(parsedMapFile);

    // Assert
    expect(actual.get('KEY')).toBe('value');
  });
});
```

### CDK / IaC (Jest)

```typescript
describe('AppStack', () => {
  it('Should_CreateLambda_When_StackSynthesized', () => {
    // Arrange
    const app = new cdk.App();
    const stack = new AppStack(app, 'TestStack');

    // Act
    const actual = Template.fromStack(stack);

    // Assert
    actual.hasResourceProperties('AWS::Lambda::Function', {
      Runtime: 'nodejs20.x',
      Handler: 'index.handler',
    });
  });
});
```

---

## Structural Guards

Tests that validate static data (i18n completeness, schema conformance,
version consistency) still **MUST** use AAA markers. Arrange can be omitted
if data is set up at the `describe` level:

```typescript
it('Should_HaveNoMissingKeys_When_CatalanComparedToEnglish', () => {
  // Act
  const actual = enKeys.filter((k) => !caKeys.includes(k));

  // Assert
  expect(actual, 'Keys missing in ca.ts').toEqual([]);
});
```

---

## Verification Commands

| Context | Command |
| ------- | ------- |
| CLI / Core / Website | `pnpm test` |
| Node.js SDK | `cd tests/sdks/nodejs && pnpm vitest run --reporter=verbose` |
| CDK | `cd tests/iac && pnpm jest` |
| CI parity | `pnpm test:ci` |
| Lint | `pnpm lint` |
| Format | `pnpm format` |

---

## Decision Points

* Pure domain logic → unit test at domain layer
* Handler orchestrating ports → mock ports with `vi.fn()`
* AWS integration semantics → E2E with LocalStack/TestContainers
* Static data consistency → structural guard (no AAA)
* CDK infrastructure → snapshot + fine-grained assertions

---

## Completion Criteria

* Test names follow `Should_<Expected>_When_<Condition>`
* AAA markers present (except structural guards), each at most once
* `sut`, `actual`, `expected` used consistently
* Positive and negative paths covered
* Tests run green: `pnpm test`
* No lint regressions: `pnpm lint`
