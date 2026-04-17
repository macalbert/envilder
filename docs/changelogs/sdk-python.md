## [0.3.2] - 2026-04-18

### Fixed

* **Delegate default AWS region resolution to boto3** — When no profile is set, the factory
  no longer manually resolves the region from environment variables. Instead it creates a plain
  `boto3.Session()` which uses the full AWS SDK resolution chain (env vars → `~/.aws/config` →
  instance metadata), correctly picking up the default config file settings
  ([#166](https://github.com/macalbert/envilder/pull/166))

---

## [0.3.1] - 2026-04-17

### Fixed

* **Remove `mypy-boto3-ssm` runtime dependency** — `AwsSsmSecretProvider` imported
  `mypy_boto3_ssm.SSMClient` at runtime, but the package is a dev-only type stub.
  Consumers installing `envilder` from PyPI got `ModuleNotFoundError`. Replaced with
  `botocore.client.BaseClient` which is already bundled with `boto3`
  ([#165](https://github.com/macalbert/envilder/pull/165))

---

## [0.3.0] - 2026-04-17

### Added

* **Environment-based loading** — `Envilder.load(env, env_mapping)` and
  `Envilder.resolve_file(env, env_mapping)` accept a dictionary mapping environment names to
  secrets-map file paths (or `None` to skip). Enables environment-aware secret loading without
  external branching logic ([#163](https://github.com/macalbert/envilder/pull/163))
* **Source validation** — Empty or whitespace-only file paths in `env_mapping` now raise
  `ValueError` with a descriptive message including the environment key

---

## [0.2.0] - 2026-04-16

### Added

* **Fluent API facade** — `Envilder` high-level entry point with `load()`, `resolve_file()`,
  and `from_file()` methods, plus fluent override methods (`with_provider()`, `with_vault_url()`,
  `with_profile()`) ([#161](https://github.com/macalbert/envilder/pull/161))
* **Facade docstrings** — All public methods on the `Envilder` facade now have docstrings with
  usage examples, improving IDE tooltips and `help()` output for external consumers

---

## [0.1.0] - 2026-04-14

### Added

* **Initial release** — Runtime library for loading secrets from AWS SSM Parameter Store or
  Azure Key Vault directly into Python applications
  ([#157](https://github.com/macalbert/envilder/pull/157))
* `Envilder` facade — High-level entry point with `load()`, `resolve_file()`, and `from_file()` methods
* `EnvilderClient` — Resolves secrets from a map-file and injects them into `os.environ`
* `MapFileParser` — Parses `param-map.json` files with `$config` section and variable mappings
* `SecretProviderFactory` — Creates the appropriate secret provider based on configuration
* `AwsSsmSecretProvider` — Fetches secrets from AWS SSM Parameter Store via boto3
* `AzureKeyVaultSecretProvider` — Fetches secrets from Azure Key Vault
* `EnvilderOptions` — Runtime overrides for provider, vault URL, and AWS profile
* Synchronous API — no async/await, uses boto3 natively
* Protocol-based ports — Python `Protocol` instead of ABC
* Python 3.10+ with full type annotations (`py.typed`)
* Published to PyPI as `envilder`

### Testing

* Unit tests with pytest using `Should_<Expected>_When_<Condition>` naming
* Acceptance tests with TestContainers (LocalStack for AWS, Lowkey Vault for Azure)
