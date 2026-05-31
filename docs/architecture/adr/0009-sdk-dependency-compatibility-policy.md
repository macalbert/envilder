# ADR-0009: SDK Dependency Compatibility Policy

## Status

Accepted

## Context

Envilder SDKs are published libraries consumed by external applications. Unlike
the CLI/GHA (developer tools where we control the runtime), SDK consumers have
their own dependency trees and runtime constraints.

Two categories of version floors exist in SDK `package.json` / `.csproj` /
`pyproject.toml`:

1. **Runtime engine** (Node.js, .NET, Python) — determines which environments
   can run the SDK
2. **External dependencies** (AWS SDK, Azure SDK) — determines whether
   consumers face version conflicts or duplicate installations

Bumping either floor to "latest" forces consumers to upgrade their entire stack
to adopt a new SDK version. This creates unnecessary friction and breaks
existing working setups.

The development toolchain (TypeScript compiler, test framework, linters) has
different requirements — those only affect contributors, not consumers.

## Decision

### Rule 1: Track active LTS for engine version

All components (CLI, GHA, SDKs) declare the **current active LTS** as the
engine floor. We do not support EOL runtimes — maintaining compatibility with
dead versions adds testing burden without real user benefit.

| Runtime | Policy |
| ------- | ------ |
| Node.js | `>=` current Active LTS minor (currently `>=22.12.0`) |
| .NET | Lowest in-support TFM |
| Python | Lowest in-support minor |

This applies uniformly — SDKs and dev tools share the same engine floor.
The only exception is CI publish workflows, which may use Node `current`
(e.g., 24) for build speed.

### Rule 2: Minimum viable dependency versions

SDK dependencies use the **lowest major.minor that provides the APIs the SDK
actually calls** — not the latest release.

Examples:

- AWS SDK: if the SDK only uses `GetParametersCommand` (available since v3
  launch), pin to `^3.700.0` (a known-stable baseline), not `^3.1057.0`
- Azure Identity: if only `DefaultAzureCredential` is used, pin to `^4.5.0`
- Azure Key Vault Secrets: if only `SecretClient.getSecret()` is used, pin to
  `^4.9.0`

### Rule 3: devDependencies are unconstrained

`devDependencies` (test frameworks, type definitions, build tools) can be
updated freely to latest — they don't affect consumers.

### Rule 4: Document the minimum in acceptance tests

Acceptance tests run against the declared minimum dependency versions (via
lockfile or explicit version resolution) to catch accidental use of newer APIs.

## Consequences

### Positive

- Consumers on older AWS/Azure SDK versions can adopt Envilder without forced
  upgrades
- No duplicate nested `node_modules` when consumer already has `@aws-sdk/*`
  installed
- Broader ecosystem compatibility = more potential adopters
- Clear separation: "what the SDK needs" vs "what contributors need"

### Negative

- Must manually verify that minimum versions provide required APIs before
  releasing
- Cannot use new SDK features (e.g., newer AWS SDK conveniences) without
  bumping the floor and issuing a semver minor/major
- Acceptance tests should ideally test against both minimum and latest deps
  (CI matrix)

## When to Reconsider

- When a minimum dependency version has a known security vulnerability — bump
  the floor
- When the SDK needs an API only available in newer dependency versions — bump
  the floor (semver minor if additive, major if dropping old support)
- When a runtime version reaches EOL and no longer receives security patches —
  consider bumping the engine floor
