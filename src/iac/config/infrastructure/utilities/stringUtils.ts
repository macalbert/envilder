/**
 * Convert a string to kebab-case
 * e.g., "Minimal.Api" -> "minimal-api", "WorkerService" -> "worker-service"
 * @param value The string to convert
 * @returns The kebab-cased string
 */
export function toKebabCase(value: string): string {
  return value
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s._]+/g, '-')
    .toLowerCase();
}
