# Envilder Infrastructure as Code (IaC)

AWS CDK project that deploys the Envilder static website (S3 + CloudFront + Route53).

## Prerequisites

- **Node.js**: 22+
- **pnpm**: Latest version
- **AWS CLI**: Configured credentials
- **AWS CDK**: v2.x (installed via pnpm)

## Getting Started

```bash
cd src/iac
pnpm install
```

## Available Commands

| Command | Description |
| ------------- | ---------------------------------------- |
| `pnpm build` | Compile TypeScript |
| `pnpm watch` | Watch for changes and compile |
| `cdk deploy` | Deploy stacks to AWS |
| `cdk diff` | Preview changes against deployed state |
| `cdk synth` | Generate CloudFormation templates |
| `cdk destroy` | Remove deployed stacks |

## Project Structure

```text
src/iac/
├── app/              # Entry point and deployment config
├── domain/           # Models, ports, errors, validation
├── application/      # Use case handler (DeployInfrastructureHandler)
└── infrastructure/   # Adapters: logging, path, naming, CDK stacks
```

Buildspecs live at `buildspecs/iac/` in the repository root.

## Deployment

```bash
pnpm build && cdk synth
cdk diff
cdk deploy
```
