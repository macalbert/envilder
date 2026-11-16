/**
 * Whether a secret declared in the map file can be resolved, as checked by
 * `envilder validate` without reading its value:
 *
 * - `exists`: the secret is there and the identity can see it.
 * - `missing`: the provider answered that there is no such secret.
 * - `access_denied`: the identity is not allowed to check the secret, so
 *   whether it exists is unknown. Never reported as `missing`.
 * - `authentication_failed`: the provider rejected the credentials.
 * - `provider_error`: anything else, for example an unreachable provider.
 */
export type SecretExistenceStatus =
  | 'exists'
  | 'missing'
  | 'access_denied'
  | 'authentication_failed'
  | 'provider_error';

/**
 * The outcome of checking one secret path. `reason` explains a status other
 * than `exists` or `missing` when the provider gave one; it never carries a
 * secret value.
 */
export type SecretExistence = {
  readonly status: SecretExistenceStatus;
  readonly reason?: string;
};

/** One variable of the map file with the outcome for the path it maps to. */
export type RemoteKeyCheck = SecretExistence & {
  readonly variable: string;
  readonly path: string;
};

/** Every failing status, in the order a summary lists them. */
const FAILING_STATUSES: readonly SecretExistenceStatus[] = [
  'missing',
  'access_denied',
  'authentication_failed',
  'provider_error',
];

/** How a status reads in text output: `access denied`, not `access_denied`. */
export function describeSecretExistenceStatus(
  status: SecretExistenceStatus,
): string {
  return status.replace(/_/g, ' ');
}

/**
 * Counts the failing checks by status, for example `2 missing, 1 access
 * denied`. Empty when every secret exists.
 */
export function summarizeFailures(checks: readonly RemoteKeyCheck[]): string {
  return FAILING_STATUSES.map((status) => ({
    status,
    count: checks.filter((check) => check.status === status).length,
  }))
    .filter(({ count }) => count > 0)
    .map(
      ({ status, count }) =>
        `${count} ${describeSecretExistenceStatus(status)}`,
    )
    .join(', ');
}
