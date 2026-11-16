# Map file (`envilder.json`) reference

Source of truth: the JSON Schema at <https://envilder.com/schema/map-file.v1.json>
and `envilder validate`. When this page and the CLI disagree, the CLI wins.

## Shape

A JSON object. Every key that does not start with `$` is an environment
variable name, and its value is a string: the secret identifier in the
provider. Two reserved keys are allowed: `$schema` and `$config`.

AWS SSM Parameter Store (the default provider):

```json
{
  "$schema": "https://envilder.com/schema/map-file.v1.json",
  "$config": {
    "provider": "aws",
    "profile": "my-app-dev",
    "name": "my-app",
    "owner": "platform-team",
    "environment": "dev"
  },
  "DB_PASSWORD": "/my-app/dev/db/password",
  "STRIPE_API_KEY": "/my-app/dev/stripe/api-key"
}
```

Azure Key Vault:

```json
{
  "$schema": "https://envilder.com/schema/map-file.v1.json",
  "$config": {
    "provider": "azure",
    "vaultUrl": "https://my-app-dev.vault.azure.net"
  },
  "DB_PASSWORD": "my-app-dev-db-password",
  "STRIPE_API_KEY": "my-app-dev-stripe-api-key"
}
```

## `$config`

Every field is optional and a string. Unknown fields are errors.

| Field | Providers | Notes |
|-------|-----------|-------|
| `provider` | all | `aws` (default when absent) or `azure`. The schema also lists `gcp`, `hashicorp` and `file`, but the CLI, Action and SDKs reject them as `Unsupported provider` |
| `profile` | `aws` only | AWS CLI profile. Leave it out in CI, where credentials come from the environment |
| `vaultUrl` | `azure` (required) | Absolute URL of the Key Vault |
| `name`, `description`, `owner`, `environment` | all | Informational metadata only |

Precedence: CLI flags and Action inputs > `$config` > defaults (`aws`). An
override such as `--provider=azure --vault-url=...` lets one map file serve a
different vault, but prefer one map file per environment so the contract shows
exactly what each environment resolves.

## Keys (variable names)

- Allowed characters: letters, digits, `_`, `.`, `-`, `/`
  (`^[A-Za-z0-9_./-]+$`). Recommended: POSIX names (`^[A-Za-z_][A-Za-z0-9_]*$`).
- `__proto__` is rejected; keys starting with `$` other than `$schema` and
  `$config` are rejected.
- A key with `/` (`Database/Password`) reaches SDKs and `exec` as-is and maps to
  the `Database:Password` section in the .NET `IConfiguration` provider. Node
  `dotenv`, Docker Compose `env_file` and `source .env` cannot read it from a
  `.env` file: for pull mode use `Database__Password` instead.
- Keep the name the application already reads. Renaming variables is a code
  change, not a mapping change.

## Values (secret identifiers)

- Always a JSON string. Numbers, booleans or objects are errors.
- AWS SSM: the parameter name as-is, case-sensitive, usually a `/`-separated
  path. Names cannot start with `aws` or `ssm`.
- Azure Key Vault: secret names allow only letters, digits and `-` (1 to 127
  characters). Envilder translates `/` to `-` and drops a leading `/`
  (`/my-app/db/password` becomes `my-app-db-password`) and nothing else: `_` or
  `.` in a value fails with Key Vault's own error. The CLI and the Action reject
  two values that resolve to the same name ignoring case.
- Several variables may map to the same secret path.

## Validate

Run these from the directory that holds the map file, or pass `--map`:

| Command | Calls the provider | Use |
|---------|--------------------|-----|
| `npx envilder validate --offline --map=envilder.json` | No | After every edit. Checks JSON, schema, provider rules |
| `npx envilder validate --map=envilder.json` | Yes, metadata only, never values | With user approval, to find secrets that are `missing`, `access denied` or unreachable |
| `npx envilder validate --offline --envfile=.env --map=envilder.json` | No | Newer CLI versions: compares `.env` keys with the map file, no value printed |

Exit code `0` means valid; `1` means any problem. Messages name keys, never
values. Typical problems and fixes:

| Message (abridged) | Fix |
|--------------------|-----|
| `Unsupported provider: gcp` | Use `aws` or `azure` |
| `vaultUrl is required when using Azure provider` | Add `$config.vaultUrl` or pass `--vault-url` |
| `$config.profile is only supported with the aws provider` | Remove `profile` for Azure |
| `$config.region is not a known field` | Remove it. AWS region comes from the profile or `AWS_REGION` |
| `DB_PORT must map to a string secret path, not a number` | Non-secret configuration does not belong in the map file |
| `Unsupported environment variable name ...` | Rename the key to the allowed character set |

## Missing and inconsistent mappings

Check, and report each finding with the variable name:

- read by the code or listed in `.env.example`, but not mapped (missing);
- mapped but never read (stale);
- mapped in one environment's map file but not in another (drift);
- mapped to an identifier that does not follow the project's path convention;
- the same variable mapped differently from the GitHub Actions secrets it
  replaces.
