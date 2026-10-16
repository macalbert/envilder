# Envilder Node.js SDK: Examples

> [!TIP]
> For complete, runnable setups with tests against AWS SSM and Azure Key Vault, see
> [`typescript-testcontainers`](https://github.com/macalbert/envilder-examples/tree/main/typescript-testcontainers) and
> [`typescript-aspire`](https://github.com/macalbert/envilder-examples/tree/main/typescript-aspire) in
> [envilder-examples](https://github.com/macalbert/envilder-examples).

Minimal examples showing how to load secrets from AWS SSM Parameter Store using the Node.js SDK.

## Prerequisites

- Node.js 22.12+
- AWS credentials configured (`~/.aws/credentials`, env vars, or IAM role)
- SSM parameters matching the paths in [`envilder.json`](../../../envilder.json)

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
