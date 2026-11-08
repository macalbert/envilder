# Envilder: Validate Command

## Overview

`envilder validate` is a preflight check. It answers *"is this map file
valid, and can every declared secret be resolved with the current
credentials?"* before a pull, a push or `envilder exec` runs, locally or as a
CI step. It never prints a secret value.

```bash
envilder validate
envilder validate --map=config/envilder.json --profile=dev
envilder validate --provider=azure --vault-url=https://my-vault.vault.azure.net
envilder validate --offline
envilder validate --envfile=.env
envilder validate --envfile=.env --compare-values
envilder validate --format=json
```

By default, `validate` checks the map file and then asks the provider whether
each declared secret exists. With `--envfile`, it also compares the keys of a
local env file with the variables the map file declares, and with
`--compare-values` their values with the remote ones, printing only
`matches` or `differs`. With `--offline`, only local files are read: no
provider is called and no cloud credentials are needed. With `--format=json`,
the result is printed as one JSON document for CI and tooling.

## Usage

```text
envilder validate [--offline] [--envfile <path> [--compare-values]] [--format <text|json>] [--map <path>] [--provider <name>] [--profile <name>] [--vault-url <url>]
```

| Option | Description |
|--------|-------------|
| `--offline` | Validate the map file locally without calling the provider |
| `--envfile <path>` | Compare the keys of this env file with the map file. Not read unless given |
| `--compare-values` | Also compare each declared value in the env file with its remote value. Requires `--envfile`; cannot be combined with `--offline` |
| `--format <format>` | `text` (default) for human-readable output, or `json` for one JSON document on stdout. See [JSON output](#json-output) |
| `--map <path>` | Map file to check. Defaults to `envilder.json` in the current directory, as for pull and `exec` |
| `--provider <name>` | Provider to check against: `aws` or `azure`. Overrides `$config.provider` |
| `--profile <name>` | AWS CLI profile. Overrides `$config.profile` |
| `--vault-url <url>` | Azure Key Vault URL. Overrides `$config.vaultUrl` |

The options have the same names, defaults and precedence as pull and `exec`:
flags take precedence over `$config`, and an empty flag is ignored. Put them
after `validate`; options written before it are rejected. `--envfile` keeps
the name pull and push use, but `validate` only reads an env file when it is
given. As in push, an empty `--envfile` value is an error rather than ignored.

`--compare-values` without `--envfile`, or together with `--offline`, and a
`--format` other than `text` or `json` are rejected before any file is read or
any provider is called.

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

Every secret path declared in the map file is checked in the provider. Envilder
never uses or prints a value during this check. A path that several variables map to is checked once. Each
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

### The env file keys (with `--envfile`)

The env file is read with the same parser pull and push use, so comments,
blank lines, `export`, quotes and multiline quoted values are handled the
same way. Its keys are compared with the variables the map file declares, by
exact name (case-sensitive):

| Finding | Effect |
|---------|--------|
| A declared variable is absent from the env file | `missing from .env`, fails |
| A key is assigned more than once | `duplicated in .env`, fails |
| A key is only in the env file | `not declared in map file`, a warning that does not change the exit code |

`KEY=` with an empty value counts as present. A missing env file fails with
`Env file not found: <path>`. This check reads local files only: it runs
before any provider call, and with `--offline` too. Values are read by the
parser but neither compared nor printed.

### The env file values (with `--compare-values`)

For every declared variable that is both in the env file and `exists` in the
provider, the remote value is read with the same resolution path pull uses
and compared with the env file value. When a key repeats, the last assignment
is compared, as dotenv loads it. A remote secret with an empty value matches
`KEY=`. Each variable is reported as:

| Status | Meaning |
|--------|---------|
| `matches` | The two values are identical |
| `differs` | The two values are not identical. Fails |
| `unreadable` | The secret exists but its value could not be read, with the provider's reason. Fails |

Neither value is ever printed, and each remote value is dropped right after
the comparison. Variables already reported as missing (from the env file or
the provider) are not read. Reading values needs the same permissions as a pull, on top of the ones the
existence check needs. Without `--compare-values`, no value is read.

#### AWS SSM Parameter Store

The paths are checked with
[`GetParameters`](https://docs.aws.amazon.com/systems-manager/latest/APIReference/API_GetParameters.html),
ten per call, with `WithDecryption: false`: SecureString parameters are never
decrypted. `String` and `StringList` values still come back in the response;
they are discarded without being inspected or printed. Names that do not exist come
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

The existence check needs no `kms:Decrypt` permission. `--compare-values` reads
values as pull does, so it needs the same KMS access as pull: `kms:Decrypt` on
the key of each `SecureString` parameter encrypted with a customer managed key.
An identity that does
have `kms:Decrypt` can read decrypted values through `ssm:GetParameters`, so
grant it only on the paths that identity may already read with
`ssm:GetParameter`.

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

☁ AWS identity · account=123456789012 · region=eu-west-1 · profile=dev

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

With `--envfile=.env --compare-values` (exit code `1`):

```text
✓ Map file valid: envilder.json
Checking env file .env
  ✗ TOKEN  missing from .env
  ⚠ DEBUG  not declared in map file

Checking 3 secrets in aws, profile=dev
  ✓ DB_URL   /myapp/db-url   exists
  ✓ API_KEY  /myapp/api-key  exists
  ✓ TOKEN    /myapp/token    exists
Comparing 2 values with aws, profile=dev
  ✓ DB_URL   matches
  ✗ API_KEY  differs
✗ Validation failed: 1 missing from .env, 1 differs
```

When every declared variable is in the env file, the env file block ends with
`✓ All 3 declared variables are in .env`, and when every compared value
matches, the values block ends with `✓ All 2 values match`.

An invalid map file, on stderr:

```text
✗ Map file invalid: envilder.json (3 problems)
  • $config.region is not a known field. Allowed fields: provider, profile, vaultUrl, projectId, namespace, path, name, description, owner, environment.
  • DB_PORT must map to a string secret path, not a number.
  • $config.profile is only supported with the aws provider (current provider: azure).
```

## JSON output

With `--format=json`, `validate` prints exactly one JSON document to stdout and
nothing else, whatever the outcome. Logs, the AWS identity banner, warnings,
error messages and the SSO login prompt go to stderr, so stdout can be piped to
`jq` or saved as a CI artifact. The exit codes are the same as with text
output. Option errors, such as `--format=yaml`, are reported on stderr before
anything runs, without a document.

```json
{
  "valid": false,
  "offline": false,
  "mapFile": { "path": "envilder.json", "valid": true, "errors": [] },
  "keys": [
    { "name": "DB_URL", "provider": "aws", "path": "/myapp/db-url", "status": "exists" },
    { "name": "API_KEY", "provider": "aws", "path": "/myapp/api-key", "status": "exists" },
    {
      "name": "TOKEN",
      "provider": "aws",
      "path": "/myapp/token",
      "status": "access_denied",
      "reason": "User: arn:aws:sts::123456789012:assumed-role/dev/ci is not authorized to perform: ssm:GetParameters ..."
    }
  ],
  "envFile": {
    "path": ".env",
    "valid": false,
    "keys": [
      { "name": "DB_URL", "status": "present", "value": "matches" },
      { "name": "API_KEY", "status": "present", "value": "differs" },
      { "name": "TOKEN", "status": "missing" }
    ],
    "duplicates": [],
    "undeclared": ["DEBUG"]
  }
}
```

| Field | Description |
|-------|-------------|
| `valid` | `true` exactly when the exit code is `0` |
| `offline` | `true` with `--offline` |
| `mapFile` | `path`, `valid`, and `errors`: one `{ "key", "message" }` per problem, the same messages as the text output. Left out when the map file could not be read |
| `keys` | One entry per declared variable, in map file order: `name`, `provider` (`aws` or `azure`), `path`, `status` and, when the provider gave one, `reason`. `status` is `exists`, `missing`, `access_denied`, `authentication_failed` or `provider_error`. Left out when the secrets were not checked: with `--offline`, after an invalid map file, or when the run stopped first |
| `envFile` | Left out without `--envfile`. `path`, `valid`, `keys` (each declared variable with `status` `present` or `missing`, the variables in the env file first), `duplicates` (`{ "name", "count" }` for each key assigned more than once) and `undeclared` (keys only in the env file, warnings). With `--compare-values`, a compared key also has `value`: `matches`, `differs` or `unreadable` (with a `reason`) |
| `error` | `{ "message" }`, only when the run stopped before every check finished, for example expired credentials, a missing env file, or a declined SSO login. The sections that completed before it are still filled in |

The document never holds a secret value, local or remote: value comparison
only reports `matches`, `differs` or `unreadable`. No field is ever `null`: a
section that does not apply is left out. A section can gain fields
in later versions; existing fields keep their meaning.

## Exit codes

| Code | Meaning |
|------|---------|
| `0` | The map file is valid; without `--offline`, every declared secret exists; with `--envfile`, every declared variable is in the env file exactly once; with `--compare-values`, every compared value matches. Variables only in the env file are warnings and do not change it |
| `1` | Anything else: the map file is missing, is not valid JSON, breaks the schema or the provider rules, the options are invalid, a secret is missing or cannot be checked, the credentials are missing or expired, or the env file is missing, lacks a declared variable, repeats a key, or holds a value that differs or cannot be compared |

## In CI

```yaml
- name: Check the map file
  run: npx envilder validate --offline --map=envilder.json

- name: Check that every secret exists
  run: npx envilder validate --map=envilder.json
```

To check that a committed `.env.example` declares every variable without
credentials, add `--offline --envfile=.env.example` to the first step.

To keep the result for later steps or other tools, use JSON output; the step
still fails when validation fails:

```yaml
- name: Check that every secret exists
  run: npx envilder validate --map=envilder.json --format=json > validate.json
```

The offline step needs no cloud credentials, so it can run on every pull
request, including from forks. The second step needs the same credentials as
a pull, plus the permissions listed above.

## From the SDKs

The .NET, Python and Node.js SDKs run the same map file and key existence
check from application code, with the same statuses, without the env file
comparison:

| SDK | Check, returns a result | Fail the load when it does not pass |
|---|---|---|
| Node.js | `await Envilder.fromMapFile(path).validateContract()` | `.withContractValidation()` |
| Python | `Envilder.from_map_file(path).validate_contract()` | `.with_contract_validation()` |
| .NET | `await Env.FromMapFile(path).ValidateContractAsync(ct)` | `.WithContractValidation()` |

Details in the [Node.js](../src/sdks/nodejs/README.md),
[Python](../src/sdks/python/README.md) and
[.NET](../src/sdks/dotnet/README.md) SDK READMEs.

A custom provider passed to the builder with `withSecretProvider()`
(`with_secret_provider()`, `WithSecretProvider()`) takes part in this check
when it also implements `ISecretExistenceChecker`. Without it, every key is
reported as `provider_error`, so a load with contract validation fails.

## What validate does not do

- It never prints secret values, and it compares them only with
  `--compare-values`.
- In `--offline` mode it does not check that the secrets exist or that the
  credentials can read them.
- It does not fix the env file: it reports what to change.
- It does not check what the values look like (types, URLs, length).
