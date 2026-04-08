---
name: common-environments
description: Defines the mental model and configuration contract for Development, LocalDevelopment, Test, and Production environments. Use to correctly configure environment-specific settings, understand DNS and configuration resolution, and avoid breaking environment parity during development, testing, and deployment.
user-invocable: false
---

# Environment Configuration Skill

This skill defines **how environments are conceptualized and configured**, not just how they are named.

An environment is **not** just an `ASPNETCORE_ENVIRONMENT` value.
An environment is the combination of:

* **Where the API runs**
* **How dependencies are resolved (DNS, networking)**
* **Where configuration comes from**
* **Whether services are mocked or real**

Correctly understanding this contract is mandatory to avoid configuration drift and “works on my machine” failures.

---

## Environment Model

| Environment | API Location | Dependencies | Config Source | Purpose |
| -------------------- | ------- | ------- | ------ | --- |
| **Development** | Local process | `localhost` | `appsettings.Development.json` | Debugging with minimal setup |
| **LocalDevelopment** | Docker | Docker DNS | `appsettings.LocalDevelopment.json` | Full-stack, production-like E2E |
| **Test** | In-memory | Testcontainers | Code | Isolated, reproducible tests |
| **Production** | AWS (Lambda/ECS) | AWS networking | AWS Parameter Store | Live system |

---

## Core Principle

**The application code must not change between environments.**

Only the following are allowed to vary:

* Service addresses (`localhost` vs Docker DNS vs AWS endpoints)
* Configuration source (JSON, code, Parameter Store)
* Level of mocking (WireMock vs real services)

If behavior changes beyond that, the environment boundary is broken.

---

## Development Environment

### Development Intent

Run the API **locally as a process** with a debugger attached, while dependencies run in Docker.

This is the **lowest-friction environment** and the fastest feedback loop.

### Development Characteristics

* API runs **outside Docker**
* Dependencies run **inside Docker**
* All services are addressed via `localhost`
* WireMock is used for external HTTP dependencies

### Configuration

**ASPNETCORE_ENVIRONMENT:** `Development`

```json
{
  "Database": {
    "ConnectionStrings": {
      "XXTemplateXXPostgreSql": "Host=localhost;Port=5432;..."
    }
  },
  "Cognito": {
    "Domain": "http://localhost:8080",
    "RedirectUri": "http://localhost:5000/auth/oauth/callback"
  },
  "Localstack": {
    "ServiceUrl": "http://localhost:4566/"
  }
}
```

### How to Run Development Environment

1. Start dependencies only:

   ```bash
   pnpm docker:up
   ```

2. Run API locally:

   ```bash
   dotnet run
   ```

3. Run frontend:

   ```bash
   pnpm dev
   ```

---

## LocalDevelopment Environment

### LocalDevelopment Intent

Run the **entire stack inside Docker** to surface issues related to networking, DNS, and container boundaries.

This is the **first environment that behaves like production**.

### LocalDevelopment Characteristics

* API runs in Docker
* Dependencies run in Docker
* All communication uses **Docker internal DNS**
* No service is reachable via `localhost` internally

### LocalDevelopment Configuration

**ASPNETCORE_ENVIRONMENT:** `LocalDevelopment`

```json
{
  "Database": {
    "ConnectionStrings": {
      "XXTemplateXXPostgreSql": "Host=postgre-database;Port=5432;..."
    }
  },
  "Cognito": {
    "Domain": "http://wiremock:8080",
    "RedirectUri": "http://xxtemplatexx-api:80/auth/oauth/callback"
  },
  "Localstack": {
    "ServiceUrl": "http://localstack:4566/"
  }
}
```

### Docker Internal DNS

| Service    | Internal Name      | External Port |
| ---------- | ------------------ | ------------- |
| API        | `xxtemplatexx-api` | 81            |
| Frontend   | `xxtemplatexx-web` | 80            |
| PostgreSQL | `postgre-database` | 5432          |
| LocalStack | `localstack`       | 4566          |
| WireMock   | `wiremock`         | 8080          |

### How to Run

```bash
pnpm docker:up
```

---

## Test Environment

### Test Intent

Execute **isolated, reproducible integration tests** without relying on shared infrastructure.

### Test Characteristics

* API hosted in-memory
* All dependencies started via Testcontainers
* Configuration is defined **programmatically**
* No `appsettings.*.json` files are used

### Pattern

```csharp
public class ApiServicesFactory 
    : WebApplicationFactory<IMinimalApiMarker>, IAsyncLifetime
{
    private readonly PostgreSqlContainer _postgresContainer;
    private readonly LocalStackContainer _localStackContainer;
    private readonly WireMockContainer _wireMockContainer;

    public async Task InitializeAsync()
    {
        await _postgresContainer.StartAsync();
        await _localStackContainer.StartAsync();
        await _wireMockContainer.StartAsync();
    }
}
```

### Guarantees

* Fresh state per test run
* Identical behavior locally and in CI
* No external dependencies
* Same WireMock mappings as other environments

Run with:

```bash
dotnet test
```

---

## Production Environment

### Production Intent

Run the system in AWS using **real managed services** with secure configuration.

### Production Characteristics

* API runs in AWS Lambda or ECS
* No mocks
* Secrets are never stored in the repository
* Configuration is split by sensitivity

### Configuration Loading

```csharp
builder.Host.ConfigureParameterStore<IMinimalApiMarker>();
```

### Parameter Store (Sensitive)

* OAuth client secrets
* JWT signing keys
* Database credentials
* Cognito configuration

### appsettings.json (Non-Sensitive)

* Queue names
* Bucket names
* Log levels
* AWS region
* Feature flags

---

## WireMock Contract

WireMock is a **shared dependency across environments**, not a test-only tool.

Used in:

* Development
* LocalDevelopment
* Test

Same mappings. Same behavior. Same OAuth contract.

Location:

```txt
scripts/development/wiremock/
├── mappings/
└── __files/
```

This guarantees parity between local debugging, Docker E2E, and tests.

---

## Configuration Hierarchy

```txt
appsettings.json
├── appsettings.Development.json
├── appsettings.LocalDevelopment.json
├── appsettings.Production.json
└── AWS Parameter Store (Production only)
```

**Priority (highest wins):**

1. Environment variables
2. AWS Parameter Store
3. `appsettings.{Environment}.json`
4. `appsettings.json`

---

## Summary Matrix

| Aspect        | Development   | LocalDevelopment | Test            | Production      |
| ------------- | ------------- | ---------------- | --------------- | --------------- |
| API runs in   | Local process | Docker           | In-memory       | AWS             |
| DNS           | localhost     | Docker DNS       | Container ports | AWS             |
| Database      | Docker        | Docker           | Testcontainer   | RDS             |
| Mocks         | WireMock      | WireMock         | WireMock        | None            |
| Config source | JSON          | JSON             | Code            | Parameter Store |

---

## Final Rule

If an issue appears in **LocalDevelopment** or **Test** but not in **Development**, the code was relying on an invalid assumption.

That is the point of having multiple environments.
