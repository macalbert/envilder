# 🛣️ Envilder Roadmap

Envilder aims to be the simplest, most reliable way to generate `.env` files from cloud secret stores
(AWS SSM Parameter Store, AWS Secrets Manager, Azure Key Vault, GCP Secret Manager) — for both local
development and CI/CD pipelines.

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
| **Exec mode** (`--exec`) | 🔴 High | Inject secrets into a child process env without writing to disk (`envilder exec -- node server.js`) |
| **GCP Secret Manager** | 🔴 High | Third cloud provider — similar DX to AWS SSM. Completes the multi-cloud trident (AWS + Azure + GCP) |
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

## 🙌 Contribute or Suggest Ideas

If you've faced similar problems or want to help improve this tool, feel free to:

- 🐛 [Open an issue](https://github.com/macalbert/envilder/issues/new)
- 💡 Share feature ideas and use cases
- 🔧 Submit a Pull Request
- 💬 Provide feedback on planned features

Every bit of feedback helps make this tool better for the community!
