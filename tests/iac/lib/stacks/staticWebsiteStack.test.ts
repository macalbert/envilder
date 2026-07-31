import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { App, Stack } from "aws-cdk-lib";
import { Capture, Match, Template } from "aws-cdk-lib/assertions";
import { AppEnvironment } from "../../../../src/iac/lib/core/types";
import type { DomainConfig } from "../../../../src/iac/lib/stacks/customStack";
import {
	StaticWebsiteStack,
	type StaticWebsiteStackProps,
} from "../../../../src/iac/lib/stacks/staticWebsiteStack";

describe("Static website Stack", () => {
	const env = {
		account: "account",
		region: "eu-west-1",
	};

	let tmpDir: string;

	beforeEach(() => {
		tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "static-website-test-"));
		fs.writeFileSync(path.join(tmpDir, "index.html"), "<html></html>");
	});

	afterEach(() => {
		fs.rmSync(tmpDir, { recursive: true, force: true });
	});

	test("Should_CreateWebsite_When_StackIsCalled", () => {
		// Arrange
		const stack = new Stack(new App(), "staticWebsiteStackTest", {
			env: env,
		});
		const props = createStaticWebsiteStackProps();

		// Act
		const actual = new StaticWebsiteStack(stack, props);

		// Assert
		const template = Template.fromStack(actual).toJSON();
		normalizeStaticWebsiteTemplate(template);

		expect(template).toMatchSnapshot("staticWebsiteStackTest");
	});

	test("Should_ReturnNotFoundPage_When_OriginReturnsMissingObject", () => {
		// Arrange
		const stack = new Stack(new App(), "staticWebsiteStackTest", {
			env: env,
		});

		const props = createStaticWebsiteStackProps();
		const sut = new StaticWebsiteStack(stack, props);
		const template = Template.fromStack(sut);

		// Act
		const actual = template;

		// Assert
		actual.hasResourceProperties("AWS::CloudFront::Distribution", {
			DistributionConfig: Match.objectLike({
				CustomErrorResponses: Match.arrayWith([
					Match.objectLike({
						ErrorCachingMinTTL: 300,
						ErrorCode: 403,
						ResponseCode: 404,
						ResponsePagePath: "/404.html",
					}),
					Match.objectLike({
						ErrorCachingMinTTL: 300,
						ErrorCode: 404,
						ResponseCode: 404,
						ResponsePagePath: "/404.html",
					}),
				]),
			}),
		});
	});

	test("Should_ApplyCacheAndSecurityHeaders_When_WebsiteIsCreated", () => {
		// Arrange
		const stack = new Stack(new App(), "staticWebsiteStackTest", {
			env: env,
		});
		const props = createStaticWebsiteStackProps();
		const sut = new StaticWebsiteStack(stack, props);
		const defaultResponseHeadersPolicyId = new Capture();
		const assetResponseHeadersPolicyId = new Capture();

		// Act
		const actual = Template.fromStack(sut);

		// Assert
		actual.hasResourceProperties("AWS::CloudFront::Distribution", {
			DistributionConfig: Match.objectLike({
				HttpVersion: "http2and3",
				DefaultCacheBehavior: Match.objectLike({
					ResponseHeadersPolicyId: {
						Ref: defaultResponseHeadersPolicyId,
					},
				}),
				CacheBehaviors: Match.arrayWith([
					Match.objectLike({
						PathPattern: "_assets/*",
						ResponseHeadersPolicyId: {
							Ref: assetResponseHeadersPolicyId,
						},
					}),
				]),
			}),
		});
		expect(
			actual.findResources("AWS::CloudFront::ResponseHeadersPolicy")[
				defaultResponseHeadersPolicyId.asString()
			],
		).toMatchObject({
			Type: "AWS::CloudFront::ResponseHeadersPolicy",
			Properties: {
				ResponseHeadersPolicyConfig: {
					CustomHeadersConfig: {
						Items: [
							{
								Header: "Cache-Control",
								Value: "public, max-age=0, s-maxage=300, must-revalidate",
							},
						],
					},
					SecurityHeadersConfig: {
						ContentTypeOptions: {
							Override: true,
						},
						FrameOptions: {
							FrameOption: "DENY",
						},
						ReferrerPolicy: {
							ReferrerPolicy: "strict-origin-when-cross-origin",
						},
						StrictTransportSecurity: {
							AccessControlMaxAgeSec: 31536000,
						},
					},
				},
			},
		});
		expect(
			actual.findResources("AWS::CloudFront::ResponseHeadersPolicy")[
				assetResponseHeadersPolicyId.asString()
			],
		).toMatchObject({
			Type: "AWS::CloudFront::ResponseHeadersPolicy",
			Properties: {
				ResponseHeadersPolicyConfig: {
					CustomHeadersConfig: {
						Items: [
							{
								Header: "Cache-Control",
								Value: "public, max-age=31536000, immutable",
							},
						],
					},
				},
			},
		});
	});

	// biome-ignore lint/suspicious/noExplicitAny: CDK template is untyped
	function normalizeStaticWebsiteTemplate(template: Record<string, any>): void {
		for (const key in template.Resources) {
			const resource = template.Resources[key];
			if (resource.Properties.SourceObjectKeys) {
				const { SourceObjectKeys: _SourceObjectKeys, ...otherProps } =
					resource.Properties;
				resource.Properties = otherProps;
			}
			if (resource.Properties.Content?.S3Key) {
				const { S3Key: _S3Key, ...otherContentProps } =
					resource.Properties.Content;
				resource.Properties.Content = otherContentProps;
			}
			if (resource.Properties.Code?.S3Key) {
				const { S3Key: _S3KeyCode, ...otherCodeProps } =
					resource.Properties.Code;
				resource.Properties.Code = otherCodeProps;
			}
		}
	}

	function createStaticWebsiteStackProps(): StaticWebsiteStackProps {
		const domains: DomainConfig[] = [
			{
				subdomain: "test",
				domainName: "domain.com",
				hostedZoneId: "123456789",
				certificateId: "some-guid",
			},
		];

		return {
			env: env,
			name: "websitetest",
			domains: domains,
			distFolderPath: tmpDir,
			envName: AppEnvironment.Development,
			githubRepo: "test-website",
			stackName: "test-web-app",
		};
	}
});
