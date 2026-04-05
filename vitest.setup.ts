import { config } from 'dotenv';

/**
 * Runs inside the test process (same process as testcontainers).
 * Loads .env into process.env so LOCALSTACK_AUTH_TOKEN is available.
 * Does not override variables already set (e.g. from CI environment).
 */
config({ override: false });
