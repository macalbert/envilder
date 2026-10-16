import type { ISecretMasker } from '../../domain/ports/ISecretMasker.js';

/**
 * Registers values with GitHub Actions log masking through `::add-mask::`
 * workflow commands, on stdout unless another stream is given.
 *
 * Writes to a piped stdout are asynchronous on POSIX, so each write is
 * tracked through its callback: `flush()` resolves once every registration
 * so far has been written, letting a caller start a process that shares
 * stdout only after its values are masked. It rejects as soon as a failed
 * write is reached, without waiting for later registrations: the caller must
 * not start that process anyway.
 */
export class GitHubActionsSecretMasker implements ISecretMasker {
  private pending: Promise<void> = Promise.resolve();
  private readonly stream: NodeJS.WritableStream;

  /**
   * @param options.stream - Where workflow commands are written (default:
   * stdout). The runner reads them from stdout and stderr; exec mode uses
   * stderr so stdout carries only the child's output.
   */
  constructor(options: { stream?: NodeJS.WritableStream } = {}) {
    this.stream = options.stream ?? process.stdout;
  }

  mask(value: string): void {
    const escapedValue = value
      .replace(/%/g, '%25')
      .replace(/\r/g, '%0D')
      .replace(/\n/g, '%0A');
    const written = new Promise<void>((resolve, reject) => {
      this.stream.write(`::add-mask::${escapedValue}\n`, (error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });
    this.pending = this.pending.then(() => written);
    // Modes that never flush (pull, the GitHub Action) must not crash on an
    // unhandled rejection; flush() still reports the failure.
    written.catch(() => undefined);
    this.pending.catch(() => undefined);
  }

  flush(): Promise<void> {
    return this.pending;
  }
}
