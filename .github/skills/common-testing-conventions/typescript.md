# Testing Stack: TypeScript

TypeScript is used across multiple stacks in this project. Each has its own test
runner and conventions.

## Stacks Overview

| Stack | Test Runner | Location |
| ----- | ----------- | -------- |
| **CLI / Core** | Vitest | `tests/envilder/` |
| **Node.js SDK** | Vitest | `tests/sdks/nodejs/` |
| **Website** | Vitest | `tests/website/` |
| **CDK (IaC)** | Jest | `tests/iac/` |
| **E2E** | Vitest + TestContainers | `e2e/` |

## CLI / Core / Node.js SDK (Vitest)

### Assertions

```typescript
expect(actual).toBe(expected);
expect(actual).toEqual(expected);
expect(actual).toBeTruthy();
expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
expect(mockFn).toHaveBeenCalledTimes(1);
expect(() => action()).toThrow(Error);
await expect(asyncAction()).rejects.toThrow('message');
```

### Mocking

```typescript
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Module mock
vi.mock('../path/to/module', () => ({
  someFunction: vi.fn(),
}));

// Inline mock object (port test double)
const mockProvider: ISecretProvider = {
  getSecret: vi.fn(),
};

// Mock return value
vi.mocked(mockProvider.getSecret).mockResolvedValue('secret-value');

// Verify
expect(mockProvider.getSecret).toHaveBeenCalledWith('/ssm/path');
expect(mockProvider.getSecret).toHaveBeenCalledTimes(1);
```

### Test Structure (CLI/Core)

```typescript
describe('PullSecretsToEnvCommandHandler', () => {
  let sut: PullSecretsToEnvCommandHandler;
  let mockStore: { getMapping: Mock; saveEnvironment: Mock };
  let mockProvider: { getSecret: Mock };

  beforeEach(() => {
    mockStore = { getMapping: vi.fn(), saveEnvironment: vi.fn() };
    mockProvider = { getSecret: vi.fn() };
    sut = new PullSecretsToEnvCommandHandler(mockProvider, mockStore, mockLogger);
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

### Test Structure (Node.js SDK)

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

## CDK / IaC (Jest)

### Snapshot Testing

```typescript
describe('AppStack', () => {
  it('Should_MatchSnapshot_When_StackSynthesized', () => {
    // Arrange
    const app = new cdk.App();
    const stack = new AppStack(app, 'TestStack');

    // Act
    const actual = Template.fromStack(stack);

    // Assert
    expect(actual.toJSON()).toMatchSnapshot();
  });
});
```

### Fine-Grained Assertions

```typescript
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
```

## Website (Vitest)

```typescript
import { describe, it, expect } from 'vitest';

describe('i18n completeness', () => {
  it('Should_HaveAllKeys_When_ComparedToEnglish', () => {
    // Arrange
    const enKeys = Object.keys(en);
    const esKeys = Object.keys(es);

    // Act
    const missing = enKeys.filter((k) => !esKeys.includes(k));

    // Assert
    expect(missing).toEqual([]);
  });
});
```

## E2E (Vitest + TestContainers)

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';

describe('CLI E2E', () => {
  let container: StartedLocalStackContainer;

  beforeAll(async () => {
    container = await new LocalstackContainer().start();
  });

  afterAll(async () => {
    await container.stop();
  });

  it('Should_PullSecrets_When_MapFileProvided', async () => {
    // Arrange
    await seedParameter(container, '/app/key', 'secret-value');

    // Act
    const result = execSync(`envilder --map=map.json --envfile=.env`);

    // Assert
    expect(readEnvFile('.env')).toContain('KEY=secret-value');
  });
});
```

## Biome (Linter + Formatter)

```bash
# Check (no writes)
pnpm lint

# Format and fix (writes)
pnpm format
```

Root `biome.json` enforces:

- Single quotes, semicolons, 2-space indent, 80-char line width
- Trailing commas enforced
- `unsafeParameterDecoratorsEnabled: true` for InversifyJS decorators

## TypeScript Strict Rules

- Use `import type` for type-only imports.
- TypeScript strict mode is enabled — respect all strict checks.
- Always run `pnpm format` after modifying TypeScript files.

## Test Cleanup — No `try/catch/finally` in Tests

**NEVER** use `try/catch`, `try/finally`, `if`, or any control flow inside test functions.
Use framework teardown mechanisms instead:

| Scenario | Mechanism |
| -------- | --------- |
| Env var restore | `beforeEach` / `afterEach` |
| Temp file cleanup | `afterEach` / `afterAll` |
| Vitest spy cleanup | `vi.restoreAllMocks()` in `afterEach` |

```typescript
// GOOD — cleanup via afterEach
describe('resolve', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv, AWS_ENDPOINT_URL: 'http://localhost:4566' };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('Should_ResolveSecret_When_EnvConfigured', async () => {
    // Act
    const actual = await resolve('map.json');

    // Assert
    expect(actual['DB_URL']).toBe(expected);
  });
});

// BAD — try/finally in test body
it('Should_ResolveSecret_When_EnvConfigured', async () => {
  const original = process.env.AWS_ENDPOINT_URL;
  try {
    process.env.AWS_ENDPOINT_URL = 'http://localhost:4566';
    const actual = await resolve('map.json');
    expect(actual['DB_URL']).toBe(expected);
  } finally {
    process.env.AWS_ENDPOINT_URL = original;
  }
});
```
