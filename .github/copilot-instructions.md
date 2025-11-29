# Envilder Copilot Instructions

## Project Overview

Envilder is a TypeScript CLI tool and GitHub Action that securely centralizes environment variables from AWS SSM Parameter Store. Built with **Hexagonal Architecture** (Ports & Adapters) and **Clean Architecture** principles for testability and modularity.

## Architecture Layers

### Domain Layer (`src/envilder/domain`)

**Pure business logic - NO external dependencies allowed.**

- **Entities**: `EnvironmentVariable` (immutable, with validation and `maskedValue` for safe logging)
- **Ports** (interfaces): `ISecretProvider`, `IVariableStore`, `ILogger`
- **Errors**: Custom domain errors (`InvalidArgumentError`, `ParameterNotFoundError`, etc.) extend `DomainError`
- **Value Objects**: `OperationMode` enum

### Application Layer (`src/envilder/application`)

**Use case orchestration using Command/Handler pattern.**

- Each feature = `*Command` + `*CommandHandler` pair (e.g., `PullSsmToEnvCommand`, `PullSsmToEnvCommandHandler`)
- `DispatchActionCommandHandler` routes between pull/push modes via switch statement
- Handlers are `@injectable()` and inject dependencies via `@inject(TYPES.X)`
- Commands have static `.create()` factory methods

### Infrastructure Layer (`src/envilder/infrastructure`)

**Adapters implementing domain ports.**

- `AwsSsmSecretProvider`: Implements `ISecretProvider` using `@aws-sdk/client-ssm`
- `FileVariableStore`: Implements `IVariableStore` for .env and mapping JSON files
- `ConsoleLogger`: Implements `ILogger` with colored output via `picocolors`

### Apps Layer (`src/apps`)

**Entry points (CLI and GitHub Action).**

- `cli/Cli.ts`: Uses `commander` for CLI parsing
- `gha/Gha.ts`: Reads inputs from `process.env.INPUT_*` (GitHub Actions convention)
- Each has `Startup.ts` that configures InversifyJS container

## Dependency Injection (InversifyJS)

**Symbol Registry**: `src/envilder/types.ts` exports `DOMAIN`, `APPLICATION`, and legacy `TYPES` objects.

**Container Setup Pattern** (see `Startup.ts` files):

```typescript
container.bind<ISecretProvider>(TYPES.ISecretProvider)
  .toConstantValue(new AwsSsmSecretProvider(ssm));  // Infrastructure
container.bind<PullSsmToEnvCommandHandler>(TYPES.PullSsmToEnvCommandHandler)
  .to(PullSsmToEnvCommandHandler)
  .inTransientScope();  // Application handlers
```

**AWS Profile Handling**: CLI supports `--profile` flag → passed to `Startup.configureInfrastructure(awsProfile)` → creates SSM client with `fromIni({ profile })`.

## Key Workflows & Commands

**Package Manager**: `pnpm` (monorepo via `pnpm-workspace.yaml`)

**Development**:

- `pnpm build` — TypeScript compilation
- `pnpm build:gha` — Bundle GitHub Action with `@vercel/ncc` into `github-action/dist/index.js`
- `pnpm verify:gha` — Verify GHA bundle is up-to-date (fails if dist is stale)
- `pnpm local:install` — Build + pack + install globally for local testing
- `pnpm local:test-run` — Run CLI against `tests/sample/param-map.json`

**Quality**:

- `pnpm test` — Vitest with coverage (v8 provider, outputs to `coverage/`)
- `pnpm test:ci` — Adds JUnit reporter for CI pipelines
- `pnpm lint` — Runs Secretlint (credential detection), Biome (format/lint), and `tsc --noEmit`
- `pnpm format:write` — Auto-format with Biome

**E2E Tests**: Located in `e2e/`, use real AWS SSM via LocalStack (TestContainers). Run `pnpm build` + `pack-and-install.ts` before E2E.

## Coding Conventions

### Command/Handler Pattern

1. **Command class**: Data container with validation via static `.create()` method
2. **Handler class**: Decorated with `@injectable()`, injects ports via constructor
3. **Registration**: Add symbol to `TYPES`, bind in `Startup.configureApplicationServices()`
4. **Routing**: Add case to `DispatchActionCommandHandler.handleCommand()` switch

Example (PushSingle):

