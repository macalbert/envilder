---
name: typescript-cdk-testing
description: AWS CDK testing patterns including snapshot tests, fine-grained assertions with Template.fromStack(), and normalization strategies. Use when writing or reviewing CDK infrastructure tests.
---

# CDK Testing Skill

Testing patterns for AWS CDK infrastructure in the Envilder project (`src/iac/`).
Tests live in `tests/iac/` and run with Vitest.

## When to Use

- Writing tests for new CDK stacks or constructs
- Adding assertions for specific resource properties
- Updating snapshots after intentional infrastructure changes
- Reviewing CDK test coverage

## Test Architecture

### Test Organization

Mirror the source structure in tests:

```txt
tests/iac/
├── aws/
│   ├── compute/       Lambda, ECS Fargate tests
│   ├── database/      RDS PostgreSQL, MySQL tests
│   ├── integration/   SQS, SNS, Step Functions tests
│   ├── network/       VPC, NLB, API Gateway tests
│   ├── storage/       S3, CloudFront tests
│   └── website/       Static website stack tests
└── config/
    ├── application/   Deployment handler tests
    ├── domain/        Config model tests
    └── infrastructure/ Stack builder, factory tests
```

## Snapshot Testing (Primary Pattern)

~80% of CDK tests use snapshot testing to detect unintended infrastructure drift:

```typescript
import { App } from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";

describe("StaticWebsiteStack", () => {
    it("Should_MatchSnapshot_When_StackIsSynthesized", () => {
        // Arrange
        const app = new App();
        const stack = new StaticWebsiteStack(app, "TestStack", config);

        // Act
        const template = Template.fromStack(stack);

        // Assert
        expect(template).toMatchSnapshot("staticWebsiteStackTest");
    });
});
```

### Snapshot Normalization

Remove non-deterministic values before snapshotting:

```typescript
function normalizeTemplate(template: Template): object {
    const json = template.toJSON();
    for (const resource of Object.values(json.Resources ?? {})) {
        if (resource.Properties?.Code?.S3Key) {
            resource.Properties.Code.S3Key = "NORMALIZED";
        }
        if (resource.Properties?.SourceObjectKeys) {
            resource.Properties.SourceObjectKeys = ["NORMALIZED"];
        }
    }
    return json;
}
```

**Normalize these properties:**

- `S3Key` — Lambda deployment artifact hash
- `SourceObjectKeys` — Asset hashes
- Any `Fn::Join` with account-specific values

### Updating Snapshots

When infrastructure changes are intentional:

```bash
pnpm test -- -u
```

**Rules:**

- Review snapshot diffs carefully before approving
- Never update snapshots to suppress failures — understand the change first
- Commit updated snapshots alongside the code that caused the change

## Fine-Grained Assertions (Secondary Pattern)

~20% of tests verify specific resource properties:

```typescript
import { Template, Match } from "aws-cdk-lib/assertions";

describe("LambdaStack", () => {
    it("Should_HaveCorrectTimeout_When_ApiLambdaIsCreated", () => {
        // Arrange
        const app = new App();
        const stack = new LambdaStack(app, "TestStack", config);
        const template = Template.fromStack(stack);

        // Act & Assert
        template.hasResourceProperties("AWS::Lambda::Function", {
            Timeout: 30,
            MemorySize: 1024,
            Runtime: "provided.al2023",
        });
    });

    it("Should_HaveDeadLetterQueue_When_SqsIsCreated", () => {
        // Arrange
        const app = new App();
        const stack = new SqsStack(app, "TestStack", config);
        const template = Template.fromStack(stack);

        // Act & Assert
        template.hasResourceProperties("AWS::SQS::Queue", {
            RedrivePolicy: Match.objectLike({
                maxReceiveCount: 3,
            }),
        });
    });
});
```

### Common Assertion Methods

| Method | Purpose |
| --- | --- |
| `template.hasResourceProperties(type, props)` | Resource exists with properties |
| `template.hasResource(type, props)` | Resource exists with full config |
| `template.resourceCountIs(type, count)` | Exact count of resource type |
| `template.hasOutput(logicalId, props)` | Stack output exists |
| `Match.objectLike({...})` | Partial match on nested objects |
| `Match.arrayWith([...])` | Array contains expected elements |
| `Match.stringLikeRegexp(pattern)` | String matches regex |
| `Match.not(matcher)` | Negation of any matcher |
| `Match.absent()` | Property should not exist |

## When to Use Which Pattern

| Scenario | Pattern |
| --- | --- |
| New stack or construct | **Snapshot** — captures full baseline |
| Specific security property (e.g., encryption) | **Assertion** — explicit check won't be missed |
| Resource count verification | **Assertion** — `resourceCountIs` |
| Cross-resource references | **Assertion** — verify `Ref`/`Fn::GetAtt` |
| Infrastructure refactor (same output) | **Snapshot** — confirms no drift |
| Config-driven resource creation | **Snapshot** + **assertion** for critical properties |

## Test Naming

Follow the project `Should_{Behavior}_When_{Condition}` convention:

```typescript
it("Should_MatchSnapshot_When_StackIsSynthesized", ...)
it("Should_HaveCorrectTimeout_When_ApiLambdaIsCreated", ...)
it("Should_CreateDeadLetterQueue_When_SqsHasMaxReceiveCount", ...)
it("Should_RestrictPublicAccess_When_S3BucketIsCreated", ...)
```

## Test Data — Config Objects

Use realistic config objects that match the config-driven infrastructure pattern:

```typescript
const testConfig: BackendStackConfig = {
    lambdas: [{ name: "TestLambda", timeoutSeconds: 30, memorySizeMbs: 1024 }],
    sqs: [{ name: "test-queue", maxReceiveCount: 3, deadLetter: true }],
    s3: [{ bucketNameSuffix: "test-bucket" }],
    fargates: [{ name: "TestService", cpu: 256, memoryLimitMiB: 512 }],
};
```

## Commands

```bash
# Run all CDK tests
cd tests/iac && pnpm test

# Run with verbose output
cd tests/iac && pnpm test -- --reporter=verbose

# Update snapshots (after intentional changes only)
cd tests/iac && pnpm test -- -u

# Run specific test file
cd tests/iac && pnpm test -- lambda
```

## Anti-Patterns

| Anti-Pattern | Correct Approach |
| --- | --- |
| Snapshot without normalization | Normalize non-deterministic values (S3Key, hashes) |
| Testing CDK internals (construct tree) | Test the synthesized CloudFormation template |
| Hardcoded account/region in tests | Use test-specific `App` with mock env |
| Updating snapshots without reviewing diff | Always review what changed and why |
| Only snapshot tests for security-critical props | Add explicit assertions for encryption, IAM, SG rules |
