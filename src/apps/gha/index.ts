#!/usr/bin/env node

/**
 * Entry point for the GitHub Action
 * This file is executed when the action runs
 */

import { main } from './GitHubAction.js';

main().catch((error) => {
  console.error('🚨 Uh-oh! Looks like Mario fell into the wrong pipe! 🍄💥');
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
