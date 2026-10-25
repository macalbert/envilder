import type { ParsedMapFile } from '../MapFileConfig.js';

export interface IVariableStore {
  getMapping(source: string): Promise<Record<string, string>>;
  getParsedMapping(source: string): Promise<ParsedMapFile>;
  getEnvironment(source: string): Promise<Record<string, string>>;
  saveEnvironment(
    destination: string,
    envVariables: Record<string, string>,
  ): Promise<void>;
  /** Raw map-file text, or `null` when the file does not exist. */
  readMapFileContent(source: string): Promise<string | null>;
  /** Writes map-file text as given; never creates missing directories. */
  writeMapFileContent(destination: string, content: string): Promise<void>;
  /** Removes a map file; a file that is already gone is not an error. */
  deleteMapFile(destination: string): Promise<void>;
}
