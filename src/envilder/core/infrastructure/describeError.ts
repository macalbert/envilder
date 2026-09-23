/**
 * Extracts a human-readable reason from an unknown thrown value.
 *
 * Digs through `AggregateError.errors` and `Error.cause` so the reason is never
 * empty — the AWS SDK v3 wraps connection failures in an `AggregateError` whose
 * own `message` is empty and whose real causes live in `errors`.
 */
export function describeError(error: unknown): string {
  const reasons = [...new Set(collectReasons(error))];
  return reasons.length > 0 ? reasons.join('; ') : 'unknown error';
}

function collectReasons(error: unknown): string[] {
  if (error instanceof AggregateError && error.errors.length > 0) {
    return error.errors.flatMap(collectReasons);
  }
  if (error instanceof Error) {
    if (error.message) {
      return [error.message];
    }
    if (error.cause !== undefined) {
      return collectReasons(error.cause);
    }
    return error.name ? [error.name] : [];
  }
  const text = String(error);
  return text ? [text] : [];
}
