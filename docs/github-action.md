# Envilder GitHub Action

## Overview

The Envilder GitHub Action loads secrets from AWS Systems Manager (SSM) Parameter Store or Azure
Key Vault into your GitHub Actions jobs. By default it exports them as environment variables for
the later steps of the job, without writing a `.env` file. It can also run a single command with
the secrets, or write a `.env` file when a tool needs one.

## Modes

| Mode | Inputs | Who can read the secrets | Writes a file |
|------|--------|--------------------------|---------------|
| Job environment (default) | `map-file` only | Every later step of the job | No |
| Command | `command` | Only that command and the processes it starts | No |
| `.env` file | `env-file` | Any step or tool that reads the file | Yes |

- **Job environment.** The action appends the secrets to the runner's `GITHUB_ENV` file, and
  the runner sets them in the environment of **every step after it in the same job**, including
  third-party actions, Docker container actions and steps running in a job `container:`. Steps
  read them as normal variables (`process.env.DB_PASSWORD`, `$DB_PASSWORD`,
  `${{ env.DB_PASSWORD }}`). Other jobs do not get them, and neither does a container you start
  yourself with `docker run` unless you pass them (`docker run -e DB_PASSWORD ...`).
- **Command.** The action runs the command with `bash` (like a `run:` step) and the secrets in
  its environment, and ends the step with the command's exit code. The secrets exist **only in
  that process**: they are not exported, so later steps never see them.
- **`.env` file.** The previous behavior: the action writes or updates the file. Use it only
  when a tool needs a file. `env-file` and `command` cannot be combined.

Job environment and command are fail-closed: if any secret is missing or empty, the step fails
and nothing is exported or passed to the command.

Because the action writes no `.env` file to the workspace, there is no workspace file for
artifacts, caches, Docker build contexts or commits to pick up by accident. The default mode
still writes the secrets to the runner's per-step `GITHUB_ENV` file in the runner's temporary
directory, outside the workspace, which the runner reads to set them in later steps and empties
at the end of the job. Treat the runner's
temporary files as sensitive, especially on self-hosted runners, where a failed cleanup can
leave them behind; `command` writes no file at all. Later tools can still write the variables
to files, and it does not protect against malicious code running in the same job, which can
read environment variables as easily as a file. For the smallest exposure, use `command`.

## Prerequisites

Before using this action, ensure you have:

### For AWS SSM (default)

1. **AWS Credentials** - Configured using `aws-actions/configure-aws-credentials`
2. **IAM Permissions** - Your AWS role must have `ssm:GetParameter` permission

### For Azure Key Vault

1. **Azure Credentials** - Configured using `azure/login`
2. **Key Vault Access** - Your identity must have `Get` secret permission
3. **Vault URL** - Set via `$config.vaultUrl` in your map file or `vault-url` action input

> **Note:** Use the published `macalbert/envilder/github-action@v0` tag directly.
> It includes the prebuilt action, so consumers do not need a build step.

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
          # No env-file: the secrets are environment variables of the later steps

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
    runs-on: ubuntu-latest
    environment: ${{ inputs.environment }}

    steps:
      - uses: actions/checkout@v5

      - uses: aws-actions/configure-aws-credentials@v5
        with:
          role-to-assume: ${{ secrets.AWS_ROLE_TO_ASSUME }}
          aws-region: us-east-1

      - uses: actions/setup-node@v6
        with:
          node-version: "22.x"
          cache: "pnpm"

      - run: pnpm install --frozen-lockfile
      - run: pnpm build

      - name: 🚀 Deploy with ${{ inputs.environment }} secrets
        uses: macalbert/envilder/github-action@v0
        with:
          map-file: config/${{ inputs.environment }}/envilder.json
          command: pnpm deploy   # the secrets exist only for this command
