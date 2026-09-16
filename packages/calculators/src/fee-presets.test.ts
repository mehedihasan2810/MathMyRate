import assert from "node:assert/strict";
import { test } from "vitest";
import { feePresets, getFeePreset } from "./fee-presets.ts";
import { validateFeePresets } from "./fee-schema.ts";
import { calculateFees, GrossOutOfRangeError, grossUpFees } from "./fees.ts";
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
  ["square-us-free-in-person-card", 275n], // 2.6% = 260, + 15
  ["square-us-plus-in-person-card", 265n], // 2.5% = 250, + 15
  ["square-us-premium-in-person-card", 255n], // 2.4% = 240, + 15
  ["square-us-free-online-card", 360n], // 3.3% = 330, + 30
  ["square-us-paid-plan-online-card", 320n], // 2.9% = 290, + 30
  ["square-us-manual-or-card-on-file", 365n], // 3.5% = 350, + 15
  ["square-us-free-in-person-international-card", 425n], // 260 + 15 + 1.5% = 150
  ["square-us-afterpay", 630n], // 6% = 600, + 30
  ["etsy-us-order-with-listing-fee", 995n], // 6.5% = 650, + 3% = 300, + 25, + 20
  ["etsy-us-order-fees-only", 975n], // 650 + 300 + 25
  ["ebay-us-most-categories", 1400n], // 13.6% = 1360, + 40
  ["ebay-us-books-movies-music", 1570n], // 15.3% = 1530, + 40
  ["ebay-us-cards-comics-coins", 1365n], // 13.25% = 1325, + 40
  ["ebay-us-guitars-basses", 710n], // 6.7% = 670, + 40
  ["ebay-us-international-most-categories", 1565n], // 1360 + 1.65% = 165, + 40
  ["ebay-us-store-most-categories", 1310n], // 12.7% = 1270, + 40
  ["kickstarter-us-pledge", 830n], // 5% = 500, + 3% = 300, + 30
  ["patreon-us-standard-web", 1320n], // 10% = 1000, + 2.9% = 290, + 30
  ["patreon-us-standard-non-us-paypal", 1420n], // 1000 + 3.9% = 390, + 30
  ["patreon-us-standard-currency-conversion", 1570n], // 1000 + 290 + 30 + 2.5% = 250
  ["patreon-us-standard-ios-first-year", 4000n], // Apple 30% = 3000, + 1000
  ["patreon-us-standard-ios-after-year", 2500n], // Apple 15% = 1500, + 1000
  ["patreon-us-pro-over-3", 1120n], // 8% = 800, + 290, + 30
  ["kofi-us-stripe-5-percent", 820n], // 5% = 500, + 290, + 30
  ["kofi-us-stripe-no-fee", 320n], // 290 + 30
  ["kofi-us-paypal-5-percent", 500n], // 5%
  ["substack-us-web-domestic-card", 1390n], // 10% = 1000, + 290, + 30, + Billing 0.7% = 70
  ["substack-us-web-international-card", 1540n], // 1000 + 290 + 30 + 1.5% = 150, + 70
  ["payhip-us-free-stripe-card", 820n], // 5% = 500, + 290, + 30
  ["payhip-us-plus-stripe-card", 520n], // 2% = 200, + 290, + 30
  ["payhip-us-pro-stripe-card", 320n], // 290 + 30
  ["podia-us-mover-stripe-card", 820n], // 5% = 500, + 290, + 30
  ["podia-us-no-fee-stripe-card", 320n], // 290 + 30
  ["indiegogo-us-contribution", 820n], // 5% = 500, + 3% = 300, + 20
  ["skool-us-pro-standard", 320n], // 2.9% = 290, + 30
  ["skool-us-hobby", 1_030n], // 10% = 1000, + 30
  ["teachable-us-starter-card", 1_070n], // 7.5% = 750, + 290, + 30
  ["teachable-us-paid-plan-card", 320n], // 290 + 30
  ["teachable-us-starter-subscription", 1_140n], // 750 + 290 + 30, + 0.7% = 70
  ["teachable-us-paid-plan-subscription", 390n], // 290 + 30 + 70
  ["whop-us-card", 300n], // 2.7% = 270, + 30
  ["whop-us-international-card", 450n], // 270 + 30 + 1.5% = 150
]);

