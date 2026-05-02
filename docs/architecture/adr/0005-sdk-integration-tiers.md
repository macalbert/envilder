# ADR-0005: SDK Integration Tiers

## Status

Accepted

## Context

Envilder provides runtime SDKs across multiple ecosystems (.NET, Python,
Node.js, Go, Java, PHP, Rust). Each ecosystem has a different relationship
with dependency injection:

| Runtime | DI landscape |
| ------- | ------------ |
| .NET | `IServiceCollection` is the de facto universal standard |
| Java/Kotlin | Fragmented: Spring, Guice, Dagger, CDI |
| Python | No standard: Django has its own, FastAPI uses `Depends` |
| Node.js | Fragmented: NestJS has its own, Express has none |
| Go | Convention is manual constructor injection (no DI container) |
| PHP | Fragmented: Symfony DI, Laravel Service Container |
| Rust | No runtime DI (not applicable) |

ADR-0003 defines the public API surface (Simple, Fluent, Advanced levels) and
the three-layer architecture. This ADR extends that by addressing how SDKs
integrate with host application frameworks — specifically around DI containers
and configuration pipelines.

## Decision

### 1. Three Integration Tiers

Each SDK exposes up to three tiers of integration. Only Tier 1 and Tier 2 are
mandatory for every SDK:

| Tier | Name | Description | Mandatory |
| ---- | ---- | ----------- | --------- |
| **Tier 1** | Static Facade | One-liner, zero config. Secrets injected into process environment. | Yes |
| **Tier 2** | Fluent Builder | Configurable step-by-step API. Provider, vault URL, profile, etc. Same package as Tier 1. | Yes |
| **Tier 3** | Framework Integration | Native integration with a specific framework's DI/config system. Separate package. | No |

### 2. Tier 3 Rules

- **Core SDK never depends on a framework DI container.** The dependency
  direction is: `envilder-{framework}` → `envilder` (core), never the reverse.
- Tier 3 packages follow the naming pattern: `envilder-{framework}`
  (e.g., `com.envilder:envilder-spring`, `envilder/laravel`, `@envilder/nestjs`).
- Tier 3 lives in `src/sdks/{runtime}/integrations/{framework}/` within the
  monorepo.

### 3. .NET Exception

.NET is the only runtime where Tier 3 extensions (`IServiceCollection.AddEnvilder()`,
`IConfigurationBuilder.AddEnvilder()`) live inside the core package. Rationale:
`IServiceCollection` is the universal DI standard in .NET — separating it would
be over-engineering with no practical benefit.

### 4. Tier 3 Is Community-Driven

Tier 3 will not be implemented for any new runtime until the community
explicitly requests it via GitHub issues or discussions. The core SDK (Tier 1 +
Tier 2) is sufficient for all use cases — Tier 3 is a convenience layer only.

### 5. Current State

| Runtime | Tier 1 | Tier 2 | Tier 3 |
| ------- | ------ | ------ | ------ |
| .NET | ✅ | ✅ | ✅ (in core, exception) |
| Python | ✅ | ✅ | — |
| Node.js | ✅ | ✅ | — |
| Go | Planned | Planned | — |
| Java/Kotlin | Planned | Planned | — |
| PHP | Planned | Planned | — |
| Rust | Planned | Planned | — |

## Alternatives Considered

### A. Single package with optional DI for all runtimes

Include framework integrations inside the core SDK package, guarded behind
optional dependencies or feature flags.

**Rejected:** Forces transitive dependencies (Spring, Laravel, etc.) on all
consumers regardless of whether they use the framework integration.

### B. Never offer Tier 3 (facade-only for everyone)

Only provide Tier 1 and Tier 2 across all ecosystems, including .NET.

**Rejected:** Loses adoption in ecosystems where native DI integration is the
expected standard (ASP.NET). The .NET SDK without `AddEnvilder()` would feel
incomplete to its target audience.

### C. Tier 3 mandatory for all SDKs from day one

Ship every SDK with at least one framework integration (Spring for Java,
Laravel for PHP, etc.).

**Rejected:** Disproportionate effort and maintenance burden without proven
demand. Violates YAGNI.

## Consequences

### Positive

- SDKs remain lightweight — no framework lock-in forced on consumers
- Clear separation of concerns: core secret loading vs framework wiring
- Community-driven prioritization avoids wasted effort
- .NET exception is pragmatic and matches ecosystem expectations

### Negative

- .NET is inconsistent with other SDKs (Tier 3 in core vs separate package)
- Future Tier 3 packages add maintenance surface area per framework

## When to Reconsider

- When the community explicitly requests framework integration for a specific
  runtime (tracked via GitHub issues/discussions)
- When an ecosystem consolidates around a single DI standard (as .NET did)
  making the "separate package" overhead unjustified
