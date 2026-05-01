# ADR-0003: SDK Architecture Pattern

## Status

Accepted

## Context

Envilder provides runtime SDKs for .NET, Python, and Node.js (with Go and Java
planned). Each SDK must:

- Load secrets from AWS SSM or Azure Key Vault at application startup
- Be lightweight — no framework dependencies forced on consumers
- Expose a simple public API while hiding provider wiring
- Support custom providers for extensibility
- Be idiomatic in each language

The TypeScript core uses InversifyJS for DI, but SDKs are consumed by external
applications that have their own DI strategy (or none). Forcing a DI framework
on consumers would be a hard dependency and adoption barrier.

## Decision

### 1. Three-Layer Architecture (No DI Framework)

Each SDK follows Domain → Application → Infrastructure layers with manual
composition via factory pattern:

```txt
Domain/           ← ISecretProvider port, config types, enums
Application/      ← Envilder facade, EnvilderClient, MapFileParser, validation
Infrastructure/   ← Provider implementations (AWS, Azure), factory
```

No SDK uses a DI framework internally. Object wiring is done by an internal
factory that the facade invokes.

### 2. Public API Surface

Three levels of API complexity for different consumer needs:

| Level | API | Purpose |
| ----- | --- | ------- |
| Simple | `Envilder.load(path)` / `Envilder.resolveFile(path)` | One-liner, auto-injects into process env |
| Fluent | `Envilder.fromMapFile(path).withProvider("azure").inject()` | Configurable builder |
| Advanced | `EnvilderClient` + custom `ISecretProvider` | Full control, custom providers |

### 3. Internal vs Public Separation

| SDK | Mechanism |
| --- | --------- |
| .NET | `internal` keyword on `SecretProviderFactory`; `InternalsVisibleTo` for tests |
| Python | Underscore prefix (`_SecretProviderFactory`) + `__all__` whitelist |
| Node.js | Factory not re-exported from barrel `index.ts`; private constructor on `Envilder` |

### 4. Provider Contract

| SDK | Contract | Rationale |
| --- | -------- | --------- |
| .NET | `GetSecret(name)` → `string?` (per-secret, sync+async) | Sync needed for `IConfigurationBuilder` |
| Python | `get_secret(name)` → `str \| None` (per-secret, sync) | boto3 is synchronous |
| Node.js | `getSecrets(names[])` → `Map<string, string>` (batch, async) | Batch avoids waterfall await; AWS SSM supports `GetParameters` batch |

### 5. Cross-Stack Universal Behaviors

- **Missing secrets silently omitted** — no exception from provider
- **Opt-in validation** — separate `validateSecrets()` function throws on empty/missing
- **Cross-provider validation** — profile + Azure → error; vaultUrl + AWS → error
- **Options override config** — runtime `EnvilderOptions` > `$config` from map file
- **Pull-only** — SDKs do not support push mode (CLI is the management tool)
- **InjectIntoEnvironment as static** — sets env vars via `Environment.SetEnvironmentVariable` / `os.environ` / `process.env`

### 6. Framework Integrations (.NET-exclusive)

.NET provides optional integration extensions for ASP.NET consumers:

- `IConfigurationBuilder.AddEnvilder(mapFilePath)` — configuration pipeline
- `IServiceCollection.AddEnvilder(mapFilePath)` — DI registration

These are opt-in extensions, not required. The core SDK works without them.

## Consequences

### Positive

- Zero forced dependencies on consumers — no DI container, no framework lock-in
- Lightweight: `.NET` → 1 NuGet, `Python` → 1 PyPI, `Node.js` → 1 npm
- Extensible: users can implement `ISecretProvider` for custom backends
- Idiomatic per language (async model, naming conventions, visibility)

### Negative

- Duplicated logic across SDKs (MapFileParser, validation, factory). Acceptable
  because language idioms differ enough that sharing code is impractical.
- No conformance test suite yet (planned: `spec/` + `conformance/`)

## When to Reconsider

- If SDKs diverge significantly in behavior (indicates need for a spec)
- If a language demands async-only and we have a sync-only port (e.g., Go)
- If framework integrations become needed in Python or Node.js
