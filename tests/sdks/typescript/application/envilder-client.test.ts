import { afterEach, describe, expect, it, vi } from 'vitest';
import { EnvilderClient } from '../../../../src/sdks/typescript/src/application/envilder-client.js';
import type { ParsedMapFile } from '../../../../src/sdks/typescript/src/domain/parsed-map-file.js';
import type { ISecretProvider } from '../../../../src/sdks/typescript/src/domain/ports/secret-provider.js';

const createMockProvider = (
  secrets: Record<string, string | null> = {},
): ISecretProvider => ({
  getSecrets: vi.fn(async (names: string[]) => {
    const result = new Map<string, string>();
    for (const name of names) {
      const value = secrets[name];
      if (value !== null && value !== undefined) {
        result.set(name, value);
      }
    }
    return result;
  }),
});

describe('EnvilderClient', () => {
  afterEach(() => {
    delete process.env.DB_URL;
    delete process.env.API_KEY;
  });

  it('Should_ResolveSecrets_When_MappingsProvided', async () => {
    // Arrange
    const provider = createMockProvider({
      '/app/db-url': 'postgres://localhost',
      '/app/api-key': 'sk-123',
    });
    const mapFile: ParsedMapFile = {
      config: {},
      mappings: new Map([
        ['DB_URL', '/app/db-url'],
        ['API_KEY', '/app/api-key'],
      ]),
    };
    const sut = new EnvilderClient(provider);

    // Act
    const actual = await sut.resolveSecrets(mapFile);

    // Assert
    expect(actual.get('DB_URL')).toBe('postgres://localhost');
    expect(actual.get('API_KEY')).toBe('sk-123');
    expect(actual.size).toBe(2);
  });

  it('Should_OmitSecret_When_ProviderReturnsNull', async () => {
    // Arrange
    const provider = createMockProvider({
      '/app/db-url': 'postgres://localhost',
      '/app/missing': null,
    });
    const mapFile: ParsedMapFile = {
      config: {},
      mappings: new Map([
        ['DB_URL', '/app/db-url'],
        ['MISSING', '/app/missing'],
      ]),
    };
    const sut = new EnvilderClient(provider);

    // Act
    const actual = await sut.resolveSecrets(mapFile);

    // Assert
    expect(actual.get('DB_URL')).toBe('postgres://localhost');
    expect(actual.has('MISSING')).toBe(false);
    expect(actual.size).toBe(1);
  });

  it('Should_InjectIntoEnvironment_When_SecretsProvided', () => {
    // Arrange
    const secrets = new Map([
      ['DB_URL', 'postgres://localhost'],
      ['API_KEY', 'sk-123'],
    ]);

    // Act
    EnvilderClient.injectIntoEnvironment(secrets);

    // Assert
    expect(process.env.DB_URL).toBe('postgres://localhost');
    expect(process.env.API_KEY).toBe('sk-123');
  });

  it('Should_ThrowError_When_ProviderIsNull', () => {
    // Act & Assert
    expect(
      () => new EnvilderClient(null as unknown as ISecretProvider),
    ).toThrow('secretProvider cannot be null');
  });

  it('Should_ReturnEmptyMap_When_NoMappings', async () => {
    // Arrange
    const provider = createMockProvider();
    const mapFile: ParsedMapFile = {
      config: {},
      mappings: new Map(),
    };
    const sut = new EnvilderClient(provider);

    // Act
    const actual = await sut.resolveSecrets(mapFile);

    // Assert
    expect(actual.size).toBe(0);
  });
});
