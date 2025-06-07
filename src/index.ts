import * as fs from 'node:fs';
import * as dotenv from 'dotenv';
import type { ISecretProvider } from './cli/domain/ports/ISecretProvider';

export class Envilder {
  private keyVault: ISecretProvider;

  constructor(keyVault: ISecretProvider) {
    this.keyVault = keyVault;
  }

  /**
   * Orchestrates the process of fetching environment variable values from a key vault and writing them to a local environment file.
   *
   * Loads a parameter mapping from a JSON file, retrieves existing environment variables, fetches updated values from the key vault, merges them, and writes the result to the specified environment file.
   *
   * @param mapPath - Path to the JSON file mapping environment variable names to key vault parameter names.
   * @param envFilePath - Path to the local environment file to read and update.
   */
  async run(mapPath: string, envFilePath: string) {
    const paramMap = loadParamMap(mapPath);
    const existingEnvVariables = loadExistingEnvVariables(envFilePath);
    const updatedEnvVariables = await this.fetchAndUpdateEnvVariables(paramMap, existingEnvVariables);
    writeEnvFile(envFilePath, updatedEnvVariables);
    console.log(`Environment File generated at '${envFilePath}'`);
  }

  private async fetchAndUpdateEnvVariables(
    paramMap: Record<string, string>,
    existingEnvVariables: Record<string, string>,
  ): Promise<Record<string, string>> {
    const errors: string[] = [];
    for (const [envVar, secretName] of Object.entries(paramMap)) {
      try {
        const value = await this.keyVault.getSecret(secretName);
        if (!value) {
          console.error(`Warning: No value found for: '${secretName}'`);
          continue;
        }
        existingEnvVariables[envVar] = value;
        console.log(
          `${envVar}=${value.length > 3 ? '*'.repeat(value.length - 3) + value.slice(-3) : '*'.repeat(value.length)}`,
        );
      } catch (error) {
        console.error(`Error fetching parameter: '${secretName}'`);
        errors.push(`ParameterNotFound: ${secretName}`);
      }
    }
    if (errors.length > 0) {
      throw new Error(`Some parameters could not be fetched:\n${errors.join('\n')}`);
    }
    return existingEnvVariables;
  }
}

function loadParamMap(mapPath: string): Record<string, string> {
  const content = fs.readFileSync(mapPath, 'utf-8');
  try {
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error parsing JSON from ${mapPath}`);
    throw new Error(`Invalid JSON in parameter map file: ${mapPath}`);
  }
}

function loadExistingEnvVariables(envFilePath: string): Record<string, string> {
  const envVariables: Record<string, string> = {};

  if (!fs.existsSync(envFilePath)) {
    return envVariables;
  }

  const existingEnvContent = fs.readFileSync(envFilePath, 'utf-8');
  const parsedEnv = dotenv.parse(existingEnvContent);
  Object.assign(envVariables, parsedEnv);

  return envVariables;
}

/**
 * Writes environment variables to a .env file with proper escaping.
 *
 * Properly escapes special characters in the environment variable values:
 * - Backslashes are escaped first to avoid interfering with other escape sequences
 * - Newlines (CR, LF, CRLF) are converted to '\n' in the output file
 * - Double quotes are escaped to avoid issues when the .env file is parsed
 *
 * @param envFilePath - Path to the .env file to write
 * @param envVariables - Record of environment variable names and values
 */
function writeEnvFile(envFilePath: string, envVariables: Record<string, string>): void {
  const envContent = Object.entries(envVariables)
    .map(([key, value]) => {
      const escapedValue = value
        .replace(/\\/g, '\\\\')
        .replace(/(\r\n|\n|\r)/g, '\\n')
        .replace(/"/g, '\\"');
      return `${key}=${escapedValue}`;
    })
    .join('\n');

  fs.writeFileSync(envFilePath, envContent);
}
