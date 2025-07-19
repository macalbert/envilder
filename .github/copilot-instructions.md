# Copilot Instructions for Envilder

## Overview

Envilder is a CLI tool for managing environment variables through AWS SSM Parameter Store as a single
source of truth. It syncs between local `.env` files and AWS SSM using JSON mapping files.

## Architecture Pattern: Clean Architecture + Hexagonal

The codebase follows clean architecture with explicit ports/adapters pattern:

- **Domain Layer** (`src/envilder/domain/`): Core entities, value objects, and interfaces (ports)
- **Application Layer** (`src/envilder/application/`): Command handlers using CQRS pattern
- **Infrastructure Layer** (`src/envilder/infrastructure/`): Adapters implementing domain ports

### Key Domain Concepts

- `EnvironmentVariable`: Domain entity with value masking for secrets (`maskedValue` property)
- `OperationMode`: Enum defining three operation types (PULL_SSM_TO_ENV, PUSH_ENV_TO_SSM, PUSH_SINGLE)
- Ports (interfaces): `ISecretProvider`, `IVariableStore`, `ILogger`

### Command Pattern Implementation

Three main command handlers coordinate operations:

- `PullSsmToEnvCommandHandler`: Fetches from SSM → writes .env file
- `PushEnvToSsmCommandHandler`: Reads .env + mapping → pushes to SSM
- `PushSingleCommandHandler`: Direct key/value → SSM push

## Dependency Injection with Inversify (.NET-Style Startup)

Uses Inversify for dependency injection with .NET-style startup pattern for organized service configuration:

```typescript
// .NET-style startup pattern (src/apps/cli/Startup.ts)
const startup = new Startup();
startup.configureServices();           // Configure domain/application services
startup.configureInfrastructure(profile); // Configure infrastructure with runtime params
const serviceProvider = startup.getServiceProvider();

const commandHandler = serviceProvider.get<DispatchActionCommandHandler>(TYPES.DispatchActionCommandHandler);
```

All services use `@injectable` decorators and constructor injection with `@inject(TYPES.Symbol)`.

DI types are defined in `src/envilder/types.ts` for shared access across layers.

## Core Workflows

### .NET-Style Startup Configuration

