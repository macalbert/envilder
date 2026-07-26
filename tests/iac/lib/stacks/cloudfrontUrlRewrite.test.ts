import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("CloudFront URL Rewrite Function", () => {
	const handlerPath = join(
		__dirname,
		"../../../../src/iac/lib/stacks/cloudfront-url-rewrite.js",
	);
	const handlerCode = readFileSync(handlerPath, "utf8");

	const handlerFunc = new Function(
		"event",
		`${handlerCode}; return handler(event);`,
	) as (event: { request: { uri: string; querystring: unknown } }) => {
		uri: string;
	};

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
		const result = handlerFunc(event);

		// Assert
		expect(result.uri).toBe(expectedUri);
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
