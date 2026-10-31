# 🗝️ Envilder GitHub Action 🏰

<p align="center">
  <img src="https://github.com/user-attachments/assets/8a7188ef-9d8d-45fb-8c37-3af718fb5103" alt="Envilder">
</p>

<p align="center">
  <b>🍄 Power up your GitHub workflows with cloud secrets! 🍄</b><br>
  <span>Load secrets from AWS SSM Parameter Store or Azure Key Vault into your CI/CD jobs, without writing .env files</span>
</p>

<p align="center">
  <a href="https://github.com/macalbert/envilder/actions/workflows/test-action.yml">
    <img src="https://github.com/macalbert/envilder/actions/workflows/test-action.yml/badge.svg" alt="Action Tests">
  </a>
  <a href="https://github.com/macalbert/envilder">
    <img src="https://img.shields.io/badge/⭐-GitHub-orange.svg" alt="GitHub">
  </a>
  <a href="../LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License">
  </a>
</p>

---

## 🌟 Why Envilder?

**Envilder** helps you manage environment variables and secrets across your
infrastructure with AWS SSM Parameter Store or Azure Key Vault as the single
source of truth. This GitHub Action makes it easy to:

- ✅ **Centralize secrets** - Store all your secrets in AWS SSM or Azure Key Vault
- 🔒 **Secure by design** - Leverage AWS IAM or Azure RBAC for access control and encryption at rest
- 🚀 **Automate workflows** - Pull secrets directly in your CI/CD pipelines
- 📦 **Prebuilt tagged action** - Reference `macalbert/envilder/github-action@v0`; no consumer build step
- ☁️ **Supported providers** - Choose AWS or Azure and configure that provider's credentials and access
- 🗺️ **Shared mapping contract** - Reuse the same `envilder.json` structure as the CLI and SDKs

