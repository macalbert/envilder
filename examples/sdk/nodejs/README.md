# Envilder Node.js SDK — Examples

Minimal examples showing how to load secrets from AWS SSM Parameter Store using the Node.js SDK.

## Prerequisites

- Node.js 20+
- [pnpm](https://pnpm.io/)
- AWS credentials configured (`~/.aws/credentials`, env vars, or IAM role)
- SSM parameters matching the paths in [`secrets-map.json`](../../../secrets-map.json)

## Setup

```bash
cd examples/sdk/nodejs
pnpm install
```

## Run

| Example            | Description                              | Command                           |
|--------------------|------------------------------------------|-----------------------------------|
| `1_fluent.ts`      | Fluent builder with provider overrides   | `pnpm run 1_fluent`               |
| `2_env_routing.ts` | Pick map file by environment             | `pnpm run 2_env_routing`          |
| `3_validation.ts`  | Fail fast on missing secrets             | `pnpm run 3_validation`           |
| `4_load.ts`        | Load + inject into `process.env`         | `pnpm run 4_load`                 |
| `5_resolve.ts`     | Resolve without injecting                | `pnpm run 5_resolve`              |

```bash
cd examples/sdk/nodejs
pnpm run 1_fluent
```
