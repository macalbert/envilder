import { App } from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
import { AppEnvironment } from "../../../../src/iac/lib/core/types";
import {
	GitHubOidcRolesStack,
	type GitHubOidcRolesStackProps,
} from "../../../../src/iac/lib/stacks/githubOidcRolesStack";

const ACCOUNT = "123456789012";
const REGION = "eu-west-1";
const OIDC_PROVIDER_ARN = `arn:aws:iam::${ACCOUNT}:oidc-provider/token.actions.githubusercontent.com`;

describe("GitHub OIDC roles Stack", () => {
	test("Should_TrustOnlyPullRequestsAndMainOfThisRepo_When_TestRoleIsCreated", () => {
		// Arrange
		const sut = createGitHubOidcRolesStack();

		// Act
		const actual = Template.fromStack(sut);

		// Assert
		actual.hasResourceProperties("AWS::IAM::Role", {
			RoleName: "envilder-github-tests",
			AssumeRolePolicyDocument: {
				Statement: [
					{
						Action: "sts:AssumeRoleWithWebIdentity",
						Effect: "Allow",
						Principal: { Federated: OIDC_PROVIDER_ARN },
						Condition: {
							StringEquals: {
								"token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
								"token.actions.githubusercontent.com:sub": [
									"repo:macalbert/envilder:pull_request",
									"repo:macalbert/envilder:ref:refs/heads/main",
								],
							},
						},
					},
				],
			},
		});
	});

	test("Should_ScopeTestRoleToTestParameters_When_TestRoleIsCreated", () => {
		// Arrange
		const sut = createGitHubOidcRolesStack();

		// Act
		const actual = Template.fromStack(sut);

		// Assert
		actual.hasResourceProperties("AWS::IAM::Policy", {
			Roles: [{ Ref: Match.stringLikeRegexp("TestsRole") }],
			PolicyDocument: {
				Statement: [
					{
						Sid: "ReadWriteTestParameters",
						Effect: "Allow",
						Action: [
							"ssm:DeleteParameter",
							"ssm:GetParameter",
							"ssm:GetParameters",
							"ssm:PutParameter",
						],
						Resource: `arn:aws:ssm:${REGION}:${ACCOUNT}:parameter/Test/*/*`,
					},
					{
						Sid: "ReadTestFixtureParameters",
						Effect: "Allow",
						Action: ["ssm:GetParameter", "ssm:GetParameters"],
						Resource: [
							`arn:aws:ssm:${REGION}:${ACCOUNT}:parameter/Test/Token`,
							`arn:aws:ssm:${REGION}:${ACCOUNT}:parameter/envilder/development/localstack/authToken`,
						],
					},
				],
			},
		});
	});

	test("Should_TrustOnlyTheDeployEnvironment_When_DeployRoleIsCreated", () => {
		// Arrange
		const sut = createGitHubOidcRolesStack();

		// Act
		const actual = Template.fromStack(sut);

		// Assert
		actual.hasResourceProperties("AWS::IAM::Role", {
			RoleName: "envilder-github-website-deploy",
			AssumeRolePolicyDocument: {
				Statement: [
					{
						Action: "sts:AssumeRoleWithWebIdentity",
						Effect: "Allow",
						Principal: { Federated: OIDC_PROVIDER_ARN },
						Condition: {
							StringEquals: {
								"token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
								"token.actions.githubusercontent.com:sub":
									"repo:macalbert/envilder:environment:production",
							},
						},
					},
				],
			},
		});
	});

	test("Should_OnlyAllowAssumingWebsiteBootstrapRoles_When_DeployRoleIsCreated", () => {
		// Arrange
		const sut = createGitHubOidcRolesStack();

		// Act
		const actual = Template.fromStack(sut);

		// Assert
		const bootstrapRole = (name: string) =>
			`arn:aws:iam::${ACCOUNT}:role/cdk-envweb-${name}-role-${ACCOUNT}-${REGION}`;
		actual.hasResourceProperties("AWS::IAM::Policy", {
			Roles: [{ Ref: Match.stringLikeRegexp("WebsiteDeployRole") }],
			PolicyDocument: {
				Statement: [
					{
						Sid: "AssumeCdkBootstrapRoles",
						Effect: "Allow",
						Action: ["sts:AssumeRole", "sts:TagSession"],
						Resource: [
							bootstrapRole("deploy"),
							bootstrapRole("file-publishing"),
							bootstrapRole("lookup"),
						],
					},
				],
			},
		});
	});

	test("Should_ScopeExecutionPolicyToWebsiteResources_When_StackIsCreated", () => {
		// Arrange
		const sut = createGitHubOidcRolesStack();

		// Act
		const actual = managedPolicyStatements(
			sut,
			"envilder-website-cfn-execution",
		);

		// Assert
		expect(actual).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					Sid: "ManageWebsiteBuckets",
					Action: "s3:*",
					Resource: [
						"arn:aws:s3:::envilder.com",
						"arn:aws:s3:::envilder.com/*",
						"arn:aws:s3:::envilder.com-logs",
						"arn:aws:s3:::envilder.com-logs/*",
					],
				}),
				expect.objectContaining({
					Sid: "ChangeWebsiteRecords",
					Action: "route53:ChangeResourceRecordSets",
					Resource: "arn:aws:route53:::hostedzone/Z123",
					Condition: {
						"ForAllValues:StringEquals": {
							"route53:ChangeResourceRecordSetsNormalizedRecordNames": [
								"envilder.com",
							],
							"route53:ChangeResourceRecordSetsRecordTypes": ["A", "AAAA"],
						},
					},
				}),
				expect.objectContaining({
					Sid: "ManageWebsiteCloudFrontResources",
					Action: "cloudfront:*",
					Resource: [
						`arn:aws:cloudfront::${ACCOUNT}:distribution/EDIST`,
						`arn:aws:cloudfront::${ACCOUNT}:origin-access-identity/EOAI`,
						`arn:aws:cloudfront::${ACCOUNT}:response-headers-policy/rhp-1`,
						`arn:aws:cloudfront::${ACCOUNT}:function/*envilder-Website*`,
					],
				}),
				expect.objectContaining({
					Sid: "ManageStackFunctions",
					Action: "lambda:*",
					Resource: `arn:aws:lambda:${REGION}:${ACCOUNT}:function:envilder-Website-*`,
				}),
			]),
		);
	});

	test("Should_OnlyCreateOrTagCloudFrontResources_When_TheyAreNotTheWebsites", () => {
		// Arrange
		const sut = createGitHubOidcRolesStack();

		// Act
		const actual = managedPolicyStatements(
			sut,
			"envilder-website-cfn-execution",
		).filter(
			(statement) =>
				action(statement).some((name) => name.startsWith("cloudfront:")) &&
				[statement.Resource]
					.flat()
					.some(
						(resource) => resource === "*" || String(resource).endsWith("/*"),
					),
		);

		// Assert
		expect(actual.length).toBeGreaterThan(0);
		for (const statement of actual) {
			for (const name of action(statement)) {
				expect(name).toMatch(
					/^cloudfront:(Create(?!Invalidation)|TagResource$|Get|List|Describe)/,
				);
			}
		}
	});

	test("Should_RequireProjectTags_When_ExecutionPolicyCreatesOrTagsDistributions", () => {
		// Arrange
		const sut = createGitHubOidcRolesStack();

		// Act
		const actual = managedPolicyStatements(
			sut,
			"envilder-website-cfn-execution",
		).filter(
			(statement) =>
				action(statement).some((name) =>
					["cloudfront:CreateDistribution", "cloudfront:TagResource"].includes(
						name,
					),
				) && statement.Resource !== undefined,
		);

		// Assert
		const wildcardGrants = actual.filter((statement) =>
			[statement.Resource]
				.flat()
				.some((resource) => String(resource).endsWith("*")),
		);
		expect(wildcardGrants).toEqual([
			expect.objectContaining({
				Sid: "CreateTaggedDistributions",
				Action: ["cloudfront:CreateDistribution", "cloudfront:TagResource"],
				Resource: "*",
				Condition: {
					StringEquals: { "aws:RequestTag/Project": "envilder" },
					"ForAllValues:StringEquals": {
						"aws:TagKeys": ["Environment", "Project", "StackId"],
					},
				},
			}),
		]);
	});

	test("Should_RequireLambdaBoundary_When_ExecutionPolicyWritesRoles", () => {
		// Arrange
		const sut = createGitHubOidcRolesStack();

		// Act
		const actual = managedPolicyStatements(
			sut,
			"envilder-website-cfn-execution",
		);

		// Assert
		expect(actual).toContainEqual(
			expect.objectContaining({
				Sid: "WriteBoundedStackRoles",
				Action: [
					"iam:AttachRolePolicy",
					"iam:CreateRole",
					"iam:DeleteRolePolicy",
					"iam:DetachRolePolicy",
					"iam:PutRolePermissionsBoundary",
					"iam:PutRolePolicy",
				],
				Resource: `arn:aws:iam::${ACCOUNT}:role/envilder-Website-*`,
				Condition: {
					StringEquals: {
						"iam:PermissionsBoundary": `arn:aws:iam::${ACCOUNT}:policy/envilder-website-lambda-boundary`,
					},
				},
			}),
		);
		expect(actual).toContainEqual(
			expect.objectContaining({
				Sid: "PassStackRolesToLambda",
				Action: "iam:PassRole",
				Condition: {
					StringEquals: { "iam:PassedToService": "lambda.amazonaws.com" },
				},
			}),
		);
	});

	test("Should_OnlyTouchStackRoles_When_ExecutionPolicyGrantsIam", () => {
		// Arrange
		const sut = createGitHubOidcRolesStack();

		// Act
		const actual = managedPolicyStatements(
			sut,
			"envilder-website-cfn-execution",
		)
			.flatMap((statement) => [statement.Resource].flat())
			.filter((resource) => String(resource).includes(":iam::"));

		// Assert
		expect(actual.length).toBeGreaterThan(0);
		for (const resource of actual) {
			expect(resource).toBe(`arn:aws:iam::${ACCOUNT}:role/envilder-Website-*`);
		}
	});

	test("Should_GrantNoIdentityActions_When_LambdaBoundaryIsCreated", () => {
		// Arrange
		const sut = createGitHubOidcRolesStack();

		// Act
		const actual = managedPolicyStatements(
			sut,
			"envilder-website-lambda-boundary",
		).flatMap((statement) => [statement.Action].flat());

		// Assert
		expect(actual.length).toBeGreaterThan(0);
		for (const action of actual) {
			expect(action).not.toMatch(/^(iam|sts|organizations):|^\*$/);
		}
	});

	test("Should_OnlyWriteWebsiteStacks_When_BootstrapBoundaryIsCreated", () => {
		// Arrange
		const sut = createGitHubOidcRolesStack();

		// Act
		const actual = managedPolicyStatements(
			sut,
			"envilder-website-bootstrap-boundary",
		);

		// Assert
		const cloudFormationWrites = actual.filter((statement) =>
			[statement.Action]
				.flat()
				.some((action) =>
					/^cloudformation:(Create|Update|Delete|Execute)/.test(action),
				),
		);
		expect(cloudFormationWrites).toEqual([
			expect.objectContaining({
				Sid: "WriteWebsiteStacks",
				Resource: `arn:aws:cloudformation:${REGION}:${ACCOUNT}:stack/envilder-Website/*`,
			}),
		]);
	});

	test("Should_CoverExecutionPolicy_When_BootstrapBoundaryIsCreated", () => {
		// Arrange
		const sut = createGitHubOidcRolesStack();

		// Act
		const actual = managedPolicyStatements(
			sut,
			"envilder-website-bootstrap-boundary",
		);

		// Assert
		for (const statement of managedPolicyStatements(
			sut,
			"envilder-website-cfn-execution",
		)) {
			expect(actual).toContainEqual(statement);
		}
	});

	test("Should_StayUnderIamSizeLimit_When_ManagedPoliciesAreCreated", () => {
		// Arrange
		const sut = createGitHubOidcRolesStack();
		const iamManagedPolicyMaxChars = 6144;

		// Act
		const actual = Object.values(
			Template.fromStack(sut).findResources("AWS::IAM::ManagedPolicy"),
		).map((policy) => JSON.stringify(policy.Properties.PolicyDocument).length);

		// Assert
		expect(actual).toHaveLength(3);
		for (const length of actual) {
			expect(length).toBeLessThan(iamManagedPolicyMaxChars);
		}
	});

	test("Should_NotUseWildcardSubjects_When_RolesAreCreated", () => {
		// Arrange
		const sut = createGitHubOidcRolesStack();

		// Act
		const actual = JSON.stringify(Template.fromStack(sut).toJSON());

		// Assert
		expect(actual).not.toContain("StringLike");
		expect(actual).not.toContain("macalbert/*");
	});

	test("Should_ExportRoleArns_When_StackIsCreated", () => {
		// Arrange
		const sut = createGitHubOidcRolesStack();

		// Act
		const actual = Template.fromStack(sut);

		// Assert
		actual.hasOutput("TestsRoleArn", {
			Value: {
				"Fn::GetAtt": [Match.stringLikeRegexp("^TestsRole"), "Arn"],
			},
		});
		actual.hasOutput("WebsiteDeployRoleArn", {
			Value: {
				"Fn::GetAtt": [Match.stringLikeRegexp("^WebsiteDeployRole"), "Arn"],
			},
		});
	});
});

