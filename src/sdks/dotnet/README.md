# Envilder .NET SDK

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

### Via IConfiguration (recommended)

```csharp
var json = File.ReadAllText("secrets-map.json");
var mapFile = new MapFileParser().Parse(json);
var provider = SecretProviderFactory.Create(mapFile.Config);

var config = new ConfigurationBuilder()
    .AddEnvilder("secrets-map.json", provider)
    .Build();

var dbPassword = config["DB_PASSWORD"];
```

### Via IServiceCollection

```csharp
var json = File.ReadAllText("secrets-map.json");
var mapFile = new MapFileParser().Parse(json);
var provider = SecretProviderFactory.Create(mapFile.Config);

services.AddEnvilder("secrets-map.json", provider);
```

### Direct usage

```csharp
var json = File.ReadAllText("secrets-map.json");
var mapFile = new MapFileParser().Parse(json);
var provider = SecretProviderFactory.Create(mapFile.Config);
var client = new EnvilderClient(provider);
var secrets = await client.ResolveSecretsAsync(mapFile);
EnvilderClient.InjectIntoEnvironment(secrets);
```

### With runtime overrides (EnvilderOptions)

Override the map file's `$config` at runtime — useful for switching providers per environment:

```csharp
var json = File.ReadAllText("secrets-map.json");
var mapFile = new MapFileParser().Parse(json);
var options = new EnvilderOptions
{
    Provider = SecretProviderType.Azure,
    VaultUrl = "https://my-vault.vault.azure.net"
};
var provider = SecretProviderFactory.Create(mapFile.Config, options);
```

### IConfiguration section binding

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

## License

MIT
