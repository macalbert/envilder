# Envilder: Validate Command

## Overview

`envilder validate` is a preflight check. It answers *"is this map file
valid, and can every declared secret be resolved with the current
credentials?"* before a pull, a push or `envilder exec` runs, locally or as a
CI step. It never reads or prints a secret value.

```bash
envilder validate
envilder validate --map=config/envilder.json --profile=dev
envilder validate --provider=azure --vault-url=https://my-vault.vault.azure.net
envilder validate --offline
```

By default, `validate` checks the map file and then asks the provider whether
each declared secret exists. With `--offline`, only the map file is read: no
provider is called and no cloud credentials are needed.

## Usage

```text
envilder validate [--offline] [--map <path>] [--provider <name>] [--profile <name>] [--vault-url <url>]
```

| Option | Description |
|--------|-------------|
| `--offline` | Validate the map file locally without calling the provider |
| `--map <path>` | Map file to check. Defaults to `envilder.json` in the current directory, as for pull and `exec` |
| `--provider <name>` | Provider to check against: `aws` or `azure`. Overrides `$config.provider` |
| `--profile <name>` | AWS CLI profile. Overrides `$config.profile` |
| `--vault-url <url>` | Azure Key Vault URL. Overrides `$config.vaultUrl` |

The options have the same names, defaults and precedence as pull and `exec`:
flags take precedence over `$config`, and an empty flag is ignored. Put them
after `validate`; options written before it are rejected.

## What is checked

### The map file (always)

1. **The file parses as JSON.** A parse error is reported with the file path
   and, when the parser gives one, the line and column. The text around the
   error is never quoted, because it can be a secret pasted into the file.
2. **The document matches the map file schema**
   ([`map-file.v1.json`](https://envilder.com/schema/map-file.v1.json)):
   - the root is a JSON object;
   - `$schema` is an absolute URI, and no other key starts with `$` besides
     `$schema` and `$config`;
   - `$config` is an object whose fields are all known (`provider`, `profile`,
     `vaultUrl`, `projectId`, `namespace`, `path`, `name`, `description`,
     `owner`, `environment`) and are strings, with `vaultUrl` an absolute URI;
   - every variable name only holds letters, digits, `_`, `.`, `-` and `/`,
     and is not `__proto__`;
   - every mapping is a string.
3. **The provider configuration is coherent**, after the flags are applied:
   - the provider is one Envilder can use (`aws` or `azure`);
   - `profile` is only set with `aws`;
   - `vaultUrl` is only set with `azure`;
   - `azure` has a `vaultUrl`.

These are the same messages that pull, push and `exec` use for the same
problems. Every problem found is reported, not only the first one, each with
the key that causes it (`$config.profile`, `--vault-url`, `DB_URL`, ...).
Messages name keys and types only, never mapped values.

When the map file is invalid, `validate` stops there: no provider is called,
with or without `--offline`.

### The remote keys (without `--offline`)

Every secret path declared in the map file is checked in the provider, without
reading its value. A path that several variables map to is checked once. Each
variable gets one of these statuses:

| Status | Meaning |
|--------|---------|
| `exists` | The secret exists and the identity can see it |
| `missing` | The provider answered that there is no such secret |
| `access denied` | The identity is not allowed to check the secret, so whether it exists is unknown. Never reported as `missing` |
| `authentication failed` | The provider rejected the credentials, or none could be found |
| `provider error` | Anything else, for example an unreachable provider or an invalid secret name |

Expired AWS credentials and expired AWS SSO sessions are reported with the
same message as pull and `exec`. On an interactive terminal, an expired SSO
session offers to run `aws sso login` and then retries, as pull does.

#### AWS SSM Parameter Store

The paths are checked with
[`GetParameters`](https://docs.aws.amazon.com/systems-manager/latest/APIReference/API_GetParameters.html),
ten per call, with `WithDecryption: false`: SecureString parameters are never
decrypted, and the values returned are ignored. Names that do not exist come
back in `InvalidParameters` and are reported as `missing`. When a call is
denied, each path in it is checked on its own, so `access denied` is reported
only for the paths the identity cannot read.

The identity needs `ssm:GetParameters` on the parameters. This is a separate
IAM action from the `ssm:GetParameter` that pull uses, so add it to the
policy, scoped to the same paths:

```json
{
  "Effect": "Allow",
  "Action": ["ssm:GetParameter", "ssm:GetParameters"],
  "Resource": "arn:aws:ssm:*:*:parameter/myapp/*"
}
```

No `kms:Decrypt` permission is needed for `validate`.

#### Azure Key Vault

The vault's secret names are listed once with
[`Get Secrets`](https://learn.microsoft.com/rest/api/keyvault/secrets/get-secrets/get-secrets),
which returns metadata only, and each declared name (after the usual `/` to `-`
translation) is matched against it, ignoring case as Key Vault does. A
disabled secret cannot be read by pull, so it is reported as `missing`.

Listing needs a permission that pull does not:

- **Azure RBAC:** `Microsoft.KeyVault/vaults/secrets/readMetadata/action`,
  which the built-in **Key Vault Secrets User** and **Key Vault Reader** roles
  include, assigned on the vault.
- **Access policies:** the `List` secret permission, besides `Get`.

Because the list covers the whole vault, an identity without it gets
`access denied` for every key, with the reason Key Vault returns.

## Output

Every secret exists (exit code `0`):

```text
✓ Map file valid: envilder.json
Checking 3 secrets in aws, profile=dev
  ✓ DB_URL        /myapp/db-url   exists
  ✓ DATABASE_URL  /myapp/db-url   exists
  ✓ API_KEY       /myapp/api-key  exists
✓ All 3 secrets exist
```

Some secrets are missing or cannot be checked (exit code `1`; the summary goes
to stderr):

```text
✓ Map file valid: envilder.json
Checking 3 secrets in aws, profile=dev
  ✓ DB_URL   /myapp/db-url   exists
  ✗ API_KEY  /myapp/api-key  missing
  ✗ TOKEN    /myapp/token    access denied (User: arn:aws:sts::123456789012:assumed-role/dev/ci is not authorized to perform: ssm:GetParameters ...)
✗ Validation failed: 1 missing, 1 access denied
```

With `--offline`:

```text
✓ Map file valid: envilder.json
  Remote validation skipped (--offline): no provider was called, so the secrets were not checked.
```

An invalid map file, on stderr:

```text
✗ Map file invalid: envilder.json (3 problems)
  • $config.region is not a known field. Allowed fields: provider, profile, vaultUrl, projectId, namespace, path, name, description, owner, environment.
  • DB_PORT must map to a string secret path, not a number.
  • $config.profile is only supported with the aws provider (current provider: azure).
```

## Exit codes

| Code | Meaning |
|------|---------|
| `0` | The map file is valid and, without `--offline`, every declared secret exists |
| `1` | Anything else: the map file is missing, is not valid JSON, breaks the schema or the provider rules, the options are invalid, a secret is missing or cannot be checked, or the credentials are missing or expired |

## In CI

```yaml
- name: Check the map file
  run: npx envilder validate --offline --map=envilder.json

- name: Check that every secret exists
  run: npx envilder validate --map=envilder.json
```

The offline step needs no cloud credentials, so it can run on every pull
request, including from forks. The second step needs the same credentials as
a pull, plus the permissions listed above.

## What validate does not do

- It does not read, compare or print secret values.
- In `--offline` mode it does not check that the secrets exist or that the
  credentials can read them.
- It does not check what the values look like (types, URLs, length).
