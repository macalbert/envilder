import { App, Stack } from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
import { AppEnvironment } from "../../../../src/iac/lib/core/types";
import {
	PublicFilesStack,
	type PublicFilesStackProps,
} from "../../../../src/iac/lib/stacks/publicFilesStack";

describe("Public files Stack", () => {
	test("Should_BlockAllPublicAccess_When_BucketIsCreated", () => {
		// Arrange
		const sut = createPublicFilesStack();

		// Act
		const actual = Template.fromStack(sut);

		// Assert
		actual.hasResourceProperties("AWS::S3::Bucket", {
			BucketName: "files.domain.com",
			PublicAccessBlockConfiguration: {
				BlockPublicAcls: true,
				BlockPublicPolicy: true,
				IgnorePublicAcls: true,
				RestrictPublicBuckets: true,
			},
			OwnershipControls: {
				Rules: [{ ObjectOwnership: "BucketOwnerEnforced" }],
			},
		});
		actual.hasResource("AWS::S3::Bucket", {
			DeletionPolicy: "Retain",
			UpdateReplacePolicy: "Retain",
		});
	});

	test("Should_OnlyAllowCloudFrontToReadBucket_When_DistributionIsCreated", () => {
		// Arrange
		const sut = createPublicFilesStack();

		// Act
		const actual = Template.fromStack(sut);

		// Assert
		actual.resourceCountIs("AWS::CloudFront::OriginAccessControl", 1);
		actual.hasResourceProperties("AWS::S3::BucketPolicy", {
			PolicyDocument: {
				Statement: Match.arrayWith([
					Match.objectLike({
						Action: "s3:GetObject",
						Effect: "Allow",
						Principal: { Service: "cloudfront.amazonaws.com" },
					}),
				]),
			},
		});
	});

	test("Should_ServeFilesFromSubdomainCheaply_When_DistributionIsCreated", () => {
		// Arrange
		const sut = createPublicFilesStack();

		// Act
		const actual = Template.fromStack(sut);

		// Assert
		actual.hasResourceProperties("AWS::CertificateManager::Certificate", {
			DomainName: "files.domain.com",
			ValidationMethod: "DNS",
		});
		actual.hasResourceProperties("AWS::CloudFront::Distribution", {
			DistributionConfig: Match.objectLike({
				Aliases: ["files.domain.com"],
				PriceClass: "PriceClass_100",
				Logging: Match.absent(),
				DefaultCacheBehavior: Match.objectLike({
					ViewerProtocolPolicy: "redirect-to-https",
					AllowedMethods: ["GET", "HEAD"],
				}),
			}),
		});
		actual.hasResourceProperties("AWS::Route53::RecordSet", {
			Name: "files.domain.com.",
			Type: "A",
		});
	});

	test("Should_Throw_When_RegionIsNotUsEast1", () => {
		// Arrange
		const props = createPublicFilesStackProps("eu-west-1");

		// Act
		const action = () => new PublicFilesStack(new App(), props);

		// Assert
		expect(action).toThrow("PublicFilesStack must be deployed to us-east-1");
	});

	function createPublicFilesStack(): Stack {
		return new PublicFilesStack(new App(), createPublicFilesStackProps());
	}

	function createPublicFilesStackProps(
		region = "us-east-1",
	): PublicFilesStackProps {
		return {
			env: { account: "account", region },
			name: "filestest",
			subdomain: "files",
			domainName: "domain.com",
			hostedZoneId: "123456789",
			envName: AppEnvironment.Development,
			githubRepo: "test-files",
			stackName: "test-files",
		};
	}
});
