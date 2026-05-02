# ADR-0008: Map-File Schema Specification

## Status

Accepted

## Context

The map-file is Envilder's universal contract — a JSON file mapping environment
variable names to cloud secret paths. Every component (CLI, GitHub Action, and
all runtime SDKs) parses this format.

Despite being the core of the product, the format has no formal specification:

- No JSON Schema for IDE autocomplete or validation
- No documented rules for reserved keys (`$config` is implicit, undocumented)
- No defined set of `$config` fields — each SDK parses what it knows
- No variable naming constraints — anything goes
- Parsers filter `$config` by exact key match, not by reserved prefix — adding
  new reserved keys (e.g., `$schema`) would leak into variable mappings

Additionally, consumers need a testing story that doesn't require a real vault.
The current SDKs offer no built-in mechanism to resolve secrets from a local
file during development or CI.

## Decision

### 1. Map-File Format (v1)

```json
{
  "$schema": "https://envilder.com/schema/map-file.v1.json",
  "$config": {
    "name": "payments-api",
    "description": "Production secrets for payments microservice",
    "owner": "platform-team",
    "environment": "production",
    "provider": "aws",
    "profile": "prod-eu"
  },
  "DB_PASSWORD": "/payments/prod/db-password",
  "API_KEY": "/payments/prod/api-key"
}
```

### 2. Root-Level Structure

The root object contains exactly two categories of keys:

| Key pattern | Type | Purpose |
| ----------- | ---- | ------- |
| `$schema` | string (URI) | Optional. Standard JSON Schema reference for IDE autocomplete |
| `$config` | object | Optional. Provider configuration and file metadata |
| Any key starting with `$` | — | Reserved. Parsers MUST ignore all `$`-prefixed keys |
| `^[a-zA-Z_][a-zA-Z0-9_]*$` | string | Variable mapping: env var name → secret identifier |

At least one variable mapping is required for meaningful operation.

### 3. `$config` Fields

All fields are optional. `additionalProperties: false` — unknown fields are
rejected to catch typos.

**Provider configuration:**

| Field | Type | Constraint | Purpose |
| ----- | ---- | ---------- | ------- |
| `provider` | enum | `aws`, `azure`, `gcp`, `hashicorp`, `file` | Secret provider. Default: `aws` |
| `profile` | string | AWS-only | AWS CLI profile name |
| `vaultUrl` | string (URI) | Azure/HashiCorp-only | Vault endpoint URL |
| `projectId` | string | GCP-only | GCP project identifier |
| `path` | string | File-only | Path to `.env` source file |
| `namespace` | string | HashiCorp-only | Vault namespace |

**Metadata (informational, ignored by runtime):**

| Field | Type | Purpose |
| ----- | ---- | ------- |
| `name` | string | Short identifier (useful for logs, CLI output) |
| `description` | string | What this file covers |
| `owner` | string | Responsible team or person |
| `environment` | string | Target environment (e.g., `production`, `staging`, `development`, `test`) |

### 4. One File, One Provider, One Environment

A map file targets a single provider and a single environment. Multi-provider
and multi-environment setups use separate files:

```
param-map.prod.json      → $config.provider: "aws"
param-map.staging.json   → $config.provider: "aws", different paths
param-map.dev.json       → $config.provider: "file"
```

If a consumer needs secrets from two providers, they make two `load()` calls
with two map files. This keeps the schema simple and avoids combinatorial
complexity in all SDKs.

### 5. Variable Mapping Semantics

Values are opaque identifiers interpreted by the provider:

| Provider | Value meaning | Example |
| -------- | ------------- | ------- |
| `aws` | SSM Parameter Store path | `/my-app/prod/db-password` |
| `azure` | Key Vault secret name | `my-app-prod-db-password` |
| `gcp` | Secret Manager secret name | `my-app-prod-db-password` |
| `hashicorp` | Vault secret path | `secret/data/my-app/db-password` |
| `file` | Key name in the `.env` source file | `DB_PASSWORD` |

### 6. `file` Provider for Testing

The `file` provider enables testing without cloud infrastructure. It reads an
`.env` file and resolves mappings by key lookup.

Consumers activate it via:

**A) Map file (dedicated test config):**

```json
{
  "$config": { "provider": "file", "path": ".env.test" },
  "DB_PASSWORD": "DB_PASSWORD",
  "API_KEY": "API_KEY"
}
```

**B) SDK options override (no separate map file):**

```csharp
// .NET
Envilder.Load("param-map.json", EnvilderOptions.FromFile(".env.test"));
```

```python
# Python
Envilder.load("param-map.json", EnvilderOptions.from_file(".env.test"))
```

```typescript
// Node.js
await Envilder.load('param-map.json', EnvilderOptions.fromFile('.env.test'));
```

`FromFile` is the primary testing mechanism — centralized source of truth in a
single `.env.test` file.

`WithDefaults(dict)` is an optional companion for per-test overrides:

```csharp
Envilder.Load("param-map.json", EnvilderOptions.FromFile(".env.test")
    .WithOverride("DB_PASSWORD", "intentionally-wrong"));
```

### 7. Reserved Prefix Rule

All keys starting with `$` are reserved for Envilder. Parsers MUST skip any
`$`-prefixed key when building the variable mapping. This replaces the current
exact-match on `$config` and future-proofs the format for new reserved keys.

**Backward compatibility:** Existing map files (without `$schema` or `$meta`)
work identically. The only behavioral change: SDKs stop making vault calls for
`$schema` values that would previously leak through as variable mappings.

### 8. JSON Schema Publication

The schema is published at `https://envilder.com/schema/map-file.v1.json` and
versioned via URL. No `version` field inside the file. Files without `$schema`
are assumed v1.

The schema file lives in the repository at `spec/map-file.v1.json`.

### 9. Cross-Provider Validation Rules

SDKs MUST validate and reject incompatible `$config` combinations:

| Combination | Result |
| ----------- | ------ |
| `profile` + `provider: "azure"` | Error |
| `vaultUrl` + `provider: "aws"` | Error |
| `path` + `provider: "aws"` | Error |
| `projectId` + `provider: "azure"` | Error |

## Consequences

### Positive

- IDEs provide autocomplete and validation via `$schema`
- Typos in `$config` fields are caught by strict schema validation
- `file` provider eliminates the need for cloud infrastructure in consumer tests
- Reserved `$` prefix future-proofs the format without breaking changes
- Metadata fields (`name`, `owner`, `environment`) improve discoverability in
  large projects with many map files

### Negative

- All parsers (4 stacks) need a one-line change from exact match to prefix
  filter. Backward compatible but requires coordinated release.
- `additionalProperties: false` on `$config` means new fields require a schema
  update. Acceptable — new fields should be deliberate.
- `file` provider adds a new adapter to each SDK. Minimal effort per SDK since
  it implements the existing `ISecretProvider` interface.

## When to Reconsider

- If multi-provider per file becomes a common request (currently deemed rare)
- If consumers need computed values or expressions in mappings (currently
  string-only)
- If `additionalProperties: false` blocks too many legitimate extensions
  (loosen to `true` with a warning)
