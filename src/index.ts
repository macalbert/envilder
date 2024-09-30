import * as fs from 'node:fs';
import { GetParameterCommand, SSM } from '@aws-sdk/client-ssm';

// Initialize SSM client
const ssm = new SSM({});

export async function run(mapPath: string, envFilePath: string) {
  const paramMap = JSON.parse(fs.readFileSync(mapPath, 'utf-8')) as Record<string, string>;
  const envContent: string[] = [];

  for (const [envVar, ssmName] of Object.entries(paramMap)) {
    try {
      const command = new GetParameterCommand({
        Name: ssmName,
        WithDecryption: true,
      });
      const { Parameter } = await ssm.send(command);
      const value = Parameter?.Value;

      if (value) {
        envContent.push(`${envVar}=${value}`);
      } else {
        console.error(`Warning: No value found for ${ssmName}`);
      }
    } catch (error) {
      console.error(`Error fetching parameter ${ssmName}: ${error}`);
      throw new Error(`ParameterNotFound: ${ssmName}`);
    }
  }

  fs.writeFileSync(envFilePath, envContent.join('\n'));
  console.log(`.env file generated at ${envFilePath}`);
}
