/**
 * Facts about the current Envilder process that exec mode needs to compose
 * and interpret a child process, kept behind a port so the application layer
 * does not read runtime globals.
 */
export interface IProcessContext {
  /** Environment inherited by the child. */
  environment(): Readonly<Record<string, string | undefined>>;
  /** Operating system platform, for example `linux` or `win32`. */
  platform(): string;
  /** Number of a signal on this platform, used for `128 + n` exit codes. */
  signalNumber(signal: NodeJS.Signals): number;
}
