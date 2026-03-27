# XXTemplateXX Infrastructure as Code (IaC)

Infrastructure as Code project for XXTemplateXX-specific AWS resources using AWS CDK with TypeScript.

## Overview

This project manages the infrastructure resources specific to the XXTemplateXX application, including:

- **Lambda Functions**: Serverless compute for APIs and background jobs
- **API Gateway**: REST API endpoints and routing
- **DynamoDB/RDS**: Application databases
- **S3 Buckets**: Static assets and data storage
- **CloudFront**: Content delivery network for frontend apps
- **SQS Queues**: Message queuing for async processing
- **CloudWatch**: Logging and monitoring
- **Cognito**: OAuth2 authentication broker with Google and Microsoft IdP federation

## Prerequisites

- **Node.js**: 22+ (recommended)
- **pnpm**: Latest version
- **AWS CLI**: Latest version with configured credentials
- **AWS CDK**: v2.x (installed via pnpm)

## Getting Started

### Installation

Navigate to this directory and install dependencies:

```bash
cd xxtemplatexx/src/iac
pnpm install
```

### Configuration

The `cdk.json` file tells the CDK Toolkit how to execute your app and contains project-specific settings.

## Available Commands

| Command | Description |
| ------- | ----------- |
| `pnpm build` | Compile TypeScript to JavaScript |
| `pnpm watch` | Watch for changes and compile automatically |
| `pnpm test` | Run Jest unit tests |
| `cdk deploy` | Deploy this stack to your AWS account/region |
| `cdk diff` | Compare deployed stack with current state |
| `cdk synth` | Generate CloudFormation template |
| `cdk destroy` | Remove deployed stack from AWS |

## Deployment

### Deploy to AWS

```bash
# Synthesize CloudFormation template
pnpm build && cdk synth

# Preview changes
cdk diff

# Deploy to AWS
cdk deploy
```

## Project Structure

```text
xxtemplatexx/src/iac/
├── bin/              # CDK app entry point (reads config and builds stacks)
├── buildspecs/       # CI buildspec definitions
├── test/             # Jest tests (incl. template snapshots)
├── cdk.json          # CDK configuration
├── package.json      # Dependencies and scripts
└── tsconfig.json     # TypeScript configuration
```

## Key Infrastructure Components

### Lambda Functions

- **API Lambdas**: HTTP-facing lambdas (via API Gateway) and/or direct Function URL (optional)
- **Background Lambdas**: Asynchronous/background jobs

### Lambda Function URL (optional)

Some Lambdas can optionally be exposed via an AWS Lambda Function URL.

- Configuration lives in [xxtemplatexx/src/iac/bin/config/backendConfig.ts](xxtemplatexx/src/iac/bin/config/backendConfig.ts)
- Enable by setting `enableFunctionUrl: true` on a Lambda config entry
- When enabled, the stack creates a Function URL and outputs it as a CloudFormation output

### Frontend Deployment

- **XXTemplateXX Frontend**: Static assets on S3 + CloudFront

### Messaging

- **SQS Queues**:
  - `processes`: Background jobs

## Environment Variables

Infrastructure configuration is managed through:

- **AWS Systems Manager Parameter Store**: Secure parameter storage
- **Environment-specific values**: Development, Staging, Production
- **Secrets Manager**: Sensitive credentials (API keys, database passwords)

## Additional Documentation

- [CDK Setup Guide](../../../docs/iac/CdkSetup.md) - Complete setup instructions
- [Create New CDK Project](../../../docs/iac/CreateCdkProject.md) - How to create new IaC projects
- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/) - Official AWS CDK docs
- [Architecture Overview](../../../README.md#️-architecture-overview) - System architecture

## Best Practices

- Always run `cdk diff` before deploying to preview changes
- Use separate AWS accounts/regions for development, staging, and production
- Tag all resources appropriately for cost tracking
- Follow the principle of least privilege for IAM roles
- Use CDK constructs for reusable infrastructure patterns

## CI/CD Integration

This infrastructure is deployed through AWS CodePipeline. See the
[CI/CD Pipeline documentation](../../../README.md#-aws-resources--management) for more details.

## Troubleshooting

### Common Issues

#### Issue: CDK version mismatch

```bash
# Update CDK to latest version
pnpm update aws-cdk
```

#### Issue: AWS credentials not found

```bash
# Configure AWS CLI
aws configure
```

#### Issue: Stack deployment fails

```bash
# Check CloudFormation events in AWS Console
# Or use: cdk deploy --verbose
```

#### Issue: Resource limit exceeded

- Check AWS service quotas in the AWS Console
- Request limit increases if needed

## Support

For questions or issues:

1. Check the [CDK Setup Guide](../../../docs/iac/CdkSetup.md)
2. Review AWS CDK documentation
3. Contact the DevOps team
4. Open an issue in the repository

---

**Last Updated**: January 2025  
**Maintained by**: DevOps Team