- Command: `PushSingleCommand.create(key, value, ssmPath)`
- Handler: `PushSingleCommandHandler` injects `ISecretProvider` and `ILogger`
- Dispatched via `OperationMode.PUSH_SINGLE` case

### Error Handling

- **Throw custom errors**: Use `InvalidArgumentError`, `ParameterNotFoundError`, etc. from `src/envilder/domain/errors`
- **Never catch generically**: Let errors bubble to entry points (CLI/GHA handle exit codes)

### Logging

- **Always inject** `ILogger` (symbol: `TYPES.ILogger`)
- **Mask secrets**: Use `EnvironmentVariable.maskedValue` for sensitive data (shows last 3 chars)
- **Log levels**: `info()` for success, `warn()` for empty parameters, `error()` for failures

### GitHub Action Constraints

- **Pull-only**: GHA only supports pull mode (no push) — see `Gha.ts` line 20
- **Input convention**: GitHub passes inputs as `INPUT_<UPPERCASE_NAME>` env vars
- **Bundle requirement**: After any code change, run `pnpm build:gha` to update `dist/index.js`

### Test Conventions

- **Framework**: Vitest with built-in mocking (`vi.fn()`, `vi.mock()`)
- **E2E Testing**: TestContainers with `@testcontainers/localstack` for real AWS SSM integration
- **Naming**: Use `Should_<Expected>_When_<Condition>` pattern (e.g., `Should_ThrowError_When_SSMParameterIsNotFound`)
- **Structure**: Follow AAA (Arrange-Act-Assert) pattern with explicit comment markers:

  ```typescript
  it('Should_GenerateEnvFile_When_ValidParametersProvided', async () => {
    // Arrange
    const mockData = { KEY: '/ssm/path' };
    mockStore.getMapping.mockResolvedValue(mockData);
    
    // Act
    await handler.handle(command);
    
    // Assert
    expect(mockStore.saveEnvironment).toHaveBeenCalled();
  });
  ```

- **Mocking Ports**: Create test doubles by implementing port interfaces with `vi.fn()` methods

### Code Style (Biome)

- Single quotes, semicolons, 2-space indent, 80-char line width
- Trailing commas enforced
- `unsafeParameterDecoratorsEnabled: true` for InversifyJS decorators

## Data Flow Example (Pull Operation)

1. User runs `envilder --map=map.json --envfile=.env`
2. `Cli.ts` parses options → calls `DispatchActionCommandHandler`
3. Dispatcher creates `PullSsmToEnvCommand` → invokes `PullSsmToEnvCommandHandler`
4. Handler loads mapping via `IVariableStore.getMapping()` → gets `{"DB_URL": "/app/db"}`
5. For each mapping, handler calls `ISecretProvider.getSecret("/app/db")`
6. AWS adapter uses `GetParameterCommand` with `WithDecryption: true`
7. Handler builds new env vars → calls `IVariableStore.saveEnvironment()`
8. Logs success with masked values

## Adding a New Feature (Step-by-Step)

**Example: Add "validate" command to check SSM parameter existence without pulling**

1. **Domain**: Create `src/envilder/domain/OperationMode.ts` enum entry: `VALIDATE`
2. **Application**:
   - Create `src/envilder/application/validate/ValidateCommand.ts` with `.create()` factory
   - Create `ValidateCommandHandler.ts`, inject `ISecretProvider` + `ILogger`
   - Add `ValidateCommandHandler: Symbol.for('ValidateCommandHandler')` to `APPLICATION` in `types.ts`
3. **DI Setup**: In `Startup.configureApplicationServices()`, bind handler with `.inTransientScope()`
4. **Routing**: Add `case OperationMode.VALIDATE:` to `DispatchActionCommandHandler`
5. **CLI**: In `Cli.ts`, add `.option('--validate')` and map to `OperationMode.VALIDATE`
6. **Tests**: Create `tests/envilder/application/validate/ValidateCommandHandler.test.ts`, mock ports with `vi.fn()`
7. **E2E**: Add test to `e2e/cli.test.ts` using LocalStack

## Extension Points

**New Secret Provider** (e.g., HashiCorp Vault):

1. Implement `ISecretProvider` interface in `src/envilder/infrastructure/vault/`
2. Update `Startup.configureInfrastructure()` to bind based on config flag
3. No changes needed to application or domain layers

**Multi-Backend Support**: Use InversifyJS conditional binding or factory pattern based on env var/flag.
