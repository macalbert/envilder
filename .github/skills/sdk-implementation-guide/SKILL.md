---
name: sdk-implementation-guide
description: >-
  Operational guide for implementing a new Envilder runtime SDK. Covers folder
  structure, API surface (Tier 1 + Tier 2), provider contract, naming
  conventions, sync/async model, internal vs public separation, vanity imports,
  and testing skeleton. Use when creating Go, Java, PHP, Rust, or any future SDK.
---

# SDK Implementation Guide

Step-by-step guide for building a new Envilder runtime SDK. Complements
ADR-0003 (architecture pattern) and ADR-0005 (integration tiers). For website
wiring and publishing, see the `sdk-release-checklist` skill.

## When to Use

- Implementing a new runtime SDK (Go, Java, PHP, Rust, etc.)
- Reviewing an SDK PR for pattern compliance
- Onboarding a contributor to SDK development

## Prerequisites

Before starting, read:

- [ADR-0003: SDK Architecture Pattern](../../../docs/architecture/adr/0003-sdk-architecture-pattern.md)
- [ADR-0005: SDK Integration Tiers](../../../docs/architecture/adr/0005-sdk-integration-tiers.md)

## 1. Folder Structure

```txt
src/sdks/{runtime}/
├── domain/
│   ├── ISecretProvider          ← Port interface/protocol
│   ├── MapFileConfig            ← Config parsed from $config
│   ├── EnvilderOptions          ← Runtime overrides
│   ├── ParsedMapFile            ← Config + variable mappings
│   └── SecretProviderType       ← Enum (aws, azure)
├── application/
│   ├── Envilder                 ← Public facade (Tier 1 + Tier 2)
│   ├── EnvilderClient           ← Core resolver
│   ├── MapFileParser            ← JSON parsing logic
│   └── SecretValidation         ← Opt-in validate function
├── infrastructure/
│   ├── SecretProviderFactory    ← Internal, not exported
│   ├── aws/
│   │   └── AwsSsmSecretProvider
│   └── azure/
│       └── AzureKeyVaultSecretProvider
└── integrations/                ← Tier 3 (future, community-driven)
    └── {framework}/
```

Tests mirror the structure under `tests/sdks/{runtime}/`.

## 2. Mandatory API Surface

### Tier 1 — Static Facade (one-liner)

```
Envilder.load("map.json")              → injects into process env
Envilder.resolveFile("map.json")       → returns resolved key-value pairs
```

### Tier 2 — Fluent Builder

```
Envilder.fromMapFile("map.json")
  .withProvider("azure")
  .withVaultUrl("https://vault.azure.net")
  .withProfile("my-profile")           // AWS only
  .inject()                            // injects into env
  // OR
  .resolve()                           // returns key-value pairs
```

### Environment Routing (both tiers)

```
Envilder.load("production", {
  "production": "prod-map.json",
  "staging": "stg-map.json"
})
```

## 3. Provider Contract

| Aspect | Decision |
| ------ | -------- |
| Missing secrets | Return null/None/nil (Option<T> in Rust) — never throw |
| Validation | Opt-in `validateSecrets()` post-resolution |
| Cross-provider validation | profile + Azure → error; vaultUrl + AWS → error |
| Options override config | Runtime `EnvilderOptions` > `$config` from map file |
| Pull-only | SDKs do not support push mode |

### Sync vs Async per Runtime

| Runtime | Model | Rationale |
| ------- | ----- | --------- |
| .NET | Both (sync + async methods) | `IConfigurationBuilder` needs sync |
| Python | Sync only | boto3 is natively synchronous |
| Node.js | Async only | AWS SDK v3 is async, natural fit |
| Go | Sync (with context.Context and goroutines for batch) | Idiomatic Go |
| Java/Kotlin | Both (sync + async/CompletableFuture) | Spring uses both patterns |
| PHP | Sync only | PHP is single-threaded by default |
| Rust | Async (tokio) | AWS SDK for Rust is async |

### Batch vs Individual

| Runtime | Strategy | Rationale |
| ------- | -------- | --------- |
| Node.js | Batch (`GetParameters`, max 10) | Avoids waterfall awaits |
| .NET | Individual (`GetParameter`) | Simpler error handling per secret |
| Python | Individual (`get_parameter`) | Matches boto3 API |
| Go | Batch preferred | Reduce round trips |
| Java | Batch preferred | AWS SDK supports batch |
| PHP | Individual | Simpler for first iteration |
| Rust | Batch preferred | Async batch is natural |

