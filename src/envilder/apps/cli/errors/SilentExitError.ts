export class SilentExitError extends Error {
  constructor(readonly code: number) {
    super('silent exit');
  }
}
