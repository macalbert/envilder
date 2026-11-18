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
| `envilder-github-tests` | `repo:macalbert/envilder:pull_request`, `repo:macalbert/envilder:ref:refs/heads/main` | Read, write and delete per-run parameters under `/Test/*/*`; read `/Test/Token` and `/envilder/development/localstack/authToken` | Test, coverage and package publish workflows (`AWS_ROLE_TO_ASSUME` repository secret) |
| `envilder-github-website-deploy` | `repo:macalbert/envilder:environment:production` | Assume the CDK bootstrap deploy, file publishing and lookup roles | `publish-website.yml` (`AWS_DEPLOY_ROLE_TO_ASSUME` secret of the `production` environment) |

Pull requests from forks get no OIDC token, so they cannot assume either
role. Running a test workflow by hand from a branch other than `main` cannot
assume the tests role either: open a pull request instead.

The `production` environment must only allow the `main` branch. GitHub
creates an environment without protection the first time a job uses it, so
configure it before the workflow change reaches `main`.

### Deploying the roles

The website workflow only deploys the website stack. Deploy this stack from a
maintainer machine. The CDK app also builds the website stack, which needs the
built site:

```bash
pnpm --filter @envilder/website build
cd src/iac && pnpm build && cdk deploy macalbert-envilder-githuboidcroles-production-stack
```

No bootstrap change is needed: the standard CDK bootstrap roles trust their
own account, and the website deploy role's identity policy allows it to
assume them.

Then, before the workflow change reaches `main`:

1. Create the `production` environment and allow only the `main` branch.
2. Set its `AWS_DEPLOY_ROLE_TO_ASSUME` secret to the `WebsiteDeployRoleArn`
   stack output.
3. Set the `AWS_ROLE_TO_ASSUME` repository secret to the `TestsRoleArn` stack
   output.

### Known limit

The CDK bootstrap deploy role runs CloudFormation with the bootstrap execution
role. With the default `AdministratorAccess` execution policy, a session of
the website deploy role can still change any stack in the account. The
`production` environment limits that session to `main`; restricting the
execution policy is a bootstrap change outside this stack.
