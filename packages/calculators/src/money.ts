import { Schema } from "effect";

/** USD-only boundary helpers. Never convert a floating-point amount to cents. */
export const MAX_CENTS = 100_000_000_000_000n;

export const Cents = Schema.BigInt.check(
  Schema.isGreaterThanOrEqualToBigInt(0n),
  Schema.isLessThanOrEqualToBigInt(MAX_CENTS),
);

export type Cents = typeof Cents.Type;

export const PositiveCents = Schema.BigInt.check(
  Schema.isGreaterThanOrEqualToBigInt(1n),
  Schema.isLessThanOrEqualToBigInt(MAX_CENTS),
);

export type PositiveCents = typeof PositiveCents.Type;

const UsdText = Schema.String.check(Schema.isPattern(/^(0|[1-9]\d*)(\.\d{1,2})?$/));

export const requireCents = Schema.decodeUnknownSync(Cents);

export function parseUsd(amount: string): Cents {
  const text = Schema.decodeSync(UsdText)(amount);
  const [whole = "", fraction = ""] = text.split(".");

  return Schema.decodeSync(Cents)(BigInt(whole) * 100n + BigInt(fraction.padEnd(2, "0")));
}

export function formatUsd(cents: bigint): string {
  const sign = cents < 0n ? "-" : "";
  const absolute = cents < 0n ? -cents : cents;

  return `${sign}${absolute / 100n}.${String(absolute % 100n).padStart(2, "0")}`;
}

export function ceilDivide(numerator: bigint, denominator: bigint): bigint {
  if (numerator < 0n || denominator <= 0n) throw new RangeError("invalid ceiling division");

  return (numerator + denominator - 1n) / denominator;
}
