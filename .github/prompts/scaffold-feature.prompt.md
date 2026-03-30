---
name: "Scaffold Feature"
description: "Generate the skeleton files for a new Envilder feature following hexagonal architecture and command/handler pattern."
argument-hint: "feature name and brief description"
---

Scaffold the file structure for a new Envilder feature.

## Inputs

- **Feature name**: e.g., "validate", "export-dotenv"
- **Description**: what the feature does

## Generated Files

For a feature named `{name}`:

### 1. Command (`src/envilder/core/application/{name}/{Name}Command.ts`)

```typescript
export class {Name}Command {
  private constructor(/* params */) {}

  static create(/* params */): {Name}Command {
    // validation
    return new {Name}Command(/* params */);
  }
}
```

### 2. Handler (`src/envilder/core/application/{name}/{Name}CommandHandler.ts`)

```typescript
@injectable()
export class {Name}CommandHandler {
  constructor(
    @inject(TYPES.ILogger) private readonly logger: ILogger,
    // other port injections
  ) {}

  async handle(command: {Name}Command): Promise<void> {
    // TODO: implement
  }
}
```

### 3. DI Symbol (`src/envilder/core/types.ts`)

Add to `APPLICATION`:

```typescript
{Name}CommandHandler: Symbol.for('{Name}CommandHandler'),
```

### 4. Test (`tests/envilder/core/application/{name}/{Name}CommandHandler.test.ts`)

```typescript
describe('{Name}CommandHandler', () => {
  it('Should_{Expected}_When_{Condition}', async () => {
    // Arrange
    // Act
    // Assert
  });
});
```

### 5. Dispatcher (`src/envilder/core/application/dispatch/DispatchActionCommandHandler.ts`)

Add case to switch statement:

```typescript
case OperationMode.{NAME}:
  // TODO: wire up
  break;
```

## Post-Scaffold

After generating files, suggest:
"Use `@TDD Coach` to implement the feature behavior via TDD."

## Constraints

- Follow hexagonal architecture — no infrastructure imports in domain or application
- Use InversifyJS decorators (`@injectable()`, `@inject()`)
- One command + one handler per feature
- Mirror `src/` structure under `tests/` for test files
