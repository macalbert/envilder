import { readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, dirname, extname, join, resolve } from 'node:path';
import Ajv2020 from 'ajv/dist/2020';
import addFormats from 'ajv-formats';
import { parse as parseDotenv } from 'dotenv';
import { describe, expect, it } from 'vitest';
import { SUPPORTED_PROVIDERS } from '../../../src/envilder/apps/shared/ContainerConfiguration';
import { compareEnvFileKeys } from '../../../src/envilder/core/domain/EnvFileComparison';
import {
  type MapFileValidationContext,
  validateMapFile,
} from '../../../src/envilder/core/domain/MapFileValidator';

const REPO_ROOT = resolve(__dirname, '../../..');
const SKILL_DIR = join(REPO_ROOT, 'skills/envilder');
const SCENARIOS_DIR = join(__dirname, 'scenarios');

const SPEC_FIELDS = [
  'name',
  'description',
  'license',
  'compatibility',
  'metadata',
  'allowed-tools',
];

const CLI_CONTEXT: MapFileValidationContext = {
  overrides: {},
  supportedProviders: SUPPORTED_PROVIDERS,
};

const NON_SDK_CALLS: Readonly<Record<string, readonly string[]>> = {
  csharp: ['CreateBuilder'],
  python: [],
  typescript: [],
};

const SDK_SOURCES: Readonly<Record<string, string>> = {
  csharp: 'src/sdks/dotnet',
  python: 'src/sdks/python',
  typescript: 'src/sdks/nodejs',
};

type CodeBlock = { file: string; language: string; code: string };

function listFiles(directory: string, extension: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    const excluded = ['node_modules', 'bin', 'obj', '.venv', 'dist'];
    if (excluded.includes(entry)) {
      return [];
    }
    if (statSync(path).isDirectory()) {
      return listFiles(path, extension);
    }
    return extname(path) === extension ? [path] : [];
  });
}

const skillFiles = listFiles(SKILL_DIR, '.md');
const skillText = (file: string) => readFileSync(file, 'utf-8');
const relative = (file: string) => file.slice(REPO_ROOT.length + 1);

function readFrontmatter(): { keys: string[]; values: Map<string, string> } {
  const content = skillText(join(SKILL_DIR, 'SKILL.md'));
  const block = content.split(/^---$/m)[1] ?? '';
  const values = new Map<string, string>();
  let current = '';
  for (const line of block.split(/\r?\n/)) {
    const field = /^([a-z-]+):\s*(.*)$/.exec(line);
    if (field) {
      current = field[1];
      values.set(current, field[2] === '>-' ? '' : field[2]);
    } else if (current && line.trim()) {
      const previous = values.get(current) ?? '';
      values.set(current, `${previous} ${line.trim()}`.trim());
    }
  }
  return { keys: [...values.keys()], values };
}

function fencedBlocks(file: string): CodeBlock[] {
  const blocks: CodeBlock[] = [];
  let open: { fence: string; language: string; lines: string[] } | undefined;
  for (const line of skillText(file).split(/\r?\n/)) {
    const fence = /^\s*(`{3,}|~{3,})\s*([^`\s]*)\s*$/.exec(line);
    if (open === undefined && fence) {
      open = { fence: fence[1], language: fence[2], lines: [] };
    } else if (
      open !== undefined &&
      fence &&
      fence[2] === '' &&
      fence[1][0] === open.fence[0] &&
      fence[1].length >= open.fence.length
    ) {
      blocks.push({
        file: relative(file),
        language: open.language,
        code: open.lines.join('\n'),
      });
      open = undefined;
    } else if (open !== undefined) {
      open.lines.push(line);
    }
  }
  return blocks;
}

function codeBlocks(): CodeBlock[] {
  return skillFiles.flatMap(fencedBlocks);
}

function referencedCliOptions(): Array<[string, string]> {
  return skillFiles.flatMap((file) =>
    [
      ...skillText(file).matchAll(/(?:^\s*|`|npx )envilder(?: [^`\n|]*)?/gm),
    ].flatMap(([invocation]) =>
      [
        ...(invocation.split(' -- ')[0] ?? '').matchAll(/ (--[a-z][a-z-]*)/g),
      ].map(([, option]) => [relative(file), option] as [string, string]),
    ),
  );
}

