import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { describe, expect, it, onTestFinished } from 'vitest';
import {
  checkRepository,
  findTryBlocksInTests,
} from '../../scripts/check-test-try-blocks.mjs';

const TRY_IN_TEST = "it('fails', () => { try { a(); } catch {} });";

/** Creates a git repository whose index tracks the given files. */
function aRepository(files: Record<string, string>): string {
  const dir = mkdtempSync(join(tmpdir(), 'check-test-try-blocks-'));
  onTestFinished(() => rmSync(dir, { recursive: true, force: true }));
  execFileSync('git', ['init', '--quiet'], { cwd: dir });
  for (const [path, content] of Object.entries(files)) {
    mkdirSync(dirname(join(dir, path)), { recursive: true });
    writeFileSync(join(dir, path), content);
  }
  execFileSync('git', ['add', '.'], { cwd: dir });
  return dir;
}

describe('checkRepository', () => {
  it('Should_FailWithAnnotation_When_TrackedTestHasTryBlock', () => {
    // Arrange
    const dir = aRepository({
      'tests/a.test.ts': TRY_IN_TEST,
      'tests/helper.ts': TRY_IN_TEST,
      'src/notes.md': TRY_IN_TEST,
    });

    // Act
    const actual = checkRepository(dir);

    // Assert
    expect(actual).toEqual({
      exitCode: 1,
      message: expect.stringMatching(
        /^::error file=tests\/a\.test\.ts,line=1::try block inside test "fails"\./,
      ),
    });
  });

  it('Should_PassAndCountFiles_When_TrackedTestsHaveNoTryBlock', () => {
    // Arrange
    const dir = aRepository({
      'tests/a.test.ts': "it('ok', () => { expect(1).toBe(1); });",
      'tests/test_client.py': 'def Should_Pass():\n    assert True\n',
      'tests/deleted.test.ts': TRY_IN_TEST,
    });
    rmSync(join(dir, 'tests/deleted.test.ts'));

    // Act
    const actual = checkRepository(dir);

    // Assert
    expect(actual).toEqual({
      exitCode: 0,
      message: 'No try blocks inside tests in 2 test files.',
    });
  });

  it('Should_NameHelperInAnnotation_When_TestReachesHelperWithTry', () => {
    // Arrange
    const dir = aRepository({
      'tests/a.test.ts': [
        'function run() { try { a(); } catch {} }',
        "it('calls', () => { expect(run()).toBe(1); });",
      ].join('\n'),
    });

    // Act
    const actual = checkRepository(dir);

    // Assert
    expect(actual.message).toContain(
      'try block in helper "run", called from test "calls"',
    );
  });
});

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
      '\t\t/* Cleanup */',
      '\t\t/*',
      '\t\t   Cleanup',
      '\t\t*/',
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

  it('Should_ReportTryBlock_When_HelperIsCalledInsideInterpolation', () => {
    // Arrange
    const python = [
      'def cleanup():',
      '    try:',
      '        release()',
      '    finally:',
      '        finish()',
      '',
      'def Should_ReturnName_When_Called():',
      '    assert get_name() == f"{cleanup()}"',
    ].join('\n');
    const cSharp = [
      'public class ClientTests',
      '{',
      '\tprivate static string Cleanup()',
      '\t{',
      '\t\ttry { return Release(); } finally { Finish(); }',
      '\t}',
      '',
      '\t[Fact]',
      '\tpublic void Should_ReturnName_When_Called()',
      '\t{',
      '\t\tGetName().Should().Be($"{Cleanup()}");',
      '\t}',
      '}',
    ].join('\n');

    // Act
    const actual = [
      ...findTryBlocksInTests('tests/test_client.py', python),
      ...findTryBlocksInTests('tests/ClientTests.cs', cSharp),
    ];

    // Assert
    expect(actual).toEqual([
      { line: 2, test: 'Should_ReturnName_When_Called', helper: 'cleanup' },
      { line: 5, test: 'Should_ReturnName_When_Called', helper: 'Cleanup' },
    ]);
  });

  it('Should_FollowOnlyCode_When_InterpolationHasEscapedOrNestedBraces', () => {
    // Arrange
    const helpers = [
      'def cleanup(options):',
      '    try:',
      '        release()',
      '    finally:',
      '        finish()',
      '',
      'def literal():',
      '    try:',
      '        release()',
      '    finally:',
      '        finish()',
      '',
    ];
    const source = [
      ...helpers,
      'def Should_FormatName_When_Called():',
      '    assert get_name() == f"{{literal()}} {cleanup({})} { {1: 2}} literal"',
    ].join('\n');

    // Act
    const actual = findTryBlocksInTests('tests/test_client.py', source);

    // Assert
    expect(actual).toEqual([
      { line: 2, test: 'Should_FormatName_When_Called', helper: 'cleanup' },
    ]);
  });

  it('Should_ReportTryBlock_When_HelperDeclaresObjectReturnType', () => {
    // Arrange
    const source = [
      'function run(): { code: number; output: string } {',
      "  try { return { code: 0, output: '' }; } catch { return { code: 1, output: '' }; }",
      '}',
      "it('typed', () => { expect(run().code).toBe(0); });",
    ].join('\n');

    // Act
    const actual = findTryBlocksInTests('tests/a.test.ts', source);

    // Assert
    expect(actual).toEqual([{ line: 2, test: 'typed', helper: 'run' }]);
  });

  it('Should_ReportTryBlock_When_ExpressionBodiedArrowCallsHelperWithTry', () => {
    // Arrange
    const source = [
      'function inner() { try { a(); } catch {} }',
      'const outer = () => inner();',
      'const unrelated = 1;',
      "it('expression', () => { expect(outer()).toBe(1); });",
    ].join('\n');

    // Act
    const actual = findTryBlocksInTests('tests/a.test.ts', source);

    // Assert
    expect(actual).toEqual([{ line: 1, test: 'expression', helper: 'inner' }]);
  });

  it('Should_ReportEachTryOnce_When_SeveralTestsReachTheSameHelper', () => {
    // Arrange
    const source = [
      'function run() { try { a(); } catch {} }',
      "it('first', () => { expect(run()).toBe(1); });",
      "it('second', () => { expect(run()).toBe(1); });",
    ].join('\n');

    // Act
    const actual = findTryBlocksInTests('tests/a.test.ts', source);

    // Assert
    expect(actual).toEqual([{ line: 1, test: 'first', helper: 'run' }]);
  });

  it('Should_ReportTryBlock_When_TestNameIsDynamicOrHasEscapedQuotes', () => {
    // Arrange
    const source = [
      "it('it\\'s `quoted`', () => { const t = `a\\`b`; try { a(t); } catch {} });",
      'it(name, () => { try { a(); } catch {} });',
    ].join('\n');

    // Act
    const actual = findTryBlocksInTests('tests/a.test.ts', source);

    // Assert
    expect(actual).toEqual([
      { line: 1, test: "it\\'s `quoted`" },
      { line: 2, test: '<dynamic name>' },
    ]);
  });

  it('Should_ReadNextMethod_When_CSharpHelperHasNoBlockBody', () => {
    // Arrange
    const source = [
      'public class ClientTests',
      '{',
      '\tprivate static int Value() => 1;',
      '',
      '\t[Fact]',
      '\tpublic void Should_Read_When_Called()',
      '\t{',
      '\t\ttry { Act(Value()); } finally { CleanUp(); }',
      '\t}',
      '}',
    ].join('\n');

    // Act
    const actual = findTryBlocksInTests('tests/ClientTests.cs', source);

    // Assert
    expect(actual).toEqual([{ line: 8, test: 'Should_Read_When_Called' }]);
  });

  it('Should_ReportNothing_When_FileTypeIsNotSupported', () => {
    // Arrange
    const source = "it('x', () => { try { a(); } catch {} });";

    // Act
    const actual = findTryBlocksInTests('tests/a.test.rb', source);

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