> 💡 **Learn more:** Visit [envilder.com](https://envilder.com/docs/github-action/?utm_source=github&utm_medium=readme&utm_campaign=action) for complete documentation,
> or check the [GitHub README](https://github.com/macalbert/envilder/blob/main/README.md)
> for CLI usage, advanced features, and more examples.

---

## 🎮 Quick Start

Load secrets from AWS SSM Parameter Store or Azure Key Vault into the environment of your GitHub Actions job.
The published `macalbert/envilder/github-action@v0` tag contains the prebuilt action.

**AWS SSM (default):**

```yaml
- name: 🪙 Configure AWS Credentials
  uses: aws-actions/configure-aws-credentials@v5
  with:
    role-to-assume: ${{ secrets.AWS_ROLE_TO_ASSUME }}
    aws-region: us-east-1

- name: 🔐 Load Secrets from AWS SSM
  uses: macalbert/envilder/github-action@v0
  with:
    map-file: envilder.json

- run: pnpm test   # the secrets are environment variables of this step
```

**Azure Key Vault:**

```yaml
- name: 🔑 Azure Login
  uses: azure/login@v2
  with:
    client-id: ${{ secrets.AZURE_CLIENT_ID }}
    tenant-id: ${{ secrets.AZURE_TENANT_ID }}
    subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}

- name: 🔐 Load Secrets from Azure Key Vault
  uses: macalbert/envilder/github-action@v0
  with:
    map-file: envilder.json
    provider: azure
    vault-url: ${{ secrets.AZURE_KEY_VAULT_URL }}
```

## 🎯 Inputs

| Input | Required | Default | Description |
|-------|----------|---------|-------------|
| `map-file` | ✅ Yes | - | 🗺️ Path to JSON file mapping environment variables to secret paths |
| `env-file` | ❌ No | - | 📝 Path to a `.env` file to write instead of exporting to the job environment |
| `command` | ❌ No | - | 🚀 Command to run with the secrets in its environment only (not exported) |
| `provider` | ❌ No | `aws` | ☁️ `aws` or `azure`. Also settable via `$config.provider` in the map file. |
| `vault-url` | ❌ No | - | 🔑 Azure Key Vault URL (overrides `$config.vaultUrl` in map file) |

> **Note:** Without `env-file` or `command`, secrets are exported to the later steps of the
> job (see [Choosing a mode](#-choosing-a-mode)). `map-file` paths are relative to the
> repository root, not to any `working-directory` setting in your job. `env-file` can also
> be an absolute path: prefer `${{ runner.temp }}/envilder.env` to keep the file out of
> the repository workspace.
>
> **Azure:** When using `provider: azure`, provide the vault URL via the `vault-url` input
> or set `$config.vaultUrl` in your map file. Authentication uses Azure Default Credentials.

## 🧭 Choosing a mode

The action has three modes. Pick one with the inputs you set:

| Mode | How to select it | Who can read the secrets | Writes a file |
|------|------------------|--------------------------|---------------|
| 🧠 **Job environment** (default) | Only `map-file` | Every **later step of the job** | ❌ No |
| 🚀 **Command** | `command` | Only **that command** and the processes it starts | ❌ No |
| 📄 **`.env` file** | `env-file` | Any step or tool that reads the file | ✅ Yes |

### 🧠 Job environment (default, recommended)

Without `env-file` or `command`, the action exports each secret as an
environment variable for **every step that runs after it in the same job**.
Steps read them like any other variable: `process.env.DB_PASSWORD`,
`os.environ["DB_PASSWORD"]`, `$DB_PASSWORD`, or `${{ env.DB_PASSWORD }}` in
the workflow file.

```yaml
- name: 🔐 Load secrets
  uses: macalbert/envilder/github-action@v0
  with:
    map-file: envilder.json

- run: pnpm test      # DB_PASSWORD, API_KEY... are already set
- run: ./deploy.sh    # and here too
```

How it works: the action appends the secrets to the runner's `GITHUB_ENV`
file, and the runner injects them into the environment of each later step.
The action itself writes no `.env` file to the workspace, so there is no
secrets file for an artifact, a cache, a Docker build context or a commit to
pick up. Later tools can still write the variables to files that end up in one
of those, so treat build and test outputs as you would without Envilder.

Scope: **the whole job**, from the next step on. That includes third-party
actions used later in the job, Docker container actions, and steps running in a
job `container:`. Other jobs do not get them: each job that needs secrets runs
the action again. A container you start yourself with `docker run` does not
inherit them: pass them explicitly, for example `docker run -e DB_PASSWORD ...`.

### 🚀 Command: secrets only for one process

With `command`, the action runs that command with the secrets in its
environment and ends the step with the command's exit code. The secrets exist
**only inside that process** (and the processes it starts). They are not
exported, so later steps, including third-party actions, never see them.

```yaml
- name: 🚀 Deploy with secrets
  uses: macalbert/envilder/github-action@v0
  with:
    map-file: envilder.json
    command: ./deploy.sh --prod

- run: echo "$DB_PASSWORD"   # empty: the secrets stayed in the deploy step
```

The command runs with `bash` like a `run:` step (`bash --noprofile --norc -eo
pipefail`), from the repository root. Use it when a single step needs the
secrets and you want the smallest exposure.

### 📄 `.env` file: when a tool needs a file

With `env-file`, the action writes (or updates) that `.env` file, as in
previous versions. Use it only when a tool can only read a file, for example
`docker compose --env-file`:

```yaml
- uses: macalbert/envilder/github-action@v0
  with:
    map-file: envilder.json
    env-file: ${{ runner.temp }}/envilder.env

- run: docker compose --env-file "${{ runner.temp }}/envilder.env" up -d
```

`env-file` and `command` cannot be used together.

### 🛡️ How much safer is it?

Not writing a `.env` file removes the most common way secrets leak from CI:
a file nobody remembers, picked up by `upload-artifact`, a cache, `COPY . .`
in a Dockerfile, or `git add -A`.

The default mode is not file-free, though: it writes the secrets to the
runner's per-step `GITHUB_ENV` file in the runner's temporary directory,
outside the workspace, which the runner reads to set them in later steps and
empties at the end of the job. Treat the runner's temporary
files as sensitive, especially on self-hosted runners, where a failed cleanup
can leave them behind. `command` writes no file at all.

It does **not** protect against malicious code running in the job: a
compromised dependency or action can read environment variables as easily as a
file. What changes is the exposure:

| | `.env` file | Job environment | Command |
|---|---|---|---|
| File in the workspace | Yes | No | No |
| File on the runner | Yes | `GITHUB_ENV`, in the runner's temporary directory | No |
| Who can read the secrets | The whole job, and the disk | The whole job | One process |

All modes register every value with GitHub log masking. Job environment and
command are fail-closed: if any secret is missing or empty, the step fails and
no secret is exported or passed to the command.

## 🏁 Prerequisites

### 1. 🪙 AWS Credentials

Configure AWS credentials using OIDC (recommended) or access keys:

```yaml
permissions:
  id-token: write  # Required for OIDC
  contents: read

jobs:
  deploy:
    steps:
      - uses: aws-actions/configure-aws-credentials@v5
        with:
          role-to-assume: arn:aws:iam::123456789012:role/GitHubActionsRole
          aws-region: us-east-1
```

### 2. 🔑 IAM Permissions

Your AWS role must have `ssm:GetParameter` permission:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["ssm:GetParameter"],
      "Resource": "arn:aws:ssm:*:*:parameter/*"
    }
  ]
}
```

### 3. 🗺️ Parameter Mapping File

Create a JSON file mapping environment variables to secret paths:

**`envilder.json` (AWS SSM):**

```json
{
  "DATABASE_URL": "/myapp/prod/database-url",
  "API_KEY": "/myapp/prod/api-key",
  "SECRET_TOKEN": "/myapp/prod/secret-token"
}
```

**`envilder.json` (Azure Key Vault):**

Use the optional `$config` section to declare the provider and vault URL:

```json
{
  "$config": {
    "provider": "azure",
    "vaultUrl": "https://my-vault.vault.azure.net"
  },
  "DATABASE_URL": "myapp-prod-database-url",
  "API_KEY": "myapp-prod-api-key",
  "SECRET_TOKEN": "myapp-prod-secret-token"
}
```

Alternatively, pass provider and vault URL via action inputs (`provider`, `vault-url`), which override `$config`.

> **Note:** Azure Key Vault secret names can only contain alphanumeric characters and hyphens.
> Envilder automatically normalizes names (replacing slashes/underscores with hyphens).

### 4. 🔑 Azure Credentials (for Azure Key Vault)

Configure Azure credentials using OIDC (recommended):

```yaml
permissions:
  id-token: write  # Required for OIDC
  contents: read

jobs:
  deploy:
    steps:
      - uses: azure/login@v2
        with:
          client-id: ${{ secrets.AZURE_CLIENT_ID }}
          tenant-id: ${{ secrets.AZURE_TENANT_ID }}
          subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}
