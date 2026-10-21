# Security Policy

## 🔒 Supported Versions

We release patches for security vulnerabilities only in the latest version:

| Version | Supported          |
| ------- | ------------------ |
| Latest  | ✅ |
| Older   | ❌ |

## 🎯 Security Requirements

Envilder reads secrets from AWS SSM Parameter Store or Azure Key Vault with your own credentials and writes them only to the `.env` file, process environment or application configuration you ask for. It never logs secret values, runs no server and implements no cryptography of its own.

It does not protect the generated `.env` file, the command started by `envilder exec`, or a map file that someone with write access to your repository has changed. The full list of what you can and cannot expect, together with the threat model, trust boundaries and the reasoning behind them, is in the [Security Requirements and Assurance Case](./security-assurance-case.md).

## 🚨 Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

If you discover a security vulnerability in Envilder, please report it privately to help us address it before public disclosure.

### How to Report

Use either channel:

- **GitHub (preferred)**: [open a private security advisory](https://github.com/macalbert/envilder/security/advisories/new)
- **Email**: send details to <mac.albert@gmail.com> with the subject `[SECURITY] Envilder - [Brief Description]`

Please include:

- Description of the vulnerability
- Steps to reproduce the issue
- Potential impact
- Suggested fix (if available)
- Your contact information for follow-up

### What to Expect

- **Acknowledgment**: I aim to acknowledge every report within 14 days
- **Initial Assessment**: I'll provide an initial assessment and prioritize based on severity
- **Updates**: I'll keep you informed about the progress
- **Resolution**: I'll work to release a fix as soon as feasible (timeline depends on severity and complexity)
- **Credit**: You'll be credited in the security advisory (unless you prefer to remain anonymous)

**Note**: This is a solo open-source project maintained in my spare time. While I take security seriously,
response times may vary based on availability.

## 🛡️ Security Best Practices

When using Envilder, follow these security guidelines:

### AWS Credentials

**DO**:

- ✅ Use IAM roles with OIDC for GitHub Actions ([setup guide](https://docs.github.com/en/actions/security-for-github-actions/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services))
- ✅ Use temporary credentials when possible
- ✅ Follow the principle of least privilege

**DON'T**:

- ❌ Store AWS access keys in code or environment variables
- ❌ Share AWS credentials via Slack, email, or chat

### Azure Credentials

**DO**:

- ✅ Use workload identity federation (OIDC) for GitHub Actions ([setup guide](https://learn.microsoft.com/en-us/entra/workload-id/workload-identity-federation-create-trust-github))
- ✅ Use managed identities in Azure-hosted environments
- ✅ Scope Key Vault access to specific secrets and operations
- ✅ Set vault URL via `$config.vaultUrl` in your map file or `--vault-url` flag; never hardcode secrets in code

**DON'T**:

- ❌ Store Azure client secrets in code
- ❌ Use overly broad Key Vault access policies

### IAM Permissions

Envilder requires these cloud provider permissions:

#### AWS

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "Federated": "arn:aws:iam::123456123456:oidc-provider/token.actions.githubusercontent.com"
            },
            "Action": "sts:AssumeRoleWithWebIdentity",
            "Condition": {
                "StringLike": {
                    "token.actions.githubusercontent.com:sub": "repo:octo-org/octo-repo:*"
                },
                "StringEquals": {
                    "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
                }
            }
        }
    ]
}
```

**Recommendations**:

- Scope permissions to specific parameter paths (e.g., `/myapp/prod/*`)
- Use separate IAM roles for different environments (dev, staging, prod)
- Enable CloudTrail logging for audit trails

### Environment Files

**DO**:

- ✅ Add `.env` to `.gitignore`
- ✅ Use `.env.example` for documentation (without real values)
- ✅ Rotate secrets regularly

**DON'T**:

- ❌ Commit `.env` files to version control
- ❌ Share `.env` files via email or chat

### GitHub Actions

When using Envilder GitHub Action:

**DO**:

- ✅ Use OIDC authentication instead of static credentials ([OIDC setup guide](https://docs.github.com/en/actions/security-for-github-actions/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services))
- ✅ Pin action versions (e.g., `@v0.8.0` instead of `@main`)
- ✅ Review action code before using in production

**DON'T**:

- ❌ Store AWS credentials in GitHub Secrets (use OIDC roles)
- ❌ Use overly permissive IAM policies

## 🔏 Verifying Releases

Packages are built and published only by GitHub Actions workflows in this repository, using OIDC instead of long-lived registry tokens.

- **npm** (`envilder`, `@envilder/sdk`): published with [npm provenance](https://docs.npmjs.com/generating-provenance-statements), signed through Sigstore. After installing, run `npm audit signatures` in your project to verify the registry signatures and provenance attestations. The npm package page also links each version to the commit and workflow run that built it.
- **PyPI** (`envilder`): published with [PEP 740 attestations](https://docs.pypi.org/attestations/) through trusted publishing. The "Provenance" section of each file on PyPI shows the source repository and workflow. To verify locally:

  ```bash
  pip install pypi-attestations
  pypi-attestations verify pypi --repository https://github.com/macalbert/envilder pypi:envilder-<version>-py3-none-any.whl
  ```

- **NuGet** (`Envilder`): every package carries the NuGet.org repository signature, which you can check with `dotnet nuget verify Envilder.<version>.nupkg`.
- **GitHub Action**: referenced directly from this repository. For an immutable reference, pin the action to a full commit SHA instead of a tag.

## 🔍 Security Audits

This project uses:

- **Snyk**: Vulnerability scanning for dependencies
- **CodeQL**: Static analysis for security issues in the TypeScript code
- **Secretlint**: Prevents accidental secret commits
- **Biome**: Code quality and security linting
- **Dependabot**: Automated dependency updates

View current security status: [![Known Vulnerabilities](https://snyk.io/test/github/macalbert/envilder/badge.svg)](https://snyk.io/test/github/macalbert/envilder)

## 📋 Known Security Considerations

### AWS SSM Parameter Store

- Parameters are encrypted at rest using AWS KMS
- All API calls are logged in CloudTrail
- Access is controlled via IAM policies
- Supports versioning and automatic rotation

### Azure Key Vault

- Secrets are encrypted at rest using Azure-managed or customer-managed keys
- All access is logged in Azure Monitor and Activity Log
- Access is controlled via Azure RBAC or Key Vault access policies
- Supports secret versioning, expiration dates, and soft delete
- Network isolation available via private endpoints and firewall rules

### Local Environment Files

- Generated `.env` files contain sensitive data
- Ensure proper file permissions (e.g., `chmod 600 .env`)
- Delete or rotate secrets if `.env` is accidentally committed

## 🔗 Additional Resources

- [AWS SSM Security Best Practices](https://docs.aws.amazon.com/systems-manager/latest/userguide/security-best-practices.html)
- [GitHub Actions Security Hardening](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions)
- [OWASP Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)

## 📜 Disclosure Policy

When I receive a security vulnerability report:

1. I will confirm the vulnerability and determine its impact
2. I will develop and test a fix
3. I will release a security advisory and patched version
4. I will credit the reporter (unless anonymity is requested)

**Public Disclosure Timeline**:

- Critical vulnerabilities: Disclosed after patch is released
- Non-critical vulnerabilities: Coordinated disclosure with reasonable timeline based on severity

**Note**: As a solo maintainer working on this project in my spare time, I appreciate your
understanding regarding response and fix timelines.

Thank you for helping keep Envilder and its users safe! 🙏
