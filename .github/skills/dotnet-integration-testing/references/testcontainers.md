# Testcontainers

Run real dependencies in Docker containers during tests.

## Shared container builders

The `M47.Shared.Tests` project (`shared/test/Backend/TestContainers/`) provides
**ready-to-use container builders** — do NOT create new ones, reuse these:

| Builder | Namespace | Image |
| ------- | --------- | ----- |
| `PostgreSqlContainerBuilder` | `…Containers.PostgreSql` | `postgres:16-alpine` |
| `LocalstackContainerBuilder<TEntryPoint>` | `…Containers.Localstack` | `localstack/localstack:stable` |
| `ConfluentKafkaContainerBuilder` | `…Containers.ConfluentKafka` | `confluentinc/cp-kafka:7.3.0` |
| `OllamaContainerBuilder` | `…Containers.Ollama` | `ollama/ollama:latest` |

Each builder accepts a `group` string for naming and handles port binding,
wait strategies, and health checks xxtemplatexxly.

## Shared base factories

The shared project also provides **base factory classes** that wire up containers,
WireMock, configuration, and DI for you:

| Factory | Use case |
| ------- | -------- |
| `WebBaseServicesFactory<TEntryPoint>` | Minimal API endpoint tests (WireMock only) |
| `LocalStackWebBaseServicesFactory<TEntryPoint>` | Minimal API + LocalStack (S3, SQS…) |
| `HostBaseServicesFactory<TEntryPoint>` | Worker/BackgroundService tests (WireMock only) |
| `LocalStackHostBaseServicesFactory<TEntryPoint>` | Worker + LocalStack |

All factories implement `IAsyncLifetime` — container lifecycle is managed automatically.

## Rules

- **Reuse shared builders** — never duplicate container setup in feature test projects
- Always use `IAsyncLifetime` — never start containers in constructors
- Use `CancellationTokenSource(TimeSpan.FromMinutes(5))` for startup timeout
- Use `Ports.GetAvailablePort()` or `WithPortBinding(port, true)` to avoid collisions
- One container per test class — don't share across classes
