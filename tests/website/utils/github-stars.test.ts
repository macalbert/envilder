import { describe, expect, it, vi } from 'vitest';
import {
  fetchStarCount,
  formatStarCount,
} from '../../../src/website/src/utils/github-stars';

const jsonResponse = (body: unknown, ok = true) =>
  ({ ok, json: async () => body }) as Response;

describe('fetchStarCount', () => {
  it('Should_ReturnStarCount_When_ApiResponds', async () => {
    // Arrange
    const fetcher = vi.fn(async () => jsonResponse({ stargazers_count: 139 }));

    // Act
    const actual = await fetchStarCount(fetcher, undefined);

    // Assert
    expect(actual).toBe(139);
    expect(fetcher).toHaveBeenCalledWith(
      'https://api.github.com/repos/macalbert/envilder',
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  it('Should_SendBearerToken_When_TokenIsProvided', async () => {
    // Arrange
    const fetcher = vi.fn(async () => jsonResponse({ stargazers_count: 1 }));

    // Act
    await fetchStarCount(fetcher, 'test-token');

    // Assert
    const init = fetcher.mock.calls[0][1] as RequestInit;
    expect((init.headers as Record<string, string>).Authorization).toBe(
      'Bearer test-token',
    );
  });

  it('Should_OmitAuthorization_When_NoTokenIsProvided', async () => {
    // Arrange
    const fetcher = vi.fn(async () => jsonResponse({ stargazers_count: 1 }));

    // Act
    await fetchStarCount(fetcher, undefined);

    // Assert
    const init = fetcher.mock.calls[0][1] as RequestInit;
    expect(init.headers).not.toHaveProperty('Authorization');
  });

  it('Should_ReturnNull_When_ApiIsRateLimited', async () => {
    // Arrange
    const fetcher = async () => jsonResponse({ message: 'limit' }, false);

    // Act
    const actual = await fetchStarCount(fetcher, undefined);

    // Assert
    expect(actual).toBeNull();
  });

  it('Should_ReturnNull_When_RequestFails', async () => {
    // Arrange
    const fetcher = async () => {
      throw new Error('offline');
    };

    // Act
    const actual = await fetchStarCount(fetcher, undefined);

    // Assert
    expect(actual).toBeNull();
  });

  it('Should_ReturnNull_When_PayloadHasNoNumericCount', async () => {
    // Arrange
    const fetcher = async () => jsonResponse({ stargazers_count: 'many' });

    // Act
    const actual = await fetchStarCount(fetcher, undefined);

    // Assert
    expect(actual).toBeNull();
  });
});

describe('formatStarCount', () => {
  it.each([
    [0, '0'],
    [139, '139'],
    [999, '999'],
    [1000, '1k'],
    [1234, '1.2k'],
    [12500, '12.5k'],
  ])('Should_Format_%i_As_%s', (value, expected) => {
    // Arrange

    // Act
    const actual = formatStarCount(value);

    // Assert
    expect(actual).toBe(expected);
  });
});
