# Envilder Python SDK

[![Coverage Report](https://img.shields.io/badge/coverage-report-green.svg)](https://macalbert.github.io/envilder/)
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

### Advanced usage

For full control over parsing, provider creation, and secret resolution:

```python
from envilder import (
    EnvilderClient,
    EnvilderOptions,
    MapFileParser,
    SecretProviderFactory,
    SecretProviderType,
)

with open('secrets-map.json', encoding='utf-8') as file:
    json_content = file.read()
map_file = MapFileParser().parse(json_content)

# Optional: override config at runtime
options = EnvilderOptions(
    provider=SecretProviderType.AZURE,
    vault_url='https://my-vault.vault.azure.net',
)
provider = SecretProviderFactory.create(map_file.config, options)

client = EnvilderClient(provider)
secrets = client.resolve_secrets(map_file)

EnvilderClient.inject_into_environment(secrets)
```

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
