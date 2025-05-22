import * as fs from 'node:fs';
import { GetParameterCommand, SSM } from '@aws-sdk/client-ssm';
import { fromIni } from '@aws-sdk/credential-providers';
import * as dotenv from 'dotenv';

/**
 * Orchestrates the process of fetching environment variable values from AWS SSM Parameter Store and writing them to a local environment file.
 *
 * Loads a parameter mapping from a JSON file, retrieves existing environment variables, fetches updated values from SSM (optionally using a specified AWS profile), merges them, and writes the result to the specified environment file.
 *
 * @param mapPath - Path to the JSON file mapping environment variable names to SSM parameter names.
 * @param envFilePath - Path to the local environment file to read and update.
 * @param profile - Optional AWS profile name to use for credentials.
 */
export async function run(mapPath: string, envFilePath: string, profile?: string) {
  const defaultAwsConfig = {};
  const ssmClientConfig = profile ? { credentials: fromIni({ profile }) } : defaultAwsConfig;
  const ssm = new SSM(ssmClientConfig);

  const paramMap = loadParamMap(mapPath);
  const existingEnvVariables = loadExistingEnvVariables(envFilePath);

  const updatedEnvVariables = await fetchAndUpdateEnvVariables(paramMap, existingEnvVariables, ssm);

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

/**
 * Fetches parameter values from AWS SSM for each environment variable in the map and updates the existing environment variables record.
 *
 * For each mapping, retrieves the corresponding SSM parameter value and updates the environment variable if found. Logs masked values and warnings for missing parameters. Throws an error if any parameters fail to fetch.
 *
 * @param paramMap - Mapping of environment variable names to SSM parameter names.
 * @param existingEnvVariables - Current environment variables to be updated.
 * @param ssm - AWS SSM client instance used for fetching parameters.
 * @returns The updated environment variables record.
 *
 * @throws {Error} If any SSM parameters cannot be fetched.
 */
async function fetchAndUpdateEnvVariables(
  paramMap: Record<string, string>,
  existingEnvVariables: Record<string, string>,
  ssm: SSM,
): Promise<Record<string, string>> {
  const errors: string[] = [];

  for (const [envVar, ssmName] of Object.entries(paramMap)) {
    try {
      const value = await fetchSSMParameter(ssmName, ssm);
      if (value) {
        existingEnvVariables[envVar] = value;
        console.log(
          `${envVar}=${value.length > 3 ? '*'.repeat(value.length - 3) + value.slice(-3) : '*'.repeat(value.length)}`,
        );
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

/**
 * Retrieves the value of a parameter from AWS SSM Parameter Store with decryption enabled.
 *
 * @param ssmName - The name of the SSM parameter to retrieve.
 * @returns The decrypted parameter value if found, or undefined if the parameter does not exist.
 */
async function fetchSSMParameter(ssmName: string, ssm: SSM): Promise<string | undefined> {
  const command = new GetParameterCommand({
    Name: ssmName,
    WithDecryption: true,
  });

  const { Parameter } = await ssm.send(command);
  return Parameter?.Value;
}

function writeEnvFile(envFilePath: string, envVariables: Record<string, string>): void {
  const envContent = Object.entries(envVariables)
    .map(([key, value]) => {
      const escapedValue = value
        .replace(/(\r\n|\n|\r)/g, '\\n')
        .replace(/"/g, '\\"');
      return `${key}=${escapedValue}`;
    })
    .join('\n');

  fs.writeFileSync(envFilePath, envContent);
}