```

Your Azure identity needs **Key Vault Secrets User** role to pull secrets.

## 🌟 Examples

### 🏰 Basic Workflow

```yaml
name: 🚀 Deploy Application

on:
  push:
    branches: [main]

permissions:
  id-token: write
  contents: read

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: 🧱 Checkout
        uses: actions/checkout@v5

      - name: 🪙 Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v5
        with:
          role-to-assume: ${{ secrets.AWS_ROLE_TO_ASSUME }}
          aws-region: ${{ secrets.AWS_REGION }}

      - name: 🔐 Load Secrets from AWS SSM
        uses: macalbert/envilder/github-action@v0
        with:
          map-file: config/envilder.json

      - name: 🍄 Setup Node.js
        uses: actions/setup-node@v6
        with:
          node-version: "22.x"
          cache: "pnpm"

      - name: 📦 Install Dependencies
        run: pnpm install --frozen-lockfile

      - name: 🏗️ Build Application
        run: pnpm build
        
      - name: 🚀 Deploy Application
        run: pnpm deploy
```

### 🚧 Using with `working-directory`

If your workflow uses `working-directory` for steps, remember that
**file paths in the action are relative to the repository root**, not the working directory:

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./app  # Commands run here

    steps:
      - uses: actions/checkout@v5
      
      - uses: aws-actions/configure-aws-credentials@v5
        with:
          role-to-assume: ${{ secrets.AWS_ROLE_TO_ASSUME }}
          aws-region: us-east-1
      
      - name: 🔐 Load Secrets
        uses: macalbert/envilder/github-action@v0
        with:
          map-file: app/config/envilder.json  # Path from repo root!
      
      - run: pnpm install --frozen-lockfile      # Runs in ./app
      - run: pnpm build   # Runs in ./app
```

### 🌍 Multi-Environment Deployment

```yaml
name: 🌍 Deploy to Environment

on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to deploy'
        required: true
        type: choice
        options:
          - dev
          - staging
          - production

permissions:
  id-token: write
  contents: read

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: ${{ inputs.environment }}

    steps:
      - uses: actions/checkout@v5

      - uses: aws-actions/configure-aws-credentials@v5
        with:
          role-to-assume: ${{ secrets.AWS_ROLE_TO_ASSUME }}
          aws-region: us-east-1

      - name: 🔐 Load ${{ inputs.environment }} secrets
        uses: macalbert/envilder/github-action@v0
        with:
          map-file: config/${{ inputs.environment }}/envilder.json

      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - run: pnpm deploy
```

### 🎯 Matrix Strategy for Multiple Environments

