import * as fs from "node:fs";
import { GetParameterCommand, SSM } from "@aws-sdk/client-ssm";

const ssm = new SSM({});

export async function run(mapPath: string, envFilePath: string) {
  console.log(`Reading content from file: ${mapPath}`);
  const content = fs.readFileSync(mapPath, "utf-8");
  console.log(content);

  console.log(`Parsing JSON`);
  const paramMap: Record<string, string> = JSON.parse(content);
  console.log(`Parsed JSON: ${JSON.stringify(paramMap)}`);

  const envContent: string[] = [];

  console.log("Fetching parameters...");
  for (const [envVar, ssmName] of Object.entries(paramMap)) {
    try {
      const command = new GetParameterCommand({
        Name: ssmName,
        WithDecryption: true,
      });

      console.log(`Fetching parameter ${ssmName}`);
      const { Parameter } = await ssm.send(command);
      const value = Parameter?.Value;
      if (value) {
        envContent.push(`${envVar}=${value}`);
        console.log(`Append: ${envVar}=${value}`);
      } else {
        console.error(`Warning: No value found for ${ssmName}`);
      }

      console.log("Writing to `.env` file...");
    } catch (error) {
      console.error(`Error fetching parameter ${ssmName}: ${error}`);
      throw new Error(`ParameterNotFound: ${ssmName}`);
    }
  }

  fs.writeFileSync(envFilePath, envContent.join("\n"));
  console.log(`.env file generated at ${envFilePath}`);
}
