# Envilder Node.js SDK — Examples

Minimal examples showing how to load secrets from AWS SSM Parameter Store using the Node.js SDK.

## Prerequisites

- Node.js 20+
- AWS credentials configured (`~/.aws/credentials`, env vars, or IAM role)
- SSM parameters matching the paths in [`secrets-map.json`](../../../secrets-map.json)

## Setup

```bash
cd examples/sdk/nodejs
npm install
```

## Run

All commands from the **`examples/sdk/nodejs/`** directory:

| Example            | Description                              | Command                       |
|--------------------|------------------------------------------|-------------------------------|
| `1_fluent.ts`      | Fluent builder with provider overrides   | `npm run 1_fluent`            |
| `2_env_routing.ts` | Pick map file by environment             | `npm run 2_env_routing`       |
| `3_validation.ts`  | Fail fast on missing secrets             | `npm run 3_validation`        |
| `4_load.ts`        | Load + inject into `process.env`         | `npm run 4_load`              |
| `5_resolve.ts`     | Resolve without injecting                | `npm run 5_resolve`           |

```bash
cd examples/sdk/nodejs
npm run 1_fluent
```
