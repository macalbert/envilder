# Envilder Node.js SDK

[![Coverage Report](https://img.shields.io/badge/coverage-report-green.svg)](https://macalbert.github.io/envilder/nodejs/)
[![npm version](https://img.shields.io/npm/v/%40envilder/sdk.svg)](https://www.npmjs.com/package/@envilder/sdk)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/macalbert/envilder/blob/main/LICENSE)

Securely load environment variables from **AWS SSM Parameter Store** or **Azure Key Vault** directly into your Node.js application.
Zero vendor lock-in — secrets stay in your cloud.

Part of the [Envilder](https://github.com/macalbert/envilder) project.

## Prerequisites

- Node.js 20+
- **AWS provider**: AWS credentials configured (CLI, environment variables, or IAM role)
- **Azure provider**: Azure credentials via `az login`, managed identity, or environment variables

## Install

```bash
npm install @envilder/sdk
```

## Quick Start

### One-liner — resolve + inject

```typescript
import { Envilder } from '@envilder/sdk';

// Resolve secrets and inject into process.env
await Envilder.load('secrets-map.json');

console.log('DB_PASSWORD loaded:', !!process.env.DB_PASSWORD);
```

### Resolve without injecting

```typescript
import { Envilder } from '@envilder/sdk';

const secrets = await Envilder.resolveFile('secrets-map.json');
console.log(secrets.get('DB_PASSWORD')); // avoid logging secrets in production
```

### Fluent builder (with overrides)

Override the map file's `$config` at runtime — useful for switching providers,
profiles, or vault URLs per environment:

```typescript
import { Envilder, SecretProviderType } from '@envilder/sdk';

// Override provider + vault URL
const secrets = await Envilder.fromMapFile('secrets-map.json')
  .withProvider(SecretProviderType.Azure)
  .withVaultUrl('https://my-vault.vault.azure.net')
  .resolve();

// Override AWS profile and inject
await Envilder.fromMapFile('secrets-map.json')
  .withProfile('staging')
  .inject();
```

### Environment-based loading

Route secret loading based on your current environment. Each environment
maps to its own secrets file (or `null` to skip loading):

```typescript
import { Envilder } from '@envilder/sdk';

const env = process.env.APP_ENV ?? 'development';

// Resolve + inject into process.env
await Envilder.load(env, {
  production: 'prod-secrets.json',
  development: 'dev-secrets.json',
  test: null, // no secrets loaded
});
```

Resolve without injecting:

```typescript
const secrets = await Envilder.resolveFile(env, {
  production: 'prod-secrets.json',
  development: 'dev-secrets.json',
  test: null,
});
```

Behavior:

- If the environment maps to a file path, secrets are loaded from that file.
- If the environment maps to `null` or is not in the mapping, an empty `Map` is returned silently.
- Empty or whitespace-only environment names throw `Error`.

### Secret validation

Opt-in validation ensures all resolved secrets have non-empty values:

```typescript
import { Envilder, validateSecrets } from '@envilder/sdk';

const secrets = await Envilder.resolveFile('secrets-map.json');
validateSecrets(secrets); // throws SecretValidationError if any value is empty
```

`validateSecrets()` checks that:

- The map is not empty (throws `SecretValidationError` with empty `missingKeys`)
- Every value is non-empty (throws `SecretValidationError` listing the failing keys)
- Passes silently when all values are present

```typescript
import { SecretValidationError, validateSecrets } from '@envilder/sdk';

try {
  validateSecrets(secrets);
} catch (err) {
  if (err instanceof SecretValidationError) {
    console.log(`Missing: ${err.missingKeys.join(', ')}`);
  }
}
```

### Advanced usage

Implement the `ISecretProvider` interface to plug in a custom backend
(e.g., HashiCorp Vault, GCP Secret Manager):

```typescript
import {
  EnvilderClient,
  MapFileParser,
  type ISecretProvider,
} from '@envilder/sdk';
import { readFileSync } from 'node:fs';

class MyCustomProvider implements ISecretProvider {
  async getSecrets(names: string[]): Promise<Map<string, string>> {
    // fetch from your custom backend
    return new Map();
  }
}

const json = readFileSync('secrets-map.json', 'utf-8');
const mapFile = new MapFileParser().parse(json);

const provider = new MyCustomProvider();
const client = new EnvilderClient(provider);
const secrets = await client.resolveSecrets(mapFile);
EnvilderClient.injectIntoEnvironment(secrets);
```

## API Reference

### Static facade (`Envilder`)

| Method | Description |
|--------|-------------|
| `load(path)` | Resolve secrets and inject into `process.env` |
| `resolveFile(path)` | Resolve secrets, return as `Map<string, string>` |
| `load(env, mapping)` | Environment-based resolve + inject |
| `resolveFile(env, mapping)` | Environment-based resolve |
| `fromMapFile(path)` | Returns fluent builder for configuration |

### Fluent builder (via `fromMapFile()`)

| Method | Description |
|--------|-------------|
| `withProvider(type)` | Override secret provider (AWS/Azure) |
| `withProfile(name)` | Override AWS named profile |
| `withVaultUrl(url)` | Override Azure Key Vault URL |
| `resolve()` | Resolve secrets, return as `Map` |
| `inject()` | Resolve + inject into `process.env` |

### Validation

| Function | Description |
|----------|-------------|
| `validateSecrets(map)` | Throws `SecretValidationError` if any value is empty or map is empty |

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
  "DB_PASSWORD": "myapp-prod-db-password",
  "API_KEY": "myapp-prod-api-key"
}
```

See the [root README](https://github.com/macalbert/envilder#%EF%B8%8F-mapping-file-format) for the full map file reference.