```

## Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `map-file` | Path to the JSON file mapping environment variables to secret paths | ✅ Yes | - |
| `env-file` | Path to a `.env` file to write instead of exporting to the job environment | ❌ No | - |
| `command` | Command to run with the secrets in its environment only (not exported). Cannot be combined with `env-file` | ❌ No | - |
| `provider` | Cloud provider to use: `aws` or `azure`. Can also be set via `$config.provider` in the map file. | ❌ No |`aws`|
| `vault-url` | Azure Key Vault URL (overrides `$config.vaultUrl` in map file) | ❌ No | - |

> **Azure:** When using `provider: azure`, provide the vault URL via the `vault-url` input
> or set `$config.vaultUrl` in your map file. Authentication uses Azure Default Credentials.

## Outputs

| Output | Description |
|--------|-------------|
| `env-file-path` | Path to the generated `.env` file (same as input `env-file`; empty without it) |

## Parameter Mapping File

Create an `envilder.json` file that maps environment variable names to secret paths in your cloud provider.

**AWS SSM (default):**

```json
{
  "DATABASE_URL": "/myapp/production/database-url",
  "API_KEY": "/myapp/production/api-key",
  "SECRET_TOKEN": "/myapp/production/secret-token"
}
```

**Azure Key Vault (via `$config`):**

```json
{
  "$config": {
    "provider": "azure",
    "vaultUrl": "https://my-vault.vault.azure.net"
  },
  "DATABASE_URL": "myapp-production-database-url",
  "API_KEY": "myapp-production-api-key",
  "SECRET_TOKEN": "myapp-production-secret-token"
}
```

> You can also set provider and vault URL via action inputs (`provider`, `vault-url`), which override `$config`.

## Troubleshooting

### Error: "Parameter not found"

- Verify the parameter exists in AWS SSM Parameter Store
- Check your IAM role has `ssm:GetParameter` permission for that parameter
- Ensure the parameter path in `envilder.json` is correct (case-sensitive)

### Error: "Unable to assume role"

- Verify your GitHub OIDC trust policy is configured correctly
- Check the role ARN is correct
- Ensure `id-token: write` permission is set in your workflow

### Azure: "SecretNotFound" or "VaultNotFound"

- Verify the vault URL is correct and accessible (e.g., `https://my-vault.vault.azure.net`)
- Check your Azure identity has **Key Vault Secrets User** role on the vault
- Ensure `azure/login` runs before the Envilder action step

### Generated `.env` file is empty

- Check that `envilder.json` exists and has valid JSON syntax
- Verify cloud credentials are configured before running the action
- Review GitHub Actions logs for specific error messages

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
      node-version: "22.x"
      cache: "pnpm"

  - name: 📦 Build the Envilder GitHub Action
    run: |
      pnpm install --frozen-lockfile
      pnpm build:gha

  - uses: aws-actions/configure-aws-credentials@v5
    with:
      role-to-assume: ${{ secrets.AWS_ROLE_TO_ASSUME }}
      aws-region: us-east-1

  - name: 🔐 Test Action (Local Reference)
    uses: ./github-action  # Reference action from current repo
    with:
      map-file: e2e/sample/envilder.json
      env-file: .env
```

> **Note:** The `pnpm build:gha` step is **only required for local development**
> after action source changes. Published tags include prebuilt code.

## Development Troubleshooting

### Error: "Envilder GitHub Action is not built!"

This error only occurs when using a local reference (`uses: ./github-action`) during development.

**Solution for development:**

```yaml
- run: pnpm install --frozen-lockfile
- run: pnpm build:gha
- uses: ./github-action  # Local reference requires build
  with:
    map-file: envilder.json
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

- uses: macalbert/envilder/github-action@v0
  with:
    map-file: envilder.json
    env-file: .env
```

### Parameter Not Found

Verify that:

1. The SSM parameter path in `envilder.json` is correct
2. The parameter exists in AWS SSM Parameter Store
3. Your IAM role has permission to read the parameter

## Security Best Practices

1. **Use OIDC Authentication** - Prefer OIDC over long-lived access keys
2. **Scope IAM Permissions** - Limit `ssm:GetParameter` to specific parameter paths
3. **Use Encrypted Parameters** - Store secrets as `SecureString` type in SSM
4. **Review Parameter Mappings** - Ensure `envilder.json` doesn't contain actual secrets
5. **Enable CloudTrail** - Monitor SSM parameter access in AWS CloudTrail

## Publishing a tagged GitHub Action release

For maintainers releasing new versions:

1. **Build the project:**

   ```bash
   pnpm install --frozen-lockfile
   pnpm build:gha
   ```

2. **Commit the action bundle referenced by `action.yml`:**

   ```bash
   git add action.yml github-action/dist/index.js
   git commit -m "chore: build GitHub Action release"
   ```

3. **Verify the committed bundle is current:**

   ```bash
   pnpm verify:gha
   ```

4. **Create the release tag and update the floating `v0` tag to the same commit:**

   ```bash
   release_tag=v0.x.y
   git tag -a "$release_tag" -m "Release $release_tag"
   git tag -fa v0 -m "Update v0 to $release_tag"
   git push origin "$release_tag"
   git push origin v0 --force
   ```

`github-action/dist/index.js` **must be committed** before tagging so users can reference
`macalbert/envilder/github-action@v0` without building the action themselves.

## Examples

Workflow examples are on this page:

- [Basic Example](#basic-example)
- [Multi-Environment Example](#multi-environment-example)

For runnable SDK and `envilder exec` setups (Testcontainers and Aspire, AWS SSM and
Azure Key Vault), see [envilder-examples](https://github.com/macalbert/envilder-examples).

## Related Documentation

- [Pull Command Documentation](pull-command.md)
- [Push Command Documentation](push-command.md)
- [Requirements & Installation](requirements-installation.md)

## Support

If you encounter issues or have questions:

- [Open an issue](https://github.com/macalbert/envilder/issues)
- [View documentation](https://github.com/macalbert/envilder)
- [Check existing issues](https://github.com/macalbert/envilder/issues?q=is%3Aissue)
