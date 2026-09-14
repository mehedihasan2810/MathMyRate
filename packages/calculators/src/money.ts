/** USD-only boundary helpers. Never convert a floating-point amount to cents. */
export const MAX_CENTS = 100_000_000_000_000n;

export function requireCents(value: unknown, field = "amount", minimum = 0n): bigint {
  if (typeof value !== "bigint" || value < minimum || value > MAX_CENTS) {
    throw new RangeError(`${field} must be bigint cents between ${minimum} and ${MAX_CENTS}`);
  }
  return value;
}

export function parseUsd(value: string): bigint {
  if (typeof value !== "string" || !/^(0|[1-9]\d*)(\.\d{1,2})?$/.test(value)) {
    throw new TypeError("amount must be a nonnegative decimal with at most two fractional digits");
  }
  const [whole = "", fraction = ""] = value.split(".");
  return requireCents(BigInt(whole) * 100n + BigInt(fraction.padEnd(2, "0")));
}

export function formatUsd(value: bigint): string {
  if (typeof value !== "bigint") throw new TypeError("amount must be bigint cents");
  const sign = value < 0n ? "-" : "";
  const absolute = value < 0n ? -value : value;
  return `${sign}${absolute / 100n}.${String(absolute % 100n).padStart(2, "0")}`;
}

export function ceilDivide(numerator: bigint, denominator: bigint): bigint {
  if (numerator < 0n || denominator <= 0n) throw new RangeError("invalid ceiling division");
  return (numerator + denominator - 1n) / denominator;
}
