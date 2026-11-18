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

## GitHub Actions Roles

`GitHubOidcRolesStack` (`macalbert-envilder-githuboidcroles-production-stack`)
defines the IAM roles that this repository's workflows assume through the
account's GitHub OIDC provider. The provider is shared with other
repositories, so the stack references it and does not create it.

| Role | Trusted subjects | Permissions | Used by |
| ---- | ---------------- | ----------- | ------- |
| `envilder-github-tests` | `repo:macalbert/envilder:pull_request`, `repo:macalbert/envilder:ref:refs/heads/main` | Read, write and delete `/Test/*`; read `/envilder/development/localstack/authToken` | Test, coverage and package publish workflows (`AWS_ROLE_TO_ASSUME` repository secret) |
| `envilder-github-website-deploy` | `repo:macalbert/envilder:environment:production` | Assume the CDK bootstrap deploy, file publishing and lookup roles | `publish-website.yml` (`AWS_DEPLOY_ROLE_TO_ASSUME` secret of the `production` environment) |

Pull requests from forks get no OIDC token, so they cannot assume either
role. Running a test workflow by hand from a branch other than `main` cannot
assume the tests role either: open a pull request instead.

The `production` environment must only allow the `main` branch. GitHub
creates an environment without protection the first time a job uses it, so
configure it before the workflow change reaches `main`.

### Deploying the roles

The website workflow only deploys the website stack. Deploy this stack from a
maintainer machine:

```bash
pnpm build && cdk deploy macalbert-envilder-githuboidcroles-production-stack
```

The CDK bootstrap roles only trust the principals in the `TrustedAccounts`
parameter of the `CDKToolkit` stack. After the deploy role exists, set that
parameter to its ARN, keeping the current bootstrap template and the other
parameter values:

```bash
aws cloudformation update-stack --stack-name CDKToolkit --use-previous-template --capabilities CAPABILITY_NAMED_IAM --parameters ParameterKey=TrustedAccounts,ParameterValue=<WebsiteDeployRoleArn> ...
```

The new value replaces the previous list, so include every principal that
must keep deploying.
