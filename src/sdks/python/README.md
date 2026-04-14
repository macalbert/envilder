# Envilder Python SDK

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

### Direct usage

```python
from envilder import (
    EnvilderClient,
    MapFileParser,
    SecretProviderFactory,
)

json_content = open('secrets-map.json').read()
map_file = MapFileParser().parse(json_content)
provider = SecretProviderFactory.create(map_file.config)
client = EnvilderClient(provider)
secrets = client.resolve_secrets(map_file)

print(secrets['DB_PASSWORD'])
```

### Inject into environment

```python
EnvilderClient.inject_into_environment(secrets)

import os
print(os.environ['DB_PASSWORD'])
```

### With runtime overrides (EnvilderOptions)

Override the map file's `$config` at runtime — useful for switching providers per environment:

```python
from envilder import EnvilderOptions, SecretProviderType

options = EnvilderOptions(
    provider=SecretProviderType.AZURE,
    vault_url='https://my-vault.vault.azure.net',
)
provider = SecretProviderFactory.create(map_file.config, options)
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
