import { getFeePreset, type FeeComponent } from "@MathMyRate/calculators";
import { describe, expect, it } from "vitest";

import { formatCombinedRate, formatFeeRate } from "./fee-labels";

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
    ["lemon-squeezy-us-domestic-card", "5% + 50¢"],
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

describe("formatCombinedRate", () => {
  it.each([
    ["stripe-us-online-domestic-card", "2.9% + 30¢"],
    ["stripe-us-online-international-card", "4.4% + 30¢"],
    ["paypal-us-checkout-international", "4.99% + 49¢"],
    ["gumroad-us-direct-card", "12.9% + 80¢"],
    ["lemon-squeezy-us-subscription", "5.5% + 50¢"],
  ])("labels every component of %s as %j", (presetId, label) => {
    const preset = getFeePreset(presetId);

    if (!preset) throw new Error(`Missing preset ${presetId}`);

    expect(formatCombinedRate(preset.components)).toBe(label);
  });
});

describe("formatCombinedRate with fees on different amounts", () => {
  it("lists a fee charged before tax separately instead of adding it", () => {
    const preset = getFeePreset("etsy-us-order-with-listing-fee");

    if (!preset) throw new Error("The Etsy preset is missing.");

    expect(formatCombinedRate(preset.components)).toBe("6.5% plus 3% + 25¢ plus 20¢");
  });
});
