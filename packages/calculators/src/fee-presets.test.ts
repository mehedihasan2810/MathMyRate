import assert from "node:assert/strict";
import { test } from "vitest";
import { feePresets, getFeePreset } from "./fee-presets.ts";
import { validateFeePresets } from "./fee-schema.ts";
import { calculateFees, grossUpFees } from "./fees.ts";
import { calculateProjectRate } from "./freelance.ts";

test("every published rule passes the runtime schema", () => {
  assert.equal(validateFeePresets(feePresets).length, feePresets.length);
});

test("official lookup returns frozen registry records", () => {
  const preset = getFeePreset("stripe-us-online-domestic-card");
  assert.ok(preset);
  assert.equal(preset.origin, "official");
  assert.equal(preset.kind, "official");
  assert.equal(getFeePreset("custom:missing"), undefined);
  assert(Object.isFrozen(preset));
  assert(Object.isFrozen(preset.components));
  assert(Object.isFrozen(preset.sources));
  assert.ok(preset.components[0]);
  assert.ok(preset.sources[0]);
  assert(Object.isFrozen(preset.components[0]));
  assert(Object.isFrozen(preset.sources[0]));
});

test("official-looking clones are rejected unless their full configuration is canonical", () => {
  const preset = getFeePreset("stripe-us-online-domestic-card");

  assert.ok(preset);
  const processing = preset.components[0];
  const source = preset.sources[0];

  assert.ok(processing);
  assert.ok(source);
  const forge = (change: Partial<typeof preset>) => ({ ...preset, ...change });

  const forged: [string, typeof preset][] = [
    [
      "rate",
      {
        ...preset,
        components: [{ ...processing, rateBps: 1 }],
      },
    ],
    [
      "source",
      {
        ...preset,
        sources: [{ ...source, url: "https://example.com/forged" }, ...preset.sources.slice(1)],
      },
    ],
    ["date", forge({ checkedOn: "2026-09-15" })],
    ["channel", forge({ channel: "in-person" })],
    ["product", forge({ paymentProduct: "Forged product" })],
    ["revision", forge({ revision: preset.revision + 1 })],
  ];

  for (const [, candidate] of forged) {
    assert.throws(
      () => calculateFees({ preset: candidate, grossCents: 10000n }),
      /immutable registry/,
    );
  }
});

// Independent $100 fixtures, directly from the component arithmetic in fee-sources.md.
const expectedFees = new Map([
  ["stripe-us-online-domestic-card", 320n],
  ["paypal-us-checkout-paypal-payment", 398n],
  ["gumroad-us-direct-card", 1370n],
  ["gumroad-us-direct-card-high-volume", 870n],
  ["gumroad-us-discover", 3000n],
  ["lemon-squeezy-us-card-single-no-tax", 550n],
]);

for (const preset of feePresets) {
  test(`${preset.id}: ${preset.status === "supported" ? "official example and inverse" : "explicitly blocked"}`, () => {
    if (preset.status === "blocked") {
      assert.equal(preset.components.length, 0);
      assert.throws(() => calculateFees({ preset, grossCents: 10000n }), /Unsupported scenario/);
      assert.throws(
        () => grossUpFees({ preset, targetProceedsCents: 10000n }),
        /Unsupported scenario/,
      );

      return;
    }

    const expected = expectedFees.get(preset.id);

    assert.ok(expected !== undefined, "Each supported rule needs an independent fixture");
    assert.equal(calculateFees({ preset, grossCents: 10000n }).feeCents, expected);
    const result = grossUpFees({ preset, targetProceedsCents: 10000n });
    assert.ok(result.sellerProceedsCents >= 10000n);

    // Independent exhaustive small-domain oracle avoids assuming monotonic net.
    for (let gross = 1; gross < Number(result.grossCents); gross++) {
      const fee = preset.components.reduce(
        (sum, c) => sum + Math.floor((gross * c.rateBps + 5000) / 10000) + c.fixedCents,
        0,
      );

      assert.ok(gross - fee < 10000, "A smaller charge must not reach the target");
    }

    if (preset.taxMode === "zero-only") {
      assert.throws(() => calculateFees({ preset, grossCents: 11000n, taxCents: 1000n }), /no-tax/);
      assert.throws(
        () => grossUpFees({ preset, targetProceedsCents: 10000n, taxCents: 1000n }),
        /no-tax/,
      );
    }
  });
}

test("a project receipt target composes with payment gross-up without taxing it again", () => {
  const project = calculateProjectRate({
    hourlyRateCents: 10000n,
    estimatedMinutes: 600,
    contingencyBps: 1000,
    directExpensesCents: 5000n,
  });

  assert.equal(project.targetReceiptsCents, 115000n);
  const preset = getFeePreset("stripe-us-online-domestic-card");

  assert.ok(preset);
  const quote = grossUpFees({ preset, targetProceedsCents: project.targetReceiptsCents });
  assert.ok(quote.sellerProceedsCents >= 115000n);
  assert.equal(quote.taxCents, 0n);
});
