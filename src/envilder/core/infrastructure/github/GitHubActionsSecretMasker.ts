import type { ISecretMasker } from '../../domain/ports/ISecretMasker.js';

export class GitHubActionsSecretMasker implements ISecretMasker {
  mask(value: string): void {
    const escapedValue = value
      .replace(/%/g, '%25')
      .replace(/\r/g, '%0D')
      .replace(/\n/g, '%0A');
    process.stdout.write(`::add-mask::${escapedValue}\n`);
  }
}
