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
    ["date", forge({ checkedOn: "2026-09-16" })],
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

// Independent $100 fixtures, derived by hand from each published component:
// a percentage of $100.00 in cents, plus any fixed charge.
const expectedFees = new Map([
  ["stripe-us-online-domestic-card", 320n], // 2.9% = 290, + 30
  ["stripe-us-online-international-card", 470n], // 290 + 30 + 1.5% = 150
  ["stripe-us-online-manual-domestic-card", 370n], // 290 + 30 + 0.5% = 50
  ["paypal-us-checkout-paypal-payment", 398n], // 3.49% = 349, + 49
  ["paypal-us-standard-card-payment", 348n], // 2.99% = 299, + 49
  ["paypal-us-invoice-paypal-payment", 398n], // 349 + 49
  ["paypal-us-invoice-card-payment", 348n], // 299 + 49
  ["paypal-us-checkout-international", 548n], // 349 + 49 + 1.50% = 150
  ["paypal-us-qr-code", 238n], // 2.29% = 229, + 9
  ["gumroad-us-direct-card", 1370n], // 1000 + 50 + 290 + 30
  ["gumroad-us-direct-card-high-volume", 870n], // 500 + 50 + 290 + 30
  ["gumroad-us-discover", 3000n], // 30%
  ["lemon-squeezy-us-domestic-card", 550n], // 5% = 500, + 50
  ["lemon-squeezy-us-international-card", 700n], // 500 + 50 + 150
  ["lemon-squeezy-us-paypal", 700n], // 500 + 50 + 150
  ["lemon-squeezy-us-subscription", 600n], // 500 + 50 + 0.5% = 50
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

test("Lemon Squeezy matches the worked examples on its own fee and sales tax pages", () => {
  const international = getFeePreset("lemon-squeezy-us-international-card");

  assert.ok(international);

  // Fees page: $20.00 product, $4.00 VAT, $24.00 total, platform fee $2.06, net $17.94.
  const france = calculateFees({ preset: international, grossCents: 2400n, taxCents: 400n });

  assert.equal(france.feeCents, 206n);
  assert.equal(france.sellerProceedsCents, 1794n);

  // Sales tax page: $15.00 subtotal, $3.00 VAT, $18.00 total, platform fee $1.67, net $13.33.
  const uk = calculateFees({ preset: international, grossCents: 1800n, taxCents: 300n });

  assert.equal(uk.feeCents, 167n);
  assert.equal(uk.sellerProceedsCents, 1333n);
});

test("PayPal's international Checkout fee is the domestic fee plus 1.50%", () => {
  const domestic = getFeePreset("paypal-us-checkout-paypal-payment");
  const international = getFeePreset("paypal-us-checkout-international");

  assert.ok(domestic && international);

  // $250.00: domestic 3.49% is 872.5, rounded to 873, + 49 = 922; the add-on is 1.50% = 375.
  assert.equal(calculateFees({ preset: domestic, grossCents: 25_000n }).feeCents, 922n);
  assert.equal(calculateFees({ preset: international, grossCents: 25_000n }).feeCents, 1_297n);
});
