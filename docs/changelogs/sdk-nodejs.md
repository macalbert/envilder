## [0.3.1] - 2026-06-26

### Fixed

* **Honor the `profile` option for the AWS region, not just credentials** —
  When a profile was set via the `profile` option or `$config.profile`, the
  SDK applied it to credentials only; the AWS SDK fell back to the default
  profile's region and silently read SSM parameters from the wrong
  account-region. The SDK now sets `AWS_PROFILE` so the AWS SDK resolves both
  the profile's region and its (SSO-capable) credentials natively. Region
  resolution order is `AWS_REGION` > profile region > `us-east-1` fallback
  ([#382](https://github.com/macalbert/envilder/issues/382))

---

## [0.3.0] - 2026-05-31

### Changed

* **BREAKING: Require Node.js >= 22.12** — Aligns with the rest of the
  monorepo. Node 18 and 20 are EOL; Node 22 is the only active LTS
  ([#291](https://github.com/macalbert/envilder/pull/291))

* **Pin dependencies to minimum viable versions** — AWS SDK `^3.700.0`, Azure
  Identity `^4.5.0`, Azure Key Vault Secrets `^4.9.0` — avoids forcing
  consumers to upgrade their cloud SDKs (ADR-0009)
  ([#291](https://github.com/macalbert/envilder/pull/291))

### Dependencies

* Remove `rimraf` — replaced with zero-dependency `fs.rmSync` in clean script
  ([#291](https://github.com/macalbert/envilder/pull/291))

---

## [0.2.0] - 2026-05-03

### Added

* **Map-file JSON Schema support** — Map files can now include
  `"$schema": "https://envilder.com/schema/map-file.v1.json"` for IDE
  autocomplete and validation without affecting secret resolution

### Fixed

* **Reserved key filtering** — All `$`-prefixed keys are now excluded from
  variable mappings. Previously only `$config` was filtered
  ([#218](https://github.com/macalbert/envilder/pull/218))

---

## [0.1.1] - 2026-05-02

### Documentation

* Add Node.js SDK references to root README, website, and installation guide

## [0.1.0] - 2026-04-25

### Added

* **Initial release** — Node.js runtime SDK for loading secrets directly
  into `process.env` from a map file. Supports AWS SSM Parameter Store and
  Azure Key Vault
* **Envilder facade** — `load()`, `resolveFile()`, `fromMapFile()` fluent
  builder for one-liner or fine-grained secret loading
* **EnvilderClient** — Core resolver with `resolveSecrets()` and
  `injectIntoEnvironment()` for custom provider usage
* **MapFileParser** — Parse `$config` section and variable mappings from JSON
* **Secret validation** — Opt-in `validateSecrets()` throws
  `SecretValidationError` for empty or missing values
* **Environment-based routing** — Load different secret files per environment
  (production, development, test)
