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
