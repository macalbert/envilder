import type { MapFileTarget } from './MapFileUpdate.js';

/**
 * Options for the CLI commands.
 */
export type CliOptions = {
  /**
   * Path to the JSON file with environment variable mapping
   */
  map?: string;

  /**
   * Path to the .env file to be generated or imported
   */
  envfile?: string;

  /**
   * Single environment variable name to push
   */
  key?: string;

  /**
   * Value of the single environment variable to push
   */
  value?: string;

  /**
   * Secret path in the cloud provider for the single environment variable
   */
  secretPath?: string;

  /**
   * AWS CLI profile to use
   */
  profile?: string;

  /**
   * Flag to push local .env file back to the secret store
   */
  push?: boolean;

  /**
   * False when `--no-map-update` is given: a single-secret push neither reads
   * nor writes a map file
   */
  mapUpdate?: boolean;

  /**
   * Effective provider target of a single-secret push, compared with the map
   * file's own target before the mapping is recorded
   */
  mapTarget?: MapFileTarget;
};
