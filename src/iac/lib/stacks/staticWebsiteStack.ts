import { join } from "node:path";
import { CfnOutput, Duration, RemovalPolicy } from "aws-cdk-lib";
import {
	Certificate,
	type ICertificate,
} from "aws-cdk-lib/aws-certificatemanager";
import {
	Distribution,
	type ErrorResponse,
	FunctionCode,
	FunctionEventType,
	Function as LambdaFunction,
	OriginAccessIdentity,
	ViewerProtocolPolicy,
} from "aws-cdk-lib/aws-cloudfront";
import { S3BucketOrigin } from "aws-cdk-lib/aws-cloudfront-origins";
import { ARecord, HostedZone, RecordTarget } from "aws-cdk-lib/aws-route53";
import { CloudFrontTarget } from "aws-cdk-lib/aws-route53-targets";
import {
	BlockPublicAccess,
	Bucket,
	BucketAccessControl,
	BucketEncryption,
	HttpMethods,
} from "aws-cdk-lib/aws-s3";
import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";
import type { Construct } from "constructs";
import {
	CustomStack,
	type CustomStackProps,
	type DomainConfig,
} from "./customStack";

export interface StaticWebsiteStackProps extends CustomStackProps {
	domains: DomainConfig[];
	distFolderPath: string;
}

export class StaticWebsiteStack extends CustomStack {
	constructor(scope: Construct, props: StaticWebsiteStackProps) {
		super(scope, props);

		if (!props.domains || props.domains.length === 0) {
			throw new Error("At least one domain configuration is required");
		}

		const primaryDomain = props.domains[0];
		const primaryFullDomainName =
			primaryDomain.subdomain && primaryDomain.subdomain.length > 0
				? [primaryDomain.subdomain, primaryDomain.domainName]
						.join(".")
						.toLowerCase()
				: primaryDomain.domainName.toLowerCase();

		const allDomainNames = props.domains.map((domain) =>
			domain.subdomain && domain.subdomain.length > 0
				? `${domain.subdomain}.${domain.domainName}`.toLowerCase()
				: domain.domainName.toLowerCase(),
		);

		const certificateMap = new Map<string, ICertificate>();
		for (const domain of props.domains) {
			if (!certificateMap.has(domain.certificateId)) {
				const certificateArn = `arn:aws:acm:us-east-1:${props.env?.account}:certificate/${domain.certificateId}`;
				certificateMap.set(
					domain.certificateId,
					Certificate.fromCertificateArn(
						this,
						`certificate-${domain.certificateId}`,
						certificateArn,
					),
				);
			}
		}

		const primaryCertificate = certificateMap.get(primaryDomain.certificateId);
		if (!primaryCertificate) {
			throw new Error(
				`Certificate not found for ${primaryDomain.certificateId}`,
			);
		}

		const loggingBucket = new Bucket(this, "logging-bucket", {
			accessControl: BucketAccessControl.LOG_DELIVERY_WRITE,
			publicReadAccess: false,
			versioned: false,
			removalPolicy: RemovalPolicy.DESTROY,
			bucketName: `${primaryFullDomainName}-logs`,
			autoDeleteObjects: true,
			blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
			encryption: BucketEncryption.S3_MANAGED,
			enforceSSL: true,
			lifecycleRules: [
				{
					id: "DeleteOldLogs",
					expiration: Duration.days(90),
					enabled: true,
				},
			],
		});

		const bucketWebsite = new Bucket(this, "static-website-bucket", {
			accessControl: BucketAccessControl.PRIVATE,
			publicReadAccess: false,
			versioned: false,
			removalPolicy: RemovalPolicy.DESTROY,
			bucketName: primaryFullDomainName,
			autoDeleteObjects: true,
			blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
			encryption: BucketEncryption.S3_MANAGED,
			cors: [
				{
					allowedMethods: [HttpMethods.GET, HttpMethods.HEAD],
					allowedOrigins: ["*"],
					allowedHeaders: ["*"],
				},
			],
			enforceSSL: true,
			serverAccessLogsBucket: loggingBucket,
			serverAccessLogsPrefix: "s3-access-logs/",
		});

		const originAccessIdentity = new OriginAccessIdentity(
			this,
			"originAccessIdentity",
			{
				comment: `Setup access from CloudFront to the bucket ${primaryFullDomainName} (read)`,
			},
		);

		bucketWebsite.grantRead(originAccessIdentity);

		const errorResponses: ErrorResponse[] = [];

		const errorResponse403: ErrorResponse = {
			httpStatus: 403,
			responseHttpStatus: 200,
			responsePagePath: "/index.html",
			ttl: Duration.seconds(10),
		};

		const errorResponse404: ErrorResponse = {
			httpStatus: 404,
			responseHttpStatus: 200,
			responsePagePath: "/index.html",
			ttl: Duration.seconds(10),
		};

		errorResponses.push(errorResponse403, errorResponse404);

		const distribution = new Distribution(this, "distribution", {
			domainNames: allDomainNames,
			defaultBehavior: {
				origin: S3BucketOrigin.withOriginAccessIdentity(bucketWebsite, {
					originAccessIdentity: originAccessIdentity,
				}),
				viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
				functionAssociations: [
					{
						eventType: FunctionEventType.VIEWER_REQUEST,
						function: new LambdaFunction(
							this,
							`${primaryFullDomainName}-url-rewrite`.toLowerCase(),
							{
								code: FunctionCode.fromFile({
									filePath: join(__dirname, "cloudfront-url-rewrite.js"),
								}),
							},
						),
					},
				],
			},
			defaultRootObject: "index.html",
			certificate: primaryCertificate,
			errorResponses: errorResponses,
			enableLogging: true,
			logBucket: loggingBucket,
			logFilePrefix: "cloudfront-logs/",
		});

		new BucketDeployment(this, "deploy-static-website", {
			sources: [Source.asset(props.distFolderPath)],
			destinationBucket: bucketWebsite,
			distribution,
			distributionPaths: ["/*"],
		});

		const aliasRecords: ARecord[] = [];
		for (const [index, domainConfig] of props.domains.entries()) {
			const fullDomainName =
				domainConfig.subdomain && domainConfig.subdomain.length > 0
					? `${domainConfig.subdomain}.${domainConfig.domainName}`.toLowerCase()
					: domainConfig.domainName.toLowerCase();

			const zoneLogicalId =
				index === 0
					? "publicHostedZone-0"
					: `hostedZone-${fullDomainName.replace(/[.-]/g, "")}`;

			const zoneFromAttributes = HostedZone.fromHostedZoneAttributes(
				this,
				zoneLogicalId,
				{
					zoneName: domainConfig.domainName,
					hostedZoneId: domainConfig.hostedZoneId,
				},
			);

			const recordLogicalId =
				index === 0
					? "webDomainRecord-0"
					: `webDomainRecord-${fullDomainName.replace(/[.-]/g, "")}`;

			const aliasRecord = new ARecord(this, recordLogicalId, {
				zone: zoneFromAttributes,
				recordName: fullDomainName,
				target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
			});

			aliasRecords.push(aliasRecord);
		}

		new CfnOutput(this, "CloudFrontDistributionDomainName", {
			value: distribution.distributionDomainName,
			description: "CloudFront distribution domain",
			exportName: `${this.getCloudFormationRepoName()}-${props.envName}-CdnDomainName`,
		});

		new CfnOutput(this, "DnsRecordName", {
			value: aliasRecords[0].domainName || allDomainNames[0],
			description: "The DNS record name (primary)",
			exportName: `${this.getCloudFormationRepoName()}-${props.envName}-AliasRecord`,
		});
	}
}
