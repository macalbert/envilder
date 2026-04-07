# Environments — Quick Reference

## Matrix

| Aspect | Development | LocalDevelopment | Test | Production |
| ------ | ----------- | ---------------- | ---- | ---------- |
| API runs in | Local process | Docker | In-memory | AWS |
| DNS | localhost | Docker DNS | Container ports | AWS |
| Database | Docker (localhost:5432) | Docker (postgre-database:5432) | Testcontainer | RDS |
| AWS Services | LocalStack (localhost:4566) | LocalStack (localstack:4566) | Testcontainer | Real AWS |
| HTTP Mocks | WireMock (localhost:8080) | WireMock (wiremock:8080) | WireMock (in-proc) | None |
| Config source | appsettings.Development.json | appsettings.LocalDevelopment.json | Code | Parameter Store |
| Cognito | WireMock mock | WireMock mock | WireMock mock | Real Cognito |

## Configuration Files

```txt
appsettings.json                          ← Shared base
├── appsettings.Development.json          ← localhost addresses
├── appsettings.LocalDevelopment.json     ← Docker DNS addresses
├── appsettings.Production.json           ← Prod endpoints, Loggly
└── AWS Parameter Store                   ← Secrets (Production only)
```

## Key Configuration Differences

### Database Connection

| Environment | Host |
| ----------- | ---- |
| Development | `Host=localhost;Port=5432` |
| LocalDevelopment | `Host=postgre-database;Port=5432` |
| Test | Testcontainer dynamic port |
| Production | RDS endpoint from Parameter Store |

### Cognito/OAuth

| Environment | Domain |
| ----------- | ------ |
| Development | `http://localhost:8080` (WireMock) |
| LocalDevelopment | `http://wiremock:8080` (Docker DNS) |
| Test | WireMock in-process |
| Production | `https://{pool}.auth.{region}.amazoncognito.com` |

### CORS Origins

| Environment | Origins |
| ----------- | ------- |
| Development | `http://localhost:3000`, `http://localhost` |
| Production | `https://xxtemplatexx.m47.io` |

## How to Run

```bash
# Development (API local, deps in Docker)
pnpm docker:up           # Start PostgreSQL, LocalStack, WireMock
dotnet run               # Start API locally
pnpm dev                 # Start frontend

# LocalDevelopment (everything in Docker)
pnpm docker:build && pnpm docker:up

# Test (Testcontainers, no Docker Compose needed)
dotnet test

# Production (AWS deployment via CDK)
# Managed by CI/CD pipeline
```

## Sensitive vs Non-Sensitive Config

**Parameter Store (secrets):** OAuth client secrets, JWT signing keys, DB credentials

**appsettings.json (public):** Queue/bucket names, log levels, feature flags, AWS region
