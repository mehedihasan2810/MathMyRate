import assert from "node:assert/strict";
import { test } from "vitest";
import type { FeePreset } from "./fee-presets.ts";
import { validateFeePreset, validateFeePresets } from "./fee-schema.ts";
import { calculateFees, calculatePaymentBatch, grossUpFees } from "./fees.ts";
import { MAX_CENTS } from "./money.ts";

const fixture: FeePreset = {
  id: "custom:fixture-not-a-provider",
  label: "Synthetic test fixture",
  provider: "test",
  origin: "custom",
  kind: "custom",
  currency: "USD",
  accountCountry: "US",
  taxMode: "caller-supplied",
  paymentProduct: "Synthetic payment",
  channel: "online",
  combinationPolicy: "exact-scenario-only",
  effectiveFrom: null,
  tierPolicy: "not-applicable",
  capsPolicy: "none-modeled",
  customPricingPolicy: "user-supplied",
  revision: 1,
  checkedOn: null,
  status: "supported",
  components: [
    {
      id: "processing",
      label: "Processing",
      rateBps: 290,
      fixedCents: 30,
      base: "gross",
      rounding: "half-up",
    },
  ],
  sources: [{ title: "Test source, not an official preset", url: "https://example.com/" }],
  assumptions: ["Synthetic test scenario only"],
  exclusions: ["Not an official rate"],
};

test("custom input does not require an invented citation or official review date", () => {
  const result = calculateFees({ preset: { ...fixture, sources: [] }, grossCents: 10000n });
  assert.equal(result.origin, "custom");
  assert.equal(result.checkedOn, null);
  assert.deepEqual(result.sources, []);
  assert.ok(result.warnings.some((warning) => warning.includes("Custom preset")));
});

test("hand-derived single-payment and gross-up fixtures", () => {
  // $100 * .029 + $.30 = $3.20, leaving $96.80.
  const result = calculateFees({ preset: fixture, grossCents: 10000n });
  assert.equal(result.feeCents, 320n);
  assert.equal(result.sellerProceedsCents, 9680n);
  // $103.30 * .029 = $2.9957 -> $3.00; + $.30 => net $100.00.
  assert.equal(grossUpFees({ preset: fixture, targetProceedsCents: 10000n }).grossCents, 10330n);
  assert.equal(calculateFees({ preset: fixture, grossCents: 10329n }).sellerProceedsCents, 9999n);
  assert.match(result.roundingPolicy, /Estimate/);
  assert.equal(result.ruleRevision, "custom:fixture-not-a-provider@1");
  assert.equal(result.lineItems[0]?.feeCents, 320n);
  assert.match(result.warnings[0]!, /Custom preset/);
  assert.equal(result.sources[0]?.url, "https://example.com/");
});

test("tax is included in the fee base but excluded from seller proceeds", () => {
  const preset = {
    ...fixture,
    components: [{ ...fixture.components[0]!, rateBps: 500, fixedCents: 50 }],
  };
  const result = calculateFees({ preset, grossCents: 11000n, taxCents: 1000n });
  assert.equal(result.feeCents, 600n);
  assert.equal(result.netAfterFeesCents, 10400n);
  assert.equal(result.sellerProceedsCents, 9400n);
  const quote = grossUpFees({ preset, targetProceedsCents: 10000n, taxCents: 1000n });
  assert.equal(quote.grossCents, 11632n);
  assert.equal(quote.sellerProceedsCents, 10000n);
});

test("fixed fee and rounding apply to each actual transaction", () => {
  const batch = calculatePaymentBatch(fixture, [{ grossCents: 1000n }, { grossCents: 1000n }]);
  assert.equal(batch.feeCents, 118n);
  assert.equal(calculateFees({ preset: fixture, grossCents: 2000n }).feeCents, 88n);
  assert.equal(batch.sellerProceedsCents, 1882n);
  assert.throws(() => calculatePaymentBatch(fixture, []));
});

test("inverse does not assume monotonic net when components round separately", () => {
  const preset = {
    ...fixture,
    components: [
      {
        id: "a",
        label: "A",
        base: "gross" as const,
        rateBps: 2500,
        fixedCents: 0,
        rounding: "half-up" as const,
      },
      {
        id: "b",
        label: "B",
        base: "gross" as const,
        rateBps: 2500,
        fixedCents: 0,
        rounding: "half-up" as const,
      },
    ],
  };
  assert.equal(calculateFees({ preset, grossCents: 1n }).sellerProceedsCents, 1n);
  assert.equal(calculateFees({ preset, grossCents: 2n }).sellerProceedsCents, 0n);
  assert.equal(grossUpFees({ preset, targetProceedsCents: 1n }).grossCents, 1n);
});

