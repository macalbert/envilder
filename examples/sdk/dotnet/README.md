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

| Example              | Description                    | Command                        |
|----------------------|--------------------------------|--------------------------------|
| `1_resolve.cs`       | Resolve secrets and print them | `dotnet run 1_resolve.cs`      |
| `2_inject.cs`        | Resolve + inject into env vars | `dotnet run 2_inject.cs`       |
| `3_configuration.cs` | Use as `IConfiguration` source | `dotnet run 3_configuration.cs`|

```bash
cd examples/sdk/dotnet
dotnet run 1_resolve.cs
```
