# 🗝️ Envilder GitHub Action 🏰

<p align="center">
  <img src="https://github.com/user-attachments/assets/8a7188ef-9d8d-45fb-8c37-3af718fb5103" alt="Envilder">
</p>

<p align="center">
  <b>🍄 Power up your GitHub workflows with cloud secrets! 🍄</b><br>
  <span>Pull secrets from AWS SSM Parameter Store or Azure Key Vault into .env files automatically</span>
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
- 📦 **Zero configuration** - Just provide a mapping file and you're ready to go
- ☁️ **Multi-provider** - Switch between AWS and Azure with a single input
- 🎯 **Type-safe** - Full TypeScript support with IntelliSense

> 💡 **Learn more:** Visit [envilder.com](https://envilder.com) for complete documentation,
> or check the [GitHub README](https://github.com/macalbert/envilder/blob/main/README.md)
> for CLI usage, advanced features, and more examples.

---

## 🎮 Quick Start

Pull secrets from AWS SSM Parameter Store or Azure Key Vault into `.env` files in your GitHub Actions workflows.

**AWS SSM (default):**

```yaml
- name: 🪙 Configure AWS Credentials
  uses: aws-actions/configure-aws-credentials@v5
  with:
    role-to-assume: ${{ secrets.AWS_ROLE_TO_ASSUME }}
    aws-region: us-east-1

- name: 🔐 Pull Secrets from AWS SSM
  uses: macalbert/envilder/github-action@v0.8.0
  with:
    map-file: param-map.json
    env-file: .env
```

**Azure Key Vault:**

```yaml
- name: 🔑 Azure Login
  uses: azure/login@v2
  with:
    client-id: ${{ secrets.AZURE_CLIENT_ID }}
    tenant-id: ${{ secrets.AZURE_TENANT_ID }}
    subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}

- name: 🔐 Pull Secrets from Azure Key Vault
  uses: macalbert/envilder/github-action@v0.8.0
  with:
    map-file: param-map.json
    env-file: .env
    provider: azure
    vault-url: ${{ secrets.AZURE_KEY_VAULT_URL }}
```

## 🎯 Inputs

| Input | Required | Default | Description |
|-------|----------|---------|-------------|
| `map-file` | ✅ Yes | - | 🗺️ Path to JSON file mapping environment variables to secret paths |
| `env-file` | ✅ Yes | - | 📝 Path to `.env` file to generate/update |
| `provider` | ❌ No | `aws` | ☁️ `aws` or `azure`. Also settable via `$config.provider` in the map file. |
| `vault-url` | ❌ No | - | 🔑 Azure Key Vault URL (overrides `$config.vaultUrl` in map file) |

> **Note:** All paths (`map-file`, `env-file`) are relative to the repository root, not to any `working-directory`
> setting in your job. If you use `working-directory`, adjust the paths accordingly.
>
> **Azure:** When using `provider: azure`, provide the vault URL via the `vault-url` input
> or set `$config.vaultUrl` in your map file. Authentication uses Azure Default Credentials.

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

**`param-map.json` (AWS SSM):**

```json
{
  "DATABASE_URL": "/myapp/prod/database-url",
  "API_KEY": "/myapp/prod/api-key",
  "SECRET_TOKEN": "/myapp/prod/secret-token"
}
```

**`param-map.json` (Azure Key Vault):**

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
    runs-on: ubuntu-24.04

    steps:
      - name: 🧱 Checkout
        uses: actions/checkout@v5

      - name: 🪙 Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v5
        with:
          role-to-assume: ${{ secrets.AWS_ROLE_TO_ASSUME }}
          aws-region: ${{ secrets.AWS_REGION }}

      - name: 🔐 Pull Secrets from AWS SSM
        uses: macalbert/envilder/github-action@v0.8.0
        with:
          map-file: config/param-map.json
          env-file: .env

      - name: 🍄 Setup Node.js
        uses: actions/setup-node@v6
        with:
          node-version: "20.x"
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
    runs-on: ubuntu-24.04
    defaults:
      run:
        working-directory: ./app  # Commands run here

    steps:
      - uses: actions/checkout@v5
      
      - uses: aws-actions/configure-aws-credentials@v5
        with:
          role-to-assume: ${{ secrets.AWS_ROLE_TO_ASSUME }}
          aws-region: us-east-1
      
      - name: 🔐 Pull Secrets
        uses: macalbert/envilder/github-action@v0.8.0
        with:
          map-file: app/config/param-map.json  # Path from repo root!
          env-file: app/.env                    # Path from repo root!
      
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
    runs-on: ubuntu-24.04
    environment: ${{ inputs.environment }}

    steps:
      - uses: actions/checkout@v5

      - uses: aws-actions/configure-aws-credentials@v5
        with:
          role-to-assume: ${{ secrets.AWS_ROLE_TO_ASSUME }}
          aws-region: us-east-1

      - name: 🔐 Pull ${{ inputs.environment }} secrets
        uses: macalbert/envilder/github-action@v0.8.0
        with:
          map-file: config/${{ inputs.environment }}/param-map.json
          env-file: .env.${{ inputs.environment }}

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
    runs-on: ubuntu-24.04
    strategy:
      matrix:
        environment: [dev, staging, production]
        
    steps:
      - uses: actions/checkout@v5
      
      - uses: aws-actions/configure-aws-credentials@v5
        with:
          role-to-assume: ${{ secrets[format('AWS_ROLE_{0}', matrix.environment)] }}
          aws-region: us-east-1
      
      - uses: macalbert/envilder/github-action@v0.8.0
        with:
          map-file: config/${{ matrix.environment }}/param-map.json
          env-file: .env
      
      - run: pnpm install --frozen-lockfile
      - run: pnpm deploy
```

## 📦 Output

The action generates/updates the specified `.env` file with values from your cloud provider:

**Generated `.env`:**

```bash
DATABASE_URL=postgresql://user:pass@host:5432/db
API_KEY=sk_live_abc123xyz789
SECRET_TOKEN=token_secret_value_here
```

## 🛡️ Security Best Practices

### ✅ DO (Power-Ups!)

- Use OIDC authentication instead of long-lived access keys
- Scope IAM policies to specific parameter paths
- Use separate parameter namespaces per environment (`/myapp/prod/*`, `/myapp/dev/*`)
- Store sensitive SSM paths in GitHub Environment Secrets
- Use GitHub Environments with protection rules for production

### ❌ DON'T (Game Over!)

- Commit the generated `.env` file to version control
- Grant overly broad IAM permissions (`ssm:*` on `*`)
- Use the same SSM parameters across environments
- Store AWS credentials in repository secrets (use OIDC)

## 🔧 Troubleshooting

### Error: "Could not find lib directory"

The published action includes pre-built code. If you see this error, ensure you're using the
marketplace version (`macalbert/envilder/github-action@v0.8.0`) not a local checkout.

### Error: "Parameter not found"

- Verify the parameter exists in AWS SSM Parameter Store
- Check your IAM role has `ssm:GetParameter` permission for that parameter
- Ensure the parameter path in `param-map.json` is correct (case-sensitive)

### Error: "Unable to assume role"

- Verify your GitHub OIDC trust policy is configured correctly
- Check the role ARN is correct
- Ensure `id-token: write` permission is set in your workflow

### Generated `.env` file is empty

- Check that `param-map.json` exists and has valid JSON syntax
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
