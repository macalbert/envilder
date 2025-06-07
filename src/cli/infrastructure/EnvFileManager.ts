import type { IEnvFileManager } from '../domain/ports/IEnvFileManager';
import * as fs from 'node:fs';
import * as dotenv from 'dotenv';

export class EnvFileManager implements IEnvFileManager {
  loadParamMap(mapPath: string): Record<string, string> {
    const content = fs.readFileSync(mapPath, 'utf-8');
    try {
      return JSON.parse(content);
    } catch (error) {
      console.error(`Error parsing JSON from ${mapPath}`);
      throw new Error(`Invalid JSON in parameter map file: ${mapPath}`);
    }
  }

  loadExistingEnvVariables(envFilePath: string): Record<string, string> {
    const envVariables: Record<string, string> = {};
    if (!fs.existsSync(envFilePath)) {
      return envVariables;
    }
    const existingEnvContent = fs.readFileSync(envFilePath, 'utf-8');
    const parsedEnv = dotenv.parse(existingEnvContent);
    Object.assign(envVariables, parsedEnv);
    return envVariables;
  }

  writeEnvFile(
    envFilePath: string,
    envVariables: Record<string, string>,
  ): void {
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
}
