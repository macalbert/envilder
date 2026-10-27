# 🛣️ Envilder Roadmap

Envilder is evolving from a CLI tool into a **multi-runtime secret management platform**.
The goal: one declarative map-file format becomes the universal standard for resolving
environment variables from cloud secret stores (AWS SSM Parameter Store, AWS Secrets Manager,
Azure Key Vault, GCP Secret Manager): whether in local development, CI/CD pipelines,
or directly inside application code at runtime.

> **Vision:** One map-file. Every cloud. Every language. Every runtime.
>
> **Note:** This roadmap contains ideas and potential features based on initial vision and community feedback.
> Not all features are guaranteed to be implemented. Priorities may change based on user needs, feedback,
> and real-world usage patterns. Your input matters. Feel free to share your thoughts and suggestions!
>
> **Horizon:** "Up Next" covers the coming months and "Planned" the rest of the next twelve months
> (through October 2027). The [Out of scope](#-out-of-scope) section lists what Envilder does not intend to do.

---

## Feature Status & Roadmap

### ✅ Shipped

Versions refer to each component's own changelog: [CLI](./docs/changelogs/cli.md), [GitHub Action](./docs/changelogs/gha.md), [.NET SDK](./docs/changelogs/sdk-dotnet.md), [Python SDK](./docs/changelogs/sdk-python.md) and [Node.js SDK](./docs/changelogs/sdk-nodejs.md).

| Feature | Version | Notes |
|---------|---------|-------|
| **Mapping-based resolution** | CLI v0.1.4 | Core functionality: resolve every variable declared in a JSON map file |
| **`.env` file generation** | CLI v0.1.4 | Core functionality |
| **AWS SSM Parameter Store** | CLI v0.1.4 | Default provider |
| **AWS profile support** | CLI v0.3.0 | `--profile` flag |
| **Push mode** (`--push`) | CLI v0.6.0 | Upload a `.env` file or a single variable (`--key`, `--value`, `--secret-path`) to the provider. Throttling retry and duplicate path checks since v0.7.7. Since v0.16.0 a single-variable push also records the mapping in the map file (opt out with `--no-map-update`). [Guide](./docs/push-command.md) |
| **GitHub Action** | Action v0.7.0 | Pull secrets into `.env` files during workflow runs. [Documentation](./github-action/README.md) |
| **Azure Key Vault** | CLI v0.8.0, Action v0.8.0 | `--provider`, `--vault-url` and the `$config` map-file section. Precedence: flags > `$config` > defaults ([#90](https://github.com/macalbert/envilder/pull/90)) |
| **Documentation website** | CLI v0.9.1 | [envilder.com](https://envilder.com), in English, Spanish and Catalan. [Setup guide](./docs/requirements-installation.md) |
| **.NET SDK** (`Envilder`) | .NET SDK v0.1.0 | Load secrets into `IConfiguration`, `IServiceCollection` or `EnvilderClient`. Static facade, fluent builder and environment routing since v0.2.0. Published to NuGet. [Documentation](./src/sdks/dotnet/README.md) |
| **Python SDK** (`envilder`) | Python SDK v0.1.0 | Runtime library for Django, FastAPI and data pipelines. Fluent facade since v0.2.0, environment routing since v0.3.0. Published to PyPI. [Documentation](./src/sdks/python/README.md) |
| **Node.js SDK** (`@envilder/sdk`) | Node.js SDK v0.1.0 | Load secrets into `process.env` from a map file, with fluent builder, secret validation and environment routing. Published to npm. [Documentation](./src/sdks/nodejs/README.md) |
| **Map-file JSON Schema** | CLI v0.10.0, .NET SDK v0.3.0, Node.js SDK v0.2.0, Python SDK v0.4.0 | Formal spec at [`spec/map-file.v1.json`](./spec/map-file.v1.json), published at `https://envilder.com/schema/map-file.v1.json`: the contract between all SDKs and tools |
| **AWS identity banner** | CLI v0.12.1, Action v0.12.1 | Logs the effective AWS identity before resolving secrets (colorized since v0.13.0) |
| **Actionable credential errors** | CLI v0.13.0, .NET SDK v0.5.0, Node.js SDK v0.4.0, Python SDK v0.5.0 | Typed expired-credentials and expired-SSO-session errors with the exact fix (ADR-0010) |
| **SSO login recovery** | CLI v0.13.0 | On an interactive terminal, offers to run `aws sso login` and retries |
| **Secret masking in GitHub Actions** | Action v0.13.2 | Every resolved value is registered with `::add-mask::` before the `.env` file is written |
| **Zero-config defaults** | CLI v0.14.0 | `envilder` with no flags reads `envilder.json` and writes `.env` |
| **Safe `.env` writing** | CLI v0.14.0, Action v0.14.0 | Values round-trip exactly, and mapping keys a `.env` file cannot represent are rejected |
| **Exec mode** (`envilder exec`) | CLI v0.15.0 | `envilder exec [options] [--] <command> [args...]` starts a command with the resolved secrets in its environment, without writing a `.env` file. [Guide](./docs/exec-command.md) |

### 🔥 Up Next

| Feature | Priority | Notes |
|---------|----------|-------|
| **Go SDK** (`envilder`) | 🔴 High | Runtime library for Go: cloud-native apps, Kubernetes tooling. Published as Go module ([#561](https://github.com/macalbert/envilder/issues/561) → [#562](https://github.com/macalbert/envilder/issues/562) → [#563](https://github.com/macalbert/envilder/issues/563)) |
| **Java SDK** (`envilder`) | 🔴 High | Runtime library for Java/Kotlin: Spring Boot, Android backends. Published to Maven Central ([#569](https://github.com/macalbert/envilder/issues/569)) |
| **SDK conformance tests** | 🔴 High | Language-agnostic test fixtures (JSON input → expected output) that all SDKs must pass |
| **Validate command** (`envilder validate`) | 🟡 Medium | Preflight check: map file, remote key existence and optional `.env` comparison, without printing values. CLI first, then the SDKs ([#532](https://github.com/macalbert/envilder/issues/532)) |
| **GCP Secret Manager** | 🟡 Medium | Third cloud provider: similar DX to AWS SSM. Completes the multi-cloud trident (AWS + Azure + GCP) ([#573](https://github.com/macalbert/envilder/issues/573)) |
| **AWS Secrets Manager** | 🟡 Medium | Support AWS Secrets Manager alongside SSM Parameter Store for teams using JSON-structured secrets |

### 💡 Planned

| Feature | Priority | Notes |
|---------|----------|-------|
| **Auto-discovery mode** (`--auto`) | Medium | Fetch all parameters matching a given prefix (e.g., `/my-app/prod/*`) |
| **Local override map file** (`envilder.local.json`) | Medium | Personal, gitignored layer on top of the committed map file, on every surface (ADR-0011, [#385](https://github.com/macalbert/envilder/issues/385)) |
| **Environment delivery in the GitHub Action** | Medium | Export resolved values to later job steps instead of writing a `.env` file ([#478](https://github.com/macalbert/envilder/issues/478)) |
| **Exec with refresh** (`--refresh-interval`) | Low | Kill & restart child process periodically with fresh secrets (builds on `envilder exec`, [#479](https://github.com/macalbert/envilder/issues/479)) |
| **Named providers and per-environment config** | Medium | Several providers in one map file, per-environment provider settings and optional secrets, through `$config.providers`. Additive to the current schema; the flat `$config` fields are deprecated, with `envilder migrate` ([#586](https://github.com/macalbert/envilder/issues/586)) |
| **Per-provider packages** | Medium | Split the SDK packages per provider, so an app installs only the cloud SDKs it uses. Prerequisite for adding more providers |
| **Kubernetes Secrets** | Low | Read secrets from a cluster: in-cluster service account in production, kubeconfig locally |
| **HashiCorp Vault / OpenBao** | Low | KV secrets engine, with GitHub OIDC (JWT auth) in the Action |
| **Infisical** | Low | Cloud or self-hosted Infisical, with machine identities and GitHub OIDC |
| **Azure App Configuration** | Low | Settings and Key Vault references from App Configuration, for .NET-centric teams on Azure |

### 🚫 Out of scope

Envilder resolves secrets from stores you already run. It does not intend to:

- **Be a secret store**: values stay in the cloud provider; Envilder never keeps its own copy outside the `.env` file or process environment you ask for
- **Run a hosted service or server**: everything runs locally, in CI or inside your application, with your own credentials
- **Manage secret lifecycle**: creating vaults, rotating values, setting expiry or access policies stays with the provider's own tooling
- **Encrypt `.env` files**: protecting the generated file on disk is the job of the environment that consumes it
- **Ship a graphical interface**: the CLI, GitHub Action and SDKs are the supported surfaces

---

## 🏗️ Platform Architecture

All tools and SDKs live in a single monorepo and share the same map-file format:

```txt
envilder.json (universal contract)
     │
     ├── envilder CLI            → generates .env files
     ├── envilder GitHub Action  → CI/CD secret injection
     ├── @envilder/sdk (npm)     → Node.js / TypeScript runtime
     ├── envilder (PyPI)         → Python runtime
     ├── Envilder (NuGet)        → .NET runtime
     ├── envilder (Go module)    → Go runtime
     └── envilder (Maven)        → Java / Kotlin runtime
```

### SDK Rollout

All five SDKs are developed **in parallel**: same map-file contract, same conformance tests, shipped simultaneously:

| SDK | Package | Registry |
|-----|---------|----------|
| **Node.js** | `@envilder/sdk` | npm |
| **Python** | `envilder` | PyPI |
| **Go** | `envilder` | Go module |
| **.NET** | `Envilder` | NuGet |
| **Java** | `envilder` | Maven Central |

### Monorepo Principles

- **One map-file spec**: formal JSON Schema at `spec/` is the source of truth for all SDKs
- **Conformance tests**: language-agnostic fixtures that every SDK must pass
- **Independent versioning**: each SDK has its own semver (`sdk-node@1.2.0`, `sdk-py@0.3.0`)
- **Shared test infrastructure**: LocalStack for AWS and Azure via Docker Compose serve all SDKs

---

## 🙌 Contribute or Suggest Ideas

If you've faced similar problems or want to help improve this tool, feel free to:

- 🐛 [Open an issue](https://github.com/macalbert/envilder/issues/new)
- 💡 Share feature ideas and use cases
- 🔧 Submit a Pull Request
- 💬 Provide feedback on planned features

Every bit of feedback helps make this tool better for the community!
