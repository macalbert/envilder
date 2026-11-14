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

  it('Should_ReportTryBlock_When_TestCallsHelperWithTry', () => {
    // Arrange
    const source = [
      'function run() { try { a(); } catch {} }',
      'const read = async () => {',
      '  try { return a(); } catch { return undefined; }',
      '};',
      "it('direct', () => { expect(run()).toBe(1); });",
      "it('arrow', async () => { expect(await read()).toBe(1); });",
    ].join('\n');

    // Act
    const actual = findTryBlocksInTests('tests/a.test.ts', source);

    // Assert
    expect(actual).toEqual([
      { line: 1, test: 'direct', helper: 'run' },
      { line: 3, test: 'arrow', helper: 'read' },
    ]);
  });

  it('Should_ReportTryBlock_When_HelperIsBareArrowOrFunctionExpression', () => {
    // Arrange
    const source = [
      'const read = name => { try { a(name); } catch {} };',
      'const write = async function () { try { a(); } catch {} };',
      "it('forms', async () => { expect(read('x') ?? (await write())).toBe(1); });",
    ].join('\n');

    // Act
    const actual = findTryBlocksInTests('tests/a.test.ts', source);

    // Assert
    expect(actual).toEqual([
      { line: 1, test: 'forms', helper: 'read' },
      { line: 2, test: 'forms', helper: 'write' },
    ]);
  });

  it('Should_ReportNothing_When_ParenthesizedInitializerPrecedesHookArrow', () => {
    // Arrange
    const source = [
      'const options = ({ retries: 1 });',
      'beforeEach(() => { try { prepare(); } finally { cleanup(); } });',
      "it('ok', () => { expect(options.retries).toBe(1); });",
    ].join('\n');

    // Act
    const actual = findTryBlocksInTests('tests/a.test.ts', source);

    // Assert
    expect(actual).toEqual([]);
  });

  it('Should_ReportNothing_When_HelperNameAppearsOnlyInStringOrComment', () => {
    // Arrange
    const python = [
      'def cleanup():',
      '    try:',
      '        release()',
      '    finally:',
      '        finish()',
      '',
      'def Should_ReturnName_When_Called():',
      '    assert get_name() == "cleanup"  # cleanup',
    ].join('\n');
    const cSharp = [
      'public class ClientTests',
      '{',
      '\tprivate static void Cleanup()',
      '\t{',
      '\t\ttry { Release(); } finally { Finish(); }',
      '\t}',
      '',
      '\t[Fact]',
      '\tpublic void Should_ReturnName_When_Called()',
      '\t{',
      '\t\tGetName().Should().Be("Cleanup"); // Cleanup',
      '\t}',
      '}',
    ].join('\n');

    // Act
    const actual = [
      ...findTryBlocksInTests('tests/test_client.py', python),
      ...findTryBlocksInTests('tests/ClientTests.cs', cSharp),
    ];

    // Assert
    expect(actual).toEqual([]);
  });

  it('Should_ReportTryBlock_When_HelperReachesAnotherHelperWithTry', () => {
    // Arrange
    const source = [
      'function inner() {',
      '  try { a(); } finally { b(); }',
      '}',
      'function outer() { return inner(); }',
      "it('chain', () => { expect(outer()).toBe(1); });",
    ].join('\n');

    // Act
    const actual = findTryBlocksInTests('tests/a.test.ts', source);

    // Assert
    expect(actual).toEqual([{ line: 2, test: 'chain', helper: 'inner' }]);
  });

  it('Should_ReportNothing_When_TryIsInHookOrHelperOnlyHooksCall', () => {
    // Arrange
    const source = [
      'function cleanUp() { try { a(); } catch {} }',
      'function unused() { try { a(); } catch {} }',
      "describe('suite', () => {",
      '  beforeEach(() => { try { a(); } catch {} });',
      '  afterAll(() => cleanUp());',
      "  it('ok', () => { expect(1).toBe(1); });",
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

  it('Should_ReportTryBlock_When_PytestTestCallsHelperWithTry', () => {
    // Arrange
    const source = [
      'def read_secret():',
      '    try:',
      '        return act()',
      '    except KeyError:',
      '        return None',
      '',
      'class TestClient:',
      '    def _parse(self):',
      '        try:',
      '            pass',
      '        finally:',
      '            pass',
      '',
      '    def Should_Read_When_Called(self):',
      '        assert read_secret() == self._parse()',
    ].join('\n');

    // Act
    const actual = findTryBlocksInTests('tests/test_client.py', source);

    // Assert
    expect(actual).toEqual([
      { line: 2, test: 'Should_Read_When_Called', helper: 'read_secret' },
      { line: 9, test: 'Should_Read_When_Called', helper: '_parse' },
    ]);
  });

  it('Should_ReportTryBlock_When_XunitTestCallsHelperWithTry', () => {
    // Arrange
    const source = [
      'public class ClientTests',
      '{',
      '\tprivate static async Task<string> ReadAsync()',
      '\t{',
      '\t\ttry',
      '\t\t{',
      '\t\t\treturn await Act();',
      '\t\t}',
      '\t\tcatch (KeyNotFoundException)',
      '\t\t{',
      '\t\t\treturn null;',
      '\t\t}',
      '\t}',
      '',
      '\t[Fact]',
      '\tpublic async Task Should_Read_When_Called()',
      '\t{',
      '\t\t(await ReadAsync()).Should().Be("x");',
      '\t}',
      '}',
    ].join('\n');

    // Act
    const actual = findTryBlocksInTests('tests/ClientTests.cs', source);

    // Assert
    expect(actual).toEqual([
      { line: 5, test: 'Should_Read_When_Called', helper: 'ReadAsync' },
    ]);
  });
});
