import { randomUUID } from 'node:crypto';
import { appendFile } from 'node:fs/promises';
import { EOL } from 'node:os';
import { InvalidArgumentError } from '../../domain/errors/DomainErrors.js';
import type { IEnvironmentExporter } from '../../domain/ports/IEnvironmentExporter.js';

/**
 * Names the GitHub runner refuses to set from `GITHUB_ENV`: `NODE_OPTIONS`
 * and the documented default variables, which cannot be overwritten. Only
 * exact names: other `GITHUB_*` and `RUNNER_*` names export normally. `CI`
 * is left out because GitHub still lets it be overwritten.
 * https://docs.github.com/en/actions/reference/workflows-and-actions/variables
 */
const RUNNER_BLOCKED_NAMES = new Set([
  'NODE_OPTIONS',
  'GITHUB_ACTION',
  'GITHUB_ACTION_PATH',
  'GITHUB_ACTION_REPOSITORY',
  'GITHUB_ACTIONS',
  'GITHUB_ACTOR',
  'GITHUB_ACTOR_ID',
  'GITHUB_API_URL',
  'GITHUB_ARTIFACTS',
  'GITHUB_ARTIFACTS_LIST',
  'GITHUB_BASE_REF',
  'GITHUB_ENV',
  'GITHUB_EVENT_NAME',
  'GITHUB_EVENT_PATH',
  'GITHUB_GRAPHQL_URL',
  'GITHUB_HEAD_REF',
  'GITHUB_JOB',
  'GITHUB_OUTPUT',
  'GITHUB_PATH',
  'GITHUB_REF',
  'GITHUB_REF_NAME',
  'GITHUB_REF_PROTECTED',
  'GITHUB_REF_TYPE',
  'GITHUB_REPOSITORY',
  'GITHUB_REPOSITORY_ID',
  'GITHUB_REPOSITORY_OWNER',
  'GITHUB_REPOSITORY_OWNER_ID',
  'GITHUB_RETENTION_DAYS',
  'GITHUB_RUN_ATTEMPT',
  'GITHUB_RUN_ID',
  'GITHUB_RUN_NUMBER',
  'GITHUB_SERVER_URL',
  'GITHUB_SHA',
  'GITHUB_STEP_SUMMARY',
  'GITHUB_TRIGGERING_ACTOR',
  'GITHUB_WORKFLOW',
  'GITHUB_WORKFLOW_REF',
  'GITHUB_WORKFLOW_SHA',
  'GITHUB_WORKSPACE',
  'RUNNER_ARCH',
  'RUNNER_DEBUG',
  'RUNNER_ENVIRONMENT',
  'RUNNER_NAME',
  'RUNNER_OS',
  'RUNNER_TEMP',
  'RUNNER_TOOL_CACHE',
]);

/**
 * Exports variables to the later steps of a GitHub Actions job by appending
 * them to the file named by `GITHUB_ENV`, which the runner reads when the
 * current step ends.
 *
 * Every variable uses the multiline `NAME<<DELIMITER` form with a random
 * delimiter, so a value containing newlines cannot close its own block and
 * declare extra variables. All variables are appended in a single write.
 */
export class GitHubEnvFileExporter implements IEnvironmentExporter {
  /**
   * @param options.filePath - File to append to (default: `GITHUB_ENV`,
   * read when exporting).
   */
  constructor(private readonly options: { filePath?: string } = {}) {}

  async export(variables: Readonly<Record<string, string>>): Promise<void> {
    const filePath = this.options.filePath ?? process.env.GITHUB_ENV;
    if (!filePath) {
      throw new InvalidArgumentError(
        'GITHUB_ENV is not set: exporting secrets to the job environment only works inside a GitHub Actions job. Set env-file to write a .env file instead.',
      );
    }

    // The runner skips these names but applies the rest, so the step would
    // report a variable later steps never get. Compared case-insensitively:
    // on Windows runners `node_options` is the same variable.
    const blocked = Object.keys(variables).filter((name) =>
      RUNNER_BLOCKED_NAMES.has(name.toUpperCase()),
    );
    if (blocked.length > 0) {
      throw new InvalidArgumentError(
        `${blocked.join(', ')} cannot be exported to the job environment: GitHub Actions does not let GITHUB_ENV set NODE_OPTIONS or its default GITHUB_* and RUNNER_* variables. Use the command or env-file input instead.`,
      );
    }

    const blocks = Object.entries(variables).map(([name, value]) =>
      GitHubEnvFileExporter.block(name, value),
    );
    if (blocks.length === 0) {
      return;
    }
    await appendFile(filePath, blocks.join(''), { encoding: 'utf8' });
  }

  private static block(name: string, value: string): string {
    const delimiter = `ghadelimiter_${randomUUID()}`;
    if (name.includes(delimiter) || value.includes(delimiter)) {
      throw new InvalidArgumentError(
        `Unexpected delimiter collision while exporting ${name}.`,
      );
    }
    return `${name}<<${delimiter}${EOL}${value}${EOL}${delimiter}${EOL}`;
  }
}
