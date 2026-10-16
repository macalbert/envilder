import { constants } from 'node:os';
import type { IProcessContext } from '../../domain/ports/IProcessContext.js';

/**
 * Reads the live Node.js process: its environment and platform at call time,
 * and the platform's signal numbers.
 */
export class NodeProcessContext implements IProcessContext {
  environment(): Readonly<Record<string, string | undefined>> {
    return process.env;
  }

  platform(): string {
    return process.platform;
  }

  signalNumber(signal: NodeJS.Signals): number {
    return constants.signals[signal] ?? 0;
  }
}
