import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('CloudFront URL Rewrite Function', () => {
  const handlerPath = join(
    __dirname,
    '../../../../src/iac/infrastructure/stacks/cloudfront-url-rewrite.js',
  );
  const handlerCode = readFileSync(handlerPath, 'utf8');

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
    { input: '/dashboard', expectedUri: '/dashboard/index.html' },
    { input: '/contact/', expectedUri: '/contact/index.html' },
    { input: '/app.js', expectedUri: '/app.js' },
    { input: '/api/users', expectedUri: '/api/users' },
    { input: '/folder/page', expectedUri: '/folder/page/index.html' },
  ];

  const testCasesWithQueryString: TestCaseWithQueryString[] = [
    {
      input: '/contact?utm_source=x',
      expectedVisible: '/contact/index.html?utm_source=x',
    },
    {
      input: '/styles/main.css?ver=123',
      expectedVisible: '/styles/main.css?ver=123',
    },
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
    const [path, querystring] = input.split('?');
    const event = {
      request: {
        uri: path,
        querystring: querystring || '',
      },
    };

    // Act
    const result = handlerFunc(event);

    // Assert
    const actualVisible = querystring
      ? `${result.uri}?${querystring}`
      : result.uri;
    expect(actualVisible).toBe(expectedVisible);
  });
});
