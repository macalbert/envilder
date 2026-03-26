# 🛣️ Envilder Roadmap

Envilder aims to be the simplest, most reliable way to generate `.env` files from cloud secret stores
(AWS SSM Parameter Store, Azure Key Vault) — for both local development and CI/CD pipelines.

> **Note:** This roadmap contains ideas and potential features based on initial vision and community feedback.
> Not all features are guaranteed to be implemented. Priorities may change based on user needs, feedback,
> and real-world usage patterns. Your input matters—feel free to share your thoughts and suggestions!

---

## Feature Status & Roadmap

<!-- markdownlint-disable MD013 -->

| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| **Mapping-based resolution** | ✅ Implemented | - | Core functionality |
| **`.env` file generation** | ✅ Implemented | - | Core functionality |
| **AWS profile support** | ✅ Implemented | - | `--profile` flag |
| **Push mode** (`--push`) | ✅ Implemented | - | [Guide](./docs/push-command.md) |
| **GitHub Action** | ✅ Implemented | - | [Documentation](./github-action/README.md) |
| **Onboarding documentation** | ✅ Implemented | - | [Setup guide](./docs/requirements-installation.md) |
| **Plugin system / Multi-backend** | ✅ Implemented | - | Azure Key Vault support with `$config` map-file section ([#90](https://github.com/macalbert/envilder/pull/90)) |
| **Exec mode** (`--exec`) | ❌ Planned | High | Inject secrets into child process env without writing to disk (`envilder exec -- node server.js`) |
| **Check/sync mode** (`--check`) | ❌ Planned | High | Validate SSM vs `.env`, fail CI if out-of-sync |
| **Documentation website** | ❌ Planned | Medium | Dedicated docs site with guides, examples, and API reference |
| **Auto-discovery mode** (`--auto`) | ❌ Planned | Medium | Fetch all parameters with a given prefix |
| **Exec with refresh** (`--refresh-interval`) | ❌ Future | Low | Kill & restart child process periodically with fresh secrets (requires `--exec`) |
| **Webhook/Slack notifications** | ❌ Planned | Low | Notify on secret sync for audit/logging |
| **Hierarchical mapping** | ❌ Future | Low | Per-environment `param-map.json` |

<!-- markdownlint-enable MD013 -->

---

## 🙌 Contribute or Suggest Ideas

If you've faced similar problems or want to help improve this tool, feel free to:

- 🐛 [Open an issue](https://github.com/macalbert/envilder/issues/new)
- 💡 Share feature ideas and use cases
- 🔧 Submit a Pull Request
- 💬 Provide feedback on planned features

Every bit of feedback helps make this tool better for the community!
