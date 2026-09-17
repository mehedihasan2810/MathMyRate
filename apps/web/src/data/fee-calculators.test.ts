import { calculateFees, getFeePreset, type FeePreset } from "@MathMyRate/calculators";
import { describe, expect, it } from "vitest";

import { calculateBandedFees, grossUpBandedFees } from "../lib/fee-bands";
import { feeCalculators, scenarioPresetIds } from "./fee-calculators";

function requirePreset(id: string): FeePreset {
  const preset = getFeePreset(id);

  if (!preset) throw new Error(`Missing preset ${id}`);

  return preset;
}

const scenarios = feeCalculators.flatMap((config) =>
  config.scenarios.map((scenario) => ({ config, scenario })),
);

describe("fee calculator scenarios", () => {
  it("use supported official presets, and bands include the headline rule", () => {
    for (const { scenario } of scenarios) {
      const ids = scenarioPresetIds(scenario);

      expect(ids, scenario.id).toContain(scenario.presetId);

      for (const preset of ids.map(requirePreset)) {
        expect(preset.status).toBe("supported");
        expect(preset.origin).toBe("official");
      }
    }
  });

  it("chain their bands with no gap, and share one tax mode", () => {
    for (const { config, scenario } of scenarios) {
      const presets = scenarioPresetIds(scenario).map(requirePreset);
      const label = `${config.id}/${scenario.id}`;

      expect(new Set(presets.map((preset) => preset.taxMode)).size, label).toBe(1);

      for (const [index, preset] of presets.entries()) {
        const next = presets[index + 1];

        if (!next) continue;

        const end = preset.grossRangeCents?.maxCents;
        const start = next.grossRangeCents?.minCents;

        expect(end, label).toBeDefined();
        expect(start, label).toBeDefined();

        if (end === undefined || start === undefined) continue;

        // Bands either meet at one amount with the same fee there, or the next starts a cent later.
        if (start === end) {
          const at = BigInt(end);

          expect(calculateFees({ preset, grossCents: at }).feeCents, label).toBe(
            calculateFees({ preset: next, grossCents: at }).feeCents,
          );
        } else {
          expect(start, label).toBe(end + 1);
        }
      }
    }
  });

  it("price a Poshmark sale with the band that covers it, and find the cheapest price for a target", () => {
    const poshmark = feeCalculators.find((config) => config.id === "poshmark")?.scenarios[0];

    expect(poshmark).toBeDefined();

    if (!poshmark) return;

    const presets = scenarioPresetIds(poshmark).map(requirePreset);

    expect(calculateBandedFees(presets, 1_000n).feeCents).toBe(295n);
    expect(calculateBandedFees(presets, 1_499n).sellerProceedsCents).toBe(1_204n);
    expect(calculateBandedFees(presets, 1_500n).sellerProceedsCents).toBe(1_200n);

    // Keeping $12.02 costs less at $14.97 in the flat band than at $15.03 in the 20% band.
    expect(grossUpBandedFees(presets, 1_202n).grossCents).toBe(1_497n);
    // Keeping $13.00 is out of reach under $15, so the 20% band answers: $16.25.
    expect(grossUpBandedFees(presets, 1_300n).grossCents).toBe(1_625n);
  });
});
