import { SSM } from "aws-sdk";
import * as fs from "node:fs";

export async function fetchSSMParameter(
  ssmPath: string
): Promise<string | undefined> {
  const ssm = new SSM();
  const params = {
    Name: ssmPath,
    WithDecryption: true,
  };
  try {
    const result = await ssm.getParameter(params).promise();
    return result.Parameter?.Value;
  } catch (err) {
    console.error(`Error fetching ${ssmPath}:`, err);
    return undefined;
  }
}

export async function generateEnvFile(
  paramMap: Record<string, string>,
  envFilePath: string
) {
  if (Object.keys(paramMap).length === 0) {
    console.log("Param map is empty. No .env file will be generated.");
    return; // Exit early if paramMap is empty
  }

  const envFileContent: string[] = [];

  for (const [envVar, ssmPath] of Object.entries(paramMap)) {
    const value = await fetchSSMParameter(ssmPath);
    if (value) {
      envFileContent.push(`${envVar}=${value}`);
    } else {
      console.error(`SSM parameter ${ssmPath} could not be fetched.`);
    }
  }

  try {
    fs.writeFileSync(envFilePath, envFileContent.join("\n"), "utf-8");
    console.log(`.env file generated at ${envFilePath}`);
  } catch (err) {
    console.error("Error generating .env file:", err);
  }
}

if (require.main === module) {
  const args = process.argv.slice(2);
  let paramMapPath = "";
  let envFilePath = "";

  for (const arg of args) {
    if (arg.startsWith("--map=")) {
      paramMapPath = arg.split("=")[1];
    }
    if (arg.startsWith("--envfile=")) {
      envFilePath = arg.split("=")[1];
    }
  }

  if (!paramMapPath || !envFilePath) {
    console.error(
      "Usage: npm run envilder --map=param_map.json --envfile=.env"
    );
    process.exit(1);
  }

  const paramMap = JSON.parse(fs.readFileSync(paramMapPath, "utf-8"));

  generateEnvFile(paramMap, envFilePath).catch((err) =>
    console.error("Error generating .env file:", err)
  );
}
