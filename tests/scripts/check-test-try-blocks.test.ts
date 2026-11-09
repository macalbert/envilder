import { describe, expect, it } from 'vitest';
import { findTryBlocksInTests } from '../../scripts/check-test-try-blocks.mjs';

describe('findTryBlocksInTests', () => {
  it('Should_ReportTryBlock_When_VitestTestBodyHasTryFinally', () => {
    // Arrange
    const source = [
      "it('Should_Work_When_Called', async () => {",
      '  try {',
      '    await act();',
      '  } finally {',
      '    await cleanUp();',
      '  }',
      '});',
    ].join('\n');

    // Act
    const actual = findTryBlocksInTests('tests/a.test.ts', source);

    // Assert
    expect(actual).toEqual([{ line: 2, test: 'Should_Work_When_Called' }]);
  });

  it('Should_ReportTryBlock_When_TestUsesModifierOrEach', () => {
    // Arrange
    const source = [
      "test.only('only', () => { try { a(); } catch {} });",
      "it.each([1])('each %s', (n) => { try { a(n); } catch {} });",
      `it.each\`n\n\${1}\`('tagged', () => { try { a(); } catch {} });`,
    ].join('\n');

    // Act
    const actual = findTryBlocksInTests('tests/a.test.ts', source);

    // Assert
    expect(actual).toEqual([
      { line: 1, test: 'only' },
      { line: 2, test: 'each %s' },
      { line: 4, test: 'tagged' },
    ]);
  });

  it('Should_ReportNothing_When_TryIsInHookOrHelper', () => {
    // Arrange
    const source = [
      'function helper() { try { a(); } catch {} }',
      "describe('suite', () => {",
      '  beforeEach(() => { try { a(); } catch {} });',
      "  it('ok', () => { expect(helper()).toBe(1); });",
      '});',
    ].join('\n');

    // Act
    const actual = findTryBlocksInTests('tests/a.test.ts', source);

    // Assert
    expect(actual).toEqual([]);
  });

  it('Should_ReportTryBlock_When_DivisionFollowsKeywordNamedProperty', () => {
    // Arrange
    const source = [
      "it('ratio', () => {",
      '  const ratio = stats.in / 2; try { a(); } catch {}',
      '});',
    ].join('\n');

    // Act
    const actual = findTryBlocksInTests('tests/a.test.ts', source);

    // Assert
    expect(actual).toEqual([{ line: 2, test: 'ratio' }]);
  });

  it('Should_ReportNothing_When_TryAppearsInStringCommentOrRegex', () => {
    // Arrange
    const source = [
      "it('try { in the name', () => {",
      "  const text = 'try { x }';",
      `  const template = \`try { \${"try {"} }\`;`,
      '  // try { commented }',
      '  /* try { block } */',
      '  const pattern = /try \\{ ) ( `/;',
      '  expect(pattern.test(text + template)).toBe(false);',
      '});',
    ].join('\n');

    // Act
    const actual = findTryBlocksInTests('tests/a.test.ts', source);

    // Assert
    expect(actual).toEqual([]);
  });

  it('Should_ReportTryBlock_When_PytestFunctionHasTry', () => {
    // Arrange
    const source = [
      'def helper():',
      '    try:',
      '        pass',
      '    except Exception:',
      '        pass',
      '',
      'class TestClient:',
      '    def Should_ReadSecret_When_Called(',
      '        self,',
      '    ) -> None:',
      '        """try: in a docstring is ignored"""',
      '        try:',
      '            act()',
      '        finally:',
      '            clean_up()',
      '',
      'def testing_setup():',
      '    try:',
      '        pass',
      '    finally:',
      '        pass',
    ].join('\n');

    // Act
    const actual = findTryBlocksInTests('tests/test_client.py', source);

    // Assert
    expect(actual).toEqual([
      { line: 12, test: 'Should_ReadSecret_When_Called' },
    ]);
  });

  it('Should_ReportTryBlock_When_XunitTestMethodHasTry', () => {
    // Arrange
    const source = [
      'public class ClientTests',
      '{',
      '\tprivate static void Helper()',
      '\t{',
      '\t\ttry { Act(); } catch { }',
      '\t}',
      '',
      '\t[Theory]',
      '\t[InlineData(1)]',
      '\tpublic async Task Should_Read_When_Called(int n)',
      '\t{',
      '\t\ttry',
      '\t\t{',
      '\t\t\tawait Act(n);',
      '\t\t}',
      '\t\tfinally',
      '\t\t{',
      '\t\t\tCleanUp();',
      '\t\t}',
      '\t}',
      '',
      '\t[Fact]',
      '\tpublic void Should_Pass_When_Called()',
      '\t{',
      '\t\tAct().Should().Be(1);',
      '\t}',
      '}',
    ].join('\n');

    // Act
    const actual = findTryBlocksInTests('tests/ClientTests.cs', source);

    // Assert
    expect(actual).toEqual([{ line: 12, test: 'Should_Read_When_Called' }]);
  });
});