function referencedSubcommands(): Array<[string, string]> {
  return skillFiles.flatMap((file) =>
    [...skillText(file).matchAll(/(?:^\s*|`|npx )envilder ([a-z]+)\b/gm)].map(
      ([, word]) => [relative(file), word] as [string, string],
    ),
  );
}

const cliSource = () =>
  readFileSync(join(REPO_ROOT, 'src/envilder/apps/cli/entry/Cli.ts'), 'utf-8');

function cliSubcommands(): Set<string> {
  return new Set(
    [...cliSource().matchAll(/\.command\('([a-z]+)'\)/g)].map(([, n]) => n),
  );
}

function cliOptions(): Set<string> {
  const cli = cliSource();
  const declared = [...cli.matchAll(/'(--[a-z][a-z-]*)/g)].map(([, o]) => o);
  return new Set([...declared, '--version', '--help']);
}

function actionInputs(): Set<string> {
  const action = readFileSync(
    join(REPO_ROOT, 'github-action/action.yml'),
    'utf-8',
  );
  const inputs = action.split(/^outputs:/m)[0]?.split(/^inputs:/m)[1] ?? '';
  return new Set([...inputs.matchAll(/^ {2}([a-z-]+):/gm)].map(([, n]) => n));
}

function referencedActionInputs(): string[] {
  const yaml = codeBlocks()
    .filter((block) => block.language === 'yaml')
    .flatMap((block) =>
      block.code
        .split(/^\s*- (?=uses|name|run)/m)
        .filter((step) => step.includes('macalbert/envilder/github-action')),
    );
  const withKeys = yaml.flatMap((step) =>
    [
      ...(step.split(/^\s*with:\s*$/m)[1] ?? '').matchAll(/^\s+([a-z-]+):/gm),
    ].map(([, key]) => key),
  );
  const ciGuide = skillText(join(SKILL_DIR, 'references/ci-and-local.md'));
  const tableKeys = [...ciGuide.matchAll(/^\| `([a-z-]+)` \|/gm)].map(
    ([, key]) => key,
  );
  return [...new Set([...withKeys, ...tableKeys])];
}

function sdkSource(language: string): string {
  const directory = join(REPO_ROOT, SDK_SOURCES[language] ?? '');
  const extension = { csharp: '.cs', python: '.py', typescript: '.ts' }[
    language
  ];
  return listFiles(directory, extension ?? '')
    .map((file) => readFileSync(file, 'utf-8'))
    .join('\n');
}

function referencedSdkCalls(): Array<[string, string]> {
  return codeBlocks()
    .filter((block) => block.language in SDK_SOURCES)
    .flatMap((block) =>
      [...block.code.matchAll(/\b([A-Za-z_]\w*)\(/g)]
        .map(([, call]) => call)
        .filter((call) => !NON_SDK_CALLS[block.language]?.includes(call))
        .map((call) => [block.language, call] as [string, string]),
    );
}

function readScenario(path: string): unknown {
  return JSON.parse(readFileSync(join(SCENARIOS_DIR, path), 'utf-8'));
}

function scenarioViolationKeys(path: string): string[] {
  return validateMapFile(readScenario(path), CLI_CONTEXT).map((v) => v.key);
}

function compareScenarioKeys(mapFile: string, envFile: string) {
  const declared = Object.keys(
    readScenario(mapFile) as Record<string, unknown>,
  ).filter((key) => !key.startsWith('$'));
  const entries = Object.keys(
    parseDotenv(readFileSync(join(SCENARIOS_DIR, envFile), 'utf-8')),
  ).map((key) => ({ key, value: '' }));
  return compareEnvFileKeys(declared, entries);
}

const schemaValidator = (() => {
  const schema = JSON.parse(
    readFileSync(join(REPO_ROOT, 'spec/map-file.v1.json'), 'utf-8'),
  );
  const ajv = new Ajv2020({ strict: false });
  addFormats(ajv);
  return ajv.compile(schema);
})();

describe('Envilder Agent Skill: Agent Skills specification', () => {
  it('Should_MatchDirectoryName_When_FrontmatterNameIsRead', () => {
    // Act
    const actual = readFrontmatter().values.get('name');

    // Assert
    expect(actual).toBe(basename(SKILL_DIR));
  });

  it('Should_FollowSpecNamingRules_When_FrontmatterNameIsRead', () => {
    // Act
    const actual = readFrontmatter().values.get('name') ?? '';

    // Assert
    expect(actual).toMatch(/^(?=.{1,64}$)[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it('Should_StayWithinSpecLimit_When_DescriptionIsRead', () => {
    // Act
    const actual = readFrontmatter().values.get('description')?.length ?? 0;

    // Assert
    expect(actual).toBeGreaterThan(0);
    expect(actual).toBeLessThanOrEqual(1024);
  });

  it('Should_StayWithinSpecLimit_When_CompatibilityIsRead', () => {
    // Act
    const actual = readFrontmatter().values.get('compatibility')?.length ?? 0;

    // Assert
    expect(actual).toBeGreaterThan(0);
    expect(actual).toBeLessThanOrEqual(500);
  });

  it('Should_UseOnlyStandardFields_When_FrontmatterIsRead', () => {
    // Act
    const actual = readFrontmatter().keys;

    // Assert
    expect(SPEC_FIELDS).toEqual(expect.arrayContaining(actual));
  });

  it('Should_StayUnder500Lines_When_SkillBodyIsRead', () => {
    // Act
    const actual = skillText(join(SKILL_DIR, 'SKILL.md')).split('\n').length;

    // Assert
    expect(actual).toBeLessThan(500);
  });

  it.each(
    skillFiles.flatMap((file) =>
      [...skillText(file).matchAll(/\]\((?!https?:|#)([^)#]+)/g)].map(
        ([, link]) => [relative(file), link] as [string, string],
      ),
    ),
  )('Should_ResolveRelativeLink_When_%s_Links_%s', (file, link) => {
    // Arrange
    const target = resolve(dirname(join(REPO_ROOT, file)), link);

    // Act
    const actual = statSync(target, { throwIfNoEntry: false })?.isFile();

    // Assert
    expect(actual).toBe(true);
  });
});

describe('Envilder Agent Skill: references match the implementation', () => {
  const mapFileBlocks = codeBlocks().filter((b) => b.language === 'json');

  it('Should_ContainMapFileExamples_When_SkillIsRead', () => {
    // Act
    const actual = mapFileBlocks.length;

    // Assert
    expect(actual).toBeGreaterThan(0);
  });

  it.each(mapFileBlocks.map((b) => [b.file, b.code] as [string, string]))(
    'Should_MatchMapFileSchema_When_JsonExampleIn_%s',
    (_file, code) => {
      // Act
      const actual = schemaValidator(JSON.parse(code));

      // Assert
      expect(actual).toBe(true);
    },
  );

  it.each(mapFileBlocks.map((b) => [b.file, b.code] as [string, string]))(
    'Should_PassCliValidation_When_JsonExampleIn_%s',
    (_file, code) => {
      // Act
      const actual = validateMapFile(JSON.parse(code), CLI_CONTEXT);

      // Assert
      expect(actual).toEqual([]);
    },
  );

  it.each(referencedCliOptions())(
    'Should_ReferenceExistingCliOption_When_%s_Uses_%s',
    (_file, option) => {
      // Act
      const actual = cliOptions().has(option);

      // Assert
      expect(actual).toBe(true);
    },
  );

  it.each(referencedSubcommands())(
    'Should_ReferenceExistingSubcommand_When_%s_Uses_%s',
    (_file, subcommand) => {
      // Act
      const actual = cliSubcommands().has(subcommand);

      // Assert
      expect(actual).toBe(true);
    },
  );

  it.each(referencedActionInputs())(
    'Should_ReferenceExistingActionInput_When_SkillUses_%s',
    (input) => {
      // Act
      const actual = actionInputs().has(input);

      // Assert
      expect(actual).toBe(true);
    },
  );

  it.each(referencedSdkCalls())(
    'Should_ReferenceExistingSdkApi_When_%sExampleCalls_%s',
    (language, call) => {
      // Act
      const actual = new RegExp(`\\b${call}\\b`).test(sdkSource(language));

      // Assert
      expect(actual).toBe(true);
    },
  );

  it('Should_ListTheProvidersTheCliRuns_When_SkillNamesSupportedProviders', () => {
    // Arrange
    const skill = skillText(join(SKILL_DIR, 'SKILL.md'));
    const expected = `Envilder runs only ${SUPPORTED_PROVIDERS.map((p) => `\`${p}\``).join(' and ')}.`;

    // Act
    const actual = skill.replace(/\s+/g, ' ');

    // Assert
    expect(actual).toContain(expected);
  });
});

describe('Envilder Agent Skill: validation scenarios', () => {
  it.each([
    ['dotnet-aws/envilder.json'],
    ['nodejs-github-actions/envilder.json'],
    ['python-existing-config/envilder.json'],
    ['migration/envilder.json'],
  ])('Should_AcceptMapFile_When_ScenarioIs_%s', (path) => {
    // Act
    const actual = scenarioViolationKeys(path);

    // Assert
    expect(actual).toEqual([]);
  });

  it.each([
    ['invalid/unsupported-provider.json', ['$config.provider']],
    ['invalid/azure-without-vault-url.json', ['$config.vaultUrl']],
    ['invalid/azure-with-aws-profile.json', ['$config.profile']],
    [
      'invalid/non-string-and-bad-name.json',
      ['$config.region', 'DB_PORT', 'DB URL'],
    ],
  ])('Should_RejectMapFile_When_ScenarioIs_%s', (path, expected) => {
    // Act
    const actual = scenarioViolationKeys(path);

    // Assert
    expect(actual).toEqual(expect.arrayContaining(expected));
  });

  it('Should_LeaveOnlyNonSecretConfigUnmapped_When_MigratingEnvFile', () => {
    // Act
    const actual = compareScenarioKeys(
      'migration/envilder.json',
      'migration/.env.example',
    );

    // Assert
    expect(actual.missing).toEqual([]);
    expect(actual.undeclared).toEqual(['PORT', 'LOG_LEVEL']);
  });

  it('Should_ReportUnmappedSecret_When_MappingIsMissing', () => {
    // Act
    const actual = compareScenarioKeys(
      'invalid/missing-mapping.json',
      'invalid/missing-mapping.env.example',
    );

    // Assert
    expect(actual.undeclared).toEqual(['PORT', 'STRIPE_API_KEY']);
  });
});
