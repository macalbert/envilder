---
name: "Scaffold Feature"
description: "Implement an approved Envilder feature skeleton through the verification-first workflow."
argument-hint: "feature name and brief description"
agent: "Change Orchestrator"
---

Coordinate one coherent `NEW_BEHAVIOR` change that establishes independent
behavioral verification before scaffolding the solution structure.

## Inputs

- **Feature name**: e.g., "validate", "export-dotenv"
- **Description**: what the feature does
- **Observable outcome**: behavior available through a public entry point
- **Scope**: approved layers, apps, SDKs, and documentation surfaces
- **Constraints**: architecture, compatibility, security, and operations

## Verification Ownership

- `@Verifier` establishes the behavioral contract and owns all protected test or
  validation artifacts.
- `@Implementer` may inspect those artifacts but never creates, edits, renames,
  regenerates, or weakens them.
- Scaffolding is a solution-generation technique, not a source of expected
  behavior.

## Typical Solution Artifacts

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

### 4. Dispatcher (`src/envilder/core/application/dispatch/DispatchActionCommandHandler.ts`)

Add case to switch statement:

```typescript
case OperationMode.{NAME}:
  // TODO: wire up
  break;
```

## Workflow

1. Approve the requirement, invariants, scope, and constraints.
2. Establish the independent `VerificationContract`.
3. Let `@Implementer` inspect similar features and create only approved solution
   artifacts.
4. Complete required DI, routing, and entry-point wiring; do not leave
   non-executable placeholders.
5. Run the frozen targeted verification and applicable broader gates.
6. Run independent candidate review and fresh final verification.

## Constraints

- Follow hexagonal architecture: no infrastructure imports in domain or application
- Use InversifyJS decorators (`@injectable()`, `@inject()`)
- One command + one handler per feature
- Follow existing repository patterns before generic templates
- Never generate placeholder tests or assertions
- Never edit protected verification artifacts to make the scaffold pass
- Do not add speculative abstractions or out-of-scope cleanup
