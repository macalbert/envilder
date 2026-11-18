import { CfnOutput, Stack } from "aws-cdk-lib";
import {
	Effect,
	FederatedPrincipal,
	PolicyStatement,
	Role,
} from "aws-cdk-lib/aws-iam";
import type { Construct } from "constructs";
import { CustomStack, type CustomStackProps } from "./customStack";

const GITHUB_OIDC_HOST = "token.actions.githubusercontent.com";
const CDK_BOOTSTRAP_QUALIFIER = "hnb659fds";

export interface TestParameterPaths {
	/** Paths the tests create, read and delete (e.g. `/Test/*`). */
	readWrite: readonly string[];
	/** Paths the tests only read (e.g. fixture tokens). */
	readOnly: readonly string[];
}

export interface GitHubOidcRolesStackProps extends CustomStackProps {
	githubOwner: string;
	mainBranch: string;
	/** GitHub environment that gates the deploy job. */
	deployEnvironment: string;
	testParameters: TestParameterPaths;
}

/**
 * Least-privilege roles that this repository's GitHub Actions workflows
 * assume through the account's GitHub OIDC provider.
 *
 * The OIDC provider itself is shared with other repositories and is not
 * managed here.
 */
export class GitHubOidcRolesStack extends CustomStack {
	constructor(scope: Construct, props: GitHubOidcRolesStackProps) {
		super(scope, props);

		const repo = `${props.githubOwner}/${props.githubRepo}`;

		const testsRole = new Role(this, "TestsRole", {
			roleName: `${props.githubRepo}-github-tests`,
			description: `Tests in ${repo}: test SSM parameters only`,
			assumedBy: this.githubPrincipal([
				`repo:${repo}:pull_request`,
				`repo:${repo}:ref:refs/heads/${props.mainBranch}`,
			]),
		});
		testsRole.addToPolicy(
			new PolicyStatement({
				sid: "ReadWriteTestParameters",
				effect: Effect.ALLOW,
				actions: [
					"ssm:DeleteParameter",
					"ssm:GetParameter",
					"ssm:GetParameters",
					"ssm:PutParameter",
				],
				resources: props.testParameters.readWrite.map((path) =>
					this.parameterArn(path),
				),
			}),
		);
		testsRole.addToPolicy(
			new PolicyStatement({
				sid: "ReadTestFixtureParameters",
				effect: Effect.ALLOW,
				actions: ["ssm:GetParameter", "ssm:GetParameters"],
				resources: props.testParameters.readOnly.map((path) =>
					this.parameterArn(path),
				),
			}),
		);

		const websiteDeployRole = new Role(this, "WebsiteDeployRole", {
			roleName: `${props.githubRepo}-github-website-deploy`,
			description: `Website deploy from ${repo} (${props.deployEnvironment} environment): CDK bootstrap roles only`,
			assumedBy: this.githubPrincipal(
				`repo:${repo}:environment:${props.deployEnvironment}`,
			),
		});
		websiteDeployRole.addToPolicy(
			new PolicyStatement({
				sid: "AssumeCdkBootstrapRoles",
				effect: Effect.ALLOW,
				actions: ["sts:AssumeRole", "sts:TagSession"],
				resources: ["deploy", "file-publishing", "lookup"].map((name) =>
					this.cdkBootstrapRoleArn(name),
				),
			}),
		);

		new CfnOutput(this, "TestsRoleArn", { value: testsRole.roleArn });
		new CfnOutput(this, "WebsiteDeployRoleArn", {
			value: websiteDeployRole.roleArn,
		});
	}

	private githubPrincipal(subject: string | string[]): FederatedPrincipal {
		return new FederatedPrincipal(
			`arn:aws:iam::${Stack.of(this).account}:oidc-provider/${GITHUB_OIDC_HOST}`,
			{
				StringEquals: {
					[`${GITHUB_OIDC_HOST}:aud`]: "sts.amazonaws.com",
					[`${GITHUB_OIDC_HOST}:sub`]: subject,
				},
			},
			"sts:AssumeRoleWithWebIdentity",
		);
	}

	private parameterArn(path: string): string {
		const { account, region } = Stack.of(this);
		return `arn:aws:ssm:${region}:${account}:parameter${path}`;
	}

	private cdkBootstrapRoleArn(name: string): string {
		const { account, region } = Stack.of(this);
		return `arn:aws:iam::${account}:role/cdk-${CDK_BOOTSTRAP_QUALIFIER}-${name}-role-${account}-${region}`;
	}
}
