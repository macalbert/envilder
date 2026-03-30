# 🛣️ Envilder Roadmap

Envilder is evolving from a CLI tool into a **multi-runtime secret management platform**.
The goal: one declarative map-file format becomes the universal standard for resolving
environment variables from cloud secret stores (AWS SSM Parameter Store, AWS Secrets Manager,
Azure Key Vault, GCP Secret Manager) — whether in local development, CI/CD pipelines,
or directly inside application code at runtime.

> **Vision:** One map-file. Every cloud. Every language. Every runtime.
>
> **Note:** This roadmap contains ideas and potential features based on initial vision and community feedback.
> Not all features are guaranteed to be implemented. Priorities may change based on user needs, feedback,
> and real-world usage patterns. Your input matters—feel free to share your thoughts and suggestions!

---

## Feature Status & Roadmap

<!-- markdownlint-disable MD013 -->

### ✅ Shipped

| Feature | Notes |
|---------|-------|
| **Mapping-based resolution** | Core functionality |
| **`.env` file generation** | Core functionality |
| **AWS SSM Parameter Store** | Default provider |
| **AWS profile support** | `--profile` flag |
| **Push mode** (`--push`) | [Guide](./docs/push-command.md) |
| **GitHub Action** | [Documentation](./github-action/README.md) |
| **Azure Key Vault** | Multi-backend via `$config` map-file section ([#90](https://github.com/macalbert/envilder/pull/90)) |
| **Documentation website** | [envilder.com](https://envilder.com) |
| **Onboarding documentation** | [Setup guide](./docs/requirements-installation.md) |

### 🔥 Up Next

| Feature | Priority | Notes |
|---------|----------|-------|
| **TypeScript SDK** (`@envilder/sdk`) | 🔴 High | Native runtime library — load secrets directly into `process.env` from a map-file. No `.env` file needed. Published to npm |
| **Python SDK** (`envilder`) | 🔴 High | Runtime library for Python — Django/FastAPI/data pipelines. Published to PyPI |
| **Go SDK** (`envilder`) | 🔴 High | Runtime library for Go — cloud-native apps, Kubernetes tooling. Published as Go module |
| **.NET SDK** (`Envilder`) | 🔴 High | Runtime library for .NET — enterprise apps, Azure-native shops. Published to NuGet |
| **Java SDK** (`envilder`) | 🔴 High | Runtime library for Java/Kotlin — Spring Boot, Android backends. Published to Maven Central |
| **Map-file JSON Schema** | 🔴 High | Formal spec for the map-file format at `spec/` — serves as the contract between all SDKs and tools |
| **SDK conformance tests** | 🔴 High | Language-agnostic test fixtures (JSON input → expected output) that all SDKs must pass |
| **Exec mode** (`--exec`) | 🟡 Medium | Inject secrets into a child process env without writing to disk (`envilder exec -- node server.js`) |
| **GCP Secret Manager** | 🟡 Medium | Third cloud provider — similar DX to AWS SSM. Completes the multi-cloud trident (AWS + Azure + GCP) |
| **AWS Secrets Manager** | 🟡 Medium | Support AWS Secrets Manager alongside SSM Parameter Store for teams using JSON-structured secrets |
| **Check/sync mode** (`--check`) | 🟡 Medium | Validate cloud secrets vs local `.env`, fail CI if out-of-sync |

### 💡 Planned

| Feature | Priority | Notes |
|---------|----------|-------|
| **Auto-discovery mode** (`--auto`) | Medium | Fetch all parameters matching a given prefix (e.g., `/my-app/prod/*`) |
| **Exec with refresh** (`--refresh-interval`) | Low | Kill & restart child process periodically with fresh secrets (requires `--exec`) |
| **Hierarchical mapping** | Low | Per-environment `param-map.json` with inheritance/overrides |

<!-- markdownlint-enable MD013 -->

---

## 🏗️ Platform Architecture

All tools and SDKs live in a single monorepo and share the same map-file format:

```txt
param-map.json (universal contract)
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

All five SDKs are developed **in parallel** — same map-file contract, same conformance tests, shipped simultaneously:

| SDK | Package | Registry |
|-----|---------|----------|
| **TypeScript** | `@envilder/sdk` | npm |
| **Python** | `envilder` | PyPI |
| **Go** | `envilder` | Go module |
| **.NET** | `Envilder` | NuGet |
| **Java** | `envilder` | Maven Central |

### Monorepo Principles

- **One map-file spec** — formal JSON Schema at `spec/` is the source of truth for all SDKs
- **Conformance tests** — language-agnostic fixtures that every SDK must pass
- **Independent versioning** — each SDK has its own semver (`sdk-ts@1.2.0`, `sdk-py@0.3.0`)
- **Shared test infrastructure** — LocalStack (AWS) and Lowkey Vault (Azure) via Docker Compose serve all SDKs

---

## 🙌 Contribute or Suggest Ideas

If you've faced similar problems or want to help improve this tool, feel free to:

- 🐛 [Open an issue](https://github.com/macalbert/envilder/issues/new)
- 💡 Share feature ideas and use cases
- 🔧 Submit a Pull Request
- 💬 Provide feedback on planned features

Every bit of feedback helps make this tool better for the community!
