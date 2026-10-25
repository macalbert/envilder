# Envilder: Push Command

## Overview

The push command uploads environment variables from a local `.env` file to your cloud provider (AWS SSM Parameter Store
or Azure Key Vault) using a mapping file.

![Push Mode Demo](https://github.com/user-attachments/assets/489b1270-9178-4c27-b92d-78a1ac7dc1cb)

## Usage

```bash
# Zero-config: uses envilder.json and .env by default
envilder --push
```

With explicit paths:

```bash
envilder --push --envfile=.env --map=envilder.json
```

### With AWS Profile

```bash
envilder --push --envfile=.env.prod --map=envilder.json --profile=prod-account
```

## Mapping File Example (`envilder.json`)

> 📖 See [Mapping File Format](../README.md#️-mapping-file-format) for the full reference on `$config` and provider options.

### AWS SSM (default)

```json
{
  "API_KEY": "/myapp/api/key",
  "DB_PASSWORD": "/myapp/db/password"
}
```

### Azure Key Vault (via `$config`)

Add `$config` to your map file to target Azure Key Vault:

```json
{
  "$config": {
    "provider": "azure",
    "vaultUrl": "https://my-vault.vault.azure.net"
  },
  "API_KEY": "myapp-prod-api-key",
  "DB_PASSWORD": "myapp-prod-db-password"
}
```

> CLI flags (`--provider`, `--vault-url`, `--profile`) override `$config` values in the map file.

## .env File Example

```dotenv
API_KEY=abc123
DB_PASSWORD=secret456
```

## What Happens

- Each variable found in both `.env` and mapping file is pushed to the corresponding secret path.
- No files are modified locally.
- Use `--provider=azure` or `$config.provider` in the map file to push to Azure Key Vault instead of AWS SSM.
- Use the `--vault-url` flag or `$config.vaultUrl` for the Azure Key Vault URL.
- Use the `--profile` flag for different AWS accounts (AWS only).

> **Permissions:** Your cloud identity must have write access to secrets.
> See [Set Up IAM Permissions](requirements-installation.md#4-set-up-iam-permissions) for AWS and Azure setup.

## Push Mode

Sync your local `.env` variables to your cloud provider using a mapping file and mapping JSON.

### How File-Based Push Works

```mermaid
graph LR
  A[.env File] --> |Variables & Values| B[Envilder]:::core
  C[Mapping File] --> |Secret Paths| B
  D[Cloud Credentials]:::cloud --> B
  B --> E[AWS SSM / Azure Key Vault]:::cloud

  classDef cloud fill:#ffcc66,color:#000000,stroke:#333,stroke-width:1.5px;
  classDef core fill:#1f3b57,color:#fff,stroke:#ccc,stroke-width:2px;
```

**Example:**
If your `.env` file contains:

```text
API_KEY=abc123
DB_PASSWORD=secret456
```

And your `envilder.json` file contains:

```json
{
  "API_KEY": "/myapp/api/key",
  "DB_PASSWORD": "/myapp/db/password"
}
```

Running this command (uses `envilder.json` and `.env` by default):

```bash
envilder --push
```

Or with explicit paths:

```bash
envilder --push --envfile=.env --map=envilder.json
```

Will push:

- Value `abc123` to SSM path `/myapp/api/key`
- Value `secret456` to SSM path `/myapp/db/password`

### Single Variable Push

Push a single environment variable directly to your cloud provider without using a `.env` file.

> **Provider resolution:** If the map file (`--map`, or `envilder.json` in the current directory)
> exists, its `$config` section (`provider`, `vaultUrl`, `profile`) is read and applied so the
> single push targets the same provider as the rest of your project. The resolved provider is
> logged before the push. When there is no map file, or with `--no-map-update`, AWS SSM is used
> unless you pass `--provider`. CLI flags always override `$config`.
>
> **Map file update:** A single push also records the mapping in the map file: `--map` if given,
> otherwise `./envilder.json`. Every run logs what happened to the file (`Created envilder.json`,
> `Added API_KEY to envilder.json` or `API_KEY already mapped in envilder.json, no changes`).
> Use `--no-map-update` to push without reading or writing any map file. See
> [Map file update](#map-file-update) below.

```mermaid
graph LR
  A[Command Line Arguments] --> B[Envilder]:::core
  C[Cloud Credentials]:::cloud --> B
  B --> D[AWS SSM / Azure Key Vault]:::cloud

  classDef cloud fill:#ffcc66,color:#000000,stroke:#333,stroke-width:1.5px;
  classDef core fill:#1f3b57,color:#fff,stroke:#ccc,stroke-width:2px;  
```

**Example:**

```bash
envilder --key=API_KEY --value=abc123 --secret-path=/myapp/api/key
```

Will push:

- Value `abc123` to secret path `/myapp/api/key`

When an `envilder.json` with an Azure `$config` is present in the current directory, the same command
targets Azure Key Vault automatically (logged as `Using configuration from envilder.json: provider=azure, ...`).
Pass `--provider`/`--vault-url` to override.

#### Map file update

After a single push, `envilder.json` (or the file passed with `--map`) is ready for `envilder` and `envilder exec`:

```bash
envilder --key=API_KEY --value=abc123 --secret-path=/myapp/api/key
envilder exec -- node app.mjs
```

- **New file:** created with the entry. For Azure it also gets `$config` with `provider` and `vaultUrl`.
  The AWS profile is never written. `$schema` is added only when the file name is not `envilder.json` or
  `envilder.*.json`: editors that use SchemaStore already validate those names.
- **Existing file:** the entry is appended at the end. Key order, indentation, line endings and the trailing
  newline are preserved, and `$config` is left untouched. `$schema` is not added to a file that lacks it.
- **Same variable, same path:** nothing is written.
- **Same variable, different path:** the command fails before pushing anything. Update the mapping by hand,
  or use `--no-map-update`.
- **Map file targets another provider or vault:** the secret is still pushed and a warning explains that the
  mapping was not added. The map file is not modified. Use `--map=<file>` to record it elsewhere.
- **Invalid JSON, or a `--map` whose directory does not exist:** the command fails before pushing.
- **Failed write or failed push:** the map file is restored to its previous content (or removed if this run
  created it). A failed write stops the command before anything is pushed.
- The secret value is never written to the map file.

> **Migration note:** Before this change, a single push never touched the file system. It now creates or
> updates `envilder.json` in the current directory by default. Pass `--no-map-update` to keep the previous
> behavior, for example in scripts that push from a directory where you do not want a map file.
> Local override files such as `envilder.local.json` are never written.

### Push Mode Options

| Option        | Description                                                |
|-------------- | ---------------------------------------------------------- |
| `--push`      | Required: Enables push mode                                |
| `--provider`  | Optional: Cloud provider `aws` (default) or `azure`        |
| `--vault-url` | Optional: Azure Key Vault URL (overrides `$config.vaultUrl`)|
| `--profile`   | Optional: AWS CLI profile to use (AWS only)                |
| `--envfile`   | Optional: Path to your local .env file (default: `.env`)   |
| `--map`       | Optional: Path to your parameter mapping JSON file (default: `envilder.json`) |

### Push Single Mode Options

| Option        | Description                                                |
|-------------- | ---------------------------------------------------------- |
| `--push`      | Optional: For single-variable push, `--key` + `--value` + `--secret-path` already activate push mode |
| `--provider`  | Optional: Cloud provider `aws` (default) or `azure`        |
| `--vault-url` | Optional: Azure Key Vault URL (overrides `$config.vaultUrl`)|
| `--profile`   | Optional: AWS CLI profile to use (AWS only)                |
| `--key`      | Required: Environment variable name                        |
| `--value`    | Required: Value to store in your cloud provider            |
| `--secret-path` | Required: Full secret path in your cloud provider       |
| `--map`       | Optional: Map file that is created or updated with the mapping and read for `$config` (default: `envilder.json`) |
| `--no-map-update` | Optional: Push without reading, creating or updating any map file; provider and vault come only from flags |

### Push Mode Examples

**Push from .env file (multiple variables, zero-config):**

```bash
envilder --push
```

With explicit paths:

```bash
envilder --push --envfile=.env --map=envilder.json
```

With AWS profile:

```bash
envilder --push --envfile=.env.prod --map=envilder.json --profile=prod-account
```

**Azure Key Vault (via `$config` in map file):**

```bash
envilder --push --envfile=.env --map=envilder.azure.json
```

**Azure Key Vault (via CLI flags):**

```bash
envilder --push --provider=azure --vault-url=https://my-vault.vault.azure.net --envfile=.env --map=envilder.json
```

**Single variable push:**

```bash
envilder --key=API_KEY --value=secret123 --secret-path=/my/path
```

With AWS profile:

```bash
envilder --key=API_KEY --value=secret123 --secret-path=/my/path --profile=dev
```

Without recording the mapping:

```bash
envilder --key=API_KEY --value=secret123 --secret-path=/my/path --no-map-update
```
