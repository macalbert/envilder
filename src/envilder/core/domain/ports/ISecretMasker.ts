export interface ISecretMasker {
  /** Registers a value so the host hides it in its logs. */
  mask(value: string): void;
  /**
   * Resolves once every registration made so far has been delivered, so a
   * process started afterwards cannot print a value before it is masked.
   * Rejects when a registration could not be delivered.
   */
  flush(): Promise<void>;
}
