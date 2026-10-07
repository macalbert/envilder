# Envilder .NET SDK

[![Coverage Report](https://img.shields.io/badge/coverage-report-green.svg)](https://macalbert.github.io/envilder/dotnet/)
[![NuGet version](https://img.shields.io/nuget/v/Envilder.svg)](https://www.nuget.org/packages/Envilder/)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/macalbert/envilder/blob/main/LICENSE)

Securely load environment variables from **AWS SSM Parameter Store** or **Azure Key Vault** directly into your .NET application.
Zero vendor lock-in: secrets stay in your cloud.

Part of the [Envilder](https://github.com/macalbert/envilder) project.

## Prerequisites

- .NET Standard 2.0 compatible runtime (.NET 6+, .NET Framework 4.6.1+, and any netstandard2.0-compatible target)
- **AWS provider**: AWS credentials configured (CLI, environment variables, or IAM role)
- **Azure provider**: Azure credentials via `az login`, managed identity, or environment variables

## Install

```bash
dotnet add package Envilder
```

## Quick Start

### One-liner: resolve + inject

```csharp
using Envilder;

// Resolve secrets from the map file and inject into Environment
Env.Load("envilder.json");

// Access via standard environment variable API
var dbPassword = Environment.GetEnvironmentVariable("DB_PASSWORD");
```

### Resolve without injecting

```csharp
using Envilder;

var secrets = Env.ResolveFile("envilder.json");
var dbPassword = secrets["DB_PASSWORD"];
```

### Azure Key Vault

Set the provider in the map file's `$config`; values are Key Vault secret names:

```json
{
  "$schema": "https://envilder.com/schema/map-file.v1.json",
  "$config": {
    "provider": "azure",
    "vaultUrl": "https://my-vault.vault.azure.net"
  },
  "DB_PASSWORD": "myapp-prod-db-password"
}
```

The code is the same as for AWS. Credentials are resolved with `DefaultAzureCredential`
(`az login`, managed identity, or environment variables):

```csharp
using Envilder;

Env.Load("envilder.json");

var dbPassword = Environment.GetEnvironmentVariable("DB_PASSWORD");
```

### Async variants

Every method has an async counterpart:

```csharp
using Envilder;

await Env.LoadAsync("envilder.json");
var secrets = await Env.ResolveFileAsync("envilder.json");
```

### Fluent builder (with overrides)

Override the map file's `$config` at runtime: useful for switching providers, profiles, or vault URLs per environment:

```csharp
using Envilder;

// Override provider + vault URL
var secrets = Env.FromMapFile("envilder.json")
    .WithProvider(SecretProviderType.Azure)
    .WithVaultUrl("https://my-vault.vault.azure.net")
    .Resolve();

// Override AWS profile and inject
Env.FromMapFile("envilder.json")
    .WithProfile("staging")
    .Inject();

// Async versions
var secrets = await Env.FromMapFile("envilder.json")
    .WithProvider(SecretProviderType.Azure)
    .WithVaultUrl("https://my-vault.vault.azure.net")
    .ResolveAsync();

await Env.FromMapFile("envilder.json")
    .WithProfile("staging")
    .InjectAsync();
```

### Environment-based loading

Route secret loading based on your current environment. Each environment maps to its own
secrets file (or `null` to skip loading):

```csharp
using Envilder;

var env = Environment.GetEnvironmentVariable("APP_ENV") ?? "development";

// Resolve + inject
Env.Load(env, new Dictionary<string, string?>
{
    ["production"] = "prod-secrets.json",
    ["development"] = "dev-secrets.json",
    ["test"] = null,  // no secrets loaded
});
```

Resolve without injecting:

```csharp
var secrets = Env.ResolveFile(env, new Dictionary<string, string?>
{
    ["production"] = "prod-secrets.json",
    ["development"] = "dev-secrets.json",
    ["test"] = null,
});
```

Behaviour:

- If the environment maps to a file path, secrets are loaded from that file.
- If the environment maps to `null` or is not in the mapping, an empty dictionary is returned silently.
- Empty or whitespace-only environment names throw `ArgumentException`.

### Secret validation

Opt-in validation ensures all resolved secrets have non-empty values:

```csharp
using Envilder;

var secrets = Env.ResolveFile("envilder.json");
secrets.ValidateSecrets(); // throws SecretValidationException if any value is empty
```

`ValidateSecrets()` is an extension method on `IReadOnlyDictionary<string, string>` that:

- Throws `SecretValidationException` when the dictionary is empty
- Throws `SecretValidationException` listing the keys whose values are null, empty, or whitespace
- Passes silently when all values are present

### Via IConfiguration (ASP.NET)

```csharp
using Microsoft.Extensions.Configuration;

var config = new ConfigurationBuilder()
    .AddEnvilder("envilder.json")
    .Build();

var dbPassword = config["DB_PASSWORD"];
```

Variable names with `__` are normalized to configuration sections, the same
convention .NET's environment-variables provider uses:

```json
{
  "Database__ConnectionString": "/app/prod/db-connection",
  "Database__Password": "/app/prod/db-password"
}
```

> Variable names may only contain letters, digits, `_`, `.` and `-`, so the
> same map file works with the CLI, the GitHub Action and every SDK. Since
> 1.0.0 a name such as `Database/ConnectionString` is rejected; rename it to
> `Database__ConnectionString`.

```csharp
var dbSettings = config.GetSection("Database");
var connString = dbSettings["ConnectionString"];
```

### Via IServiceCollection (ASP.NET DI)

```csharp
services.AddEnvilder("envilder.json");
```

### With runtime overrides (IConfiguration)

Pass `EnvilderOptions` to override the map file's `$config` from code:

```csharp
using Envilder;
using Microsoft.Extensions.Configuration;

var config = new ConfigurationBuilder()
    .AddEnvilder("envilder.json", new EnvilderOptions
    {
        Provider = SecretProviderType.Azure,
        VaultUrl = "https://my-vault.vault.azure.net",
    })
    .Build();
```

## API Reference

### Static facade (`Env`)

| Method | Description |
|--------|-------------|
| `Load(path)` | Resolve secrets and inject into `Environment` |
| `LoadAsync(path, ct?)` | Async version of `Load` |
| `ResolveFile(path)` | Resolve secrets, return as `IReadOnlyDictionary` |
| `ResolveFileAsync(path, ct?)` | Async version of `ResolveFile` |
| `Load(env, mapping)` | Environment-based resolve + inject |
| `LoadAsync(env, mapping, ct?)` | Async version |
| `ResolveFile(env, mapping)` | Environment-based resolve |
| `ResolveFileAsync(env, mapping, ct?)` | Async version |
| `FromMapFile(path)` | Returns `EnvilderBuilder` for fluent configuration |

### Fluent builder (`EnvilderBuilder`)

| Method | Description |
|--------|-------------|
| `WithProvider(type)` | Override secret provider (AWS/Azure) |
| `WithProfile(name)` | Override AWS named profile |
| `WithVaultUrl(url)` | Override Azure Key Vault URL |
| `Resolve()` | Resolve secrets, return as dictionary |
| `ResolveAsync(ct?)` | Async version of `Resolve` |
| `Inject()` | Resolve + inject into `Environment` |
| `InjectAsync(ct?)` | Async version of `Inject` |

### Validation (`SecretValidationExtensions`)

| Method | Description |
|--------|-------------|
| `ValidateSecrets()` | Throws `SecretValidationException` if any value is empty or dictionary is empty |

### IConfiguration integration

| Method | Description |
|--------|-------------|
| `AddEnvilder(path, options?)` | Add Envilder as an `IConfigurationBuilder` source |

### Dependency injection

| Method | Description |
|--------|-------------|
| `AddEnvilder(path, options?)` | Register Envilder secrets into `IServiceCollection` |

## Map File Format

```json
{
  "$schema": "https://envilder.com/schema/map-file.v1.json",
  "$config": {
    "provider": "aws",
    "profile": "my-profile"
  },
  "DB_PASSWORD": "/app/prod/db-password",
  "API_KEY": "/app/prod/api-key"
}
```

Supported providers: `aws` (default), `azure`.

For Azure, add `vaultUrl`:

```json
{
  "$schema": "https://envilder.com/schema/map-file.v1.json",
  "$config": {
    "provider": "azure",
    "vaultUrl": "https://my-vault.vault.azure.net"
  },
  "DB_PASSWORD": "db-password",
  "API_KEY": "api-key"
}
```

### Keys and values

Keys follow the same rule as the CLI and the GitHub Action, so one map file works everywhere:

- **Keys** may only contain letters, digits, `_`, `.` and `-` (`^[A-Za-z0-9_.-]+$`); `__proto__`
  is also rejected. `MapFileParser.Parse` throws `FormatException` for any other key, before any secret is fetched.
  Use `__` for hierarchical names (`Database__Password`), not `/`.
- **Values** are the secret identifiers in the provider (SSM parameter name or Key Vault secret
  name) and must be JSON strings.
- **Secret contents** are returned exactly as the provider stores them. `ResolveFile` / `Resolve` and `IConfiguration` keep them in
  memory; `Load` / `Inject` write them to the process environment, where the operating system cannot
  store `NUL` (`U+0000`) and Windows limits a variable to 32,767 characters.

See [Keys and Values: What Is Accepted](https://github.com/macalbert/envilder#keys-and-values-what-is-accepted)
for the full reference and the reasoning behind the rules.

## Links

- [Changelog](https://github.com/macalbert/envilder/blob/main/docs/changelogs/sdk-dotnet.md)
- [Official Website](https://envilder.com/docs/sdks/dotnet/?utm_source=nuget&utm_medium=readme)

## License

MIT
