# Envilder Domain Glossary

Canonical vocabulary for the Envilder project. Skills and agents should use
these terms consistently to avoid drift.

## Core Concepts

| Term | Definition |
|------|-----------|
| **Map file** | JSON file mapping environment variable names to secret paths in a cloud provider. Git-versioned, PR-reviewable. The universal contract between CLI, GHA, and SDKs. |
| **Provider** | A cloud secret backend (AWS SSM Parameter Store, Azure Key Vault). Implemented via `ISecretProvider` port. |
| **Pull** | Resolve secrets from a provider using a map file and output them (to .env, process.env, or return value). |
| **Push** | Write a secret value to a provider path. CLI-only operation. |
| **Facade** | The primary public API of each SDK (`Envilder` class/module). Hides provider creation, map parsing, and resolution behind a one-liner or fluent builder. |
| **Builder** | Fluent API for configuring an SDK invocation: `fromMapFile().withProvider().withVaultUrl().inject()` |
| **Port** | Interface defining a capability boundary (e.g., `ISecretProvider`, `IVariableStore`, `ILogger`). Domain-owned, infrastructure-implemented. |
| **Adapter** | Concrete implementation of a port for a specific technology (e.g., `AwsSsmSecretProvider`). |
| **Map file config (`$config`)** | Optional section inside a map file declaring provider type, vault URL, AWS profile, etc. Merged with CLI flags (flags win). |

## SDK Terms

| Term | Definition |
|------|-----------|
| **EnvilderClient** | Core resolver class in each SDK. Reads map file, calls provider, returns resolved secrets. |
| **SecretProviderFactory** | Internal factory selecting the correct adapter based on config. Not exposed in public API. |
| **Inject** | Set resolved secrets as environment variables (`process.env`, `os.environ`, `Environment.SetEnvironmentVariable`). |
| **Resolve** | Fetch secrets from provider and return as key-value collection without injecting. |
| **Validate** | Opt-in post-resolution check that no values are null/empty. Throws `SecretValidationError`. |

## Infrastructure Terms

| Term | Definition |
|------|-----------|
| **LocalStack** | Local AWS emulator for acceptance tests. Runs in Docker via TestContainers. |
| **Lowkey Vault** | Local Azure Key Vault emulator for acceptance tests. Runs in Docker via TestContainers. |
| **Container wrapper** | Test helper class with explicit `start()`/`stop()` lifecycle managing a TestContainer instance. |
| **Conformance fixture** | Shared test data (input map + expected output) validating SDK behavior across languages. |
