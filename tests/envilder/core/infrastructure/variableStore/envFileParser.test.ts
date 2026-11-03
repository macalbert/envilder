import * as dotenv from 'dotenv';
import { describe, expect, it } from 'vitest';
import {
  parseEnvFile,
  parseEnvFileEntries,
} from '../../../../../src/envilder/core/infrastructure/variableStore/EnvFileParser';

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
    ['blank and indented lines', '\n\nA=1\n \t\n\r\n  export B=2\n\n\tC=3\n'],
    ['line separators as blanks', `${LINE_SEPARATOR}${LINE_SEPARATOR}A=1`],
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

describe('parseEnvFileEntries', () => {
  it('Should_KeepEveryAssignmentInOrder_When_KeyRepeats', () => {
    // Arrange
    const content = '# heading\n\nA=1\nexport B="two"\nA=3 # again\n';

    // Act
    const actual = parseEnvFileEntries(content);

    // Assert
    expect(actual).toEqual([
      { key: 'A', value: '1' },
      { key: 'B', value: 'two' },
      { key: 'A', value: '3' },
    ]);
  });

  it('Should_ReadValuesAsParseEnvFileDoes_When_ValuesAreQuotedOrEmpty', () => {
    // Arrange
    const content = `A='single'\nB=\nC="line\\nbreak"\nD=\`tick\``;

    // Act
    const actual = parseEnvFileEntries(content);

    // Assert
    expect(Object.fromEntries(actual.map((e) => [e.key, e.value]))).toEqual(
      parseEnvFile(content),
    );
  });
});