interface PolicyStatementJson {
	Sid?: string;
	Action: string | string[];
	Resource: unknown;
	Condition?: unknown;
}

function action(statement: PolicyStatementJson): string[] {
	return [statement.Action].flat();
}

function managedPolicyStatements(
	stack: GitHubOidcRolesStack,
	name: string,
): PolicyStatementJson[] {
	const policies = Template.fromStack(stack).findResources(
		"AWS::IAM::ManagedPolicy",
		{ Properties: { ManagedPolicyName: name } },
	);
	const [policy] = Object.values(policies);
	return policy.Properties.PolicyDocument.Statement;
}

function createGitHubOidcRolesStack(
	overrides: Partial<GitHubOidcRolesStackProps> = {},
): GitHubOidcRolesStack {
	const app = new App();
	return new GitHubOidcRolesStack(app, {
		env: { account: ACCOUNT, region: REGION },
		name: "GitHubOidcRoles",
		envName: AppEnvironment.Production,
		githubOwner: "macalbert",
		githubRepo: "envilder",
		stackName: "envilder-GitHubOidcRoles",
		mainBranch: "main",
		deployEnvironment: "production",
		testParameters: {
			readWrite: ["/Test/*/*"],
			readOnly: ["/Test/Token", "/envilder/development/localstack/authToken"],
		},
		websiteDeployment: {
			qualifier: "envweb",
			executionPolicyName: "envilder-website-cfn-execution",
			lambdaBoundaryName: "envilder-website-lambda-boundary",
			bootstrapBoundaryName: "envilder-website-bootstrap-boundary",
			stackNames: ["envilder-Website"],
			bucketNames: ["envilder.com", "envilder.com-logs"],
			hostedZoneId: "Z123",
			recordNames: ["envilder.com"],
			certificateIds: ["cert-a"],
			cloudFront: {
				distributionIds: ["EDIST"],
				originAccessIdentityIds: ["EOAI"],
				originAccessControlIds: [],
				responseHeadersPolicyIds: ["rhp-1"],
			},
		},
		...overrides,
	});
}
