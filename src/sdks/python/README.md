# Envilder Python SDK

[![Coverage Report](https://img.shields.io/badge/coverage-report-green.svg)](https://macalbert.github.io/envilder/python/)
[![PyPI version](https://img.shields.io/pypi/v/envilder.svg)](https://pypi.org/project/envilder/)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/macalbert/envilder/blob/main/LICENSE)

Securely load environment variables from **AWS SSM Parameter Store** or **Azure Key Vault** directly into your Python application.
Zero vendor lock-in — secrets stay in your cloud.

Part of the [Envilder](https://github.com/macalbert/envilder) project.

## Prerequisites

- Python 3.10+
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
Envilder.load('secrets-map.json')

import os
print(os.environ['DB_PASSWORD'])
```

### Resolve without injecting

```python
from envilder import Envilder

secrets = Envilder.resolve_file('secrets-map.json')
print(secrets['DB_PASSWORD'])
```

### Fluent builder (with overrides)

Override the map file's `$config` at runtime — useful for switching providers,
profiles, or vault URLs per environment:

```python
from envilder import Envilder, SecretProviderType

# Override provider + vault URL
secrets = (
    Envilder.from_file('secrets-map.json')
    .with_provider(SecretProviderType.AZURE)
    .with_vault_url('https://my-vault.vault.azure.net')
    .resolve()
)

# Override AWS profile and inject
(
    Envilder.from_file('secrets-map.json')
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
  is returned silently — no errors, no output.
- The environment name is stripped of leading/trailing whitespace before lookup.
- Empty or whitespace-only environment names raise `ValueError`.

### Secret validation

Opt-in validation ensures all resolved secrets have non-empty values:

```python
from envilder import Envilder, validate_secrets

secrets = Envilder.resolve_file('secrets-map.json')
validate_secrets(secrets)  # raises SecretValidationError if any value is empty
```

`validate_secrets()` checks that:

- The dictionary is not empty (raises `SecretValidationError` with empty `missing_keys`)
- Every value is non-None and non-whitespace (raises `SecretValidationError` listing the failing keys)
- Passes silently when all values are present

```python
from envilder.application.secret_validation import (
    SecretValidationError,
    validate_secrets,
)

try:
    validate_secrets(secrets)
except SecretValidationError as e:
    print(f"Missing: {', '.join(e.missing_keys)}")
```

### Advanced usage

Implement the `ISecretProvider` protocol to plug in a custom backend
(e.g., HashiCorp Vault, GCP Secret Manager):

```python
from envilder import EnvilderClient, ISecretProvider, MapFileParser


class MyCustomProvider(ISecretProvider):
    def get_secret(self, name: str) -> str | None:
        # fetch from your custom backend
        ...


with open('secrets-map.json', encoding='utf-8') as file:
    map_file = MapFileParser().parse(file.read())

provider = MyCustomProvider()
secrets = EnvilderClient(provider).resolve_secrets(map_file)
EnvilderClient.inject_into_environment(secrets)
```

## API Reference

### Static facade (`Envilder`)

| Method | Description |
|--------|-------------|
| `load(path)` | Resolve secrets and inject into `os.environ` |
| `resolve_file(path)` | Resolve secrets, return as `dict` |
| `load(env, mapping)` | Environment-based resolve + inject |
| `resolve_file(env, mapping)` | Environment-based resolve |
| `from_file(path)` | Returns fluent builder for configuration |

### Fluent builder (via `from_file()`)

| Method | Description |
|--------|-------------|
| `with_provider(type)` | Override secret provider (AWS/Azure) |
| `with_profile(name)` | Override AWS named profile |
| `with_vault_url(url)` | Override Azure Key Vault URL |
| `resolve()` | Resolve secrets, return as dict |
| `inject()` | Resolve + inject into `os.environ` |

### Validation

| Function | Description |
|----------|-------------|
| `validate_secrets(dict)` | Raises `SecretValidationError` if any value is empty or dict is empty |

## Map File Format

```json
{
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
  "$config": {
    "provider": "azure",
    "vaultUrl": "https://my-vault.vault.azure.net"
  },
  "DB_PASSWORD": "db-password",
  "API_KEY": "api-key"
}
```

## Links

- [Changelog](https://github.com/macalbert/envilder/blob/main/docs/changelogs/sdk-python.md)
- [Official Website](https://envilder.com)

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