- `Startup` class in `src/apps/cli/Startup.ts` - Main DI configuration (equivalent to .NET's Startup.cs)
- `configureServices()` - Configure domain and application services (equivalent to ConfigureServices)
- `configureInfrastructure()` - Configure infrastructure with runtime parameters (equivalent to Configure)  
- `getServiceProvider()` - Get configured container (equivalent to built service provider)
- Type symbols in `src/envilder/types.ts`
- Runtime binding for `ISecretProvider` due to AWS SSM instance dependency

### Mapping File Pattern

All operations use JSON mapping files (`param-map.json`) to connect environment variable names to SSM paths:

```json
{
  "API_KEY": "/myapp/api/key",
  "DB_PASSWORD": "/myapp/db/password"
}
```

### AWS Profile Support

CLI supports `--profile` flag that gets passed to AWS SDK credentials:

```typescript
const ssm = options.profile
  ? new SSM({ credentials: fromIni({ profile: options.profile }) })
  : new SSM();
```

## Testing Patterns

### Unit Tests

- Mock all ports/adapters using Vitest `vi.fn()`
- Test command handlers in isolation
- Use in-memory maps for file system mocking

### Integration Tests

- Use TestContainers with LocalStack for AWS integration
- Located in `tests/envilder/infrastructure/aws/`

### File System Mocking

In tests, file operations are mocked using Map-based in-memory storage:

```typescript
const mockInMemoryFiles = new Map<string, string>();
```

## Development Commands

### Build & Test

```bash
npm run build          # TypeScript compilation to lib/
npm run test           # Vitest with coverage
npm run test:ci        # CI mode with JUnit output
```

### Local Development

```bash
npm run local:install  # Build + pack + install globally for testing
npm run local:test-run # Test with sample files
```

### Code Quality

```bash
npm run lint           # Biome + secretlint + TypeScript check
npm run format:write   # Biome formatting
```

## Project Conventions

### Error Handling

- Domain-specific error classes in `src/envilder/domain/errors/DomainErrors.ts`
- All async operations use try/catch with logging
- Validation happens in domain entities (e.g., `EnvironmentVariable.validate()`)

### Secret Masking

Always use `EnvironmentVariable.maskedValue` for logging secrets:

```typescript
const envVar = new EnvironmentVariable(name, value, true);
logger.info(`${envVar.name}=${envVar.maskedValue}`);
```

### File Extensions

- Use `.js` imports in TypeScript for ESM compatibility
- Build output goes to `lib/` directory

## Testing Guidelines

### Test Structure: AAA Pattern

All tests must follow the **Arrange-Act-Assert (AAA)** pattern with clear comment blocks:

```typescript
it('Should_DoSomething_When_ConditionIsMet', () => {
  // Arrange
  const sut = new MyClass();
  const expected = 'expectedValue';

  // Act
  const actual = sut.doSomething();

  // Assert
  expect(actual).toBe(expected);
});
```

### Naming Conventions

#### Test Method Names

Use descriptive names following this pattern:

- `Should_[ExpectedBehavior]_When_[StateUnderTest]`
- Examples: `Should_ReturnContainer_When_CreateIsCalled`, `Should_ThrowError_When_ServicesAreNotConfigured`

#### Variable Names

**Always use these standard names:**

- `sut` = Subject Under Test (the object being tested)
- `expected` = Expected result/value
- `actual` = Actual result from the operation
- For multiple instances: `actual1`, `actual2`, etc.

```typescript
// ✅ Good
const sut = startup.configureServices().configureInfrastructure();
const expected = sut.create();
const actual = sut.getServiceProvider();
expect(actual).toBe(expected);

// ❌ Bad
const configuredStartup = startup.configureServices().configureInfrastructure();
const container1 = configuredStartup.create();
const container2 = configuredStartup.getServiceProvider();
expect(container2).toBe(container1);
```

### Test Categories

#### Unit Tests (Behavior-Focused)

- **Focus**: Test behavior, not implementation details
- **Scope**: Single class/method in isolation
- **Dependencies**: Mock all external dependencies using `vi.fn()`
- **Location**: Mirror source structure in `tests/` directory

#### Smoke Tests (Integration Points)

- **Purpose**: Verify main integration points work
- **Pattern**: Test 1-2 representative services, not exhaustive lists
- **Example**: Test main entry point resolution, not every service

```typescript
// ✅ Good - Smoke test
expect(() => 
  container.get<DispatchActionCommandHandler>(TYPES.DispatchActionCommandHandler)
).not.toThrow();

// ❌ Bad - Exhaustive testing
expect(() => container.get<Service1>(TYPES.Service1)).not.toThrow();
expect(() => container.get<Service2>(TYPES.Service2)).not.toThrow();
expect(() => container.get<Service3>(TYPES.Service3)).not.toThrow();
// ... (testing every service)
```

#### Integration Tests (Full Workflows)

- **Purpose**: Test complete workflows with real dependencies
- **Location**: `tests/envilder/infrastructure/aws/` for AWS integration
- **Tools**: Use TestContainers with LocalStack for AWS services

### Anti-Patterns to Avoid

#### ❌ Don't Test Implementation Details

```typescript
// Bad - testing internal DI configuration
expect(() => container.get<EveryService>(TYPES.EveryService)).not.toThrow();
```

#### ❌ Don't Test Third-Party Code

```typescript
// Bad - testing Inversify's binding mechanism
expect(container.bind(TYPES.Service).to(Service)).not.toThrow();
```

#### ❌ Don't Create Brittle Tests

```typescript
// Bad - breaks when adding new services
const allServices = [Service1, Service2, Service3];
allServices.forEach(service => {
  expect(() => container.get(service)).not.toThrow();
});
```

### Test Maintainability

#### ✅ Test Behavior, Not Structure

- Focus on what the code should do, not how it's implemented
- Tests should rarely need updates when refactoring internals

#### ✅ Use Descriptive Assertions

```typescript
// Good
expect(actual).toBeDefined();
expect(actual).toBeInstanceOf(Container);

// Better with context
expect(actual).toBeDefined(); // Main entry point should be resolvable
```

#### ✅ Keep Tests Simple and Focused

- One concept per test
- Clear setup in Arrange section
- Single action in Act section
- Focused verification in Assert section

### Mocking Strategy

#### In-Memory Mocking for File Operations

```typescript
const mockInMemoryFiles = new Map<string, string>();
// Mock file system operations with Map-based storage
```

#### Service Mocking with Vitest

```typescript
const mockLogger: Mocked<ILogger> = {
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};
```

## File Extensions and Build

- Use `.js` imports in TypeScript for ESM compatibility
- Build output goes to `lib/` directory

## Key Files to Reference

- `src/apps/cli/Cli.ts` - CLI entry point and DI container setup
- `src/apps/cli/Startup.ts` - .NET-style startup class for DI configuration
- `src/envilder/types.ts` - DI type symbols for shared access across layers
- `src/envilder/application/dispatch/DispatchActionCommandHandler.ts` - Main orchestrator
- `src/envilder/domain/EnvironmentVariable.ts` - Core domain entity
- `src/envilder/infrastructure/aws/AwsSsmSecretProvider.ts` - AWS integration
- `package.json` - npm scripts and dependencies

## Integration Points

- Inversify for dependency injection with decorators
- AWS SDK v3 for SSM operations (`@aws-sdk/client-ssm`)
- Commander.js for CLI parsing
- dotenv for .env file parsing
- Vitest for testing with TestContainers for AWS integration
