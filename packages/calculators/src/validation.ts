/**
 * Reject invalid numeric inputs instead of returning a plausible fallback.
 * UI parsing and monetary precision policies belong to the consuming engine.
 */
export function requireFiniteNumber(value: unknown, field: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new TypeError(`${field} must be a finite number`);
  }
  return value;
}