## 4. Internal vs Public Separation

The `SecretProviderFactory` is always **internal** (not part of public API):

| Runtime | Mechanism |
| ------- | --------- |
| .NET | `internal` keyword + `InternalsVisibleTo` for tests |
| Python | `_` prefix (`_SecretProviderFactory`) + `__all__` whitelist |
| Node.js | Not re-exported from barrel `index.ts` |
| Go | Unexported (`secretProviderFactory`, lowercase) |
| Java/Kotlin | Package-private or `internal` (Kotlin) |
| PHP | Prefixed `_` or `#[Internal]` attribute / `@internal` docblock |
| Rust | `pub(crate)` visibility |

## 5. Naming Conventions

### Package/Module Names

| Runtime | Package name | Import |
| ------- | ------------ | ------ |
| .NET | `Envilder` (NuGet) | `using Envilder;` |
| Python | `envilder` (PyPI) | `from envilder import Envilder` |
| Node.js | `@envilder/sdk` (npm) | `import { Envilder } from '@envilder/sdk'` |
| Go | `envilder.com/go` (vanity) | `import "envilder.com/go"` |
| Java/Kotlin | `com.envilder:envilder` (Maven) | `import com.envilder.Envilder;` |
| PHP | `envilder/envilder` (Packagist) | `use Envilder\Envilder;` |
| Rust | `envilder` (crates.io) | `use envilder::Envilder;` |

### Class/Struct Naming

- Facade class is always `Envilder` (consistent cross-SDK brand)
- Client class is always `EnvilderClient`
- Provider interface: `ISecretProvider` (or language equivalent: Protocol, trait, interface)

## 6. Vanity Imports (Go)

Go module path is `envilder.com/go`. This requires a vanity import HTML at
`https://envilder.com/go?go-get=1`:

```html
<meta name="go-import" content="envilder.com/go git https://github.com/macalbert/envilder">
<meta name="go-source" content="envilder.com/go https://github.com/macalbert/envilder https://github.com/macalbert/envilder/tree/main/src/sdks/go{/dir} https://github.com/macalbert/envilder/tree/main/src/sdks/go{/dir}/{file}#L{line}">
```

Serve from the Envilder website (`src/website/public/go/index.html`).

## 7. Testing Skeleton

Every SDK must have:

- [ ] Unit tests for `MapFileParser`
- [ ] Unit tests for `EnvilderClient` (mock `ISecretProvider`)
- [ ] Unit tests for `Envilder` facade (mock client/provider)
- [ ] Unit tests for `SecretValidation`
- [ ] Unit tests for cross-provider validation
- [ ] Acceptance tests with LocalStack (AWS SSM)
- [ ] Acceptance tests with Lowkey Vault (Azure Key Vault)

Follow `sdk-acceptance-testing` skill for container wrapper patterns.

## 8. Implementation Order (per SDK)

1. Domain types (`MapFileConfig`, `EnvilderOptions`, `SecretProviderType`, `ISecretProvider`)
2. `MapFileParser` + tests
3. `EnvilderClient` + tests
4. `AwsSsmSecretProvider` + acceptance tests
5. `AzureKeyVaultSecretProvider` + acceptance tests
6. `Envilder` facade (Tier 1 + Tier 2) + tests
7. `SecretValidation` + tests
8. Cross-provider validation + tests
9. README, changelog, website wiring (→ `sdk-release-checklist` skill)

## 9. Checklist Before Submitting PR

- [ ] All unit tests pass
- [ ] All acceptance tests pass (Docker required)
- [ ] `SecretProviderFactory` is not publicly exported
- [ ] Tier 1 (`load`) and Tier 2 (`fromMapFile().inject()`) work end-to-end
- [ ] Missing secrets silently omitted (no exceptions from provider)
- [ ] `validateSecrets()` throws on empty/missing values
- [ ] Cross-provider errors: profile+Azure→error, vaultUrl+AWS→error
- [ ] Options override `$config` values
- [ ] Environment routing works
- [ ] Follows language-idiomatic conventions (naming, async model, visibility)
