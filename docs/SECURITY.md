# Security Policy

## 🔒 Supported Versions

We release patches for security vulnerabilities only in the latest version:

| Version | Supported          |
| ------- | ------------------ |
| Latest  | ✅ |
| Older   | ❌ |

## 🚨 Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

If you discover a security vulnerability in Envilder, please report it privately to help us address it before public disclosure.

### How to Report

1. **Email**: Send details to <mac.albert@gmail.com>
2. **Subject**: `[SECURITY] Envilder - [Brief Description]`
3. **Include**:
   - Description of the vulnerability
   - Steps to reproduce the issue
   - Potential impact
   - Suggested fix (if available)
   - Your contact information for follow-up

### What to Expect

- **Acknowledgment**: I will acknowledge your email as soon as possible
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

### IAM Permissions

Envilder requires these AWS permissions:

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
- ✅ Pin action versions (e.g., `@v1.0.0` instead of `@main`)
- ✅ Review action code before using in production

**DON'T**:

- ❌ Store AWS credentials in GitHub Secrets (use OIDC roles)
- ❌ Use overly permissive IAM policies

## 🔍 Security Audits

This project uses:

- **Snyk**: Vulnerability scanning for dependencies
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
