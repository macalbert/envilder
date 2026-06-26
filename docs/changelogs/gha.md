## [0.13.0] - 2026-06-26

### Added

* **Colorized `AWS identity` banner** — The
  `AWS identity → account=… region=… profile=…` line is now colorized.
  `account` and `region` render in red when they resolve to `unknown`,
  signalling that authentication failed
  ([#382](https://github.com/macalbert/envilder/issues/382))

### Changed

* **Print the `AWS identity` banner before resolving secrets** — The
  banner is now printed before secrets are resolved, so it always
  appears first. Previously it could surface mid-output because secrets
  resolve in parallel
  ([#382](https://github.com/macalbert/envilder/issues/382))

### Fixed

* **Clear error for expired or invalid AWS credentials** — Expired or
  invalid AWS credentials (e.g. an expired SSO session) now produce a
  clear, actionable `ExpiredCredentialsError` during the pull, telling
  you to refresh credentials (e.g. run `aws sso login`), instead of
  being masked as a misleading `ParameterNotFound`

---

## [0.12.1] - 2026-06-26

### Fixed

* **Honor `$config.profile` for the AWS region, not just credentials** —
  When a map file set an AWS profile via `$config.profile`, the action
  applied it to credentials only; the AWS SDK fell back to the default
  profile's region and silently read SSM parameters from the wrong
  account-region. The action now sets `AWS_PROFILE` so the AWS SDK resolves
  both the profile's region and its (SSO-capable) credentials natively.
  Region resolution order is `AWS_REGION` > `AWS_DEFAULT_REGION` >
  profile region > `us-east-1` fallback
  ([#382](https://github.com/macalbert/envilder/issues/382))

### Added

* **Log the effective AWS identity before resolving secrets** —
  Before the first read, the action logs
  `☁ AWS identity · account=… · region=… · profile=…` so a misrouted account
  or region is immediately visible. The account is read from the active
  credentials, falling back to an STS `GetCallerIdentity` call when not
  present, then `unknown`
  ([#382](https://github.com/macalbert/envilder/issues/382))

---

## [0.12.0] - 2026-06-26

### Changed

* **Preserve existing `.env` formatting on pull** — When the target `.env`
  file already exists, the action now updates values in place instead of
  rewriting the file from scratch. Full-line comments, blank lines, key
  ordering, `export` prefixes, and surrounding spacing are preserved; only
  the values of mapped keys are replaced, and new keys are appended at the
  end. (Inline comments after a value, e.g. `KEY=val # note`, are not
  preserved.)

### Dependencies

* Bundle updated with latest CLI core

---

## [0.11.0] - 2026-05-31

### Changed

* **BREAKING: Require Node.js >= 22.12** — GitHub Actions workflows updated
  to use `node-version: "22.x"`. The bundled CLI now requires Node.js 22.12+
  ([#291](https://github.com/macalbert/envilder/pull/291))

### Dependencies

* Bundle updated with latest CLI core (all dependencies at latest)

---

## [0.10.0] - 2026-05-03

### Fixed

* **Reserved key filtering** — `$schema` and other `$`-prefixed keys no longer
  leak into environment variable mappings
  ([#218](https://github.com/macalbert/envilder/pull/218))

### Dependencies

* Bundle updated with latest CLI core (map-file schema support)

---

## [0.9.4] - 2026-05-03

### Fixed

* Rebuild stale dist and remove force-tracked build artifacts (#193)

### Dependencies

* Bundle updated with latest CLI core (dependency bumps)

---

## [0.9.3] - 2026-04-17

### Changed

* Bundle updated with latest CLI core (runtime SDKs announcement, dependency bumps)

### Fixed

* **ci(publish-npm):** Narrowed `paths` filter from `src/**` to
  `src/envilder/**` so SDK/website/IaC changes no longer trigger the
  npm publish workflow

---

## [0.9.2] - 2026-04-02

### Changed

* Bundle updated with latest CLI core (Azure Key Vault, `$config` map-file support)

---

## [0.8.0] - 2026-03-22

### Added

* **Azure Key Vault support** — Use `provider: azure` input to pull secrets from Azure Key Vault
* New input `vault-url` — Azure Key Vault URL, overrides `$config.vaultUrl` in the map file
* New input `provider` — Select cloud provider (`aws` or `azure`, default: `aws`)
* `$config` section support in map files — declare provider and connection details inline

### Changed

* Updated `action.yml` description and inputs to reflect multi-provider support
* Both CLI and GHA now use shared `ContainerConfiguration` module for DI setup

---

## [0.7.1] - 2025-11-16

### Documentation

* Update GitHub Action version from v1 to v0.7.1 in documentation
* Fix example version references

---

## [0.7.0] - 2025-11-16

### Added

* **Initial GitHub Action release** — Use Envilder in CI/CD workflows natively
* Pull secrets from AWS SSM Parameter Store into `.env` files during workflow runs
* End-to-end tests for GitHub Actions simulation

### Changed

* Action moved to `github-action/` subfolder

### Breaking Changes

* Action path changed from `macalbert/envilder@v1` to `macalbert/envilder/github-action@v1`
