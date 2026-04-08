# Envilder .NET SDK

Securely load environment variables from **AWS SSM Parameter Store** or **Azure Key Vault** directly into your .NET application.
Zero vendor lock-in — secrets stay in your cloud.

## Install

```bash
dotnet add package Envilder
```

## Quick Start

### Via IConfiguration (recommended)

```csharp
var config = new ConfigurationBuilder()
    .AddEnvilder("secrets-map.json", secretProvider)
    .Build();

var dbPassword = config["DB_PASSWORD"];
```

### Via IServiceCollection

```csharp
services.AddEnvilder("secrets-map.json", secretProvider);
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
