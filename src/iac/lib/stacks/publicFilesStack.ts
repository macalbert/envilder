import { CfnOutput, RemovalPolicy } from "aws-cdk-lib";
import { Certificate } from "aws-cdk-lib/aws-certificatemanager";
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
import {
	AaaaRecord,
	ARecord,
	HostedZone,
	RecordTarget,
} from "aws-cdk-lib/aws-route53";
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
	/** ACM certificate in us-east-1 covering the subdomain (CloudFront requirement) */
	certificateId: string;
}

/**
 * Public, shareable files served from <subdomain>.<domainName>.
 * Objects are uploaded by hand; the stack never deploys or prunes them.
 * Kept close to zero cost: no logging, no versioning, cheapest price class.
 */
export class PublicFilesStack extends CustomStack {
	constructor(scope: Construct, props: PublicFilesStackProps) {
		super(scope, props);

		const fullDomainName =
			`${props.subdomain}.${props.domainName}`.toLowerCase();

		const hostedZone = HostedZone.fromHostedZoneAttributes(
			this,
			"hosted-zone",
			{
				zoneName: props.domainName.toLowerCase(),
				hostedZoneId: props.hostedZoneId,
			},
		);

		const certificate = Certificate.fromCertificateArn(
			this,
			"certificate",
			`arn:aws:acm:us-east-1:${this.account}:certificate/${props.certificateId}`,
		);

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

		const aliasTarget = RecordTarget.fromAlias(
			new CloudFrontTarget(distribution),
		);

		new ARecord(this, "public-files-record", {
			zone: hostedZone,
			recordName: fullDomainName,
			target: aliasTarget,
		});

		new AaaaRecord(this, "public-files-record-ipv6", {
			zone: hostedZone,
			recordName: fullDomainName,
			target: aliasTarget,
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
