# Envilder GitHub Action

## Overview

The Envilder GitHub Action allows you to seamlessly pull secrets from AWS Systems Manager (SSM)
Parameter Store into `.env` files within your GitHub Actions workflows. This eliminates the need
to manually manage environment variables in CI/CD pipelines and ensures your applications always
have the latest configuration from your centralized secret store.

## Prerequisites

Before using this action, ensure you have:

1. **AWS Credentials** - Configured using `aws-actions/configure-aws-credentials`
2. **IAM Permissions** - Your AWS role must have `ssm:GetParameter` permission

> **Note:** If you're using the published action from GitHub Marketplace (`macalbert/envilder@v1`),
> no build step is required. The action is pre-built and ready to use.

### Required IAM Policy

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ssm:GetParameter"
      ],
      "Resource": "arn:aws:ssm:*:*:parameter/*"
    }
  ]
}
```

For better security, scope the `Resource` to specific parameter paths:

```json
{
  "Resource": "arn:aws:ssm:us-east-1:123456789012:parameter/myapp/*"
}
```

## Usage

### Basic Example

```yaml
name: 🚀 Deploy Application

on:
  push:
    branches: [main]

permissions:
  id-token: write  # Required for OIDC
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
          cache: 'npm'

      - name: 📦 Install Dependencies
        run: npm ci

      - name: 🏗️ Build Application
        run: npm run build

      - name: 🚀 Deploy Application
        run: npm run deploy
```

### Multi-Environment Example

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
          env-file: .env

      - uses: actions/setup-node@v6
        with:
          node-version: '20.x'
          cache: 'npm'

      - run: npm ci
      - run: npm run build
      - run: npm run deploy
```

## Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------||
| `map-file` | Path to the JSON file mapping environment variables to SSM parameter paths | ✅ Yes | - |
| `env-file` | Path to the `.env` file to generate | ✅ Yes | - |

## Outputs

| Output | Description |
|--------|-------------|
| `env-file-path` | Path to the generated `.env` file (same as input `env-file`) |

## Parameter Mapping File

Create a `param-map.json` file that maps environment variable names to AWS SSM parameter paths:

```json
{
  "DATABASE_URL": "/myapp/production/database-url",
  "API_KEY": "/myapp/production/api-key",
  "SECRET_TOKEN": "/myapp/production/secret-token"
}
```

## AWS Authentication

This action works with any AWS authentication method supported by the AWS SDK. The recommended
approach is using GitHub OIDC with `aws-actions/configure-aws-credentials`:

### OIDC Authentication (Recommended)

```yaml
permissions:
  id-token: write  # Required for OIDC
  contents: read

steps:
  - uses: aws-actions/configure-aws-credentials@v5
    with:
      role-to-assume: arn:aws:iam::123456789012:role/GitHubActionsRole
      aws-region: us-east-1
```

### Access Key Authentication (Not Recommended)

```yaml
steps:
  - uses: aws-actions/configure-aws-credentials@v5
    with:
      aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
      aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
      aws-region: us-east-1
```

## Development Usage

If you're developing Envilder or testing the action locally within the repository:

```yaml
steps:
  - uses: actions/checkout@v5

  - uses: actions/setup-node@v6
    with:
      node-version: '20.x'
      cache: 'npm'

  - name: 📦 Install and Build Envilder
    run: |
      npm ci
      npm run build

  - uses: aws-actions/configure-aws-credentials@v5
    with:
      role-to-assume: ${{ secrets.AWS_ROLE_TO_ASSUME }}
      aws-region: us-east-1

  - name: 🔐 Test Action (Local Reference)
    uses: ./  # Reference action from current repo
    with:
      map-file: e2e/sample/param-map.json
      env-file: .env
```

> **Note:** The `npm run build` step is **only required for local development**.
> Published releases on GitHub Marketplace include pre-built code.

## Troubleshooting

### Error: "Envilder GitHub Action is not built!"

This error only occurs when using a local reference (`uses: ./`) during development.

**Solution for development:**

```yaml
- run: npm ci
- run: npm run build
- uses: ./  # Local reference requires build
  with:
    map-file: param-map.json
    env-file: .env
```

**If using the published action:** This should never happen. If it does, please
[open an issue](https://github.com/macalbert/envilder/issues).

### Error: AWS Credentials Not Found

Ensure you've configured AWS credentials before the action:

```yaml
- uses: aws-actions/configure-aws-credentials@v5
  with:
    role-to-assume: ${{ secrets.AWS_ROLE_TO_ASSUME }}
    aws-region: ${{ secrets.AWS_REGION }}

- uses: macalbert/envilder/github-action@v1
  with:
    map-file: param-map.json
    env-file: .env
```

### Parameter Not Found

Verify that:

1. The SSM parameter path in `param-map.json` is correct
2. The parameter exists in AWS SSM Parameter Store
3. Your IAM role has permission to read the parameter

## Security Best Practices

1. **Use OIDC Authentication** - Prefer OIDC over long-lived access keys
2. **Scope IAM Permissions** - Limit `ssm:GetParameter` to specific parameter paths
3. **Use Encrypted Parameters** - Store secrets as `SecureString` type in SSM
4. **Review Parameter Mappings** - Ensure `param-map.json` doesn't contain actual secrets
5. **Enable CloudTrail** - Monitor SSM parameter access in AWS CloudTrail

## Publishing to GitHub Marketplace

For maintainers releasing new versions:

1. **Build the project:**

   ```bash
   npm ci
   npm run build
   ```

2. **Commit the `lib/` directory:**

   ```bash
   git add lib/
   git commit -m "chore: build for release v1.0.0"
   ```

3. **Create and push tags:**

   ```bash
   git tag -a v1.0.0 -m "Release v1.0.0"
   git tag -fa v1 -m "Update v1 to v1.0.0"
   git push origin v1.0.0
   git push origin v1 --force
   ```

The `lib/` directory **must be committed** for release tags so users can reference
`macalbert/envilder@v1` without needing to build the action themselves.

## Examples

See the [examples directory](examples/) for complete workflow examples:

- [Basic Pull Workflow](examples/pull-secrets-workflow.yml)
- [Multi-Environment Deployment](examples/multi-environment.yml)
- [Monorepo Setup](examples/monorepo.yml)

## Related Documentation

- [Pull Command Documentation](pull-command.md)
- [Push Command Documentation](push-command.md)
- [Requirements & Installation](requirements-installation.md)

## Support

If you encounter issues or have questions:

- [Open an issue](https://github.com/macalbert/envilder/issues)
- [View documentation](https://github.com/macalbert/envilder)
- [Check existing issues](https://github.com/macalbert/envilder/issues?q=is%3Aissue)

