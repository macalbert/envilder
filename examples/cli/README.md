# Envilder CLI: Examples

Push one secret, let Envilder write the map file, then run a command with the secret. No `.env` file.

## Prerequisites

- Node.js 22.12+
- AWS credentials with write access to SSM (`~/.aws/credentials`, env vars, or IAM role)

## Push a secret and run an app

All commands from the **`examples/cli/`** directory:

```bash
cd examples/cli

# 1. Push the secret. Envilder also creates envilder.json
npx envilder --key=API_KEY --value=s3cret --secret-path=/envilder/demo/api-key
# Created envilder.json

# 2. Run the app with API_KEY in its environment
npx envilder exec -- node app.mjs
# API_KEY=set
```

The generated `envilder.json` maps the variable to its secret path. It never contains the value:

```json
{
  "API_KEY": "/envilder/demo/api-key"
}
```

| Flag | Effect |
|------|--------|
| `--map=<file>` | Create or update this map file instead of `envilder.json` |
| `--no-map-update` | Push only; do not read, create or update any map file |

Pushing another secret appends it to the same file. For Azure Key Vault, pass `--provider=azure --vault-url=...`
on the first push and Envilder writes the matching `$config`.

> [!TIP]
> For complete, runnable setups with tests against AWS SSM and Azure Key Vault, see
> [envilder-examples](https://github.com/macalbert/envilder-examples).
