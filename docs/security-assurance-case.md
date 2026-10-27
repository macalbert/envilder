# Security Requirements and Assurance Case

This document states what users can and cannot expect from Envilder in
terms of security, and argues why those expectations are met. It covers the
CLI, the GitHub Action and the .NET, Python and Node.js SDKs. For how to
report a vulnerability, see [SECURITY.md](./SECURITY.md).

## Security requirements

### What you can expect

- **Secrets stay in your store.** Envilder reads values from AWS SSM
  Parameter Store or Azure Key Vault and writes them only where you ask: a
  `.env` file, the environment of a child process (`envilder exec`) or your
  application's configuration (SDKs). It runs no server and sends values
  nowhere else.
- **Your identity, your permissions.** Envilder authenticates with the
  provider's standard credential chain (AWS profiles, SSO, OIDC; Azure
  `DefaultAzureCredential`). It can do exactly what those credentials allow,
  and nothing more.
- **No values in logs.** Envilder never prints resolved secret values. Error
  messages show masked parameter paths. In GitHub Actions, every resolved
  value is registered with `::add-mask::` before it is written or handed to a
  child process.
- **Encrypted transport.** All provider calls go through the official AWS and
  Azure SDKs over HTTPS, with TLS certificate verification on by default.
- **Safe `.env` output.** Variable names are checked against an allowlist so
  that a map file cannot inject extra assignments into the generated file,
  and values round-trip exactly.
- **Traceable packages.** npm and PyPI packages are published from GitHub
  Actions with signed build provenance (see
  [Verifying releases](./SECURITY.md#-verifying-releases)).

### What you cannot expect

- **Protection of the generated `.env` file.** Envilder writes the file with
  the default permissions of the current process. Restricting access to it,
  keeping it out of version control and deleting it when no longer needed is
  up to you.
- **Protection from a trusted-but-malicious map file.** The map file decides
  which secrets are fetched. Anyone who can change it in your repository can
  request any secret your credentials can read. Review map-file changes like
  code.
- **Protection of the child process.** `envilder exec` hands secrets to the
  command you run. What that command does with them is outside Envilder's
  control.
- **Encryption at rest or secret lifecycle management.** These stay with the
  cloud provider (KMS, Key Vault). Envilder does not encrypt, rotate or
  expire secrets.
- **Defence against a compromised machine or CI runner.** If the host running
  Envilder is compromised, so are the secrets it can read.

## Threat model

| Asset | Threat | Mitigation |
|-------|--------|------------|
| Secret values | Leak through console or CI logs | Values are never logged; paths are masked; `::add-mask::` in GitHub Actions |
| Secret values | Leak through a generated `.env` file committed or shared by mistake | Documentation in [SECURITY.md](./SECURITY.md) (`.gitignore`, file permissions); Secretlint in this repository |
| `.env` file integrity | A crafted variable name injects extra assignments | Allowlist `^[A-Za-z0-9_./-]+$` and rejection of `__proto__` (`EnvironmentVariableName.ts`) |
| Child process | Shell injection through `envilder exec` arguments | The command is spawned with `shell: false` (`CrossSpawnProcessRunner.ts`) |
| Cloud credentials | Over-privileged roles used by Envilder | Least-privilege IAM and RBAC guidance in [SECURITY.md](./SECURITY.md); OIDC recommended for CI |
| Published packages | Tampered package on a registry | Builds run only in GitHub Actions; npm provenance and PyPI attestations link each package to its source commit and workflow |
| Dependencies | Known-vulnerable third-party code | Dependabot, CodeQL and lockfiles for every workspace |

## Trust boundaries

1. **Host to cloud provider.** Envilder runs on a developer machine, a CI
   runner or inside an application, and calls the AWS or Azure API over TLS.
   The provider authorizes every call with the caller's own identity.
2. **Repository to Envilder.** The map file (`envilder.json`) and CLI flags
   come from the user's repository and command line. Their format is
   specified by the [map-file schema](../spec/map-file.v1.json), and every
   variable name is checked against an allowlist before anything is resolved
   or written.
3. **Envilder to output.** Resolved values cross into a `.env` file on disk,
   the environment of a child process or the application's configuration.
   After this point protection is the user's responsibility.
4. **Envilder to CI logs.** In GitHub Actions, everything written to stdout
   and stderr is visible in the job log; values are masked before any output
   that could contain them.
5. **Source to registry.** Releases are built and published by GitHub Actions
   workflows in this repository using OIDC, not by personal machines.

## Secure design principles applied

Following Saltzer and Schroeder:

| Principle | How Envilder applies it |
|-----------|-------------------------|
| Economy of mechanism | Hexagonal architecture with a pure domain and thin provider adapters ([architecture](./architecture/README.md)); no custom cryptography or networking |
| Fail-safe defaults | Unreadable map files and invalid variable names stop the run with an error; `envilder exec` does not start the command if masking fails in GitHub Actions |
| Complete mediation | Every read goes through the provider API, which checks permissions on each call; Envilder keeps no cache of secrets |
| Open design | All code, the map-file schema and the architecture decisions ([ADRs](./adr/)) are public |
| Separation of privilege | Pull and push are separate commands; read-only roles are enough for pull and the GitHub Action |
| Least privilege | Documentation recommends path-scoped IAM policies and scoped Key Vault access; release workflows authenticate with short-lived OIDC tokens instead of long-lived secrets |
| Least common mechanism | Each SDK is independent and runs in the caller's process; there is no shared service |
| Psychological acceptability | Zero-config defaults (`envilder` reads `envilder.json` and writes `.env`) and actionable error messages make the secure path the easy one |

## Common weaknesses countered

| Weakness (CWE) | Countermeasure |
|----------------|----------------|
| CWE-78 OS command injection | `envilder exec` passes the command and its arguments to the OS without a shell (`shell: false`) |
| CWE-93 / CWE-113 CRLF injection | Variable names are restricted to an allowlist; values are quoted and escaped so they round-trip exactly |
| CWE-20 Improper input validation | Variable names from map files and flags are checked against an allowlist; malformed map files are rejected |
| CWE-532 Sensitive information in logs | No value logging; masked paths; `::add-mask::` in GitHub Actions |
| CWE-798 Hard-coded credentials | No credentials in code or config; Secretlint runs in CI on this repository |
| CWE-295 Improper certificate validation | TLS verification is left to the official AWS and Azure SDKs, which verify certificates by default |
| CWE-1395 Vulnerable third-party components | Dependabot updates, CodeQL analysis and lockfiles |
| CWE-494 Download of code without integrity check | npm provenance and PyPI attestations for published packages |
| CWE-276 Incorrect default permissions | Known limitation: the `.env` file uses the process default permissions; users should restrict it (see above) |

## Verification

- Automated tests run on every pull request for each component, with
  statement coverage above 80% (see the
  [coverage dashboard](https://macalbert.github.io/envilder/)).
- Static analysis: CodeQL for JavaScript and TypeScript, Biome, `tsc`
  strict mode, mypy strict mode and `dotnet format`.
- This document is reviewed whenever a change affects the threat model,
  a trust boundary or the security requirements above.
