import { CfnOutput, Stack } from "aws-cdk-lib";
import {
	Effect,
	FederatedPrincipal,
	PolicyStatement,
	Role,
} from "aws-cdk-lib/aws-iam";
import type { Construct } from "constructs";
import { CustomStack, type CustomStackProps } from "./customStack";
import {
	type WebsiteDeploymentConfig,
	WebsiteDeploymentPolicies,
} from "./websiteDeploymentPolicies";

const GITHUB_OIDC_HOST = "token.actions.githubusercontent.com";

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
	websiteDeployment: WebsiteDeploymentConfig;
}

/**
 * Least-privilege roles that this repository's GitHub Actions workflows
 * assume through the account's GitHub OIDC provider.
 *
 * The OIDC provider itself is shared with other repositories and is not
 * managed here. The website deploy role only reaches a CDK bootstrap
 * reserved for the website stacks, whose execution policy is defined here.
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
			description: `Website deploy from ${repo} (${props.deployEnvironment} environment): ${props.websiteDeployment.qualifier} CDK bootstrap roles only`,
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
					this.cdkBootstrapRoleArn(props.websiteDeployment.qualifier, name),
				),
			}),
		);

		const websitePolicies = new WebsiteDeploymentPolicies(
			this,
			"WebsiteDeploymentPolicies",
			props.websiteDeployment,
		);

		new CfnOutput(this, "TestsRoleArn", { value: testsRole.roleArn });
		new CfnOutput(this, "WebsiteDeployRoleArn", {
			value: websiteDeployRole.roleArn,
		});
		new CfnOutput(this, "WebsiteExecutionPolicyArn", {
			value: websitePolicies.executionPolicy.managedPolicyArn,
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

	private cdkBootstrapRoleArn(qualifier: string, name: string): string {
		const { account, region } = Stack.of(this);
		return `arn:aws:iam::${account}:role/cdk-${qualifier}-${name}-role-${account}-${region}`;
	}
}
