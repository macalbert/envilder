import { randomUUID } from 'node:crypto';
import { appendFile } from 'node:fs/promises';
import { EOL } from 'node:os';
import { InvalidArgumentError } from '../../domain/errors/DomainErrors.js';
import type { IEnvironmentExporter } from '../../domain/ports/IEnvironmentExporter.js';

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
