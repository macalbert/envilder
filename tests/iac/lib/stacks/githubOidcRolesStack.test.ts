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

	test("Should_OnlyAllowAssumingCdkBootstrapRoles_When_DeployRoleIsCreated", () => {
		// Arrange
		const sut = createGitHubOidcRolesStack();

		// Act
		const actual = Template.fromStack(sut);

		// Assert
		const bootstrapRole = (name: string) =>
			`arn:aws:iam::${ACCOUNT}:role/cdk-hnb659fds-${name}-role-${ACCOUNT}-${REGION}`;
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
		...overrides,
	});
}
