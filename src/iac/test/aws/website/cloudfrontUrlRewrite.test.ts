import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('CloudFront URL Rewrite Function', () => {
  // Read and execute the handler file
  const handlerPath = join(
    __dirname,
    '../../../src/aws/website/cloudfront-url-rewrite.js',
  );
  const handlerCode = readFileSync(handlerPath, 'utf8');

  // Create handler function from the source file
  const handlerFunc = new Function(
    'event',
    `${handlerCode}; return handler(event);`,
  ) as (event: { request: { uri: string; querystring: string } }) => {
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
    { input: '/', expectedUri: '/' },
    { input: '/dashboard', expectedUri: '/dashboard.html' },
    { input: '/dashboard/', expectedUri: '/dashboard.html' },
    { input: '/groups', expectedUri: '/groups.html' },
    { input: '/app.js', expectedUri: '/app.js' },
    { input: '/styles/main.css', expectedUri: '/styles/main.css' },
    { input: '/IMG/Photo.JPG', expectedUri: '/IMG/Photo.JPG' },
    { input: '/IMG/photo.jpg', expectedUri: '/IMG/photo.jpg' },
    { input: '/api/users', expectedUri: '/api/users' },
    { input: '/api/users/123', expectedUri: '/api/users/123' },
    { input: '/API/USERS', expectedUri: '/API/USERS' },
    { input: '/folder/page', expectedUri: '/folder/page.html' },
    { input: '/contact/', expectedUri: '/contact.html' },
    { input: '/file.txt', expectedUri: '/file.txt' },
    { input: '/source.map', expectedUri: '/source.map' },
  ];

  const testCasesWithQueryString: TestCaseWithQueryString[] = [
    {
      input: '/contact?utm_source=x',
      expectedVisible: '/contact.html?utm_source=x',
    },
    {
      input: '/styles/main.css?ver=123',
      expectedVisible: '/styles/main.css?ver=123',
    },
    {
      input: '/dashboard?param1=value1&param2=value2',
      expectedVisible: '/dashboard.html?param1=value1&param2=value2',
    },
  ];

  const apiRoutes: TestCase[] = [
    { input: '/api/users', expectedUri: '/api/users' },
    { input: '/API/data', expectedUri: '/API/data' },
    { input: '/api/v1/endpoint', expectedUri: '/api/v1/endpoint' },
  ];

  const staticFiles: TestCase[] = [
    { input: '/app.js', expectedUri: '/app.js' },
    { input: '/styles.css', expectedUri: '/styles.css' },
    { input: '/image.png', expectedUri: '/image.png' },
    { input: '/font.woff2', expectedUri: '/font.woff2' },
    { input: '/data.json', expectedUri: '/data.json' },
  ];

  test.each(testCases)('Should_RewriteUrlCorrectly_When_RequestedUrl_$input', ({
    input,
    expectedUri,
  }) => {
    // Arrange
    const event = {
      request: {
        uri: input,
        querystring: '',
      },
    };

    // Act
    const result = handlerFunc(event);

    // Assert
    expect(result.uri).toBe(expectedUri);
  });

  test.each(
    testCasesWithQueryString,
  )('Should_PreserveQueryStrings_When_UrlHasParameters_$input', ({
    input,
    expectedVisible,
  }) => {
    // Arrange
    const uriPath = input.split('?')[0];
    const qs = input.split('?')[1];

    const event = {
      request: {
        uri: uriPath,
        querystring: qs,
      },
    };

    // Act
    const result = handlerFunc(event);
    const visible = `${result.uri}?${qs}`;
    // Assert
    expect(visible).toBe(expectedVisible);
  });

  test.each(apiRoutes)('Should_NotModifyUri_When_RequestIsApiRoute_$input', ({
    input,
    expectedUri,
  }) => {
    // Arrange
    const event = {
      request: {
        uri: input,
        querystring: '',
      },
    };

    // Act
    const result = handlerFunc(event);

    // Assert
    expect(result.uri).toBe(expectedUri);
  });

  test.each(
    staticFiles,
  )('Should_NotModifyUri_When_FileHasKnownExtension_$input', ({
    input,
    expectedUri,
  }) => {
    // Arrange
    const event = {
      request: {
        uri: input,
        querystring: '',
      },
    };

    // Act
    const result = handlerFunc(event);

    // Assert
    expect(result.uri).toBe(expectedUri);
  });
});
