import { injectable } from 'inversify';
import type { ILogger } from '../../domain/ports/ILogger.js';

/**
 * Logger that writes every level to stderr, so stdout stays reserved for a
 * child process (exec mode).
 */
@injectable()
export class StderrConsoleLogger implements ILogger {
  info(message: string): void {
    console.error(message);
  }

  warn(message: string): void {
    console.warn(message);
  }

  error(message: string): void {
    console.error(message);
  }
}
