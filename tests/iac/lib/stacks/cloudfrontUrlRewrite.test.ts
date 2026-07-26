import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("CloudFront URL Rewrite Function", () => {
	interface CloudFrontRequest {
		uri: string;
		querystring: unknown;
	}

	interface CloudFrontRedirectResponse {
		statusCode: number;
		statusDescription: string;
		headers: {
			location: {
				value: string;
			};
		};
	}

	type CloudFrontHandlerResult =
		| CloudFrontRequest
		| CloudFrontRedirectResponse;

	const handlerPath = join(
		__dirname,
		"../../../../src/iac/lib/stacks/cloudfront-url-rewrite.js",
	);
	const handlerCode = readFileSync(handlerPath, "utf8");

	const handlerFunc = new Function(
		"event",
		`${handlerCode}; return handler(event);`,
	) as (event: {
		request: CloudFrontRequest;
	}) => CloudFrontHandlerResult;

	interface TestCase {
		input: string;
		expectedUri: string;
	}

	interface TestCaseWithQueryString {
		input: string;
		expectedVisible: string;
	}

	const testCases: TestCase[] = [
		{ input: "/", expectedUri: "/" },
		{ input: "/contact/", expectedUri: "/contact/index.html" },
		{ input: "/app.js", expectedUri: "/app.js" },
		{ input: "/api/users", expectedUri: "/api/users" },
	];

	const testCasesWithQueryString: TestCaseWithQueryString[] = [
		{
			input: "/contact?utm_source=x",
			expectedVisible: "/contact/?utm_source=x",
		},
	];

	test.each(testCases)("Should_RewriteUrlCorrectly_When_RequestedUrl_$input", ({
		input,
		expectedUri,
	}) => {
		// Arrange
		const event = {
			request: {
				uri: input,
				querystring: "",
			},
		};

		// Act
		const actual = handlerFunc(event);

		// Assert
		expect(actual).toMatchObject({
			uri: expectedUri,
		});
	});

	test.each(
		testCasesWithQueryString,
	)("Should_PreserveQueryStrings_When_RedirectingUrl_$input", ({
		input,
		expectedVisible,
	}) => {
		// Arrange
		const [path, querystring] = input.split("?");
		const event = {
			request: {
				uri: path,
				querystring: querystring || "",
			},
		};

		// Act
		const actual = handlerFunc(event);

		// Assert
		expect(actual).toMatchObject({
			statusCode: 301,
			headers: {
				location: {
					value: expectedVisible,
				},
			},
		});
	});

	test("Should_KeepStaticUrl_When_StaticFileHasQueryString", () => {
		// Arrange
		const event = {
			request: {
				uri: "/styles/main.css",
				querystring: "ver=123",
			},
		};

		// Act
		const actual = handlerFunc(event);

		// Assert
		expect(actual).toMatchObject({
			uri: "/styles/main.css",
			querystring: "ver=123",
		});
	});

	test("Should_PreserveCloudFrontQueryObject_When_RedirectingUrl", () => {
		// Arrange
		const event = {
			request: {
				uri: "/docs",
				querystring: {
					utm_source: {
						value: "search",
					},
				},
			},
		};

		// Act
		const actual = handlerFunc(event);

		// Assert
		expect(actual).toMatchObject({
			statusCode: 301,
			headers: {
				location: {
					value: "/docs/?utm_source=search",
				},
			},
		});
	});

	test(
		"Should_PercentEncodeQueryObjectParameters_When_RedirectingUrl",
		() => {
			// Arrange
			const event = {
				request: {
					uri: "/docs",
					querystring: {
						"category name": {
							value: "green tea&herbs",
						},
						flag: {},
						empty: {
							value: "",
						},
						"a&b": {
							value: "c=d#f",
						},
					},
				},
			};
			const expected =
				"/docs/?category%20name=green%20tea%26herbs&flag&empty=&a%26b=c%3Dd%23f";

			// Act
			const actual = handlerFunc(event);

			// Assert
			expect(actual).toMatchObject({
				statusCode: 301,
				headers: {
					location: {
						value: expected,
					},
				},
			});
		},
	);

	test("Should_RedirectToTrailingSlash_When_PathHasNoFileExtension", () => {
		// Arrange
		const event = {
			request: {
				uri: "/docs",
				querystring: "",
			},
		};

		// Act
		const actual = handlerFunc(event);

		// Assert
		expect(actual).toMatchObject({
			statusCode: 301,
			headers: {
				location: {
					value: "/docs/",
				},
			},
		});
	});

	test("Should_RedirectLegacySitemap_When_SitemapXmlIsRequested", () => {
		// Arrange
		const event = {
			request: {
				uri: "/sitemap.xml",
				querystring: "",
			},
		};

		// Act
		const actual = handlerFunc(event);

		// Assert
		expect(actual).toMatchObject({
			statusCode: 301,
			headers: {
				location: {
					value: "/sitemap-index.xml",
				},
			},
		});
	});
});
