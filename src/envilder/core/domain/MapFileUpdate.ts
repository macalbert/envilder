import type { MapFileConfig } from './MapFileConfig.js';

export const MAP_FILE_SCHEMA_URL =
  'https://envilder.com/schema/map-file.v1.json';

/**
 * Where a secret is pushed to. A profile is deliberately absent: it is a
 * local credential choice and never belongs in a committed map file.
 */
export type MapFileTarget = {
  provider: string;
  vaultUrl?: string;
};

export type MapFileUpdateDecision =
  | { kind: 'create'; content: string }
  | { kind: 'append'; content: string }
  | { kind: 'unchanged' }
  | { kind: 'conflict' }
  | { kind: 'invalidJson' }
  | { kind: 'targetMismatch'; fileTarget: MapFileTarget };

type Layout = {
  indent: string | number;
  newline: string;
  trailingNewline: boolean;
};

const DEFAULT_PROVIDER = 'aws';
const DEFAULT_LAYOUT: Layout = {
  indent: 2,
  newline: '\n',
  trailingNewline: true,
};

export function resolveMapFileTarget(config: MapFileConfig): MapFileTarget {
  const provider = config.provider?.toLowerCase() || DEFAULT_PROVIDER;
  if (provider === 'azure' && config.vaultUrl) {
    return { provider, vaultUrl: config.vaultUrl };
  }
  return { provider };
}

/**
 * Decides how recording `key` -> `secretPath` changes a map file. Pure: it
 * never touches the filesystem, so every outcome can be checked on strings.
 *
 * A file that targets somewhere else than the push is left alone, and that
 * outranks a conflicting mapping, because the mapping then describes another
 * secret store.
 */
export function decideMapFileUpdate(
  existingContent: string | null,
  key: string,
  secretPath: string,
  target: MapFileTarget,
  mapFile: string,
): MapFileUpdateDecision {
  if (existingContent === null) {
    const file = buildNewFile(key, secretPath, target, mapFile);
    return { kind: 'create', content: serialize(file, DEFAULT_LAYOUT) };
  }

  const parsed = parseObject(existingContent);
  if (parsed === undefined) {
    return { kind: 'invalidJson' };
  }

  const fileTarget = resolveMapFileTarget(readConfig(parsed));
  if (!sameTarget(fileTarget, target)) {
    return { kind: 'targetMismatch', fileTarget };
  }

  if (Object.hasOwn(parsed, key)) {
    return parsed[key] === secretPath
      ? { kind: 'unchanged' }
      : { kind: 'conflict' };
  }

  // fromEntries defines own properties, so a `__proto__` key stays data.
  const updated = Object.fromEntries([
    ...Object.entries(parsed),
    [key, secretPath],
  ]);
  return {
    kind: 'append',
    content: serialize(updated, detectLayout(existingContent)),
  };
}

/**
 * File names SchemaStore already associates with the map-file schema
 * (`envilder.json`, `envilder.*.json`), so editors validate them without a
 * `$schema` key.
 */
const SCHEMA_STORE_FILE_NAME = /^envilder(?:\.[^.]+)*\.json$/;

function buildNewFile(
  key: string,
  secretPath: string,
  target: MapFileTarget,
  mapFile: string,
): Record<string, unknown> {
  const fileName = mapFile.split(/[\\/]/).pop() ?? mapFile;
  const file: Record<string, unknown> = SCHEMA_STORE_FILE_NAME.test(fileName)
    ? {}
    : { $schema: MAP_FILE_SCHEMA_URL };
  if (target.provider !== DEFAULT_PROVIDER) {
    file.$config = {
      provider: target.provider,
      ...(target.vaultUrl && { vaultUrl: target.vaultUrl }),
    };
  }
  file[key] = secretPath;
  return file;
}

function parseObject(content: string): Record<string, unknown> | undefined {
  try {
    const value: unknown = JSON.parse(content);
    return typeof value === 'object' && value !== null && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : undefined;
  } catch {
    return undefined;
  }
}

function readConfig(parsed: Record<string, unknown>): MapFileConfig {
  const config = parsed.$config;
  return config && typeof config === 'object' ? (config as MapFileConfig) : {};
}

function sameTarget(a: MapFileTarget, b: MapFileTarget): boolean {
  return (
    a.provider === b.provider &&
    normalizeVaultUrl(a.vaultUrl) === normalizeVaultUrl(b.vaultUrl)
  );
}

function normalizeVaultUrl(vaultUrl: string | undefined): string | undefined {
  return vaultUrl?.trim().replace(/\/+$/, '').toLowerCase();
}

function detectLayout(content: string): Layout {
  const indent = /\n([ \t]+)\S/.exec(content)?.[1];
  return {
    indent: indent ?? DEFAULT_LAYOUT.indent,
    newline: content.includes('\r\n') ? '\r\n' : '\n',
    trailingNewline: /\n$/.test(content),
  };
}

function serialize(value: Record<string, unknown>, layout: Layout): string {
  const body = JSON.stringify(value, null, layout.indent).replace(
    /\n/g,
    layout.newline,
  );
  return layout.trailingNewline ? `${body}${layout.newline}` : body;
}
