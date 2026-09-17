import {
  calculateFees,
  effectiveFeeRateBps,
  getFeePreset,
  type FeePreset,
} from "@MathMyRate/calculators";

import { formatPercentBps, formatUsdGrouped } from "../scripts/calculator-form";
import { bandedRateLabel, calculateBandedFees } from "./fee-bands";

/** Sale amounts, in cents, used for the reference tables on fee pages. */
export const commonSaleAmounts: readonly bigint[] = [
  500n,
  1_000n,
  2_500n,
  5_000n,
  10_000n,
  25_000n,
  50_000n,
  100_000n,
];

export function requireOfficialPreset(id: string): FeePreset {
  const preset = getFeePreset(id);

  if (!preset) throw new Error(`The ${id} fee preset is missing from the registry.`);

  return preset;
}

/** "$5", "$1,000", or "$12.50": whole-dollar amounts drop their cents. */
export function formatSaleLabel(cents: bigint): string {
  return formatUsdGrouped(cents).replace(/\.00$/u, "");
}

/** One row per sale amount: sale, fee, what you keep, and fees as a share of the sale. */
export function feeRowsByAmount(preset: FeePreset, amounts: readonly bigint[]): string[][] {
  return amounts.map((grossCents) => {
    const result = calculateFees({ preset, grossCents });

    return [
      formatSaleLabel(grossCents),
      formatUsdGrouped(result.feeCents),
      formatUsdGrouped(result.sellerProceedsCents),
      formatPercentBps(effectiveFeeRateBps(result.feeCents, grossCents)),
    ];
  });
}

/** One row per scenario for the same sale: scenario, combined rate, fee, and what you keep. */
export function scenarioRowsAt(
  scenarios: readonly {
    readonly label: string;
    readonly presetId: string;
    readonly bandPresetIds?: readonly string[];
  }[],
  grossCents: bigint,
): string[][] {
  return scenarios.map((scenario) => {
    const presets = (scenario.bandPresetIds ?? [scenario.presetId]).map(requireOfficialPreset);
    const result = calculateBandedFees(presets, grossCents);

    return [
      scenario.label,
      bandedRateLabel(presets),
      formatUsdGrouped(result.feeCents),
      formatUsdGrouped(result.sellerProceedsCents),
    ];
  });
}

/** One row per sale amount, with one fee column for each preset. */
export function feeColumnsByAmount(
  presetIds: readonly string[],
  amounts: readonly bigint[],
): string[][] {
  const presets = presetIds.map(requireOfficialPreset);

  return amounts.map((grossCents) => [
    formatSaleLabel(grossCents),
    ...presets.map((preset) => formatUsdGrouped(calculateFees({ preset, grossCents }).feeCents)),
  ]);
}

/** The fee on one sale, formatted, for sentences that quote a computed number. */
export function feeFor(presetId: string, grossCents: bigint): string {
  return formatUsdGrouped(
    calculateFees({ preset: requireOfficialPreset(presetId), grossCents }).feeCents,
  );
}
