# Envilder Node.js SDK

[![Coverage Report](https://img.shields.io/badge/coverage-report-green.svg)](https://macalbert.github.io/envilder/nodejs/)
[![npm version](https://img.shields.io/npm/v/%40envilder/sdk.svg)](https://www.npmjs.com/package/@envilder/sdk)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/macalbert/envilder/blob/main/LICENSE)

Securely load environment variables from **AWS SSM Parameter Store** or **Azure Key Vault** directly into your Node.js application.
Zero vendor lock-in: secrets stay in your cloud.

Part of the [Envilder](https://github.com/macalbert/envilder) project.

## Prerequisites

- Node.js 22.12+
- **AWS provider**: AWS credentials configured (CLI, environment variables, or IAM role)
- **Azure provider**: Azure credentials via `az login`, managed identity, or environment variables

## Install

```bash
npm install @envilder/sdk
```

## Quick Start

### One-liner: resolve + inject

```typescript
import { Envilder } from '@envilder/sdk';

// Resolve secrets and inject into process.env
await Envilder.load('envilder.json');

console.log('DB_PASSWORD loaded:', !!process.env.DB_PASSWORD);
```

### Resolve without injecting

```typescript
import { Envilder } from '@envilder/sdk';

const secrets = await Envilder.resolveFile('envilder.json');
console.log(secrets.get('DB_PASSWORD')); // avoid logging secrets in production
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

```typescript
import { Envilder } from '@envilder/sdk';

await Envilder.load('envilder.json');

console.log('DB_PASSWORD loaded:', !!process.env.DB_PASSWORD);
```

### Fluent builder (with overrides)

Override the map file's `$config` at runtime: useful for switching providers,
profiles, or vault URLs per environment:

```typescript
import { Envilder, SecretProviderType } from '@envilder/sdk';

// Override provider + vault URL
const secrets = await Envilder.fromMapFile('envilder.json')
  .withProvider(SecretProviderType.Azure)
  .withVaultUrl('https://my-vault.vault.azure.net')
  .resolve();

// Override AWS profile and inject
await Envilder.fromMapFile('envilder.json')
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

const secrets = await Envilder.resolveFile('envilder.json');
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

### Map file contract validation

Check, before loading anything, that the map file is valid and that every
declared secret exists with the current credentials. No secret value is used
or returned. This is the same check as `envilder validate` in the CLI.

```typescript
import { Envilder } from '@envilder/sdk';

const result = await Envilder.fromMapFile('envilder.json').validateContract();

if (!result.isValid) {
  for (const error of result.mapFileErrors) {
    console.error(`${error.key}: ${error.message}`);
  }
  for (const key of result.keys.filter((k) => k.status !== 'exists')) {
    console.error(`${key.variable} (${key.provider} ${key.path}): ${key.status}`);
  }
}
```

`validateContract()` never throws for expected failures; they are reported in
the result:

- `mapFileErrors`: the map file does not match the
  [published schema](https://envilder.com/schema/map-file.v1.json) or its
  provider configuration cannot work (for example `vaultUrl` with AWS). When
  there are any, no provider is called and `keys` is empty.
- `keys`: one entry per variable with its `path`, `provider` and `status`:
  `exists`, `missing`, `access_denied` (the identity cannot check the secret,
  never reported as `missing`), `authentication_failed` or `provider_error`.
  `reason` explains the last three when the provider gave one.

To fail a load when the contract does not hold, opt in on the builder. The
check runs once before resolving and throws `ContractValidationError`, whose
message names the failing keys and paths (never their values) and whose
`result` holds the full outcome:

```typescript
await Envilder.fromMapFile('envilder.json')
  .withContractValidation()
  .inject(); // throws ContractValidationError if a key is missing
```

Without `withContractValidation()`, a load makes no extra provider call and
needs no extra permission. The check needs `ssm:GetParameters` on AWS (it
uses `GetParameters` in batches of ten with `WithDecryption: false`; plain
`String` values can still come back in the response and are discarded, and
with `kms:Decrypt` the same permission reads decrypted values, so scope it
like `ssm:GetParameter`) and, on
Azure Key Vault, the `List` secret permission (access policies) or
`Microsoft.KeyVault/vaults/secrets/readMetadata/action` (Azure RBAC, included
in Key Vault Secrets User), because it lists secret metadata instead of
reading values.

Contract validation and `validateSecrets()` answer different questions:
contract validation checks that the map file is valid and each declared secret
exists, before resolving; `validateSecrets()` checks that the values already
resolved are not empty.

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

const json = readFileSync('envilder.json', 'utf-8');
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
| `withContractValidation()` | Check the map file contract once before resolving; fail with `ContractValidationError` |
| `validateContract()` | Check the map file contract and return a `ContractValidationResult`, without loading |
| `resolve()` | Resolve secrets, return as `Map` |
| `inject()` | Resolve + inject into `process.env` |

### Validation

| Function | Description |
|----------|-------------|
| `validateSecrets(map)` | Throws `SecretValidationError` if any value is empty or map is empty |

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
  "DB_PASSWORD": "myapp-prod-db-password",
  "API_KEY": "myapp-prod-api-key"
}
```

### Keys and values

Keys follow the same rule as the CLI and the GitHub Action, so a key accepted by one is accepted by all:

- **Keys** may only contain letters, digits, `_`, `.`, `-` and `/` (`^[A-Za-z0-9_./-]+$`); `__proto__`
  is also rejected. `MapFileParser.parse` throws `Error` for any other key, before any secret is fetched.
  `/` is allowed for hierarchical names (`Database/Password`) and returned as-is.
- **Values** are the secret identifiers in the provider (SSM parameter name or Key Vault secret
  name) and must be JSON strings.
- **Secret contents** are returned exactly as the provider stores them. `resolveFile` / `resolve` keep them in
  memory; `load` / `inject` write them to the process environment, where the operating system cannot
  store `NUL` (`U+0000`) and Windows limits a variable to 32,767 characters.

See [Keys and Values: What Is Accepted](https://github.com/macalbert/envilder#keys-and-values-what-is-accepted)
for the full reference and the reasoning behind the rules.

See the [root README](https://github.com/macalbert/envilder#%EF%B8%8F-mapping-file-format) for the full map file reference.

## Examples

Runnable projects in [envilder-examples](https://github.com/macalbert/envilder-examples) resolve a map file
against AWS SSM and Azure Key Vault (emulated with LocalStack and Lowkey Vault) and pass the values to
containers, with no `.env` file:

- [typescript-testcontainers](https://github.com/macalbert/envilder-examples/tree/main/typescript-testcontainers): Vitest + Testcontainers
- [typescript-aspire](https://github.com/macalbert/envilder-examples/tree/main/typescript-aspire): Aspire TypeScript AppHost

## Links

- [Changelog](https://github.com/macalbert/envilder/blob/main/docs/changelogs/sdk-nodejs.md)
- [Official Website](https://envilder.com/docs/sdks/nodejs/?utm_source=npm&utm_medium=readme&utm_campaign=sdk)
