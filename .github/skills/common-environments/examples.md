# Environments — Examples

## Development — appsettings.Development.json

All services on `localhost`:

```json
{
    "Database": {
        "ConnectionStrings": {
            "XXTemplateXXPostgreSql": "Host=localhost;Port=5432;Database=xxtemplatexx;Username=admin;Password=admin123"
        }
    },
    "Cognito": {
        "Domain": "http://localhost:8080",
        "RedirectUri": "http://localhost:5000/auth/oauth/callback",
        "ClientId": "mock-client-id",
        "UserPoolId": "mock-user-pool-id"
    },
    "Localstack": {
        "ServiceUrl": "http://localhost:4566/"
    },
    "Cors": {
        "AllowedOrigins": ["http://localhost:3000", "http://localhost"]
    },
    "Serilog": {
        "Properties": {
            "Application": "XXTemplateXX.Minimal.Api",
            "Environment": "Development"
        }
    }
}
```

## LocalDevelopment — appsettings.LocalDevelopment.json

All services on Docker internal DNS:

```json
{
    "Database": {
        "ConnectionStrings": {
            "XXTemplateXXPostgreSql": "Host=postgre-database;Port=5432;Database=xxtemplatexx;Username=admin;Password=admin123"
        }
    },
    "Cognito": {
        "Domain": "http://wiremock:8080",
        "RedirectUri": "http://xxtemplatexx-api:80/auth/oauth/callback",
        "ClientId": "mock-client-id",
        "UserPoolId": "mock-user-pool-id"
    },
    "Localstack": {
        "ServiceUrl": "http://localstack:4566/"
    }
}
```

## Docker DNS Resolution

| Service | Development (localhost) | LocalDevelopment (Docker DNS) |
| --- | --- | --- |
| PostgreSQL | `localhost:5432` | `postgre-database:5432` |
| LocalStack | `localhost:4566` | `localstack:4566` |
| WireMock | `localhost:8080` | `wiremock:8080` |
| API | `localhost:5000` | `xxtemplatexx-api:80` |
| Frontend | `localhost:3000` | `xxtemplatexx-web:80` |

## Test — Programmatic Configuration

No JSON files — everything is defined in code via Testcontainers:

```csharp
public class ApiServicesFactory
    : WebApplicationFactory<IMinimalApiMarker>, IAsyncLifetime
{
    private readonly PostgreSqlContainer _postgresContainer = new PostgreSqlBuilder()
        .WithDatabase("xxtemplatexx")
        .WithUsername("admin")
        .WithPassword("admin123")
        .Build();

    private readonly LocalStackContainer _localStackContainer = new LocalStackBuilder()
        .Build();

    private readonly WireMockContainer _wireMockContainer = new WireMockBuilder()
        .Build();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureAppConfiguration((context, config) =>
        {
            config.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Database:ConnectionStrings:XXTemplateXXPostgreSql"] =
                    _postgresContainer.GetConnectionString(),
                ["Localstack:ServiceUrl"] =
                    _localStackContainer.GetConnectionString(),
            });
        });
    }
}
```

## Production — appsettings.Production.json

Non-sensitive config only — secrets come from AWS Parameter Store:

```json
{
    "Serilog": {
        "MinimumLevel": {
            "Default": "Information",
            "Override": {
                "System.Net.Http.HttpClient": "Warning",
                "Microsoft.EntityFrameworkCore": "Warning"
            }
        },
        "WriteTo": [
            { "Name": "Console" },
            {
                "Name": "Loggly",
                "Args": {
                    "customerToken": "loaded-from-ssm",
                    "bufferBaseFilename": "/tmp/logs",
                    "period": "0.00:00:01"
                }
            }
        ],
        "Properties": {
            "Application": "XXTemplateXX.Minimal.Api",
            "Environment": "Production"
        }
    }
}
```

## Configuration Priority

```txt
1. Environment variables              (highest — overrides everything)
2. AWS Parameter Store                (Production only)
3. appsettings.{Environment}.json     (per-environment overrides)
4. appsettings.json                   (base defaults)
```

## WireMock Shared Mappings

Same mappings used in Development, LocalDevelopment, and Test:

```txt
scripts/development/wiremock/
├── mappings/
│   ├── cognito-token.json
│   ├── cognito-userinfo.json
│   └── external-api-stub.json
└── __files/
    └── cognito-jwks.json
```
