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

## Builder Pattern for Dependency Injection

Use `DispatchActionCommandHandlerBuilder` to wire dependencies:

```typescript
const commandHandler = DispatchActionCommandHandlerBuilder.build()
  .withLogger(logger)
  .withEnvFileManager(fileManager)
  .withProvider(secretProvider)
  .create();
```

## Core Workflows

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

- Domain-specific error classes in `domain/errors/DomainErrors.ts`
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

## Key Files to Reference

- `src/apps/cli/Cli.ts` - CLI entry point and command parsing
- `src/envilder/application/dispatch/DispatchActionCommandHandler.ts` - Main orchestrator
- `src/envilder/domain/EnvironmentVariable.ts` - Core domain entity
- `src/envilder/infrastructure/aws/AwsSsmSecretProvider.ts` - AWS integration
- `package.json` - npm scripts and dependencies

## Integration Points

- AWS SDK v3 for SSM operations (`@aws-sdk/client-ssm`)
- Commander.js for CLI parsing
- dotenv for .env file parsing
- Vitest for testing with TestContainers for AWS integration
