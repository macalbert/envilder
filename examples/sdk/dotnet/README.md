# Envilder .NET SDK — Examples

Minimal examples showing how to load secrets from AWS SSM Parameter Store using the .NET SDK.

Uses .NET 10
[file-based apps](https://learn.microsoft.com/en-us/dotnet/core/whats-new/dotnet-10/sdk#file-based-apps-enhancements)
— no `.csproj` needed.

## Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download/dotnet/10.0)
- AWS credentials configured (`~/.aws/credentials`, env vars, or IAM role)
- SSM parameters matching the paths in [`secrets-map.json`](../../../secrets-map.json)

## Run

All commands from the **`examples/sdk/dotnet/`** directory:

| Example                | Description                              | Command                          |
|------------------------|------------------------------------------|----------------------------------|
| `1_configuration.cs`   | Use as `IConfiguration` source           | `dotnet run 1_configuration.cs`  |
| `2_fluent.cs`          | Fluent builder with provider overrides   | `dotnet run 2_fluent.cs`         |
| `3_env_routing.cs`     | Environment-based map file routing       | `dotnet run 3_env_routing.cs`    |
| `4_validation.cs`      | Fail fast on missing secrets             | `dotnet run 4_validation.cs`     |
| `5_load.cs`            | Resolve + inject into env vars           | `dotnet run 5_load.cs`           |
| `6_resolve.cs`         | Resolve secrets without injecting        | `dotnet run 6_resolve.cs`        |

```bash
cd examples/sdk/dotnet
dotnet run 1_configuration.cs
```
