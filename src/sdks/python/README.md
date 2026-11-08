# Envilder Python SDK

[![Coverage Report](https://img.shields.io/badge/coverage-report-green.svg)](https://macalbert.github.io/envilder/python/)
[![PyPI version](https://img.shields.io/pypi/v/envilder.svg)](https://pypi.org/project/envilder/)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/macalbert/envilder/blob/main/LICENSE)

Securely load environment variables from **AWS SSM Parameter Store** or **Azure Key Vault** directly into your Python application.
Zero vendor lock-in: secrets stay in your cloud.

Part of the [Envilder](https://github.com/macalbert/envilder) project.

## Prerequisites

- Python 3.11+
- **AWS provider**: AWS credentials configured (CLI, environment variables, or IAM role)
- **Azure provider**: Azure credentials via `az login`, managed identity, or environment variables

## Install

```bash
uv add envilder
# or
pip install envilder
```

## Quick Start

### One-liner

```python
from envilder import Envilder

# Resolve secrets and inject into os.environ
Envilder.load('envilder.json')

import os
print(os.environ['DB_PASSWORD'])
```

### Resolve without injecting

```python
from envilder import Envilder

secrets = Envilder.resolve_file('envilder.json')
print(secrets['DB_PASSWORD'])
```

### Azure Key Vault

Set the provider in the map file's `$config`; values are Key Vault secret names:

```json
{
  "$schema": "https://envilder.com/schema/map-file.v1.json",
  "$config": {
    "provider": "azure",
    "vaultUrl": "https://my-vault.vault.azure.net"
  },
  "DB_PASSWORD": "myapp-prod-db-password"
}
```

Values are sent to Key Vault as written, except that slashes become hyphens: a path-style value
such as `/myapp/prod/db-password` is read as `myapp-prod-db-password`, the same name the CLI pushes
it under.

The code is the same as for AWS. Credentials are resolved with `DefaultAzureCredential`
(`az login`, managed identity, or environment variables):

```python
import os

from envilder import Envilder

Envilder.load('envilder.json')

db_password = os.environ['DB_PASSWORD']
```

### Fluent builder (with overrides)

Override the map file's `$config` at runtime: useful for switching providers,
profiles, or vault URLs per environment:

```python
from envilder import Envilder, SecretProviderType

# Override provider + vault URL
secrets = (
    Envilder.from_map_file('envilder.json')
    .with_provider(SecretProviderType.AZURE)
    .with_vault_url('https://my-vault.vault.azure.net')
    .resolve()
)

# Override AWS profile and inject
(
    Envilder.from_map_file('envilder.json')
    .with_profile('staging')
    .inject()
)
```

### Environment-based loading

Route secret loading based on your current environment. Each environment
maps to its own secrets file (or `None` to skip loading):

```python
from envilder import Envilder
import os

env = os.getenv('APP_ENV', 'development')

# Resolve + inject into os.environ
Envilder.load(env, {
    'production': 'prod-secrets.json',
    'development': 'dev-secrets.json',
    'test': None,  # no secrets loaded
})
```

Resolve without injecting:

```python
secrets = Envilder.resolve_file(env, {
    'production': 'prod-secrets.json',
    'development': 'dev-secrets.json',
    'test': None,
})
```

Behaviour:

- If the environment maps to a file path, secrets are loaded from that file.
- If the environment maps to `None` or is not in the mapping, an empty dict
  is returned silently: no errors, no output.
- The environment name is stripped of leading/trailing whitespace before lookup.
- Empty or whitespace-only environment names raise `ValueError`.

### Secret validation

Opt-in validation ensures all resolved secrets have non-empty values:

```python
from envilder import Envilder, validate_secrets

secrets = Envilder.resolve_file('envilder.json')
validate_secrets(secrets)  # raises SecretValidationError if any value is empty
```

`validate_secrets()` checks that:

- The dictionary is not empty (raises `SecretValidationError` with empty `missing_keys`)
- Every value is non-None and non-whitespace (raises `SecretValidationError` listing the failing keys)
- Passes silently when all values are present

```python
from envilder import SecretValidationError, validate_secrets

try:
    validate_secrets(secrets)
except SecretValidationError as e:
    print(f"Missing: {', '.join(e.missing_keys)}")
```

### Map file contract validation

`validate_contract()` checks that a map file can be used without using or
printing any secret value: the map file matches the published schema (the same rules and
messages as `envilder validate --offline`), the provider configuration it
resolves to is coherent, and every declared secret exists. Builder overrides
(`with_provider()`, `with_profile()`, `with_vault_url()`) take precedence over
`$config`, as they do on a load.

```python
from envilder import Envilder

result = Envilder.from_map_file('envilder.json').validate_contract()

if not result.is_valid:
    for error in result.map_file_errors:
        print(f"{error.key}: {error.message}")
    for key in result.keys:
        print(f"{key.variable} ({key.path}): {key.status.value}")
```

Expected failures are reported in the result, not raised. When the map file is
invalid, `keys` is empty and no provider is created or called. A missing map
file still raises `FileNotFoundError`, as a load does.

To fail a load when the contract does not hold, opt in with
`with_contract_validation()`. The check runs once before resolving, reuses the
same provider for the resolution, and raises `ContractValidationError` (with
the full outcome in `.result`). It is off by default: without it a load makes
no extra provider call.

```python
from envilder import ContractValidationError, Envilder

try:
    Envilder.from_map_file('envilder.json').with_contract_validation().inject()
except ContractValidationError as e:
    print(e)  # Map file contract validation failed: DB_URL (/app/db): missing
    print(e.result.keys)
```

The message names the failing keys and paths, never a secret value.

Each `KeyCheck` carries one status (`SecretExistenceStatus`):

| Status | Meaning |
|--------|---------|
| `exists` | The secret is there and the identity can see it |
| `missing` | The provider answered that there is no such secret (a disabled Azure secret counts as missing) |
| `access_denied` | The identity may not check the secret, so whether it exists is unknown. Never reported as `missing` |
| `authentication_failed` | The provider rejected the credentials, or none were available (an expired AWS session includes the `aws sso login` remediation as `reason`) |
| `provider_error` | Anything else, for example an unreachable provider |

Required permissions (existence is checked without using any value):

- **AWS SSM**: `ssm:GetParameters` on the parameters. Values are requested
  without decryption, so `kms:Decrypt` is not needed. Plain `String` values can
  still come back in the response; the SDK discards them. With `kms:Decrypt`,
  `ssm:GetParameters` can read decrypted values, so grant it only on paths the
  identity may already read with `ssm:GetParameter`.
- **Azure Key Vault**: the `List` secret permission (access policies) or
  `Microsoft.KeyVault/vaults/secrets/readMetadata/action` (Azure RBAC, included
  in the Key Vault Secrets User role). Names are matched case-insensitively.

This differs from `validate_secrets()`: `validate_secrets()` runs after
resolution and checks that the resolved values are non-empty, while contract
validation runs before resolution, without using any value the provider
returns, and checks that the map file is valid and every declared secret exists.

### Advanced usage

Implement the `ISecretProvider` protocol to plug in a custom backend
(e.g., HashiCorp Vault, GCP Secret Manager):

```python
from envilder import EnvilderClient, ISecretProvider, MapFileParser


class MyCustomProvider(ISecretProvider):
    def get_secret(self, name: str) -> str | None:
        # fetch from your custom backend
        ...


with open('envilder.json', encoding='utf-8') as file:
    map_file = MapFileParser().parse(file.read())

provider = MyCustomProvider()
secrets = EnvilderClient(provider).resolve_secrets(map_file)
EnvilderClient.inject_into_environment(secrets)
```

### Custom provider in the fluent builder

`with_secret_provider()` hands the builder your own provider instance instead
of the one it would build from `$config`. The map file is still validated as
usual, so this is also the way to test your startup code against an in-memory
fake, with no cloud account, emulator or environment variables:

```python
from collections.abc import Collection, Mapping

from envilder import (
    Envilder,
    ISecretExistenceChecker,
    ISecretProvider,
    SecretExistence,
    SecretExistenceStatus,
)

FAKE_SECRETS = {"/app/db-url": "postgres://localhost/test"}


class InMemoryProvider(ISecretProvider, ISecretExistenceChecker):
    def get_secret(self, name: str) -> str | None:
        return FAKE_SECRETS.get(name)

    def check_secrets_exist(
        self, names: Collection[str]
    ) -> Mapping[str, SecretExistence]:
        return {
            name: SecretExistence(
                SecretExistenceStatus.EXISTS
                if name in FAKE_SECRETS
                else SecretExistenceStatus.MISSING
            )
            for name in names
        }


(
    Envilder.from_map_file("envilder.json")
    .with_secret_provider(InMemoryProvider())
    .with_contract_validation()
    .inject()
)
```

To take part in contract validation, the provider also implements
`ISecretExistenceChecker`. A provider that only implements `ISecretProvider`
still resolves secrets, but `validate_contract()` reports every key as
`provider_error`, so `with_contract_validation()` fails the load. The
`provider` field of each key keeps the configured type (`with_provider()`,
then `$config.provider`, then `aws`).

For a complete, runnable walkthrough, see
[`python-custom-provider`](https://github.com/macalbert/envilder-examples/tree/main/python-custom-provider)
in envilder-examples: a custom provider over a local AES-256-GCM encrypted
file, with tests for loading, failing at startup on a missing secret, and
validating the contract without decrypting anything.

## API Reference

### Static facade (`Envilder`)

| Method | Description |
|--------|-------------|
| `load(path)` | Resolve secrets and inject into `os.environ` |
| `resolve_file(path)` | Resolve secrets, return as `dict` |
| `load(env, mapping)` | Environment-based resolve + inject |
| `resolve_file(env, mapping)` | Environment-based resolve |
| `from_map_file(path)` | Returns fluent builder for configuration |

### Fluent builder (via `from_map_file()`)

| Method | Description |
|--------|-------------|
| `with_provider(type)` | Override secret provider (AWS/Azure) |
| `with_profile(name)` | Override AWS named profile |
| `with_vault_url(url)` | Override Azure Key Vault URL |
| `with_secret_provider(provider)` | Use your own `ISecretProvider` instance instead of building one from `$config` |
| `resolve()` | Resolve secrets, return as dict |
| `inject()` | Resolve + inject into `os.environ` |
| `validate_contract()` | Check the map file and that every declared secret exists, returns `ContractValidationResult` |
| `with_contract_validation()` | Run the check before `resolve()`/`inject()`, raising `ContractValidationError` on failure |

### Validation

| Function | Description |
|----------|-------------|
| `validate_secrets(dict)` | Raises `SecretValidationError` if any value is empty or dict is empty |
| `Envilder.from_map_file(path).validate_contract()` | Returns a `ContractValidationResult` (`is_valid`, `map_file_errors`, `keys`) |

## Map File Format

```json
{
  "$schema": "https://envilder.com/schema/map-file.v1.json",
  "$config": {
    "provider": "aws",
    "profile": "my-profile"
  },
  "DB_PASSWORD": "/app/prod/db-password",
  "API_KEY": "/app/prod/api-key"
}
```

Supported providers: `aws` (default), `azure`.

For Azure, add `vaultUrl`:

```json
{
  "$schema": "https://envilder.com/schema/map-file.v1.json",
  "$config": {
    "provider": "azure",
    "vaultUrl": "https://my-vault.vault.azure.net"
  },
  "DB_PASSWORD": "db-password",
  "API_KEY": "api-key"
}
```

### Keys and values

Keys follow the same rule as the CLI and the GitHub Action, so a key accepted by one is accepted by all:

- **Keys** may only contain letters, digits, `_`, `.`, `-` and `/` (`^[A-Za-z0-9_./-]+$`); `__proto__`
  is also rejected. `MapFileParser.parse` raises `ValueError` for any other key, before any secret is fetched.
  `/` is allowed for hierarchical names (`Database/Password`) and returned as-is.
- **Values** are the secret identifiers in the provider (SSM parameter name or Key Vault secret
  name) and must be JSON strings.
- **Secret contents** are returned exactly as the provider stores them. `resolve_file` / `resolve` keep them in
  memory; `load` / `inject` write them to the process environment, where the operating system cannot
  store `NUL` (`U+0000`) and Windows limits a variable to 32,767 characters.

See [Keys and Values: What Is Accepted](https://github.com/macalbert/envilder#keys-and-values-what-is-accepted)
for the full reference and the reasoning behind the rules.

## Examples

Runnable projects in [envilder-examples](https://github.com/macalbert/envilder-examples) resolve a map file
against AWS SSM and Azure Key Vault (emulated with LocalStack for AWS and LocalStack for Azure) and pass the values to
containers, with no `.env` file:

- [python-testcontainers](https://github.com/macalbert/envilder-examples/tree/main/python-testcontainers): pytest + Testcontainers

## Links

- [Changelog](https://github.com/macalbert/envilder/blob/main/docs/changelogs/sdk-python.md)
- [Official Website](https://envilder.com/docs/sdks/python/?utm_source=pypi&utm_medium=readme)

## License

MIT

## Development

### Setup

```bash
# From the repo root
make install-sdk-python
```

### Quality checks

```bash
make check-sdk-python    # black + isort + mypy (no changes)
make format-sdk-python   # auto-format
```

### Running tests

Unit tests run without any external dependencies:

```bash
cd tests/sdks/python
python -m pytest -v -m "not acceptance"
```

Acceptance tests require **Docker** and a **LocalStack auth token**:

```bash
export LOCALSTACK_AUTH_TOKEN=<your-token>
cd tests/sdks/python
python -m pytest -v -m acceptance
```

All tests:

```bash
make test-sdk-python
```
