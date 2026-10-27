import * as dotenv from 'dotenv';
import { describe, expect, it } from 'vitest';
import { parseEnvFile } from '../../../../../src/envilder/core/infrastructure/variableStore/EnvFileParser';

const LINE_SEPARATOR = String.fromCharCode(0x2028);

describe('parseEnvFile', () => {
  // Without `/` in a key the parser must read a file exactly as dotenv does:
  // the writer's round-trip checks rely on it standing in for dotenv.
  it.each([
    ['plain', 'A=1\nB=two'],
    ['export prefix and colon separator', 'export A=1\nB: two'],
    ['quotes', `A='single'\nB="double"\nC=\`backtick\``],
    ['double-quoted escapes', 'A="line\\nbreak\\rreturn"'],
    ['multiline quoted', 'A="first\nsecond"\nB=after'],
    ['comments', '# heading\nA=1 # trailing\nB="#kept"'],
    ['CRLF', 'A=1\r\nB="x\r\ny"\r\n'],
    ['blank values', 'A=\nB=""\nC='],
    ['duplicates keep the last', 'A=1\nA=2'],
    ['dotted and hyphenated keys', 'APP.NAME=1\nAPP-NAME=2'],
    ['line separator in key', `SAFE${LINE_SEPARATOR}INJECTED=1`],
    ['__proto__', '__proto__=1\nA=2'],
    ['unparseable lines', 'LOST NAME=1\nA=2\nnot an assignment'],
  ])('Should_MatchDotenv_When_KeysHaveNoSlash (%s)', (_name, content) => {
    // Act
    const actual = parseEnvFile(content);

    // Assert
    expect(actual).toEqual(dotenv.parse(content));
  });

  it('Should_ReadSlashKey_When_DotenvWouldSkipIt', () => {
    // Arrange
    const content = 'Database/Password="fictional value"\nA=1';

    // Act
    const actual = parseEnvFile(content);

    // Assert
    expect(dotenv.parse(content)).toEqual({ A: '1' });
    expect(actual).toEqual({
      'Database/Password': 'fictional value',
      A: '1',
    });
  });
});
