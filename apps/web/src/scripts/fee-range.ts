import { formatUsdGrouped } from "./calculator-form";

/** "$10.00 or more", "up to $9.99", or "$10.00 to $2,500.00" for a scenario's covered charges. */
export function describeRange(minCents: bigint | null, maxCents: bigint | null): string {
  if (minCents !== null && maxCents !== null) {
    return `${formatUsdGrouped(minCents)} to ${formatUsdGrouped(maxCents)}`;
  }

  if (minCents !== null) return `${formatUsdGrouped(minCents)} or more`;

  return `up to ${formatUsdGrouped(maxCents ?? 0n)}`;
}
