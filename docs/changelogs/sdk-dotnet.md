## [0.2.0] - 2026-04-18

### Added

* **Static facade** — `Envilder` class with one-liner API for resolving and injecting secrets
* `ResolveFile(path)` / `ResolveFileAsync(path)` — Resolve secrets from a map file
* `Load(path)` / `LoadAsync(path)` — Resolve and inject secrets into `Environment`
* `ResolveFile(env, mapping)` / `Load(env, mapping)` — Environment-routed overloads
* `FromMapFile(path)` — Fluent builder with `.WithProvider()`, `.WithProfile()`, `.WithVaultUrl()`
* `EnvilderBuilder.Resolve()` / `ResolveAsync()` / `Inject()` / `InjectAsync()` — Fluent terminal methods
* `ISecretProvider.GetSecret(name)` — Synchronous secret retrieval (new interface method)
* `AwsSsmSecretProvider.GetSecret(name)` — Sync AWS SSM implementation
* `AzureKeyVaultSecretProvider.GetSecret(name)` — Sync Azure Key Vault implementation
* `EnvilderClient.ResolveSecrets(mapFile)` — Sync secret resolution

### Changed

* **Simplify `AddEnvilder` extensions** — `IConfigurationBuilder.AddEnvilder()` and
  `IServiceCollection.AddEnvilder()` now accept `(string mapFilePath, EnvilderOptions? options)`
  instead of requiring a manually-created `ISecretProvider`
  ([#167](https://github.com/macalbert/envilder/pull/167))
* **Cross-provider validation** — `SecretProviderFactory` now rejects invalid combinations:
  AWS profile with Azure provider, or Vault URL with AWS provider
  ([#167](https://github.com/macalbert/envilder/pull/167))

### Breaking

* `SecretProviderFactory` is now `internal` — External code that referenced this type
  directly will no longer compile. Use the `Envilder` facade, `EnvilderBuilder`
  (`Envilder.FromMapFile(...)`), or the `AddEnvilder(string, EnvilderOptions?)` extensions instead
  ([#167](https://github.com/macalbert/envilder/pull/167))
* `ISecretProvider.GetSecret(string name)` — New required interface method. External
  implementations of `ISecretProvider` must add a synchronous `GetSecret` method
  (return `null` for missing secrets, matching the `GetSecretAsync` contract)
* `ServiceCollectionExtensions.AddEnvilder(string, ISecretProvider)` signature removed — Use
  `AddEnvilder(string, EnvilderOptions?)` instead
* `ConfigurationBuilderExtensions.AddEnvilder(string, ISecretProvider)` signature removed — Use
  `AddEnvilder(string, EnvilderOptions?)` instead

### Fixed

* **Delegate default AWS region resolution to the AWS SDK** — When no profile is set, the
  factory no longer manually resolves the region via `ResolveRegion()`. Instead it creates a
  plain `AmazonSimpleSystemsManagementClient()` which uses the full AWS SDK resolution chain
  (env vars → `~/.aws/config` → instance metadata), correctly picking up the default config
  file settings
  ([#166](https://github.com/macalbert/envilder/pull/166))
* **Respect `AWS_SHARED_CREDENTIALS_FILE` for profile resolution** — `CredentialProfileStoreChain`
  now receives the credentials file path from the `AWS_SHARED_CREDENTIALS_FILE` environment
  variable, fixing profile discovery when credentials are stored at non-default locations
  ([#166](https://github.com/macalbert/envilder/pull/166))

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
* Targets .NET Standard 2.0 (compatible with .NET 6+, .NET Framework 4.6.1+)
* Published to NuGet as `Envilder`

### Testing

* Unit tests with xUnit, NSubstitute, AwesomeAssertions, and AutoFixture
* Acceptance tests with TestContainers (LocalStack for AWS, Lowkey Vault for Azure)
