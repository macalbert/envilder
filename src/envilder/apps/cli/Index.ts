#!/usr/bin/env node

/**
 * Entry point for the CLI application
 * This file is executed when the CLI runs
 */

import { main } from './Cli.js';
import { presentError } from './CliErrorPresenter.js';
import { SilentExitError } from './SilentExitError.js';

main().catch((error) => {
  if (error instanceof SilentExitError) {
    process.exit(error.code);
  }
  console.error(presentError(error));
  process.exit(1);
});
