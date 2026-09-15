import { getFeePreset, type FeeComponent } from "@MathMyRate/calculators";
import { describe, expect, it } from "vitest";

import { formatFeeRate } from "./fee-labels";

function firstComponent(presetId: string): FeeComponent {
  const component = getFeePreset(presetId)?.components[0];

  if (!component) throw new Error(`Preset ${presetId} has no fee component.`);

  return component;
}

describe("formatFeeRate", () => {
  it.each([
    ["stripe-us-online-domestic-card", "2.9% + 30¢"],
    ["paypal-us-checkout-paypal-payment", "3.49% + 49¢"],
    ["gumroad-us-direct-card", "10% + 50¢"],
    ["gumroad-us-discover", "30%"],
    ["lemon-squeezy-us-card-single-no-tax", "5% + 50¢"],
  ])("labels %s as %j", (presetId, label) => {
    expect(formatFeeRate(firstComponent(presetId))).toBe(label);
  });

  it("uses dollars for a fixed fee of a dollar or more", () => {
    expect(
      formatFeeRate({
        id: "x",
        label: "x",
        rateBps: 150,
        fixedCents: 125,
        base: "gross",
        rounding: "half-up",
      }),
    ).toBe("1.5% + $1.25");
  });
});
