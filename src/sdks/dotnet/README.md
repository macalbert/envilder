# Envilder .NET SDK

[![Coverage Report](https://img.shields.io/badge/coverage-report-green.svg)](https://macalbert.github.io/envilder/dotnet/)
[![NuGet version](https://img.shields.io/nuget/v/Envilder.svg)](https://www.nuget.org/packages/Envilder/)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/macalbert/envilder/blob/main/LICENSE)

Securely load environment variables from **AWS SSM Parameter Store** or **Azure Key Vault** directly into your .NET application.
Zero vendor lock-in — secrets stay in your cloud.

Part of the [Envilder](https://github.com/macalbert/envilder) project.

## Prerequisites

- .NET Standard 2.0 compatible runtime (.NET 6+, .NET Framework 4.6.1+)
- **AWS provider**: AWS credentials configured (CLI, environment variables, or IAM role)
- **Azure provider**: Azure credentials via `az login`, managed identity, or environment variables

## Install

```bash
dotnet add package Envilder
```

## Quick Start

### One-liner — resolve + inject

```csharp
using Envilder;

// Resolve secrets from the map file and inject into Environment
Envilder.Load("secrets-map.json");

// Access via standard environment variable API
var dbPassword = Environment.GetEnvironmentVariable("DB_PASSWORD");
```

### Resolve without injecting

```csharp
using Envilder;

var secrets = Envilder.ResolveFile("secrets-map.json");
var dbPassword = secrets["DB_PASSWORD"];
```

### Async variants

Every method has an async counterpart:

```csharp
await Envilder.LoadAsync("secrets-map.json");
var secrets = await Envilder.ResolveFileAsync("secrets-map.json");
```

### Fluent builder (with overrides)

Override the map file's `$config` at runtime — useful for switching providers, profiles, or vault URLs per environment:

```csharp
using Envilder;

// Override provider + vault URL
var secrets = Envilder.FromFile("secrets-map.json")
    .WithProvider(SecretProviderType.Azure)
    .WithVaultUrl("https://my-vault.vault.azure.net")
    .Resolve();

// Override AWS profile and inject
Envilder.FromFile("secrets-map.json")
    .WithProfile("staging")
    .Inject();

// Async versions
var secrets = await Envilder.FromFile("secrets-map.json")
    .WithProvider(SecretProviderType.Azure)
    .WithVaultUrl("https://my-vault.vault.azure.net")
    .ResolveAsync();

await Envilder.FromFile("secrets-map.json")
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
Envilder.Load(env, new Dictionary<string, string?>
{
    ["production"] = "prod-secrets.json",
    ["development"] = "dev-secrets.json",
    ["test"] = null,  // no secrets loaded
});
```

Resolve without injecting:

```csharp
var secrets = Envilder.ResolveFile(env, new Dictionary<string, string?>
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

var secrets = Envilder.ResolveFile("secrets-map.json");
secrets.ValidateSecrets(); // throws SecretValidationException if any value is empty
```

`ValidateSecrets()` is an extension method on `IReadOnlyDictionary<string, string>` that:

- Throws `SecretValidationException` when the dictionary is empty
- Throws `SecretValidationException` listing the keys whose values are null, empty, or whitespace
- Passes silently when all values are present

### Via IConfiguration (ASP.NET)

```csharp
using Envilder.Infrastructure.Configuration;
using Microsoft.Extensions.Configuration;

var config = new ConfigurationBuilder()
    .AddEnvilder("secrets-map.json")
    .Build();

var dbPassword = config["DB_PASSWORD"];
```

Secrets with `/` in their paths are normalized to configuration sections:

```json
{
  "Database/ConnectionString": "/app/prod/db-connection",
  "Database/Password": "/app/prod/db-password"
}
```

```csharp
var dbSettings = config.GetSection("Database");
var connString = dbSettings["ConnectionString"];
```

### Via IServiceCollection (ASP.NET DI)

```csharp
using Envilder.Infrastructure.DependencyInjection;

services.AddEnvilder("secrets-map.json");
```

### With runtime overrides (IConfiguration)

Pass `EnvilderOptions` to override the map file's `$config` from code:

```csharp
using Envilder.Domain;
using Envilder.Infrastructure.Configuration;
using Microsoft.Extensions.Configuration;

var config = new ConfigurationBuilder()
    .AddEnvilder("secrets-map.json", new EnvilderOptions
    {
        Provider = SecretProviderType.Azure,
        VaultUrl = "https://my-vault.vault.azure.net",
    })
    .Build();
```

## API Reference

### Static facade (`Envilder`)

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
| `FromFile(path)` | Returns `EnvilderBuilder` for fluent configuration |

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
  "$config": {
    "provider": "azure",
    "vaultUrl": "https://my-vault.vault.azure.net"
  },
  "DB_PASSWORD": "db-password",
  "API_KEY": "api-key"
}
```

## Links

- [Changelog](https://github.com/macalbert/envilder/blob/main/docs/changelogs/sdk-dotnet.md)
- [Official Website](https://envilder.com)

## License

MIT
