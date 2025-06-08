import * as fs from 'node:fs/promises';
import * as dotenv from 'dotenv';
import type { IEnvFileManager } from '../domain/ports/IEnvFileManager';

export class EnvFileManager implements IEnvFileManager {
  async loadParamMap(mapPath: string): Promise<Record<string, string>> {
    const content = await fs.readFile(mapPath, 'utf-8');
    try {
      return JSON.parse(content);
    } catch (error) {
      console.error(`Error parsing JSON from ${mapPath}`);
      throw new Error(`Invalid JSON in parameter map file: ${mapPath}`);
    }
  }

  async loadExistingEnvVariables(
    envFilePath: string,
  ): Promise<Record<string, string>> {
    const envVariables: Record<string, string> = {};
    try {
      await fs.access(envFilePath);
    } catch {
      return envVariables;
    }
    const existingEnvContent = await fs.readFile(envFilePath, 'utf-8');
    const parsedEnv = dotenv.parse(existingEnvContent);
    Object.assign(envVariables, parsedEnv);
    return envVariables;
  }

  async writeEnvFile(
    envFilePath: string,
    envVariables: Record<string, string>,
  ): Promise<void> {
    const envContent = Object.entries(envVariables)
      .map(([key, value]) => {
        const escapedValue = value
          .replace(/\\/g, '\\\\')
          .replace(/(\r\n|\n|\r)/g, '\\n')
          .replace(/"/g, '\\"');
        return `${key}=${escapedValue}`;
      })
      .join('\n');
    await fs.writeFile(envFilePath, envContent);
  }
}
