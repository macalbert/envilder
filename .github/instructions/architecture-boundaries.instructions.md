---
description: "Use when adding or refactoring Envilder TypeScript features, especially command handlers, DI wiring, operation modes, or AWS SSM flows. Enforces hexagonal architecture and clean layer boundaries."
name: "Envilder Architecture Boundaries"
applyTo:
  - "src/envilder/**/*.ts"
  - "src/apps/**/*.ts"
---
# Envilder Architecture Boundaries

These rules are hard requirements for Envilder source code changes.

- Keep domain code pure in `src/envilder/domain`: no SDK, filesystem, process, or framework dependencies.
- Model external systems behind domain ports (`ISecretProvider`, `IVariableStore`, `ILogger`), and implement them only in infrastructure.
- Use the Command/Handler pattern in the application layer: add a `*Command` with static `.create()` and a matching `*CommandHandler`.
- Route new behavior via `DispatchActionCommandHandler` and `OperationMode` instead of branching directly in entry points.
- Keep `src/apps/*` focused on input parsing, startup wiring, and process exit behavior.
- Register new handlers and services in startup container configuration and symbol registries in `src/envilder/types.ts`.
- Prefer domain-specific errors from `src/envilder/domain/errors`; let errors bubble to CLI/GHA entry points.
- Keep GitHub Action behavior pull-only unless the requirement explicitly changes that product constraint.
