# Envilder Node.js SDK — Examples

Minimal examples showing how to load secrets from AWS SSM Parameter Store using the Node.js SDK.

Uses `pnpm dlx` to run scripts directly — no setup required.

## Prerequisites

- Node.js 20+
- [pnpm](https://pnpm.io/)
- AWS credentials configured (`~/.aws/credentials`, env vars, or IAM role)
- SSM parameters matching the paths in [`secrets-map.json`](../../../secrets-map.json)

## Run

All commands from the **`examples/sdk/nodejs/`** directory:

| Example            | Description                              | Command                                                         |
|--------------------|------------------------------------------|-----------------------------------------------------------------|
| `1_fluent.ts`      | Fluent builder with provider overrides   | `pnpm --package=@envilder/sdk dlx tsx 1_fluent.ts`              |
| `2_env_routing.ts` | Pick map file by environment             | `pnpm --package=@envilder/sdk dlx tsx 2_env_routing.ts`         |
| `3_validation.ts`  | Fail fast on missing secrets             | `pnpm --package=@envilder/sdk dlx tsx 3_validation.ts`          |
| `4_load.ts`        | Load + inject into `process.env`         | `pnpm --package=@envilder/sdk dlx tsx 4_load.ts`                |
| `5_resolve.ts`     | Resolve without injecting                | `pnpm --package=@envilder/sdk dlx tsx 5_resolve.ts`             |

```bash
cd examples/sdk/nodejs
pnpm --package=@envilder/sdk dlx tsx 1_fluent.ts
```
