/**
 * Some fee rules change with the amount, such as a flat fee under a threshold
 * and a percentage above it. Each band is its own official preset covering a
 * range of amounts; these helpers pick the band that covers an amount.
 */

import {
  calculateFees,
  GrossOutOfRangeError,
  grossUpFees,
  type FeePreset,
} from "@MathMyRate/calculators";

import { formatCombinedRate } from "./fee-labels";

type FeeResult = ReturnType<typeof calculateFees>;

type GrossUpResult = ReturnType<typeof grossUpFees>;

/** The range covered by bands listed lowest amounts first. */
function spanningRangeError(presets: readonly FeePreset[]): GrossOutOfRangeError {
  const first = presets[0]?.grossRangeCents?.minCents;
  const last = presets.at(-1)?.grossRangeCents?.maxCents;

  return new GrossOutOfRangeError(
    first === undefined ? null : BigInt(first),
    last === undefined ? null : BigInt(last),
  );
}

/**
 * Prices an amount with the band that covers it. When no band does, throws a
 * GrossOutOfRangeError spanning every band, so the message names the whole
 * range the rule covers.
 */
export function calculateBandedFees(
  presets: readonly FeePreset[],
  grossCents: bigint,
  taxCents = 0n,
): FeeResult {
  for (const preset of presets) {
    try {
      return calculateFees({ preset, grossCents, taxCents });
    } catch (error) {
      if (!(error instanceof GrossOutOfRangeError)) throw error;
    }
  }

  throw spanningRangeError(presets);
}

/**
 * Finds the smallest charge that keeps a target. Each band is tried on its
 * own; a band whose answer falls outside its range is skipped. Earnings can
 * drop where a band starts, so the lowest charge across bands wins.
 */
export function grossUpBandedFees(
  presets: readonly FeePreset[],
  targetProceedsCents: bigint,
  taxCents = 0n,
): GrossUpResult {
  let best: GrossUpResult | null = null;
  let unreachable: Error | null = null;

  for (const preset of presets) {
    try {
      const result = grossUpFees({ preset, targetProceedsCents, taxCents });

      if (best === null || result.grossCents < best.grossCents) best = result;
    } catch (error) {
      if (error instanceof GrossOutOfRangeError) continue;

      if (!(error instanceof Error)) throw error;

      unreachable ??= error;
    }
  }

  if (best !== null) return best;

  if (unreachable !== null) throw unreachable;

  throw spanningRangeError(presets);
}

/** A rate label for every band, such as "$2.95 or 20%". */
export function bandedRateLabel(presets: readonly FeePreset[]): string {
  return presets.map((preset) => formatCombinedRate(preset.components)).join(" or ");
}
