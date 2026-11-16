import type { EnvFileEntry } from '../EnvFileComparison.js';
import type { ParsedMapFile } from '../MapFileConfig.js';

export interface IVariableStore {
  getMapping(source: string): Promise<Record<string, string>>;
  getParsedMapping(source: string): Promise<ParsedMapFile>;
  getEnvironment(source: string): Promise<Record<string, string>>;
  /**
   * Every assignment of an env file in file order, repeated keys included,
   * read with the parser `getEnvironment` uses. `null` when the file does not
   * exist.
   */
  readEnvironmentEntries(source: string): Promise<EnvFileEntry[] | null>;
  saveEnvironment(
    destination: string,
    envVariables: Record<string, string>,
  ): Promise<void>;
  /** Raw map-file text, or `null` when the file does not exist. */
  readMapFileContent(source: string): Promise<string | null>;
  /** Writes map-file text as given; never creates missing directories. */
  writeMapFileContent(destination: string, content: string): Promise<void>;
  /**
   * Puts a map file back as it was: writes `original`, or removes the file
   * when `original` is `null` because it did not exist before.
   */
  restoreMapFile(destination: string, original: string | null): Promise<void>;
}