```yaml
name: 🎯 Deploy All Environments

on:
  push:
    branches: [main]

permissions:
  id-token: write
  contents: read

jobs:
  deploy:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        environment: [dev, staging, production]
        
    steps:
      - uses: actions/checkout@v5
      
      - uses: aws-actions/configure-aws-credentials@v5
        with:
          role-to-assume: ${{ secrets[format('AWS_ROLE_{0}', matrix.environment)] }}
          aws-region: us-east-1
      
      - run: pnpm install --frozen-lockfile

      - uses: macalbert/envilder/github-action@v0
        with:
          map-file: config/${{ matrix.environment }}/envilder.json
          command: pnpm deploy   # secrets only for the deploy
```

## 📦 Output

In the default mode the action prints the names (never the values) of the
exported variables:

```text
envilder: 3 secrets exported to the job environment (DATABASE_URL, API_KEY, SECRET_TOKEN)
```

With `env-file`, the action generates/updates the specified `.env` file with values from your
cloud provider:

**Generated `.env`:**

```bash
DATABASE_URL=postgresql://user:pass@host:5432/db
API_KEY=example-not-a-real-secret
SECRET_TOKEN=token_secret_value_here
```

## 🛡️ Security Best Practices

### ✅ DO (Power-Ups!)

- Use OIDC authentication instead of long-lived access keys
- Prefer the default job-environment mode, or `command` when only one step needs the secrets
- When a tool needs a file, prefer `${{ runner.temp }}/envilder.env` over the workspace
- Scope IAM policies to specific parameter paths
- Use separate parameter namespaces per environment (`/myapp/prod/*`, `/myapp/dev/*`)
- Store sensitive SSM paths in GitHub Environment Secrets
- Use GitHub Environments with protection rules for production

### ❌ DON'T (Game Over!)

- Commit the generated `.env` file to version control
- Grant overly broad IAM permissions (`ssm:*` on `*`)
- Use the same SSM parameters across environments
- Store AWS credentials in repository secrets (use OIDC)

### 🥷 Runner log masking

The action registers each non-empty resolved value with GitHub Actions runner
masking before exporting it, passing it to the command, or writing the
environment file. This redacts exact registered
values from later workflow logs, but it is not a substitute for avoiding secret
output: transformed, partial, or encoded values may not be masked.

## 🔧 Troubleshooting

### Error: "Action bundle not found"

The published tag includes prebuilt code. If you see this error, ensure you're using
`macalbert/envilder/github-action@v0` rather than a local checkout.

### Error: "Parameter not found"

- Verify the parameter exists in AWS SSM Parameter Store
- Check your IAM role has `ssm:GetParameter` permission for that parameter
- Ensure the parameter path in `envilder.json` is correct (case-sensitive)

### Error: "Unable to assume role"

- Verify your GitHub OIDC trust policy is configured correctly
- Check the role ARN is correct
- Ensure `id-token: write` permission is set in your workflow

### Error: "GITHUB_ENV is not set"

The default mode only works inside a GitHub Actions job. Outside one (for
example a local runner emulator without `GITHUB_ENV`), set `env-file` or
`command`.

### Error: "... cannot be exported to the job environment"

GitHub Actions does not let `GITHUB_ENV` set `NODE_OPTIONS` or its
[default variables](https://docs.github.com/en/actions/reference/workflows-and-actions/variables)
(`GITHUB_SHA`, `RUNNER_OS` and the rest of the documented `GITHUB_*` and
`RUNNER_*` names). The default mode refuses those names, in any letter case,
instead of reporting a variable later steps would never get. Rename the
variable in the map file, or use `command` or `env-file`.

### Generated `.env` file is empty

- Check that `envilder.json` exists and has valid JSON syntax
- Verify AWS credentials are configured before running the action
- Review GitHub Actions logs for specific error messages

### Azure: "SecretNotFound" or "VaultNotFound"

- Verify the vault URL is correct and accessible (e.g., `https://my-vault.vault.azure.net`)
- Check your Azure identity has **Key Vault Secrets User** role on the vault
- Ensure `azure/login` runs before the Envilder action step

### Azure: Secret name contains invalid characters

- Azure Key Vault secret names only allow alphanumeric characters and hyphens
- Envilder automatically normalizes names (slashes and underscores become hyphens)
- If you see unexpected results, check the normalized name in the action logs

## 🔗 Related

- 🍄 **CLI Tool**: [Envilder CLI](https://www.npmjs.com/package/envilder) - npm package for local development
- 📚 **Documentation**: [Full documentation](https://github.com/macalbert/envilder/tree/main/docs)
- 🐛 **Issues**: [Report issues](https://github.com/macalbert/envilder/issues)

## 📜 License

MIT License - see [LICENSE](../LICENSE) for details

---

<p align="center">
  <b>🍄 Made with ❤️ and a little bit of Mario magic 🏰</b>
</p>
