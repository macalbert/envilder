import { CfnOutput, RemovalPolicy } from "aws-cdk-lib";
import {
	Certificate,
	CertificateValidation,
} from "aws-cdk-lib/aws-certificatemanager";
import {
	AllowedMethods,
	CachePolicy,
	Distribution,
	HttpVersion,
	PriceClass,
	ResponseHeadersPolicy,
	ViewerProtocolPolicy,
} from "aws-cdk-lib/aws-cloudfront";
import { S3BucketOrigin } from "aws-cdk-lib/aws-cloudfront-origins";
import { ARecord, HostedZone, RecordTarget } from "aws-cdk-lib/aws-route53";
import { CloudFrontTarget } from "aws-cdk-lib/aws-route53-targets";
import {
	BlockPublicAccess,
	Bucket,
	BucketEncryption,
	ObjectOwnership,
} from "aws-cdk-lib/aws-s3";
import type { Construct } from "constructs";
import { CustomStack, type CustomStackProps } from "./customStack";

export interface PublicFilesStackProps extends CustomStackProps {
	subdomain: string;
	domainName: string;
	hostedZoneId: string;
}

/**
 * Public, shareable files served from <subdomain>.<domainName>.
 * Objects are uploaded by hand; the stack never deploys or prunes them.
 * Kept close to zero cost: no logging, no versioning, cheapest price class.
 * CloudFront requires its certificate in us-east-1, so this stack must be
 * deployed there.
 */
export class PublicFilesStack extends CustomStack {
	constructor(scope: Construct, props: PublicFilesStackProps) {
		super(scope, props);

		if (props.env?.region && props.env.region !== "us-east-1") {
			throw new Error("PublicFilesStack must be deployed to us-east-1");
		}

		const fullDomainName =
			`${props.subdomain}.${props.domainName}`.toLowerCase();

		const hostedZone = HostedZone.fromHostedZoneAttributes(
			this,
			"hosted-zone",
			{
				zoneName: props.domainName,
				hostedZoneId: props.hostedZoneId,
			},
		);

		const certificate = new Certificate(this, "certificate", {
			domainName: fullDomainName,
			validation: CertificateValidation.fromDns(hostedZone),
		});

		const bucket = new Bucket(this, "public-files-bucket", {
			bucketName: fullDomainName,
			publicReadAccess: false,
			blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
			objectOwnership: ObjectOwnership.BUCKET_OWNER_ENFORCED,
			encryption: BucketEncryption.S3_MANAGED,
			enforceSSL: true,
			versioned: false,
			// Shared files are uploaded by hand: never delete them with the stack
			removalPolicy: RemovalPolicy.RETAIN,
		});

		const distribution = new Distribution(this, "distribution", {
			domainNames: [fullDomainName],
			certificate,
			defaultBehavior: {
				origin: S3BucketOrigin.withOriginAccessControl(bucket),
				viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
				allowedMethods: AllowedMethods.ALLOW_GET_HEAD,
				cachePolicy: CachePolicy.CACHING_OPTIMIZED,
				responseHeadersPolicy: ResponseHeadersPolicy.SECURITY_HEADERS,
				compress: true,
			},
			priceClass: PriceClass.PRICE_CLASS_100,
			httpVersion: HttpVersion.HTTP2_AND_3,
			enableLogging: false,
		});

		new ARecord(this, "public-files-record", {
			zone: hostedZone,
			recordName: fullDomainName,
			target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
		});

		new CfnOutput(this, "PublicFilesBucketName", {
			value: bucket.bucketName,
			description: "Bucket to upload shareable files to",
		});

		new CfnOutput(this, "PublicFilesUrl", {
			value: `https://${fullDomainName}`,
			description: "Base URL of the shareable files",
		});
	}
}
