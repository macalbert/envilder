import { describe, expect, it } from 'vitest';
import { buildChildEnvironment } from '../../../../src/envilder/core/domain/ChildEnvironment';

describe('buildChildEnvironment', () => {
  it('Should_InheritParentEnvironment_When_ChildStarts', () => {
    // Arrange
    const inherited = { HOME: '/home/dev', PATH: '/usr/bin', NODE_ENV: 'test' };
    const resolved = { DB_URL: 'fake-db-url', API_KEY: 'key-value' };

    // Act
    const actual = buildChildEnvironment(inherited, resolved, 'linux');

    // Assert
    expect(actual.env).toEqual({
      HOME: '/home/dev',
      PATH: '/usr/bin',
      NODE_ENV: 'test',
      DB_URL: 'fake-db-url',
      API_KEY: 'key-value',
    });
    expect(actual.overridden).toEqual([]);
  });

  it('Should_OverrideInheritedVariable_When_MapDeclaresSameName', () => {
    // Arrange
    const inherited = { API_KEY: 'from-shell', HOME: '/home/dev' };
    const resolved = { API_KEY: 'from-provider' };

    // Act
    const actual = buildChildEnvironment(inherited, resolved, 'linux');

    // Assert
    expect(actual.env.API_KEY).toBe('from-provider');
    expect(actual.env.HOME).toBe('/home/dev');
    expect(actual.overridden).toEqual(['API_KEY']);
  });

  it('Should_MergeNamesCaseInsensitively_When_RunningOnWindows', () => {
    // Arrange
    const inherited = { Path: 'C:\\Windows', SystemRoot: 'C:\\Windows' };
    const resolved = { PATH: 'C:\\mapped' };

    // Act
    const actual = buildChildEnvironment(inherited, resolved, 'win32');

    // Assert
    const pathEntries = Object.entries(actual.env).filter(
      ([name]) => name.toUpperCase() === 'PATH',
    );
    expect(pathEntries).toEqual([['PATH', 'C:\\mapped']]);
    expect(actual.env.SystemRoot).toBe('C:\\Windows');
    expect(actual.overridden).toEqual(['Path']);
  });

  it('Should_KeepNamesThatDifferOnlyByCase_When_RunningOnPosix', () => {
    // Arrange
    const inherited = { Path: '/inherited' };
    const resolved = { PATH: '/mapped' };

    // Act
    const actual = buildChildEnvironment(inherited, resolved, 'linux');

    // Assert
    expect(actual.env).toEqual({ Path: '/inherited', PATH: '/mapped' });
    expect(actual.overridden).toEqual([]);
  });

  it('Should_DropUndefinedInheritedValues_When_ComposingEnvironment', () => {
    // Arrange
    const inherited = { DEFINED: 'yes', MISSING: undefined };
    const resolved = { DB_URL: 'fake-db-url' };

    // Act
    const actual = buildChildEnvironment(inherited, resolved, 'linux');

    // Assert
    expect(Object.keys(actual.env).sort()).toEqual(['DB_URL', 'DEFINED']);
  });

  it('Should_PassValueByteForByte_When_ValueIsMultiline', () => {
    // Arrange
    const pem =
      '-----BEGIN FAKE TEST BLOCK-----\nMIIEvQIBADANBg\r\nkqhkiG9w0BAQEF\n-----END FAKE TEST BLOCK-----\n';
    const special = `a=b "quoted" 'single' #hash $DB_URL \\back ñ 日本 \u{1F512}`;
    const resolved = { PEM_KEY: pem, SPECIAL: special };

    // Act
    const actual = buildChildEnvironment({}, resolved, 'linux');

    // Assert
    expect(actual.env.PEM_KEY).toBe(pem);
    expect(actual.env.SPECIAL).toBe(special);
  });

  it('Should_NotMutateInputs_When_ComposingEnvironment', () => {
    // Arrange
    const inherited = { API_KEY: 'from-shell', HOME: '/home/dev' };
    const resolved = { API_KEY: 'from-provider', DB_URL: 'fake-db-url' };
    const inheritedSnapshot = { ...inherited };
    const resolvedSnapshot = { ...resolved };

    // Act
    buildChildEnvironment(inherited, resolved, 'win32');

    // Assert
    expect(inherited).toEqual(inheritedSnapshot);
    expect(resolved).toEqual(resolvedSnapshot);
  });

  it.each([
    ['Linux', 'linux'],
    ['Win32', 'win32'],
  ])(
    'Should_KeepInheritedProtoVariable_When_ComposingEnvironmentOn%s',
    (_name, platform) => {
      // Arrange
      const inherited: Record<string, string | undefined> = {
        HOME: '/home/dev',
      };
      Object.defineProperty(inherited, '__proto__', {
        value: 'proto-value',
        enumerable: true,
        writable: true,
        configurable: true,
      });

      // Act
      const actual = buildChildEnvironment(
        inherited,
        { DB_URL: 'fake-db-url' },
        platform,
      );

      // Assert
      expect(Object.hasOwn(actual.env, '__proto__')).toBe(true);
      expect(
        Object.getOwnPropertyDescriptor(actual.env, '__proto__')?.value,
      ).toBe('proto-value');
      expect(actual.env.HOME).toBe('/home/dev');
      expect(actual.env.DB_URL).toBe('fake-db-url');
      expect(actual.overridden).toEqual([]);
    },
  );
});
