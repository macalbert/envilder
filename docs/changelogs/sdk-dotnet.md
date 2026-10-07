## [1.0.0] - 2026-09-28

### Changed

* **BREAKING: Map-file variable names follow the shared naming constraint**:
  `MapFileParser.Parse` now throws `FormatException` when a variable name
  does not match `^[A-Za-z0-9_.-]+$` or is `__proto__`, the constraint in
  ADR-0008 that the CLI, the GitHub Action and the published JSON Schema
  already enforce. The same `envilder.json` is now valid, or invalid, on every
  surface. The name is checked even when its value is not a string, and the
  message quotes the name without echoing the mapped value. Dotted,
  hyphenated and digit-leading names remain valid
  ([#511](https://github.com/macalbert/envilder/issues/511))

* **BREAKING: `__` is the configuration section separator**: `IConfiguration`
  sections are now expressed with `__` (`Database__ConnectionString` →
  `Database:ConnectionString`), the same convention .NET's
  environment-variables provider uses. Names with `/` are rejected by the
  rule above: the CLI would write them to a `.env` line that `dotenv`, Docker
  Compose and POSIX shells cannot load. `/` is still normalized for a
  `ParsedMapFile` built in code

### Security

* **Reject map-file mapping keys that a `.env` file cannot represent**:
  Previously the SDK accepted names the CLI refuses, including names with
  `=`, a line break or `U+2028`/`U+2029` that the CLI treats as an injection
  vector ([#511](https://github.com/macalbert/envilder/issues/511))

### Migration

Rename section keys in your map file:

```json
// Before
{ "Database/ConnectionString": "/app/prod/db-connection" }

// After
{ "Database__ConnectionString": "/app/prod/db-connection" }
```

`config.GetSection("Database")["ConnectionString"]` keeps working unchanged.

### Documentation

* **Document accepted map-file keys, values and limits**: The SDK README now
  lists the accepted key grammar and why it matches dotenv, the secret
  reference format per provider, and the limits on secret contents
  (provider sizes, the one value a `.env` file cannot hold, operating-system
  limits and variable expansion by other loaders)

---

## [0.5.1] - 2026-09-26

### Documentation

* **Link the NuGet page to the .NET SDK docs**: The README's "Official
  Website" link now points to `envilder.com/docs/sdks/dotnet/` with UTM tags,
  so visits from NuGet to envilder.com can be measured

---

## [0.5.0] - 2026-06-26

### Added

* **New `ExpiredCredentialsException`**: Thrown by the AWS SSM provider
  on expired or invalid credentials (e.g. an expired session token), with
  an actionable message guiding you to refresh credentials (e.g. run
  `aws sso login`)

* **New `SsoSessionExpiredException`**: Thrown by the AWS SSM provider
  when an AWS SSO session can no longer be resolved, exposing the AWS
  profile via `ProfileName` and an actionable message that names the
  `aws sso login --profile <name>` command to run. A plain expired
  session token still throws `ExpiredCredentialsException`
  ([#377](https://github.com/macalbert/envilder/issues/377))

---

## [0.4.0] - 2026-05-18

### Changed

* **BREAKING: Root namespace for public API**: All consumer-facing types
  moved from `Envilder.Application` / `Envilder.Domain` to the root
  `Envilder` namespace. Consumers now only need `using Envilder;`
* **BREAKING: Facade class renamed to `Env`**: The static facade class
  is now `Env` instead of `Envilder` to avoid namespace/class name collision.
  Use `Env.Load(...)`, `Env.ResolveFile(...)`, `Env.FromMapFile(...)` etc.
* **Extension methods follow .NET conventions**:
  `AddEnvilder()` for `IConfigurationBuilder` moved to
  `Microsoft.Extensions.Configuration` namespace;
  `AddEnvilder()` for `IServiceCollection` moved to
  `Microsoft.Extensions.DependencyInjection` namespace.
  Both are now discoverable without any Envilder-specific using directives

### Migration

Replace:

```csharp
using Envilder.Application;
using Envilder.Domain;
using Envilder.Infrastructure.Configuration;
using Envilder.Infrastructure.DependencyInjection;
```

With:

```csharp
using Envilder;
```

Replace facade calls:

```csharp
// Before
Envilder.Load("envilder.json");
Envilder.FromMapFile("envilder.json").Inject();

// After
Env.Load("envilder.json");
Env.FromMapFile("envilder.json").Inject();
```

`AddEnvilder()` extension methods now live in `Microsoft.Extensions.Configuration`
and `Microsoft.Extensions.DependencyInjection`: no Envilder-specific import needed.
ASP.NET projects already include these namespaces via global usings; console apps
may need to add them explicitly.

---

## [0.3.0] - 2026-05-03

### Added

* **Map-file JSON Schema support**: Map files can now include
  `"$schema": "https://envilder.com/schema/map-file.v1.json"` for IDE
  autocomplete and validation without affecting secret resolution

### Fixed

* **Reserved key filtering**: All `$`-prefixed keys are now excluded from
  variable mappings. Previously only `$config` was filtered
  ([#218](https://github.com/macalbert/envilder/pull/218))

---

## [0.2.0] - 2026-04-18

### Added

* **Static facade**: `Envilder` class with one-liner API for resolving and injecting secrets
* `ResolveFile(path)` / `ResolveFileAsync(path)`: Resolve secrets from a map file
* `Load(path)` / `LoadAsync(path)`: Resolve and inject secrets into `Environment`
* `ResolveFile(env, mapping)` / `Load(env, mapping)`: Environment-routed overloads
* `FromMapFile(path)`: Fluent builder with `.WithProvider()`, `.WithProfile()`, `.WithVaultUrl()`
* `EnvilderBuilder.Resolve()` / `ResolveAsync()` / `Inject()` / `InjectAsync()`: Fluent terminal methods
* `ISecretProvider.GetSecret(name)`: Synchronous secret retrieval (new interface method)
* `AwsSsmSecretProvider.GetSecret(name)`: Sync AWS SSM implementation
* `AzureKeyVaultSecretProvider.GetSecret(name)`: Sync Azure Key Vault implementation
* `EnvilderClient.ResolveSecrets(mapFile)`: Sync secret resolution

### Changed

* **Simplify `AddEnvilder` extensions**: `IConfigurationBuilder.AddEnvilder()` and
  `IServiceCollection.AddEnvilder()` now accept `(string mapFilePath, EnvilderOptions? options)`
  instead of requiring a manually-created `ISecretProvider`
  ([#167](https://github.com/macalbert/envilder/pull/167))
* **Cross-provider validation**: `SecretProviderFactory` now rejects invalid combinations:
  AWS profile with Azure provider, or Vault URL with AWS provider
  ([#167](https://github.com/macalbert/envilder/pull/167))

### Breaking

* `SecretProviderFactory` is now `internal`: External code that referenced this type
  directly will no longer compile. Use the `Envilder` facade, `EnvilderBuilder`
  (`Envilder.FromMapFile(...)`), or the `AddEnvilder(string, EnvilderOptions?)` extensions instead
  ([#167](https://github.com/macalbert/envilder/pull/167))
* `ISecretProvider.GetSecret(string name)`: New required interface method. External
  implementations of `ISecretProvider` must add a synchronous `GetSecret` method
  (return `null` for missing secrets, matching the `GetSecretAsync` contract)
* `ServiceCollectionExtensions.AddEnvilder(string, ISecretProvider)` signature removed. Use
  `AddEnvilder(string, EnvilderOptions?)` instead
* `ConfigurationBuilderExtensions.AddEnvilder(string, ISecretProvider)` signature removed. Use
  `AddEnvilder(string, EnvilderOptions?)` instead

### Fixed

* **Delegate default AWS region resolution to the AWS SDK**: When no profile is set, the
  factory no longer manually resolves the region via `ResolveRegion()`. Instead it creates a
  plain `AmazonSimpleSystemsManagementClient()` which uses the full AWS SDK resolution chain
  (env vars → `~/.aws/config` → instance metadata), correctly picking up the default config
  file settings
  ([#166](https://github.com/macalbert/envilder/pull/166))
* **Respect `AWS_SHARED_CREDENTIALS_FILE` for profile resolution**: `CredentialProfileStoreChain`
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

* **Initial release**: Runtime library for loading secrets from AWS SSM Parameter Store or Azure Key Vault
  directly into .NET applications ([#147](https://github.com/macalbert/envilder/pull/147))
* `EnvilderClient`: Resolves secrets from a map-file and returns them as a dictionary
* `MapFileParser`: Parses `envilder.json` files with `$config` section and variable mappings
* `SecretProviderFactory`: Creates the appropriate secret provider based on configuration
* `AwsSsmSecretProvider`: Fetches secrets from AWS SSM Parameter Store
* `AzureKeyVaultSecretProvider`: Fetches secrets from Azure Key Vault
* `IConfiguration` extensions: Load secrets directly into .NET configuration
* `IServiceCollection` extensions: Register Envilder in the DI container
* `EnvilderOptions`: Runtime overrides for provider, vault URL, and AWS profile
* Targets .NET Standard 2.0 (compatible with .NET 6+, .NET Framework 4.6.1+)
* Published to NuGet as `Envilder`

### Testing

* Unit tests with xUnit, NSubstitute, AwesomeAssertions, and AutoFixture
* Acceptance tests with TestContainers (LocalStack for AWS, Lowkey Vault for Azure)
