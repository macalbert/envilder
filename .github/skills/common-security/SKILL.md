---
name: common-security
description: Security guardrails covering OWASP Top 10 adapted to this stack (.NET, Python, TypeScript). Use when reviewing code for security, implementing authentication/authorization, handling secrets, validating input, or configuring CORS.
---

# Security Skill

Security guardrails for the M47 monorepo. Covers OWASP Top 10 risks adapted to the
.NET + Python + TypeScript stack.

## When to Use

- Reviewing code for security vulnerabilities
- Implementing authentication or authorization
- Handling secrets or sensitive configuration
- Validating user input
- Configuring CORS or HTTP security headers
- Creating API endpoints that accept external data

## OWASP Top 10 — Stack-Specific Guidance

### 1. Broken Access Control

**Authentication patterns in this repo:**

- **Cognito OAuth + JWT Cookie** — Federated login via AWS Cognito, JWT validated server-side
- **API Key** — Header-based for service-to-service calls
- **Environment-aware policies** — Development allows all; Production enforces real auth

**Rules:**

- Every API endpoint must have `.RequireAuthorization()` with a named policy
- Never skip authorization in production — use `AuthConstants` policy names
- Python Lambda: validate the event source (Function URL signature, API Gateway context)
- Frontend: never store tokens in localStorage — use HTTP-only secure cookies

### 2. Cryptographic Failures

**Rules:**

- Secrets go in **AWS SSM Parameter Store** (Production) — never in appsettings, env vars, or code
- Development uses `appsettings.Development.json` with non-sensitive mock values
- Cognito `ClientSecret`, JWT signing keys, Loggly tokens: always SSM in Production
- Database credentials: AWS Secrets Manager (generated via CDK, not manually set)
- Never log secrets, tokens, or passwords — use structured logging with safe property names

### 3. Injection

**SQL Injection:**

- EF Core parametrizes all LINQ queries automatically — never use `FromSqlRaw()` with concatenation
- If raw SQL is needed, use `FromSqlInterpolated()` (parametrized) — never string concat

```csharp
// GOOD
context.Processes.FromSqlInterpolated($"SELECT * FROM Process WHERE Id = {id}");

// BAD — never do this
context.Processes.FromSqlRaw($"SELECT * FROM Process WHERE Id = '{id}'");
```

**XSS:**

- React escapes output by default — never use `dangerouslySetInnerHTML`
- Sanitize any user-provided HTML before rendering
- API responses should set `Content-Type: application/json` — never return raw HTML from APIs

**Command Injection:**

- Python: never use `os.system()` or `subprocess.run(shell=True)` with user input
- .NET: never use `Process.Start()` with unsanitized arguments

### 4. Insecure Design

**Rules:**

- Clean Architecture enforces security boundaries by design:
  - Domain layer has zero external dependencies (no I/O, no HTTP, no SDK)
  - Infrastructure layer implements ports — security validation happens at boundaries
  - Presentation layer validates input before dispatching to Application
- FluentValidation on every request DTO — never trust input from external sources
- Rate limiting on public endpoints (configure in CDK or middleware)

### 5. Security Misconfiguration

**CORS:**

- **WithCredentials** policy: specific origins from config, credentials allowed
- **AnyOrigin** policy: public endpoints only (no credentials)
- Never use `AllowAnyOrigin()` + `AllowCredentials()` together — browsers reject this
- Origins loaded from `appsettings.json` `Cors:AllowedOrigins` — configure per environment

**HTTP Headers:**

- Use HSTS in production
- Set `X-Content-Type-Options: nosniff`
- Set `X-Frame-Options: DENY` for API endpoints

**Error Responses:**

- `UnhandledExceptionMiddleware` returns structured errors without stack traces in production
- Never expose internal exception details to the client

### 6. Vulnerable and Outdated Components

**Rules:**

- Dependabot configured for automatic dependency updates
- Review NuGet, pip, and npm advisories on every PR
- Pin exact versions in `Directory.Packages.props` (.NET), `pyproject.toml` (Python)
- CDK: keep `aws-cdk-lib` up to date — security patches affect deployed infrastructure

### 7. Identification and Authentication Failures

**Rules:**

- JWT tokens must be validated (issuer, audience, expiry, signature)
- API keys: compare with constant-time comparison (`CryptographicOperations.FixedTimeEquals`)
- Session timeout: configure token expiry in Cognito (not infinite)
- Never implement custom password hashing — delegate to Cognito

### 8. Software and Data Integrity Failures

**Rules:**

- GitHub Actions: use OIDC federation for AWS (no stored credentials)
- Lock files committed: `pnpm-lock.yaml`, `Directory.Packages.props`
- Verify checksums for external downloads in Dockerfiles
- CDK: use CDK Nag or similar for best-practice validation

### 9. Security Logging and Monitoring Failures

**Rules:**

- Log authentication failures (failed logins, invalid tokens, rejected API keys)
- Log authorization failures (access denied to resources)
- Include correlation context: `ClaimId`, `ProcessId`, `UserId` where applicable
- Never log sensitive data (passwords, tokens, full credit card numbers)
- Serilog enrichers: `FromLogContext()`, `WithExceptionDetails()`, `WithMachineName()`

See `common-observability` skill for the Structured Log Key Contract, PascalCase key naming
rules, and the full list of mandatory/contextual log properties.

### 10. Server-Side Request Forgery (SSRF)

**Rules:**

- Never pass user-supplied URLs directly to `HttpClient` or `httpx`
- Validate URLs against an allowlist of known hosts/domains
- Lambda functions: restrict outbound with VPC security groups
- S3 pre-signed URLs: set short expiry, validate bucket/key patterns

## Quick Security Checklist

Before merging any PR, verify:

- [ ] All endpoints have `.RequireAuthorization()` with appropriate policy
- [ ] All request DTOs have FluentValidation validators
- [ ] No secrets hardcoded in code or config files
- [ ] No `FromSqlRaw()` with string concatenation
- [ ] No `dangerouslySetInnerHTML` without sanitization
- [ ] CORS configured with specific origins (not `*` with credentials)
- [ ] Error responses don't leak stack traces or internal details
- [ ] Sensitive operations are logged (auth events, data access)
