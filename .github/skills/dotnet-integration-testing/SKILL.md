---
name: dotnet-integration-testing
description: 'Integration testing patterns for .NET using Testcontainers, LocalStack, WireMock, and WebApplicationFactory. Use when writing integration tests that need PostgreSQL, S3/SQS, HTTP mocking, or API endpoint testing. Also covers the HTTP Client Builder pattern for Infrastructure adapters with SSM Parameter Store secrets.'
---

# Integration Testing

Patterns for integration testing with real dependencies in Docker containers.

## When to use

- Database tests → [Testcontainers](./references/testcontainers.md)
- External HTTP APIs → [WireMock](./references/wiremock.md)
- Record real responses → embed as test fixtures → mock from samples → [Sample-Driven Mocking](./references/sample-driven-mocking.md)
- API endpoint tests → [WebApplicationFactory](./references/web-application-factory.md)
- Infrastructure HTTP adapter (client + builder + manual test) → [HTTP Client Builder](./references/http-client-builder.md)
- Real codebase examples → [examples.md](./examples.md)

## Code style rules

| Rule | Example |
| ---- | ------ |
| Use `class` not `record` | `public class PostgreSqlContainerBuilder { ... }` |
| Always use `{}` brackets | `if (x) { return; }` never `if (x) return;` |
| Aligned wrapped parameters | Align parameters with opening parenthesis |
| `// Arrange`, `// Act`, `// Assert` | REQUIRED in every test method |
| No comments or XML summaries | Exception: the AAA comments above |

## Tool selection

| Dependency | Tool | Lifecycle |
| ---------- | ---- | --------- |
| PostgreSQL | Testcontainers (`PostgreSqlBuilder`) | `IAsyncLifetime` |
| AWS (S3, SQS, SES, SNS) | Testcontainers + LocalStack | `IAsyncLifetime` |
| External HTTP APIs | WireMock.Net (`WireMockServer`) | constructor / `IAsyncLifetime` |
| Own API endpoints | `WebApplicationFactory<Program>` | `IClassFixture` |
| Infrastructure HTTP clients | HTTP Client Builder pattern | per-test |

## Key principles

1. Use **real dependencies in containers** — avoid in-memory fakes for databases
2. Use **WireMock** for external HTTP services — record real responses, replay in tests
3. Use **`IAsyncLifetime`** for container setup/teardown
4. Keep tests **isolated and independent** — no shared mutable state
5. Every Infrastructure HTTP client must have a **builder with `CreateMock` + `CreateAsync`**
6. Every HTTP client test class must include a **skipped manual real-client test**
