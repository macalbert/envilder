#!/usr/bin/env node

/**
 * Entry point for the CLI application
 * This file is executed when the CLI runs
 */

import { presentError } from '../errors/CliErrorPresenter.js';
import { SilentExitError } from '../errors/SilentExitError.js';
import { main } from './Cli.js';

main().catch((error) => {
  if (error instanceof SilentExitError) {
    process.exit(error.code);
  }
  console.error(presentError(error));
  process.exit(1);
});
