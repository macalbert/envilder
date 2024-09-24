import { program } from "commander";
import { run } from "../index.js";

export async function cliRunner() {
  program
    .name("envilder")
    .description("A CLI tool to generate .env files from AWS SSM parameters")
    .option(
      "--map <mapFile>",
      "Path to the JSON file containing SSM parameter map"
    )
    .option("--envfile <envFile>", "Path to the .env file to generate")
    .action((options) => run(options.map, options.envfile));

  await program.parseAsync(process.argv);
}
