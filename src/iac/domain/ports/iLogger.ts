export interface ILogger {
  info(message: string): void;

  error(error: Error): void;

  table(entries: ReadonlyArray<{ label: string; value: string }>): void;
}
