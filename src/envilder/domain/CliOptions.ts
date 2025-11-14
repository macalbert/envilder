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
   * SSM path for the single environment variable
   */
  ssmPath?: string;

  /**
   * AWS CLI profile to use
   */
  profile?: string;

  /**
   * Flag to push local .env file back to AWS SSM (renamed from import)
   */
  push?: boolean;

  /**
   * Cloud provider to use (aws or azure, defaults to aws)
   */
  provider?: string;
};
