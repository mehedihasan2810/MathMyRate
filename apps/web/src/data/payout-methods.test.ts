import { calculateFees, GrossOutOfRangeError } from "@MathMyRate/calculators";
import { describe, expect, it } from "vitest";

import {
  calculatePayout,
  payoutBreakdown,
  payoutFeeShare,
  payoutMethods,
  payoutPresets,
} from "./payout-methods";

describe("payout methods", () => {
  it("uses unique ids and official, supported payout presets", () => {
    expect(new Set(payoutMethods.map((method) => method.id)).size).toBe(payoutMethods.length);

    for (const method of payoutMethods) {
      expect(method.presetIds.length).toBeGreaterThan(0);

      for (const preset of payoutPresets(method)) {
        expect(preset.origin).toBe("official");
        expect(preset.status).toBe("supported");
        expect(preset.paymentProduct).toMatch(/payout/u);
      }
    }
  });

  it("chains each method's bands so one ends where the next begins, with the same fee there", () => {
    for (const method of payoutMethods) {
      const presets = payoutPresets(method);

      for (const [index, preset] of presets.entries()) {
        const next = presets[index + 1];

        if (!next) continue;

        const boundary = preset.grossRangeCents?.maxCents;

        expect(boundary, method.id).toBeDefined();
        expect(next.grossRangeCents?.minCents, method.id).toBe(boundary);

        const grossCents = BigInt(boundary ?? 0);

        expect(calculateFees({ preset, grossCents }).feeCents).toBe(
          calculateFees({ preset: next, grossCents }).feeCents,
        );
      }
    }
  });

  it("prices Patreon's PayPal payouts with the minimum, the percentage, and the cap", () => {
    const method = payoutMethods.find((candidate) => candidate.id === "patreon-paypal");

    expect(method).toBeDefined();

    if (!method) return;

    // 1% with a $0.25 minimum and a $20 cap.
    expect(calculatePayout(method, 1_000n).feeCents).toBe(25n);
    expect(calculatePayout(method, 2_449n).feeCents).toBe(25n);
    expect(calculatePayout(method, 5_000n).feeCents).toBe(50n);
    expect(calculatePayout(method, 123_456n).feeCents).toBe(1_235n);
    expect(calculatePayout(method, 199_949n).feeCents).toBe(1_999n);
    expect(calculatePayout(method, 1_000_000n).feeCents).toBe(2_000n);
    expect(calculatePayout(method, 1_000_000n).sellerProceedsCents).toBe(998_000n);
  });

  it("names the whole covered range when no band covers the payout", () => {
    const patreon = payoutMethods.find((candidate) => candidate.id === "patreon-paypal");
    const instant = payoutMethods.find((candidate) => candidate.id === "gumroad-instant");

    expect(patreon && instant).toBeTruthy();

    if (!patreon || !instant) return;

    const low = (() => {
      try {
        calculatePayout(patreon, 999n);
      } catch (error) {
        return error;
      }

      return null;
    })();

    expect(low).toBeInstanceOf(GrossOutOfRangeError);
    expect(low instanceof GrossOutOfRangeError ? [low.minCents, low.maxCents] : []).toEqual([
      1_000n,
      null,
    ]);

    expect(() => calculatePayout(instant, 99n)).toThrow(GrossOutOfRangeError);
    expect(() => calculatePayout(instant, 1_000_001n)).toThrow(GrossOutOfRangeError);
    expect(calculatePayout(instant, 100n).feeCents).toBe(3n);
    expect(calculatePayout(instant, 1_000_000n).feeCents).toBe(30_000n);
  });

  it("never shows a real fee as a 0.00% share", () => {
    expect(payoutFeeShare(25n, 1_000n)).toBe("2.50%");
    expect(payoutFeeShare(25n, 499_999n)).toBe("0.01%");
    expect(payoutFeeShare(25n, 100_000_000n)).toBe("under 0.01%");
    expect(payoutFeeShare(0n, 100_000_000n)).toBe("0.00%");
  });

  it("adds Stripe's Instant Payout fee on top of the amount received", () => {
    const stripe = payoutMethods.find((candidate) => candidate.id === "stripe-instant");
    const gumroad = payoutMethods.find((candidate) => candidate.id === "gumroad-instant");

    expect(stripe && gumroad).toBeTruthy();

    if (!stripe || !gumroad) return;

    // 1.5% of $100.00 is $1.50, so $101.50 leaves the balance and $100.00 arrives.
    expect(payoutBreakdown(stripe, 10_000n)).toMatchObject({
      feeCents: 150n,
      receivedCents: 10_000n,
      balanceUsedCents: 10_150n,
    });

    // A 50¢ minimum fee up to $33.34, where 1.5% reaches 50¢.
    expect(payoutBreakdown(stripe, 50n)).toMatchObject({ feeCents: 50n, balanceUsedCents: 100n });
    expect(payoutBreakdown(stripe, 3_333n).feeCents).toBe(50n);
    expect(payoutBreakdown(stripe, 3_334n).feeCents).toBe(50n);
    expect(payoutBreakdown(stripe, 3_367n).feeCents).toBe(51n);
    expect(payoutBreakdown(stripe, 999_900n).feeCents).toBe(14_999n);
    expect(() => payoutBreakdown(stripe, 49n)).toThrow(GrossOutOfRangeError);
    expect(() => payoutBreakdown(stripe, 999_901n)).toThrow(GrossOutOfRangeError);

    // Gumroad takes its 3% out of the payout instead.
    expect(payoutBreakdown(gumroad, 10_000n)).toMatchObject({
      feeCents: 300n,
      receivedCents: 9_700n,
      balanceUsedCents: 10_000n,
    });
  });
});
