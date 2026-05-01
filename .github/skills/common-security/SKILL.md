---
name: common-security
description: >-
  Security guardrails for Envilder (CLI, GitHub Action, SDKs, CDK, website).
  Covers secret handling, credential hygiene, supply chain safety, input
  validation, and CI/CD security. Use when reviewing code for security,
  handling secrets, validating CLI input, or reviewing GitHub Actions workflows.
user-invocable: false
---

# Security Skill

Security guardrails adapted to the Envilder project: a CLI + GitHub Action +
multi-runtime SDK platform that manages secrets from AWS SSM and Azure Key Vault.

## When to Use

- Reviewing code that handles secrets or cloud credentials
- Adding new CLI options or GHA inputs that accept external data
- Reviewing GitHub Actions workflows for credential safety
- Adding new infrastructure (CDK stacks)
- Reviewing SDK code that interacts with cloud provider APIs
- Modifying the website (Astro) with user-visible content

## 1. Secret Handling

### Never Expose Secrets in Output

- **CLI/GHA**: Use `EnvironmentVariable.maskedValue` (shows last 3 chars) for logging
- **SDKs**: Never log resolved secret values — log only the key name
- **Tests**: Use `secrets-map.json` to resolve test tokens; never hardcode tokens
- **Website**: No secrets — it's a static site

### Storage Rules

| Context | Where secrets live | Never |
| ------- | ------------------ | ----- |
| Production | AWS SSM Parameter Store (encrypted) | In code, env vars, or config files |
| Production (Azure) | Azure Key Vault | In code or checked-in files |
| CI | GitHub Secrets → OIDC → SSM | As plaintext in workflow YAML |
| Local dev | AWS profile → SSM (via `secrets-map.json`) | In `.env` files committed to Git |
| Tests | TestContainers (LocalStack/Lowkey Vault) | Real credentials in test code |

### Secretlint Enforcement

Secretlint runs on every `pnpm lint` invocation and scans **all files** for
credential patterns (AWS keys, tokens, private keys). If Secretlint fails,
the commit is blocked.

## 2. Credential Hygiene in CI/CD

### GitHub Actions OIDC

- **Always** use `aws-actions/configure-aws-credentials` with `role-to-assume`
- **Never** store `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` as GitHub Secrets
- OIDC tokens are short-lived and scoped — no rotation needed

### GitHub Action Inputs

- GHA reads inputs from `process.env.INPUT_*` — validate before use
- The `map` input (file path) must be validated to prevent path traversal
- Never interpolate GHA inputs directly into shell commands

### Workflow Permissions

- Use minimal `permissions:` block in every workflow
- `contents: read` for checkout, `id-token: write` for OIDC
- Never use `permissions: write-all`

## 3. Input Validation

### CLI

- Commander validates option types — but validate semantic constraints:
  - `--map` path must exist and be a `.json` file
  - `--provider` must be one of `aws` | `azure` (case-insensitive)
  - `--vault-url` must be a valid HTTPS URL matching `*.vault.azure.net`
- Never pass CLI arguments to shell commands unsanitized
- Use custom domain errors (`InvalidArgumentError`) — not generic exceptions

### SDKs

- Map file paths: validate existence before parsing
- JSON parsing: handle malformed JSON gracefully (domain error, not stack trace)
- Provider names: strict enum matching, reject unknown values
- Cross-provider validation: profile + Azure → `InvalidArgumentError`

### Website

- Static site (Astro) — no user input at runtime
- Build-time i18n: translation keys are developer-controlled, not user-supplied

## 4. Supply Chain Security

### Dependency Pinning

| Stack | Mechanism | File |
| ----- | --------- | ---- |
| TypeScript | `pnpm-lock.yaml` + `catalog:` versions | `pnpm-workspace.yaml` |
| .NET | Central Package Management | `Directory.Packages.props` |
| Python | `uv.lock` (deterministic) | `uv.lock` |

### Rules

- Lock files **must** be committed — never `.gitignore` them
- Dependabot (or Renovate) configured for automatic dependency updates
- Review advisories on every dependency update PR
- `@vercel/ncc` bundles GHA — verify bundle is up-to-date (`pnpm verify:gha`)
- Pin GitHub Actions to full commit SHA (not `@v4` tags) in production workflows

### CDK

- Keep `aws-cdk-lib` up to date — security patches affect deployed infra
- CDK synth output (`cdk.out/`) is `.gitignored` — never commit CloudFormation templates

## 5. SDK-Specific Security

### AWS SSM Provider

- Always use `WithDecryption: true` for SecureString parameters
- Never log the decrypted parameter value
- Credential chain: SDK default chain (env vars → profile → instance role)
- If `profile` is specified, only use `CredentialProfileStoreChain` — don't mix

### Azure Key Vault Provider

- Use `DefaultAzureCredential` — never hardcode `clientId`/`clientSecret`
- Vault URL validation: must match `https://*.vault.azure.net`
- TLS certificate validation: enabled in production, only disabled in tests
  against Lowkey Vault (emulator)

### Cross-Provider

- `EnvilderOptions` overrides `$config` — validate that overrides don't
  introduce insecure combinations (e.g., disabling encryption)
- Missing secrets → `null`/`None` (silent). Validation is opt-in via
  `validateSecrets()` — document this to users clearly

## 6. Website Security

- Astro generates static HTML — no server-side injection possible
- External links: use `rel="noopener noreferrer"` on `target="_blank"` links
- No inline scripts or `dangerouslySetInnerHTML` equivalents
- CSP headers configured at CDN/CloudFront level (via CDK)

## 7. Testing Security

- Acceptance tests use emulators (LocalStack, Lowkey Vault) — never real
  cloud endpoints
- `LOCALSTACK_AUTH_TOKEN` resolved via Envilder itself (dogfooding) — stored
  in SSM, never in code
- Test cleanup: containers destroyed after test run (TestContainers lifecycle)
- TLS disabled only for Lowkey Vault container tests (self-signed cert)

## Quick Security Checklist

Before merging any PR, verify:

- [ ] No secrets hardcoded in code, config, or test files
- [ ] Secretlint passes (`pnpm lint`)
- [ ] CLI/SDK input validated with domain errors (not generic exceptions)
- [ ] Cloud credentials use OIDC (CI) or SDK default chain (runtime)
- [ ] Secrets logged only via `maskedValue` (last 3 chars visible)
- [ ] Lock files updated if dependencies changed
- [ ] GHA workflows use minimal `permissions:`
- [ ] No `shell=True` or unsanitized argument interpolation in scripts
