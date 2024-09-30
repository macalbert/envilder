#!/usr/bin/env node

import { Command } from "commander";
import { run } from "../index.js";

export async function cliRunner() {
  const program = new Command();

  program
    .name("envilder")
    .description("A CLI tool to generate .env files from AWS SSM parameters")
    .version("0.1.0")
    .requiredOption(
      "--map <path>",
      "Path to the JSON file with environment variable mapping"
    )
    .requiredOption(
      "--envfile <path>",
      "Path to the .env file to be generated"
    );

  await program.parseAsync(process.argv);
  const options = program.opts();

  if (!options.map || !options.envfile) {
    throw new Error("Missing required arguments: --map and --envfile");
  }

  await run(options.map, options.envfile);
}

cliRunner().catch((error) => {
  console.error("Error in CLI Runner:", error);
});
