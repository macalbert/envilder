## [0.2.0] - 2026-04-18

### Added

* **Static facade** — `Envilder` class with one-liner API for resolving and injecting secrets
* `ResolveFile(path)` / `ResolveFileAsync(path)` — Resolve secrets from a map file
* `Load(path)` / `LoadAsync(path)` — Resolve and inject secrets into `Environment`
* `ResolveFile(env, mapping)` / `Load(env, mapping)` — Environment-routed overloads
* `FromFile(path)` — Fluent builder with `.WithProvider()`, `.WithProfile()`, `.WithVaultUrl()`
* `EnvilderBuilder.Resolve()` / `ResolveAsync()` / `Inject()` / `InjectAsync()` — Fluent terminal methods
* `ISecretProvider.GetSecret(name)` — Synchronous secret retrieval (new interface method)
* `AwsSsmSecretProvider.GetSecret()` — Sync AWS SSM implementation
* `AzureKeyVaultSecretProvider.GetSecret()` — Sync Azure Key Vault implementation
* `EnvilderClient.ResolveSecrets(mapFile)` — Sync secret resolution

### Testing

* Unit tests for facade validation, env routing, and fluent builder chaining
* Acceptance tests for `ResolveFile` and `Load` against LocalStack
* Sync `GetSecret` tests for AWS SSM and Azure Key Vault providers
* Sync `ResolveSecrets` test for `EnvilderClient`

## [0.1.0] - 2026-04-09

### Added

* **Initial release** — Runtime library for loading secrets from AWS SSM Parameter Store or Azure Key Vault
  directly into .NET applications ([#147](https://github.com/macalbert/envilder/pull/147))
* `EnvilderClient` — Resolves secrets from a map-file and returns them as a dictionary
* `MapFileParser` — Parses `param-map.json` files with `$config` section and variable mappings
* `SecretProviderFactory` — Creates the appropriate secret provider based on configuration
* `AwsSsmSecretProvider` — Fetches secrets from AWS SSM Parameter Store
* `AzureKeyVaultSecretProvider` — Fetches secrets from Azure Key Vault
* `IConfiguration` extensions — Load secrets directly into .NET configuration
* `IServiceCollection` extensions — Register Envilder in the DI container
* `EnvilderOptions` — Runtime overrides for provider, vault URL, and AWS profile
* Supports .NET 8.0 and .NET 9.0
* Published to NuGet as `Envilder`

### Testing

* Unit tests with xUnit, NSubstitute, AwesomeAssertions, and AutoFixture
* Acceptance tests with TestContainers (LocalStack for AWS, Lowkey Vault for Azure)
