#!/usr/bin/env node

/**
 * Entry point for the GitHub Action
 * This file is executed when the action runs
 */

import { main } from './Gha.js';

main().catch(() => {
  // Gha.ts already logged an actionable message via presentGhaError()
  // before rethrowing; this handler only needs to set the exit code.
  process.exit(1);
});
