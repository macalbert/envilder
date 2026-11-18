import { Stack } from "aws-cdk-lib";
import { Effect, ManagedPolicy, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";

export interface WebsiteDeploymentConfig {
	/** CDK bootstrap qualifier reserved for the website stacks. */
	qualifier: string;
	/** Managed policy given to that bootstrap's CloudFormation execution role. */
	executionPolicyName: string;
	/** Permissions boundary every role in the website stacks must carry. */
	lambdaBoundaryName: string;
	/** Permissions boundary of every role of that CDK bootstrap. */
	bootstrapBoundaryName: string;
	/** CloudFormation stack names; generated resource names start with them. */
	stackNames: readonly string[];
	bucketNames: readonly string[];
	hostedZoneId: string;
	/** ACM certificate IDs in us-east-1, as CloudFront requires. */
	certificateIds: readonly string[];
}

/**
 * Policies that limit what the website stacks' CloudFormation deployments
 * can change: the execution policy covers only website resources, the
 * bootstrap boundary keeps every bootstrap role on the website stacks, and
 * the Lambda boundary keeps the roles those stacks create away from IAM.
 */
export class WebsiteDeploymentPolicies extends Construct {
	readonly executionPolicy: ManagedPolicy;
	readonly lambdaBoundary: ManagedPolicy;
	readonly bootstrapBoundary: ManagedPolicy;

	constructor(scope: Construct, id: string, config: WebsiteDeploymentConfig) {
		super(scope, id);

		const { account, region } = Stack.of(this);
		const boundaryArn = `arn:aws:iam::${account}:policy/${config.lambdaBoundaryName}`;
		const bucketArns = config.bucketNames.flatMap((name) => [
			`arn:aws:s3:::${name}`,
			`arn:aws:s3:::${name}/*`,
		]);
		const assetsBucket = `cdk-${config.qualifier}-assets-${account}-${region}`;
		const stackRoleArns = config.stackNames.map(
			(name) => `arn:aws:iam::${account}:role/${name}-*`,
		);

		this.lambdaBoundary = new ManagedPolicy(this, "LambdaBoundary", {
			managedPolicyName: config.lambdaBoundaryName,
			description:
				"Maximum permissions of roles created by the website stacks: no IAM",
			statements: [
				new PolicyStatement({
					sid: "WebsiteContent",
					effect: Effect.ALLOW,
					actions: ["s3:*"],
					resources: [
						...bucketArns,
						`arn:aws:s3:::${assetsBucket}`,
						`arn:aws:s3:::${assetsBucket}/*`,
					],
				}),
				new PolicyStatement({
					sid: "DecryptAssetsThroughS3",
					effect: Effect.ALLOW,
					actions: ["kms:Decrypt"],
					resources: [`arn:aws:kms:${region}:${account}:key/*`],
					conditions: {
						StringEquals: { "kms:ViaService": `s3.${region}.amazonaws.com` },
					},
				}),
				new PolicyStatement({
					sid: "InvalidateDistributions",
					effect: Effect.ALLOW,
					actions: [
						"cloudfront:CreateInvalidation",
						"cloudfront:GetInvalidation",
					],
					resources: [`arn:aws:cloudfront::${account}:distribution/*`],
				}),
				new PolicyStatement({
					sid: "WriteFunctionLogs",
					effect: Effect.ALLOW,
					actions: [
						"logs:CreateLogGroup",
						"logs:CreateLogStream",
						"logs:PutLogEvents",
					],
					resources: [
						`arn:aws:logs:${region}:${account}:log-group:/aws/lambda/*`,
					],
				}),
			],
		});

		const executionStatements = (): PolicyStatement[] => [
			new PolicyStatement({
				sid: "ManageWebsiteBuckets",
				effect: Effect.ALLOW,
				actions: ["s3:*"],
				resources: bucketArns,
			}),
			new PolicyStatement({
				sid: "ReadDeploymentAssets",
				effect: Effect.ALLOW,
				actions: ["s3:GetBucketLocation", "s3:GetObject", "s3:ListBucket"],
				resources: [
					`arn:aws:s3:::${assetsBucket}`,
					`arn:aws:s3:::${assetsBucket}/*`,
				],
			}),
			new PolicyStatement({
				sid: "ManageCloudFront",
				effect: Effect.ALLOW,
				actions: ["cloudfront:*"],
				resources: [
					"distribution",
					"function",
					"origin-access-identity",
					"origin-access-control",
					"response-headers-policy",
					"cache-policy",
					"origin-request-policy",
				].map((type) => `arn:aws:cloudfront::${account}:${type}/*`),
			}),
			new PolicyStatement({
				sid: "UseCertificates",
				effect: Effect.ALLOW,
				actions: ["acm:DescribeCertificate"],
				resources: config.certificateIds.map(
					(id) => `arn:aws:acm:us-east-1:${account}:certificate/${id}`,
				),
			}),
			new PolicyStatement({
				sid: "ManageDnsRecords",
				effect: Effect.ALLOW,
				actions: [
					"route53:ChangeResourceRecordSets",
					"route53:GetHostedZone",
					"route53:ListResourceRecordSets",
				],
				resources: [`arn:aws:route53:::hostedzone/${config.hostedZoneId}`],
			}),
			new PolicyStatement({
				sid: "TrackDnsChanges",
				effect: Effect.ALLOW,
				actions: ["route53:GetChange"],
				resources: ["arn:aws:route53:::change/*"],
			}),
			new PolicyStatement({
				sid: "ManageStackFunctions",
				effect: Effect.ALLOW,
				actions: ["lambda:*"],
				resources: config.stackNames.map(
					(name) => `arn:aws:lambda:${region}:${account}:function:${name}-*`,
				),
			}),
			new PolicyStatement({
				sid: "ManageDeploymentLayers",
				effect: Effect.ALLOW,
				actions: ["lambda:*"],
				resources: [
					`arn:aws:lambda:${region}:${account}:layer:*AwsCliLayer*`,
					`arn:aws:lambda:${region}:${account}:layer:*AwsCliLayer*:*`,
				],
			}),
			new PolicyStatement({
				sid: "WriteBoundedStackRoles",
				effect: Effect.ALLOW,
				actions: [
					"iam:AttachRolePolicy",
					"iam:CreateRole",
					"iam:DeleteRolePolicy",
					"iam:DetachRolePolicy",
					"iam:PutRolePermissionsBoundary",
					"iam:PutRolePolicy",
				],
				resources: stackRoleArns,
				conditions: {
					StringEquals: { "iam:PermissionsBoundary": boundaryArn },
				},
			}),
			new PolicyStatement({
				sid: "ReadAndRemoveStackRoles",
				effect: Effect.ALLOW,
				actions: [
					"iam:DeleteRole",
					"iam:GetRole",
					"iam:GetRolePolicy",
					"iam:ListAttachedRolePolicies",
					"iam:ListRolePolicies",
					"iam:TagRole",
					"iam:UntagRole",
				],
				resources: stackRoleArns,
			}),
			new PolicyStatement({
				sid: "PassStackRolesToLambda",
				effect: Effect.ALLOW,
				actions: ["iam:PassRole"],
				resources: stackRoleArns,
				conditions: {
					StringEquals: { "iam:PassedToService": "lambda.amazonaws.com" },
				},
			}),
		];

		this.executionPolicy = new ManagedPolicy(this, "ExecutionPolicy", {
			managedPolicyName: config.executionPolicyName,
			description: `CloudFormation execution policy of the ${config.qualifier} CDK bootstrap: website resources only`,
			statements: executionStatements(),
		});

		this.bootstrapBoundary = new ManagedPolicy(this, "BootstrapBoundary", {
			managedPolicyName: config.bootstrapBoundaryName,
			description: `Permissions boundary of every ${config.qualifier} CDK bootstrap role: website stacks only`,
			statements: [
				...executionStatements(),
				new PolicyStatement({
					sid: "WriteWebsiteStacks",
					effect: Effect.ALLOW,
					actions: [
						"cloudformation:ContinueUpdateRollback",
						"cloudformation:CreateChangeSet",
						"cloudformation:CreateStack",
						"cloudformation:DeleteChangeSet",
						"cloudformation:DeleteStack",
						"cloudformation:ExecuteChangeSet",
						"cloudformation:RollbackStack",
						"cloudformation:UpdateStack",
						"cloudformation:UpdateTerminationProtection",
					],
					resources: config.stackNames.map(
						(name) =>
							`arn:aws:cloudformation:${region}:${account}:stack/${name}/*`,
					),
				}),
				new PolicyStatement({
					sid: "ReadStacks",
					effect: Effect.ALLOW,
					actions: [
						"cloudformation:Describe*",
						"cloudformation:Get*",
						"cloudformation:List*",
						"cloudformation:ValidateTemplate",
					],
					resources: ["*"],
				}),
				new PolicyStatement({
					sid: "UseStagingBucket",
					effect: Effect.ALLOW,
					actions: ["s3:*"],
					resources: [
						`arn:aws:s3:::${assetsBucket}`,
						`arn:aws:s3:::${assetsBucket}/*`,
					],
				}),
				new PolicyStatement({
					sid: "EncryptStagedAssetsThroughS3",
					effect: Effect.ALLOW,
					actions: ["kms:Decrypt", "kms:Encrypt", "kms:GenerateDataKey*"],
					resources: [`arn:aws:kms:${region}:${account}:key/*`],
					conditions: {
						StringEquals: { "kms:ViaService": `s3.${region}.amazonaws.com` },
					},
				}),
				new PolicyStatement({
					sid: "ReadBootstrapVersion",
					effect: Effect.ALLOW,
					actions: ["ssm:GetParameter", "ssm:GetParameters"],
					resources: [
						`arn:aws:ssm:${region}:${account}:parameter/cdk-bootstrap/${config.qualifier}/version`,
					],
				}),
				new PolicyStatement({
					sid: "PassExecutionRole",
					effect: Effect.ALLOW,
					actions: ["iam:PassRole"],
					resources: [
						`arn:aws:iam::${account}:role/cdk-${config.qualifier}-cfn-exec-role-${account}-${region}`,
					],
				}),
			],
		});
	}
}
