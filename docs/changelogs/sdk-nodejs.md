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
