---
description: "Use when editing Envilder TypeScript code or tests. Enforces repository conventions for logging, secret safety, tests, and build verification."
name: "Envilder Coding And Testing Conventions"
applyTo:
  - "src/**/*.ts"
  - "tests/**/*.ts"
  - "e2e/**/*.ts"
---
# Envilder Coding And Testing Conventions

Apply these conventions as required defaults for source and test changes.

- Follow existing Biome style: single quotes, semicolons, 2-space indent, and trailing commas.
- Inject `ILogger` instead of writing directly to console in domain or application code.
- Never log raw secrets; use masked output patterns (for example `EnvironmentVariable.maskedValue`).
- For tests, use Vitest naming: `Should_<Expected>_When_<Condition>`.
- Structure tests with explicit AAA markers: `// Arrange`, `// Act`, `// Assert`.
- Mock application-layer dependencies at port boundaries using `vi.fn()`.
- For GitHub Action behavior changes, regenerate and verify the bundle with `pnpm build:gha` and `pnpm verify:gha`.
- Prefer `pnpm` commands and keep changes compatible with existing scripts and workspace layout.
