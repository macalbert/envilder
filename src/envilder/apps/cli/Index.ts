#!/usr/bin/env node

/**
 * Entry point for the CLI application
 * This file is executed when the CLI runs
 */

import { main } from './Cli.js';
import { presentError } from './CliErrorPresenter.js';

main().catch((error) => {
  console.error(presentError(error));
  process.exit(1);
});