test("gross-up matches independent exhaustive oracle across rounding boundaries", () => {
  for (const rates of [[0], [290], [1000, 290], [2500, 2500], [9999]]) {
    const preset = {
      ...fixture,
      components: rates.map((rateBps, index) => ({
        id: `part-${index}`,
        label: "Test",
        rateBps,
        fixedCents: index + 1,
        base: "gross" as const,
        rounding: "half-up" as const,
      })),
    };
    for (const target of [0, 1, 2, 5, 20]) {
      // Small values permit exact integer arithmetic in this independent Number oracle.
      let expected = 1;
      for (; expected < 300000; expected++) {
        const fees = rates.reduce(
          (sum, rate, index) => sum + Math.floor((expected * rate + 5000) / 10000) + index + 1,
          0,
        );
        if (expected - fees >= target) break;
      }
      assert.equal(
        grossUpFees({ preset, targetProceedsCents: BigInt(target) }).grossCents,
        BigInt(expected),
      );
    }
  }
});

test("zero-rate inverse, negative receipts, limits and invalid amount boundaries", () => {
  const zero = {
    ...fixture,
    components: [{ ...fixture.components[0]!, rateBps: 0, fixedCents: 0 }],
  };
  assert.equal(grossUpFees({ preset: zero, targetProceedsCents: 0n }).grossCents, 1n);
  assert.equal(grossUpFees({ preset: zero, targetProceedsCents: MAX_CENTS }).grossCents, MAX_CENTS);
  assert.equal(calculateFees({ preset: fixture, grossCents: 1n }).sellerProceedsCents, -29n);
  assert.throws(() => grossUpFees({ preset: fixture, targetProceedsCents: MAX_CENTS }));
  assert.throws(() => calculateFees({ preset: fixture, grossCents: 0n }));
  assert.throws(() => calculateFees({ preset: fixture, grossCents: -1n }));
  assert.throws(() => calculateFees({ preset: fixture, grossCents: 1n, taxCents: 2n }));
  assert.throws(() => grossUpFees({ preset: fixture, targetProceedsCents: -1n }));
});

test("schema rejects incomplete or contradictory configurations", () => {
  const invalids = [
    null,
    {},
    { ...fixture, id: "" },
    { ...fixture, currency: "EUR" },
    { ...fixture, accountCountry: "GB" },
    { ...fixture, checkedOn: "2026-02-30" },
    { ...fixture, paymentProduct: "" },
    { ...fixture, channel: "" },
    { ...fixture, combinationPolicy: "all-scenarios" },
    { ...fixture, effectiveFrom: "2026-02-30" },
    { ...fixture, tierPolicy: "unknown" },
    { ...fixture, capsPolicy: "modeled" },
    { ...fixture, customPricingPolicy: "excluded" },
    { ...fixture, revision: 1.5 },
    { ...fixture, sources: null },
    { ...fixture, assumptions: [] },
    { ...fixture, exclusions: [] },
    { ...fixture, components: [] },
    { ...fixture, status: "unknown" },
    { ...fixture, blockedReason: "cannot be supported" },
    { ...fixture, status: "blocked", blockedReason: "unknown" },
    { ...fixture, sources: [{ title: "Bad source", url: "http://example.com" }] },
    { ...fixture, components: [fixture.components[0], fixture.components[0]] },
    ...[
      { rateBps: 10000 },
      { rateBps: -1 },
      { rateBps: 2.9 },
      { fixedCents: -1 },
      { base: "subtotal" },
      { rounding: "bankers" },
    ].map((change) => ({
      ...fixture,
      components: [{ ...fixture.components[0], ...change }],
    })),
    {
      ...fixture,
      components: [
        { ...fixture.components[0], id: "a", rateBps: 6000 },
        { ...fixture.components[0], id: "b", rateBps: 4000 },
      ],
    },
  ];
  for (const invalid of invalids) assert.throws(() => validateFeePreset(invalid));
  assert.throws(() => validateFeePresets([fixture, fixture]));
  assert.throws(() => validateFeePresets([]));
  const blocked = { ...fixture, status: "blocked", blockedReason: "unverified", components: [] };
  assert.equal(validateFeePreset(blocked).status, "blocked");
  assert.throws(
    () => calculateFees({ preset: blocked as FeePreset, grossCents: 100n }),
    /Unsupported scenario/,
  );
});
