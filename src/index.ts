import * as fs from 'node:fs';
import { GetParameterCommand, SSM } from '@aws-sdk/client-ssm';
import * as dotenv from 'dotenv';

const ssm = new SSM({});

export async function run(mapPath: string, envFilePath: string) {
  const paramMap = loadParamMap(mapPath);
  const existingEnvVariables = loadExistingEnvVariables(envFilePath);

  const updatedEnvVariables = await fetchAndUpdateEnvVariables(paramMap, existingEnvVariables);

  writeEnvFile(envFilePath, updatedEnvVariables);
  console.log(`Environment File generated at '${envFilePath}'`);
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

  if (!fs.existsSync(envFilePath)) return envVariables;

  const existingEnvContent = fs.readFileSync(envFilePath, 'utf-8');
  const parsedEnv = dotenv.parse(existingEnvContent);
  Object.assign(envVariables, parsedEnv);

  return envVariables;
}

async function fetchAndUpdateEnvVariables(
  paramMap: Record<string, string>,
  existingEnvVariables: Record<string, string>,
): Promise<Record<string, string>> {
  console.log('Fetching parameters...');
  const errors: string[] = [];

  for (const [envVar, ssmName] of Object.entries(paramMap)) {
    try {
      const value = await fetchSSMParameter(ssmName);
      if (value) {
        existingEnvVariables[envVar] = value;
        console.log(`${envVar}=${value}`);
      } else {
        console.error(`Warning: No value found for: '${ssmName}'`);
      }
    } catch (error) {
      console.error(`Error fetching parameter: '${ssmName}'`);
      errors.push(`ParameterNotFound: ${ssmName}`);
    }
  }

  if (errors.length > 0) {
    throw new Error(`Some parameters could not be fetched:\n${errors.join('\n')}`);
  }

  return existingEnvVariables;
}

async function fetchSSMParameter(ssmName: string): Promise<string | undefined> {
  const command = new GetParameterCommand({
    Name: ssmName,
    WithDecryption: true,
  });

  const { Parameter } = await ssm.send(command);
  return Parameter?.Value;
}

function writeEnvFile(envFilePath: string, envVariables: Record<string, string>): void {
  const envContent = Object.entries(envVariables)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  fs.writeFileSync(envFilePath, envContent);
}
