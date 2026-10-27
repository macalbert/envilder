# Envilder: Validate Command

## Overview

`envilder validate` is a preflight check for the map file. It answers *"is
this map file valid?"* before a pull, a push or `envilder exec` runs, locally
or as a CI step, and it never prints a secret value.

```bash
envilder validate --offline
envilder validate --offline --map=config/envilder.json
envilder validate --offline --provider=azure --vault-url=https://my-vault.vault.azure.net
```

With `--offline`, only the map file is read: no provider is called and no
cloud credentials are needed.

> **Status:** `--offline` is the only mode available today. Checking that each
> declared secret exists in the provider with the current credentials is
> planned ([#558](https://github.com/macalbert/envilder/issues/558)). Until
> then, `envilder validate` without `--offline` fails with a message that
> points to `--offline`.

## Usage

```text
envilder validate --offline [--map <path>] [--provider <name>] [--profile <name>] [--vault-url <url>]
```

| Option | Description |
|--------|-------------|
| `--offline` | Validate the map file locally without calling the provider. Required for now |
| `--map <path>` | Map file to check. Defaults to `envilder.json` in the current directory, as for pull and `exec` |
| `--provider <name>` | Provider to check against: `aws` or `azure`. Overrides `$config.provider` |
| `--profile <name>` | AWS CLI profile. Overrides `$config.profile` |
| `--vault-url <url>` | Azure Key Vault URL. Overrides `$config.vaultUrl` |

The options have the same names, defaults and precedence as pull and `exec`:
flags take precedence over `$config`, and an empty flag is ignored. Put them
after `validate`; options written before it are rejected.

## What is checked

1. **The file parses as JSON.** A parse error is reported with the file path
   and, when the parser gives one, the line and column. The text around the
   error is never quoted, because it can be a secret pasted into the file.
2. **The document matches the map file schema**
   ([`spec/map-file.v1.json`](../spec/map-file.v1.json)):
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
problems.

Every problem found is reported, not only the first one, each with the key
that causes it (`$config.profile`, `--vault-url`, `DB_URL`, ...). Messages
name keys and types only, never mapped values.

## Output

A valid map file:

```text
✓ Map file valid: envilder.json
  Remote validation skipped (--offline): no provider was called, so the secrets were not checked.
```

An invalid one, on stderr:

```text
✗ Map file invalid: envilder.json (3 problems)
  • $config.region is not a known field. Allowed fields: provider, profile, vaultUrl, projectId, namespace, path, name, description, owner, environment.
  • DB_PORT must map to a string secret path, not a number.
  • $config.profile is only supported with the aws provider (current provider: azure).
```

## Exit codes

| Code | Meaning |
|------|---------|
| `0` | The map file is valid |
| `1` | The map file is missing, is not valid JSON, breaks the schema or the provider rules, or the options are invalid |

## In CI

```yaml
- name: Check the map file
  run: npx envilder validate --offline --map=envilder.json
```

The step needs no cloud credentials, so it can run on every pull request,
including from forks.

## What validate does not do

- It does not read, compare or print secret values.
- In `--offline` mode it does not check that the secrets exist or that the
  credentials can read them.
- It does not check what the values look like (types, URLs, length).
