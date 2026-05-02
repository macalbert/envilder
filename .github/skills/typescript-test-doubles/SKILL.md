---
name: typescript-test-doubles
description: Test doubles with Vitest (vi.fn, vi.mock, vi.spyOn) and Mother pattern. Use when creating test data, mocking dependencies, or setting up module mocks in TypeScript tests.
---

# Test Doubles (TypeScript)

This skill defines how to use test doubles in TypeScript (Vitest).

---

## Test Doubles Types

### 1. Mock — vi.fn()

Use `vi.fn()` to create mock functions for port interfaces.

**Purpose:** Replace real dependencies with controllable test doubles.

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

### 2. Stub — mockResolvedValue / mockReturnValue

Use return value methods to configure stubs.

**Purpose:** Predefined responses without caring about call verification.

```typescript
// Async stub
mockProvider.getSecret.mockResolvedValue('secret-value');
mockStore.getMapping.mockResolvedValue({ KEY: '/ssm/path' });

// Sync stub
mockParser.parse.mockReturnValue({ config: {}, mappings: {} });

// Sequential returns
mockProvider.getSecret
  .mockResolvedValueOnce('first')
  .mockResolvedValueOnce('second');
```

### 3. Spy — vi.spyOn()

Use `vi.spyOn()` to observe calls on real objects without replacing behavior.

**Purpose:** Verify interactions while preserving real implementation.

```typescript
const spy = vi.spyOn(console, 'log');

sut.execute();

expect(spy).toHaveBeenCalledWith('Processing...');
spy.mockRestore();
```

### 4. Module Mock — vi.mock()

Use `vi.mock()` to replace entire modules.

**Purpose:** Replace external dependencies (AWS SDK, file system, etc.).

```typescript
vi.mock('@aws-sdk/client-ssm', () => ({
  SSMClient: vi.fn().mockImplementation(() => ({
    send: vi.fn(),
  })),
  GetParameterCommand: vi.fn(),
}));
```

### 5. Error Simulation — mockRejectedValue

Use `mockRejectedValue()` to simulate failures.

**Purpose:** Test error paths and exception handling.

```typescript
mockProvider.getSecret.mockRejectedValue(
  new ParameterNotFoundError('/missing/key'),
);

mockStore.getMapping.mockRejectedValue(
  new Error('File not found'),
);
```

---

## Verification Patterns

### Basic Verification

```typescript
expect(mockProvider.getSecret).toHaveBeenCalledWith('/ssm/path');
expect(mockProvider.getSecret).toHaveBeenCalledTimes(1);
expect(mockLogger.info).toHaveBeenCalledWith(
  expect.stringContaining('success'),
);
```

### Not Called

```typescript
expect(mockStore.saveEnvironment).not.toHaveBeenCalled();
expect(mockLogger.error).not.toHaveBeenCalled();
```

### Call Order

```typescript
expect(mockProvider.getSecret).toHaveBeenCalledBefore(
  mockStore.saveEnvironment,
);
```

### Argument Matchers

```typescript
expect(mockLogger.info).toHaveBeenCalledWith(
  expect.stringMatching(/loaded \d+ secrets/),
);
expect(mockStore.saveEnvironment).toHaveBeenCalledWith(
  expect.objectContaining({ KEY: 'value' }),
);
```

---

## Mother Pattern

Use factory functions for reusable test data creation.

```typescript
function createParsedMapFile(
  overrides: Partial<ParsedMapFile> = {},
): ParsedMapFile {
  return {
    config: { provider: 'aws' },
    mappings: new Map([['DB_URL', '/app/db']]),
    ...overrides,
  };
}

function createEnvilderOptions(
  overrides: Partial<EnvilderOptions> = {},
): EnvilderOptions {
  return {
    provider: SecretProviderType.AWS,
    profile: undefined,
    vaultUrl: undefined,
    ...overrides,
  };
}
```

Usage:

```typescript
// Arrange
const mapFile = createParsedMapFile({
  mappings: new Map([['API_KEY', '/prod/api-key']]),
});
```

---

## Port Test Double Pattern

Build complete mock objects implementing domain interfaces:

```typescript
function createMockSecretProvider(): ISecretProvider & {
  getSecrets: Mock;
} {
  return {
    getSecrets: vi.fn().mockResolvedValue(new Map()),
  };
}

function createMockLogger(): ILogger & {
  info: Mock;
  warn: Mock;
  error: Mock;
} {
  return {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };
}
```

---

## Summary

| Double Type | Vitest API | Purpose |
| ----------- | ---------- | ------- |
| Mock | `vi.fn()` | Controllable replacement |
| Stub | `.mockResolvedValue()` / `.mockReturnValue()` | Predefined responses |
| Spy | `vi.spyOn()` | Observe real objects |
| Module mock | `vi.mock()` | Replace entire modules |
| Error sim | `.mockRejectedValue()` | Failure paths |

When writing tests:

1. Create port test doubles with `vi.fn()` in `beforeEach`
2. Configure stubs with `.mockResolvedValue()` in Arrange
3. **Always verify** mock interactions in Assert
4. Use Mother pattern for complex test data
5. Prefer `vi.fn()` over `vi.mock()` (port-level > module-level)
