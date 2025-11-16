#!/usr/bin/env node

/**
 * Entry point for the CLI application
 * This file is executed when the CLI runs
 */

import { main } from './Cli.js';

main().catch((error) => {
  console.error('🚨 Uh-oh! Looks like Mario fell into the wrong pipe! 🍄💥');
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
