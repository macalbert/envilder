# 🗝️ Envilder ☁️

<p align="center">
  <img src="https://github.com/user-attachments/assets/8a7188ef-9d8d-45fb-8c37-3af718fb5103" alt="Envilder">
</p>

<p align="center">
  <b>One model. Your secrets. Every runtime.</b><br>
  <span>Define secret mappings once — resolve them consistently from AWS SSM, Azure Key Vault, or GCP Secret Manager.</span>
</p>

![CodeRabbit Pull Request Reviews](https://img.shields.io/coderabbit/prs/github/macalbert/envilder?utm_source=oss&utm_medium=github&utm_campaign=macalbert%2Fenvilder&labelColor=171717&color=FF570A&link=https%3A%2F%2Fcoderabbit.ai&label=CodeRabbit+Reviews)

[![npm version](https://img.shields.io/npm/v/envilder.svg)](https://www.npmjs.com/package/envilder)
[![npm downloads](https://img.shields.io/npm/dm/envilder.svg)](https://npmcharts.com/compare/envilder)
[![CI Tests](https://github.com/macalbert/envilder/actions/workflows/tests.yml/badge.svg)](https://github.com/macalbert/envilder/actions/workflows/tests.yml)
[![Overall Coverage](https://macalbert.github.io/envilder/badge_combined.svg)](https://macalbert.github.io/envilder/)

[![Core Coverage](https://macalbert.github.io/envilder/core/badge_named.svg)](https://macalbert.github.io/envilder/core/index.html)
[![.NET Coverage](https://macalbert.github.io/envilder/dotnet/badge_named.svg)](https://macalbert.github.io/envilder/dotnet/index.html)
[![Python Coverage](https://macalbert.github.io/envilder/python/badge_named.svg)](https://macalbert.github.io/envilder/python/index.html)
[![IaC Coverage](https://macalbert.github.io/envilder/iac/badge_named.svg)](https://macalbert.github.io/envilder/iac/index.html)

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

## Why Envilder?

Envilder is a model-driven configuration resolution system. You define a JSON mapping between
variable names and cloud secret paths, and Envilder resolves them consistently — via the CLI for
local dev, the GitHub Action for CI/CD, or runtime SDKs for application startup.

The mapping file is the product. It's Git-versioned, PR-reviewable, and the single source of truth
for what secrets your app needs across every environment (dev, staging, production) and every runtime
(local shell, CI pipeline, application process).

No SaaS middleman. No vendor lock-in. Secrets stay in your cloud infrastructure.

---

## Why secret management is broken

- **Fragmented across tools** — Local dev uses `.env` files. CI/CD reads from vault integrations.
  Production has its own method. Same app, different configuration workflows everywhere.
- **Secrets shared through unsafe channels** — API keys sent over Slack, `.env` files committed
  to repos, wiki pages with plain-text credentials. A security incident waiting to happen.
- **Configuration drift is inevitable** — No single source of truth for what secrets an app needs.
  Dev, staging, and production desync. Deployments fail. Nobody knows which config is correct.

## How Envilder solves it

- 📋 **One model, one source of truth** — A single mapping file defines what secrets your app needs.
  Git-versioned. PR-reviewable. The same contract across every environment.
- ⚡ **Consistent resolution everywhere** — CLI for local dev, GitHub Action for CI/CD, runtime SDKs
  for app startup. Same mapping, same behavior, same result.
- 🛡️ **Your cloud, no middleman** — AWS SSM, Azure Key Vault, or GCP Secret Manager. No SaaS proxy.
  Secrets stay in your infrastructure. Native IAM/RBAC access control.
- 🔌 **Runtime SDKs** — Load secrets directly into memory at app startup — Python, .NET, and more.
  No `.env` files written to disk. No secrets left behind.
  ([.NET SDK](./src/sdks/dotnet/README.md), [Python SDK](./src/sdks/python/README.md))
- 🔄 **Bidirectional sync** — Pull secrets to `.env` or push values back to your cloud provider.
  Full round-trip support via CLI.

---

## 📚 Table of Contents

- [🗝️ Envilder ☁️](#️-envilder-️)
  - [Why Envilder?](#why-envilder)
  - [Why secret management is broken](#why-secret-management-is-broken)
  - [How Envilder solves it](#how-envilder-solves-it)
  - [📚 Table of Contents](#-table-of-contents)
  - [⚙️ Features](#️-features)
  - [💾 Installation](#-installation)
    - [🤖 GitHub Action](#-github-action)
  - [🚀 Quick Start](#-quick-start)
    - [🎥 Video Demonstration](#-video-demonstration)
    - [🏁 Get Started (3 steps)](#-get-started-3-steps)
      - [AWS SSM (default)](#aws-ssm-default)
      - [Azure Key Vault](#azure-key-vault)
    - [📚 Quick Links](#-quick-links)
  - [🗺️ Mapping File Format](#️-mapping-file-format)
    - [Basic Format (AWS SSM — default)](#basic-format-aws-ssm--default)
    - [With `$config` (explicit provider)](#with-config-explicit-provider)
    - [`$config` Options](#config-options)
    - [Configuration Priority](#configuration-priority)
  - [🧩 Runtime SDKs](#-runtime-sdks)
    - [.NET SDK](#net-sdk)
    - [Python SDK](#python-sdk)
  - [🛠️ How it works](#️-how-it-works)
  - [🔍 Envilder vs. Alternatives](#-envilder-vs-alternatives)
    - [Secrets sync tools (direct alternatives)](#secrets-sync-tools-direct-alternatives)
    - [Runtime \& credential tools (not direct alternatives)](#runtime--credential-tools-not-direct-alternatives)
    - [When to use what](#when-to-use-what)
    - [Why choose Envilder?](#why-choose-envilder)
    - [Where Envilder fits best](#where-envilder-fits-best)
  - [🏁 Roadmap](#-roadmap)
  - [🤝 Contributing](#-contributing)
  - [💜 Sponsors](#-sponsors)
  - [📜 License](#-license)

---

## ⚙️ Features

A configuration resolution system designed for security, consistency, and multi-runtime execution.

| Feature | Description |
|---------|-------------|
| 📋 **Single Mapping Model** | One JSON contract defines all secrets. Git-versioned, PR-reviewable, diff-able |
| 🔌 **Runtime SDKs** | Load secrets into memory at app startup — [.NET](./src/sdks/dotnet/README.md), [Python](./src/sdks/python/README.md). No `.env` on disk |
| ☁️ **Multi-Provider** | AWS SSM, Azure Key Vault, GCP Secret Manager (coming soon). No vendor lock-in |
| ⚙️ **GitHub Action** | Pull secrets in CI/CD workflows. Same mapping, zero manual intervention |
| 🔄 **Bidirectional Sync** | Pull secrets to `.env` or push values back to the cloud provider |
| 🔒 **IAM & RBAC** | Native cloud access control. AWS IAM or Azure RBAC. No extra auth layer |
| 📊 **Fully Auditable** | Every read/write logged in AWS CloudTrail or Azure Monitor |
| 🧱 **Zero Infrastructure** | No servers, no proxies, no SaaS. Built on cloud services you already use |
| 👤 **AWS Profile Support** | Multi-account setups via `--profile` for different CLI profiles |

---

## 💾 Installation

🛠 Requirements:

- Node.js **v20+** (cloud-native compatible)
- **AWS provider**: AWS CLI installed and configured; IAM user/role with `ssm:GetParameter`, `ssm:PutParameter`
- **Azure provider**: Azure CLI installed; vault URL configured via
`$config.vaultUrl` in your map file or `--vault-url` flag

```bash
pnpm add -g envilder
```

Or use your preferred package manager:

```bash
npm install -g envilder
```

> 💡 **Want to try without installing?** Run `npx envilder --help` to explore the CLI instantly.
>
> 💡 **New to AWS SSM?** AWS Systems Manager Parameter Store provides secure storage for configuration data and secrets:
>
> - [AWS SSM Parameter Store Overview](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html)
> - [Setting up AWS CLI credentials](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html)
> - [IAM permissions for SSM](https://docs.aws.amazon.com/systems-manager/latest/userguide/setup-instance-profile.html)
>
> 💡 **New to Azure Key Vault?** Azure Key Vault safeguards cryptographic keys and secrets used by cloud apps:
>
> - [Azure Key Vault Overview](https://learn.microsoft.com/en-us/azure/key-vault/general/overview)
> - [Setting up Azure CLI](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli)
> - [Key Vault access policies](https://learn.microsoft.com/en-us/azure/key-vault/general/assign-access-policy)

### 🤖 GitHub Action

Use Envilder directly in your CI/CD workflows with our official GitHub Action:

**AWS SSM (default):**

```yaml
- name: Configure AWS Credentials
  uses: aws-actions/configure-aws-credentials@v5
  with:
    role-to-assume: ${{ secrets.AWS_ROLE_TO_ASSUME }}
    aws-region: us-east-1

- name: Pull secrets from AWS SSM
  uses: macalbert/envilder/github-action@v0.8.0
  with:
    map-file: param-map.json
    env-file: .env
```

**Azure Key Vault:**

```yaml
- name: Azure Login
  uses: azure/login@v2
  with:
    client-id: ${{ secrets.AZURE_CLIENT_ID }}
    tenant-id: ${{ secrets.AZURE_TENANT_ID }}
    subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}

- name: Pull secrets from Azure Key Vault
  uses: macalbert/envilder/github-action@v0.8.0
  with:
    map-file: param-map.json
    env-file: .env
    provider: azure
    vault-url: ${{ secrets.AZURE_KEY_VAULT_URL }}
```

📖 **[View full GitHub Action documentation](./github-action/README.md)**

---

## 🚀 Quick Start

### 🎥 Video Demonstration

Watch how easy it is to automate your .env management in less than 1 minute:  

![Watch the video](https://github.com/user-attachments/assets/9f194143-117d-49f3-a6fb-f400040ea514)

### 🏁 Get Started (3 steps)

After configuring your cloud provider credentials, you can begin managing your secrets.

#### AWS SSM (default)

1. **Create a mapping file:**

   ```json
   {
     "DB_PASSWORD": "/my-app/db/password"
   }
   ```

2. **Push a secret to AWS SSM:**

   ```bash
   envilder --push --key=DB_PASSWORD --value=12345 --secret-path=/my-app/db/password
   ```

3. **Generate your .env file from AWS SSM:**

   ```bash
   envilder --map=param-map.json --envfile=.env
   ```

#### Azure Key Vault

1. **Add `$config` to your mapping file:**

   ```json
   {
     "$config": {
       "provider": "azure",
       "vaultUrl": "https://my-vault.vault.azure.net"
     },
     "DB_PASSWORD": "my-app-db-password"
   }
   ```

2. **Pull secrets from Azure Key Vault:**

   ```bash
   envilder --map=param-map.json --envfile=.env
   ```

   Or use CLI flags to override:

   ```bash
   envilder --provider=azure --vault-url=https://my-vault.vault.azure.net --map=param-map.json --envfile=.env
   ```

Your secrets are now managed from your cloud provider. Add `.env` to your `.gitignore` for security.
The mapping file is versioned — review it in PRs, diff it between environments.

### 📚 Quick Links

- [📖 Full Documentation](https://envilder.com) — Visit envilder.com for the complete guide
- [Requirements & Installation](docs/requirements-installation.md)
- [Push Command Guide](docs/push-command.md)
- [Pull Command Guide](docs/pull-command.md)

---

## 🗺️ Mapping File Format

The mapping file (`param-map.json`) is the core of Envilder — it's the single model that defines
what secrets your app needs and where they live in your cloud provider. The same file is used by
the CLI, the GitHub Action, and the runtime SDKs. You can optionally include a `$config` section
to declare which provider and settings to use.

### Basic Format (AWS SSM — default)

When no `$config` is present, Envilder defaults to AWS SSM Parameter Store:

```json
{
  "API_KEY": "/myapp/prod/api-key",
  "DB_PASSWORD": "/myapp/prod/db-password",
  "SECRET_TOKEN": "/myapp/prod/secret-token"
}
```

Values are SSM parameter paths (e.g., `/myapp/prod/api-key`).

### With `$config` (explicit provider)

Add a `$config` key to declare the provider and its settings. Envilder reads `$config` for configuration
and uses all other keys as secret mappings:

**AWS SSM with profile:**

```json
{
  "$config": {
    "provider": "aws",
    "profile": "prod-account"
  },
  "API_KEY": "/myapp/prod/api-key",
  "DB_PASSWORD": "/myapp/prod/db-password"
}
```

**Azure Key Vault:**

```json
{
  "$config": {
    "provider": "azure",
    "vaultUrl": "https://my-vault.vault.azure.net"
  },
  "API_KEY": "myapp-prod-api-key",
  "DB_PASSWORD": "myapp-prod-db-password"
}
```

> **Azure naming:** Key Vault secret names only allow alphanumeric characters and hyphens.
> Envilder automatically normalizes names — slashes and underscores become hyphens
> (e.g., `/myapp/db/password` → `myapp-db-password`).

### `$config` Options

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `provider` | `"aws"` \| `"azure"` | `"aws"` | Cloud provider to use |
| `vaultUrl` | `string` | — | Azure Key Vault URL (required when `provider` is `"azure"`) |
| `profile` | `string` | — | AWS CLI profile for multi-account setups (AWS only) |

### Configuration Priority

CLI flags and GitHub Action inputs always override `$config` values:

```txt
CLI flags / GHA inputs  >  $config in map file  >  defaults (AWS)
```

This means you can set a default provider in `$config` and override it per invocation:

```bash
# Uses $config from the map file
envilder --map=param-map.json --envfile=.env

# Overrides provider and vault URL from the map file
envilder --provider=azure --vault-url=https://other-vault.vault.azure.net --map=param-map.json --envfile=.env
```

---

## 🧩 Runtime SDKs

Beyond the CLI and GitHub Action, Envilder provides **runtime SDKs** that resolve secrets
directly into your application's memory at startup — no `.env` file written to disk, no secrets
left behind. SDKs use the same map-file format as the CLI.

### .NET SDK

Install via NuGet:

```bash
dotnet add package Envilder
```

Load secrets into `IConfiguration`:

```csharp
var mapFile = new MapFileParser().Parse(File.ReadAllText("secrets-map.json"));
var provider = SecretProviderFactory.Create(mapFile.Config);

var config = new ConfigurationBuilder()
    .AddEnvilder("secrets-map.json", provider)
    .Build();

var dbPassword = config["DB_PASSWORD"];
```

Or inject directly into process environment variables:

```csharp
var client = new EnvilderClient(provider);
var secrets = await client.ResolveSecretsAsync(mapFile);
EnvilderClient.InjectIntoEnvironment(secrets);
```

📖 **[View full .NET SDK documentation](./src/sdks/dotnet/README.md)**

### Python SDK

Install via uv (recommended) or pip:

```bash
uv add envilder
# or
pip install envilder
```

Load secrets into your application with a single line:

```python
from envilder import Envilder

# Resolve + inject into os.environ
Envilder.load('secrets-map.json')
```

Or route by environment — each environment points to its own map file:

```python
from envilder import Envilder

Envilder.load('production', {
    'production': 'prod-secrets.json',
    'development': 'dev-secrets.json',
    'test': None,  # no secrets loaded
})
```

📖 **[View full Python SDK documentation](./src/sdks/python/README.md)**

---

## 🛠️ How it works

```mermaid
graph LR
    A["Mapping Model (param-map.json)"] --> B[Envilder]:::core
    B --> C["CLI → .env file"]
    B --> D["GitHub Action → CI/CD"]
    B --> E["SDK → app memory"]
    F["AWS SSM / Azure KV / GCP"]:::cloud --> B

    classDef cloud fill:#ffcc66,color:#000000,stroke:#333,stroke-width:1.5px;
    classDef core fill:#1f3b57,color:#fff,stroke:#ccc,stroke-width:2px;
```

1. **Define** — Create a `param-map.json` mapping env var names to cloud secret paths
2. **Resolve** — Envilder fetches each secret from your cloud vault
3. **Deliver** — Secrets arrive as a `.env` file (CLI/GHA) or in-memory (SDKs)
4. **Push** — Rotate or add secrets from your local environment back to the cloud
5. **Trust** — Your cloud manages storage, rotation, and access. Envilder resolves — it never stores.

---

## 🔍 Envilder vs. Alternatives

Envilder is not a secrets manager. It is a **configuration resolution layer** — it reads from your
existing cloud vault and delivers secrets where they're needed (`.env` file, CI/CD, app memory).
No SaaS backend. No extra servers.

### Secrets sync tools (direct alternatives)

These tools manage secrets as data and project them into `.env` or runtime:

| Feature | Envilder | dotenv-vault | infisical |
|---------|----------|-------------|----------|
| **Source of truth** | External (SSM / Key Vault) | dotenv vault (SaaS) | Infisical backend |
| **Sync direction** | Bidirectional | Pull only | Bidirectional |
| **Declarative mapping** | ✅ JSON mapping | ❌ | ❌ |
| **Multi-provider (AWS + Azure)** | ✅ | ❌ | ⚠️ (primarily its own backend) |
| **Local `.env` generation** | ✅ | ✅ | ✅ |
| **Runtime SDKs** | ✅ (.NET, Python) | ❌ | ❌ |
| **CI/CD integration** | ✅ Native GitHub Action | Manual | ✅ Native |
| **Requires SaaS** | ❌ | ✅ | Optional |
| **Self-hosted** | N/A (no server needed) | ❌ | ✅ |
| **Complexity** | Low | Low | Medium |
| **Vendor lock-in** | Low | High | Medium |
| **Open source** | ✅ MIT | Partial | ✅ |

### Runtime & credential tools (not direct alternatives)

These tools serve different purposes and are better seen as **complements**, not competitors:

| Tool | Purpose | Manages app secrets? | Works with `.env`? |
|------|---------|---------------------|-------------------|
| **chamber** | Injects SSM params at runtime (`exec` with env) | ❌ | ❌ |
| **aws-vault** | Safely assumes AWS IAM roles / STS credentials | ❌ | ❌ |

### When to use what

- **Need a full vault with its own backend?** → [Infisical](https://infisical.com)
- **Need SaaS simplicity for `.env` sync?** → [dotenv-vault](https://www.dotenv.org/vault)
- **Need a projection layer from existing cloud stores?** → **Envilder**

### Why choose Envilder?

If you already use AWS SSM or Azure Key Vault and want a **single declarative model** that resolves
secrets consistently across local dev, CI/CD, and app startup — without a SaaS dependency or extra
servers — Envilder is the simplest path.

- **Versioned mappings** — `param-map.json` lives in source control, making secret
  resolution reproducible across environments
- **Three delivery modes** — CLI writes `.env` files, GitHub Action injects in CI, SDKs load into memory
- **Mockable architecture** — hexagonal design with port interfaces makes offline testing straightforward
- **Audit trail** — all reads/writes logged by your cloud provider (CloudTrail / Azure Monitor)

### Where Envilder fits best

| Use case | Resolution mode |
|----------|----------------|
| **Local development** | CLI → `.env` file. Onboard in one command |
| **CI/CD pipelines** | GitHub Action → inject secrets at build time |
| **SSG/SSR builds** | CLI → `.env` for frameworks that read env at build time |
| **Application runtime** | SDK → load secrets into memory at startup. No `.env` on disk |

> **Runtime SDKs:** The [.NET SDK](./src/sdks/dotnet/README.md) and [Python SDK](./src/sdks/python/README.md)
> load secrets directly into your application. More SDKs (TypeScript, Go, Java) are coming next.
> See the [Roadmap](./ROADMAP.md).

---

## 🏁 Roadmap

Envilder is actively developed. Here's where we're headed:

- ✅ **Pull & Push** — Bidirectional sync between `.env` and cloud vault
- ✅ **Multi-provider** — AWS SSM Parameter Store + Azure Key Vault
- ✅ **GitHub Action** — Native CI/CD integration
- ✅ **.NET SDK** — Runtime secret loading via `IConfiguration` or `EnvilderClient`
- ✅ **Python SDK** — Runtime secret loading via `Envilder` facade
- 🔜 **TypeScript SDK** — Native runtime library for Node.js apps
- 🔜 **Go SDK** — Runtime library for cloud-native apps and Kubernetes tooling
- 🔜 **Java SDK** — Runtime library for Spring Boot and Android backends
- 🔜 **GCP Secret Manager** — Third cloud provider — completes the multi-cloud trident
- 🔜 **Exec mode** — Inject secrets into a child process without writing to disk
- 🔍 **Check/sync mode** — Drift detection between cloud and local config
- 🔌 **AWS Secrets Manager** — Support JSON-structured secrets alongside SSM

👉 **[View full roadmap with priorities](./ROADMAP.md)**

---

## 🤝 Contributing

All help is welcome — PRs, issues, ideas!

- 🔧 Use our [Pull Request Template](.github/pull_request_template.md)
- 🧪 Add tests where possible
- 💬 Feedback and discussion welcome
- 🏗️ Check our [Architecture Documentation](./docs/architecture/README.md)
- 🔒 Review our [Security Policy](./docs/SECURITY.md)

---

## 💜 Sponsors

<p align="center">
  <a href="https://localstack.cloud" target="_blank" rel="noopener noreferrer">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="./src/website/public/localstack-logo-horizontal-Light.svg">
      <source media="(prefers-color-scheme: light)" srcset="./src/website/public/localstack-logo-horizontal-Dark.svg">
      <img src="./src/website/public/localstack-logo-horizontal-Dark.svg" alt="LocalStack" height="40">
    </picture>
  </a>
</p>

<p align="center">
  Proudly supported by <a href="https://localstack.cloud">LocalStack</a> — powering Envilder's integration tests.
</p>

---

## 📜 License

MIT © [Marçal Albert](https://github.com/macalbert)  
See [LICENSE](./LICENSE) | [CHANGELOG](./docs/CHANGELOG.md) | [Security Policy](./docs/SECURITY.md)
