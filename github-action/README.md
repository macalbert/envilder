# 🗝️ Envilder GitHub Action 🏰

<p align="center">
  <img src="https://github.com/user-attachments/assets/96bf1efa-7d21-440a-a414-3a20e7f9a1f1" alt="Envilder">
</p>

<p align="center">
  <b>🍄 Power up your GitHub workflows with AWS SSM secrets! 🍄</b><br>
  <span>Pull secrets from AWS Systems Manager Parameter Store into .env files automatically</span>
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
infrastructure with AWS SSM Parameter Store as the single source of truth.
This GitHub Action makes it easy to:

- ✅ **Centralize secrets** - Store all your secrets in AWS SSM Parameter Store
- 🔒 **Secure by design** - Leverage AWS IAM for access control and encryption at rest
- 🚀 **Automate workflows** - Pull secrets directly in your CI/CD pipelines
- 📦 **Zero configuration** - Just provide a mapping file and you're ready to go
- 🔄 **Bidirectional sync** - Push local changes back to SSM when needed
- 🎯 **Type-safe** - Full TypeScript support with IntelliSense

> 💡 **Learn more:** Check out the [full documentation](https://github.com/macalbert/envilder/blob/main/README.md)
> for CLI usage, advanced features, and more examples.

---

## 🎮 Quick Start

Pull AWS SSM Parameter Store secrets into `.env` files in your GitHub Actions workflows.

```yaml
- name: 🪙 Configure AWS Credentials
  uses: aws-actions/configure-aws-credentials@v5
  with:
    role-to-assume: ${{ secrets.AWS_ROLE_TO_ASSUME }}
    aws-region: us-east-1

- name: 🔐 Pull Secrets from AWS SSM
  uses: macalbert/envilder/github-action@v1
  with:
    map-file: param-map.json
    env-file: .env
```

## 🎯 Inputs

| Input | Required | Default | Description |
|-------|----------|---------|-------------|
| `map-file` | ✅ Yes | - | 🗺️ Path to JSON file mapping environment variables to SSM parameter paths |
| `env-file` | ✅ Yes | - | 📝 Path to `.env` file to generate/update |

> **Note:** All paths (`map-file`, `env-file`) are relative to the repository root, not to any `working-directory`
> setting in your job. If you use `working-directory`, adjust the paths accordingly.

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

Create a JSON file mapping environment variables to SSM paths:

**`param-map.json`:**

```json
{
  "DATABASE_URL": "/myapp/prod/database-url",
  "API_KEY": "/myapp/prod/api-key",
  "SECRET_TOKEN": "/myapp/prod/secret-token"
}
```

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
        uses: macalbert/envilder/github-action@v1
        with:
          map-file: config/param-map.json
          env-file: .env

      - name: 🍄 Setup Node.js
        uses: actions/setup-node@v6
        with:
          node-version: '20.x'
          cache: 'pnpm'

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
        uses: macalbert/envilder/github-action@v1
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
        uses: macalbert/envilder/github-action@v1
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
      
      - uses: macalbert/envilder/github-action@v1
        with:
          map-file: config/${{ matrix.environment }}/param-map.json
          env-file: .env
      
      - run: pnpm install --frozen-lockfile
      - run: pnpm deploy
```

## 📦 Output

The action generates/updates the specified `.env` file with values from AWS SSM:

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
marketplace version (`macalbert/envilder/github-action@v1`) not a local checkout.

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
