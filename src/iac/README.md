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
| `envilder-github-website-deploy` | `repo:macalbert/envilder:environment:production` | Assume the deploy, file publishing and lookup roles of the `envweb` CDK bootstrap | `publish-website.yml` (`AWS_DEPLOY_ROLE_TO_ASSUME` secret of the `production` environment) |

Pull requests from forks get no OIDC token, so they cannot assume either
role. Running a test workflow by hand from a branch other than `main` cannot
assume the tests role either: open a pull request instead.

The `production` environment must only allow the `main` branch. GitHub
creates an environment without protection the first time a job uses it, so
configure it before the workflow change reaches `main`.

## Website Bootstrap

The website and public files stacks deploy through a CDK bootstrap of their
own, with the `envweb` qualifier. Its CloudFormation execution role gets the
`envilder-website-cfn-execution` managed policy instead of
`AdministratorAccess`, so a website deploy can only change:

- the website buckets, CloudFront resources and the hosted zone records;
- Lambda functions and roles whose names start with the website stack names.

CloudFront distributions, origin access identities and controls, and response
headers policies support no tag conditions, so the policy names the deployed
ones by ID (`websiteDeployment.cloudFront` in `bin/main.ts`). A deploy can
still create new ones, and new distributions only with the stack tags
(`Project=envilder`, `Environment`, `StackId`), but it cannot change any
other. If it replaces one, add the new ID and deploy the roles stack before
the website stacks can change it again. DNS changes are
limited to the website records (`A` and `AAAA`).

It can only create or change those roles when they carry the
`envilder-website-lambda-boundary` permissions boundary, which grants no IAM
or STS actions.

Every role of the `envweb` bootstrap also carries the
`envilder-website-bootstrap-boundary` permissions boundary. It only allows
CloudFormation writes on the website stacks, so the bootstrap deploy role
cannot update or delete other stacks, which keep their own execution role.
All three policies are defined in `GitHubOidcRolesStack`.

The default CDK bootstrap keeps `AdministratorAccess` for stacks that
maintainers deploy, such as `GitHubOidcRolesStack`. The website deploy role
cannot assume its roles.

## Deploying the Roles and the Website Bootstrap

Run these from a maintainer machine. The CDK app also builds the website
stack, which needs the built site:

```bash
pnpm --filter @envilder/website build
cd src/iac && pnpm build
cdk deploy macalbert-envilder-githuboidcroles-production-stack
cdk bootstrap aws://<account>/<region> --qualifier envweb --toolkit-stack-name CDKToolkit-envweb --cloudformation-execution-policies <WebsiteExecutionPolicyArn> --custom-permissions-boundary envilder-website-bootstrap-boundary --apply-permissions-boundary-to-all-roles
cdk deploy macalbert-envilder-website-production-stack macalbert-envilder-files-production-stack
```

`<WebsiteExecutionPolicyArn>` is an output of the roles stack. The last
command moves both website stacks to the `envweb` bootstrap, which proves
the execution policy before CI relies on it.

Then, before the workflow change reaches `main`:

1. Create the `production` environment and allow only the `main` branch.
2. Set its `AWS_DEPLOY_ROLE_TO_ASSUME` secret to the `WebsiteDeployRoleArn`
   stack output.
3. Set the `AWS_ROLE_TO_ASSUME` repository secret to the `TestsRoleArn` stack
   output.