// Presets whose range excludes $100 get a fixture at an amount inside their range.
const expectedFeesAt = new Map([
  ["ebay-us-most-categories-small-order", { grossCents: 1_000n, feeCents: 166n }], // 13.6% of 1,000 = 136, + 30
  ["kickstarter-us-micropledge", { grossCents: 500n, feeCents: 58n }], // 5% of 500 = 25, + 5% = 25, + 8
  ["patreon-us-pro-3-or-less", { grossCents: 300n, feeCents: 49n }], // 8% of 300 = 24, + 5% = 15, + 10
  ["skool-us-pro-large", { grossCents: 100_000n, feeCents: 3_930n }], // 3.9% of 1,000 = 3,900, + 30
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

    const fixture =
      expectedFeesAt.get(preset.id) ??
      (expectedFees.has(preset.id)
        ? { grossCents: 10000n, feeCents: expectedFees.get(preset.id) }
        : undefined);

    assert.ok(fixture?.feeCents !== undefined, "Each supported rule needs an independent fixture");
    assert.equal(
      calculateFees({ preset, grossCents: fixture.grossCents }).feeCents,
      fixture.feeCents,
    );

    const target = fixture.grossCents / 2n;
    const result = grossUpFees({ preset, targetProceedsCents: target });

    assert.ok(result.sellerProceedsCents >= target);

    // Independent exhaustive small-domain oracle avoids assuming monotonic net.
    for (let gross = 1; gross < Number(result.grossCents); gross++) {
      const fee = preset.components.reduce(
        (sum, c) => sum + Math.floor((gross * c.rateBps + 5000) / 10000) + c.fixedCents,
        0,
      );

      const floor = preset.grossRangeCents?.minCents ?? 1;

      assert.ok(
        gross < floor || gross - fee < Number(target),
        "A smaller charge must not reach the target",
      );
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

test("Substack's $150 annual example plus Stripe's 0.7% Billing fee", () => {
  const preset = getFeePreset("substack-us-web-domestic-card");

  assert.ok(preset);
  const result = calculateFees({ preset, grossCents: 15_000n });

  // Substack's example: $150 − 10% ($15.00) − 2.9% + $0.30 ($4.65) = $130.35, before the $1.05 Billing fee.
  assert.equal(result.sellerProceedsCents, 13_035n - 105n);
  assert.equal(result.feeCents, 1_500n + 465n + 105n);
});

test("Skool's $999 example pays out $959.74", () => {
  const preset = getFeePreset("skool-us-pro-large");

  assert.ok(preset);
  const result = calculateFees({ preset, grossCents: 99_900n });

  // 3.9% of $999.00 is $38.961, rounded half up to $38.96, plus $0.30.
  assert.equal(result.feeCents, 3_926n);
  assert.equal(result.sellerProceedsCents, 95_974n);
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

test("Square takes its fee from the total, including tax", () => {
  const preset = getFeePreset("square-us-free-in-person-card");

  assert.ok(preset);

  // $108.00 including $8.00 tax: 2.6% of 10,800 is 280.8, rounded to 281, + 15 = 296; 10,800 - 296 - 800 = 9,704.
  const sale = calculateFees({ preset, grossCents: 10_800n, taxCents: 800n });

  assert.equal(sale.feeCents, 296n);
  assert.equal(sale.sellerProceedsCents, 9_704n);
});

test("Etsy's transaction fee leaves out sales tax while its processing fee includes it", () => {
  const preset = getFeePreset("etsy-us-order-with-listing-fee");

  assert.ok(preset);

  // $54.00 order with $4.00 tax: 6.5% of 5,000 = 325; 3% of 5,400 = 162, + 25 = 187; listing 20.
  const order = calculateFees({ preset, grossCents: 5_400n, taxCents: 400n });

  assert.deepEqual(
    order.lineItems.map((item) => item.feeCents),
    [325n, 187n, 20n],
  );
  assert.equal(order.feeCents, 532n);
  assert.equal(order.sellerProceedsCents, 4_468n);
});

test("eBay matches the worked examples on its selling fees page", () => {
  const preset = getFeePreset("ebay-us-most-categories");

  assert.ok(preset);

  // $424.00 including 6% sales tax ($24.00): 13.6% of 42,400 is 5,766.4, rounded to 5,766, + 40 = 5,806.
  const taxed = calculateFees({ preset, grossCents: 42_400n, taxCents: 2_400n });

  assert.equal(taxed.feeCents, 5_806n);

  // $68.90: 13.6% is 937.04, rounded to 937, + 40 = 977.
  assert.equal(calculateFees({ preset, grossCents: 6_890n }).feeCents, 977n);
});

test("eBay scenarios refuse amounts outside the range their rates cover", () => {
  const large = getFeePreset("ebay-us-most-categories");
  const small = getFeePreset("ebay-us-most-categories-small-order");

  assert.ok(large && small);
  assert.throws(() => calculateFees({ preset: large, grossCents: 1_000n }), GrossOutOfRangeError);
  assert.throws(() => calculateFees({ preset: large, grossCents: 750_001n }), GrossOutOfRangeError);
  assert.throws(() => calculateFees({ preset: small, grossCents: 1_001n }), GrossOutOfRangeError);
  assert.equal(calculateFees({ preset: large, grossCents: 750_000n }).feeCents, 102_040n);

  // Keeping $1.00 on the large-order scenario still needs a charge of at least $10.01.
  assert.equal(grossUpFees({ preset: large, targetProceedsCents: 100n }).grossCents, 1_001n);

  // Keeping $7,000.00 would need more than $7,500.00, beyond the scenario's range.
  assert.throws(
    () => grossUpFees({ preset: large, targetProceedsCents: 700_000n }),
    GrossOutOfRangeError,
  );
});

test("Kickstarter's processing fee changes at $10 and each scenario refuses the other side", () => {
  const standard = getFeePreset("kickstarter-us-pledge");
  const micro = getFeePreset("kickstarter-us-micropledge");

  assert.ok(standard && micro);

  // $10.00: 5% = 50, 3% = 30, + 30 = 110. $9.99: 5% = 49.95 rounds to 50, 5% again 50, + 8 = 108.
  assert.equal(calculateFees({ preset: standard, grossCents: 1_000n }).feeCents, 110n);
  assert.equal(calculateFees({ preset: micro, grossCents: 999n }).feeCents, 108n);

  // $1.00: 5 + 5 + 8 = 18, which is 18% of the pledge.
  assert.equal(calculateFees({ preset: micro, grossCents: 100n }).feeCents, 18n);

  assert.throws(() => calculateFees({ preset: standard, grossCents: 999n }), GrossOutOfRangeError);
  assert.throws(() => calculateFees({ preset: micro, grossCents: 1_000n }), GrossOutOfRangeError);

  try {
    calculateFees({ preset: micro, grossCents: 5_000n });
    assert.fail("A $50 pledge is outside the micropledge range");
  } catch (error) {
    assert.ok(error instanceof GrossOutOfRangeError);
    assert.equal(error.minCents, null);
    assert.equal(error.maxCents, 999n);
  }
});

test("Patreon matches its own web and iOS worked examples", () => {
  const web = getFeePreset("patreon-us-standard-web");
  const ios = getFeePreset("patreon-us-standard-ios-first-year");

  assert.ok(web && ios);

  // $10 on the web: $1.00 platform fee and $0.59 processing, so the creator gets $8.41.
  const webSale = calculateFees({ preset: web, grossCents: 1_000n });

  assert.deepEqual(
    webSale.lineItems.map((item) => item.feeCents),
    [100n, 59n],
  );
  assert.equal(webSale.sellerProceedsCents, 841n);

  // $14.50 in the iOS app: $4.35 to Apple and $1.45 platform fee, so the creator gets $8.70.
  const iosSale = calculateFees({ preset: ios, grossCents: 1_450n });

  assert.deepEqual(
    iosSale.lineItems.map((item) => item.feeCents),
    [435n, 145n],
  );
  assert.equal(iosSale.sellerProceedsCents, 870n);

  // $10 in the iOS app with the creator absorbing Apple's fee: $3.00 and $1.00, so $6.00.
  assert.equal(calculateFees({ preset: ios, grossCents: 1_000n }).sellerProceedsCents, 600n);
});
