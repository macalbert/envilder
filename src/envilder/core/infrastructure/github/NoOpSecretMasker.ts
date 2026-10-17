import type { ISecretMasker } from '../../domain/ports/ISecretMasker.js';

export class NoOpSecretMasker implements ISecretMasker {
  mask(_value: string): void {}

  flush(): Promise<void> {
    return Promise.resolve();
  }
}
