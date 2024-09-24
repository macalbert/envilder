import * as fs from "fs/promises";
import * as path from "path";
import { SSM } from "aws-sdk";

interface ParamMap {
  [envVar: string]: string;
}

async function fetchSSMParams(
  ssmMap: ParamMap
): Promise<Record<string, string>> {
  const ssm = new SSM();
  const envVars: Record<string, string> = {};

  const promises = Object.entries(ssmMap).map(async ([envVar, ssmName]) => {
    const param = await ssm
      .getParameter({ Name: ssmName, WithDecryption: true })
      .promise();
    envVars[envVar] = param.Parameter?.Value || "";
  });

  await Promise.all(promises);
  return envVars;
}

async function generateEnvFile(
  envVars: Record<string, string>,
  outputFilePath: string
): Promise<void> {
  const envFileContent = Object.entries(envVars)
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  await fs.writeFile(outputFilePath, envFileContent);
  console.log(`.env file generated at ${outputFilePath}`);
}

export async function run(
  mapFilePath: string,
  envFilePath: string
): Promise<void> {
  try {
    const paramMap: ParamMap = JSON.parse(
      await fs.readFile(path.resolve(mapFilePath), "utf-8")
    );
    const envVars = await fetchSSMParams(paramMap);
    await generateEnvFile(envVars, path.resolve(envFilePath));
  } catch (error) {
    console.error("Error generating .env file:", error);
    process.exit(1);
  }
}
