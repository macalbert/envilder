# Smart Commit — Scope Reference

## Envilder-Specific Scopes

| Scope | Area |
|-------|------|
| `cli` | CLI entry point (`src/envilder/apps/cli/`) |
| `gha` | GitHub Action (`src/envilder/apps/gha/`) |
| `ssm` | AWS SSM provider |
| `keyvault` | Azure Key Vault provider |
| `domain` | Domain entities, ports, errors |
| `app` | Application layer handlers |
| `infra` | Infrastructure adapters |
| `sdk-node` | Node.js SDK (`src/sdks/nodejs/`) |
| `sdk-dotnet` | .NET SDK (`src/sdks/dotnet/`) |
| `sdk-python` | Python SDK (`src/sdks/python/`) |
| `sdk-go` | Go SDK (`src/sdks/go/`) |
| `sdk-java` | Java SDK (`src/sdks/java/`) |
| `website` | Astro website (`src/website/`) |
| `e2e` | End-to-end tests |
| `iac` | Infrastructure as Code (`src/iac/`) |
| `sdk` | Changes spanning multiple SDKs |
| `dx` | Developer experience, tooling |

## Scope Selection Heuristic

1. If all changes are in one SDK → use the matching `sdk-*` scope (e.g. `sdk-node`, `sdk-dotnet`, `sdk-python`)
2. If all changes are in one layer → use that layer scope (`domain`, `app`, `infra`)
3. If changes span CLI + core → use `cli` (user-facing entry point)
4. If changes span multiple SDKs → use `sdk` scope
5. If changes are purely infrastructure/tooling → use `dx` scope (with `chore` as the commit type)

## Examples

```bash
feat(sdk-node): add fluent builder for secret resolution
fix(ssm): handle throttling on GetParameter calls
test(sdk-dotnet): add acceptance tests for Azure Key Vault
docs(website): update SDK landing page with Node.js examples
chore(dx): update biome to v2.0
refactor(app): extract shared validation into domain layer
```
