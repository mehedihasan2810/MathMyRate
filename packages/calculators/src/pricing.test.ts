import assert from "node:assert/strict";
import { test } from "vitest";

import {
  analyzePrice,
  calculateRetainer,
  calculateServiceFee,
  convertPay,
  earningsForTarget,
  priceFromMargin,
  priceFromMarkup,
} from "./pricing.ts";

test("a 50% markup and a 50% margin give different prices", () => {
  // $40.00 cost: +50% of cost is $60.00; a price where profit is half of price is $80.00.
  const markup = priceFromMarkup({ costCents: 4_000n, markupBps: 5_000 });

  assert.equal(markup.priceCents, 6_000n);
  assert.equal(markup.profitCents, 2_000n);
  assert.equal(markup.marginBps, 3_333n); // $20 / $60 = 33.33%

  const margin = priceFromMargin({ costCents: 4_000n, marginBps: 5_000 });

  assert.equal(margin.priceCents, 8_000n);
  assert.equal(margin.markupBps, 10_000n); // $40 / $40 = 100%
});

test("prices round up to the cent so the target is never missed", () => {
  // $10.00 at a 33.33% margin: 1000 / 0.6667 = 1499.925 cents, rounded up to $15.00.
  const margin = priceFromMargin({ costCents: 1_000n, marginBps: 3_333 });

  assert.equal(margin.priceCents, 1_500n);
  assert.ok((margin.marginBps ?? 0n) >= 3_333n);

  // $0.07 at a 12.5% markup: 7.875 cents, rounded up to 8.
  assert.equal(priceFromMarkup({ costCents: 7n, markupBps: 1_250 }).priceCents, 8n);
});

test("a price below cost has negative markup and margin", () => {
  // $50.00 cost sold at $40.00: -$10.00 is -20% of cost and -25% of price.
  const loss = analyzePrice({ costCents: 5_000n, priceCents: 4_000n });

  assert.equal(loss.profitCents, -1_000n);
  assert.equal(loss.markupBps, -2_000n);
  assert.equal(loss.marginBps, -2_500n);
});

test("markup and margin are undefined when their base is zero", () => {
  const free = analyzePrice({ costCents: 0n, priceCents: 1_000n });

  assert.equal(free.markupBps, null);
  assert.equal(free.marginBps, 10_000n);
  assert.equal(analyzePrice({ costCents: 0n, priceCents: 0n }).marginBps, null);
});

test("margin cannot reach 100% and inputs must be valid", () => {
  assert.throws(() => priceFromMargin({ costCents: 1_000n, marginBps: 10_000 }));
  assert.throws(() => priceFromMarkup({ costCents: -1n, markupBps: 100 }));
  assert.throws(() => priceFromMarkup({ costCents: 100n, markupBps: 1.5 }));
});

test("a $52,000 salary over 40-hour, 52-week years", () => {
  const pay = convertPay({
    amountCents: 5_200_000n,
    period: "year",
    hoursPerWeekHundredths: 4_000,
    daysPerWeek: 5,
    weeksPerYear: 52,
  });

  assert.equal(pay.hourlyCents, 2_500n); // 52,000 / 2,080 hours
  assert.equal(pay.dailyCents, 20_000n); // 52,000 / 260 days
  assert.equal(pay.weeklyCents, 100_000n);
  assert.equal(pay.biweeklyCents, 200_000n);
  assert.equal(pay.semimonthlyCents, 216_667n); // 2,166.666...
  assert.equal(pay.monthlyCents, 433_333n); // 4,333.333...
  assert.equal(pay.hoursPerYear, 2_080);
});

test("an hourly wage with part-time hours and unpaid weeks", () => {
  // $25.00 x 37.5 hours x 48 weeks = $45,000.00; 5 days x 48 weeks = 240 days.
  const pay = convertPay({
    amountCents: 2_500n,
    period: "hour",
    hoursPerWeekHundredths: 3_750,
    daysPerWeek: 5,
    weeksPerYear: 48,
  });

  assert.equal(pay.yearlyCents, 4_500_000n);
  assert.equal(pay.dailyCents, 18_750n);
  assert.equal(pay.weeklyCents, 93_750n);
  assert.equal(pay.monthlyCents, 375_000n);
  assert.equal(pay.hourlyCents, 2_500n);
});

test("every pay period converts from the exact yearly amount", () => {
  // $0.01 an hour for 37.25 hours over 52 weeks is $19.37 a year and $1.61 a month (161.4166...).
  const pay = convertPay({
    amountCents: 1n,
    period: "hour",
    hoursPerWeekHundredths: 3_725,
    daysPerWeek: 5,
    weeksPerYear: 52,
  });

  assert.equal(pay.yearlyCents, 1_937n);
  assert.equal(pay.monthlyCents, 161n);
  assert.equal(pay.hourlyCents, 1n);

  // $2,000 every two weeks is $52,000 a year and $4,333.33 a month.
  const biweekly = convertPay({
    amountCents: 200_000n,
    period: "biweekly",
    hoursPerWeekHundredths: 4_000,
    daysPerWeek: 5,
    weeksPerYear: 52,
  });

  assert.equal(biweekly.yearlyCents, 5_200_000n);
  assert.equal(biweekly.monthlyCents, 433_333n);
  assert.throws(() =>
    convertPay({
      amountCents: 100n,
      period: "year",
      hoursPerWeekHundredths: 0,
      daysPerWeek: 5,
      weeksPerYear: 52,
    }),
  );
});

test("a discounted monthly retainer", () => {
  // $100/hour x 20 hours = $2,000; 10% off is $1,800; $1,800 / 20 = $90; / 15 used hours = $120.
  const retainer = calculateRetainer({
    hourlyRateCents: 10_000n,
    includedMinutes: 1_200,
    discountBps: 1_000,
    usedMinutes: 900,
    months: 3,
  });

  assert.equal(retainer.fullValueCents, 200_000n);
  assert.equal(retainer.monthlyFeeCents, 180_000n);
  assert.equal(retainer.clientSavingsCents, 20_000n);
  assert.equal(retainer.ratePerIncludedHourCents, 9_000n);
  assert.equal(retainer.ratePerUsedHourCents, 12_000n);
  assert.equal(retainer.contractTotalCents, 540_000n);
});

test("retainer fees round up and unused months have no used-hour rate", () => {
  // $112.50 x 7.5 hours = $843.75; 15% off = $717.1875, rounded up to $717.19.
  const retainer = calculateRetainer({
    hourlyRateCents: 11_250n,
    includedMinutes: 450,
    discountBps: 1_500,
    usedMinutes: 0,
    months: 1,
  });

  assert.equal(retainer.fullValueCents, 84_375n);
  assert.equal(retainer.monthlyFeeCents, 71_719n);
  assert.equal(retainer.ratePerUsedHourCents, null);
  assert.throws(() =>
    calculateRetainer({
      hourlyRateCents: 100n,
      includedMinutes: 0,
      discountBps: 0,
      usedMinutes: 0,
      months: 1,
    }),
  );
});

test("a percentage service fee rounds to the nearest cent", () => {
  // $500.00 at 10%: a $50.00 fee leaves $450.00.
  assert.deepEqual(calculateServiceFee({ earningsCents: 50_000n, feeBps: 1_000 }), {
    earningsCents: 50_000n,
    feeCents: 5_000n,
    afterFeeCents: 45_000n,
  });

  // 10% of $266.64 is $26.664, which rounds down to $26.66; 10% of $333.36 is $33.336, which rounds up to $33.34.
  assert.equal(calculateServiceFee({ earningsCents: 26_664n, feeBps: 1_000 }).feeCents, 2_666n);
  assert.equal(calculateServiceFee({ earningsCents: 33_336n, feeBps: 1_000 }).feeCents, 3_334n);
  assert.equal(calculateServiceFee({ earningsCents: 12_345n, feeBps: 0 }).afterFeeCents, 12_345n);
  assert.throws(() => calculateServiceFee({ earningsCents: 100n, feeBps: 10_000 }));
});

test("earnings for a target are the least that still reach it", () => {
  assert.equal(earningsForTarget({ targetCents: 45_000n, feeBps: 1_000 }).earningsCents, 50_000n);
  assert.equal(earningsForTarget({ targetCents: 7_777n, feeBps: 0 }).earningsCents, 7_777n);
  assert.equal(earningsForTarget({ targetCents: 0n, feeBps: 1_500 }).earningsCents, 0n);

  // Keeping $100.00 at 15%: $117.65 pays $17.65 and leaves $100.00, while $117.64 also pays $17.65 and leaves $99.99.
  const quote = earningsForTarget({ targetCents: 10_000n, feeBps: 1_500 });

  assert.equal(quote.earningsCents, 11_765n);
  assert.equal(quote.afterFeeCents, 10_000n);
  assert.ok(calculateServiceFee({ earningsCents: 11_764n, feeBps: 1_500 }).afterFeeCents < 10_000n);

  for (const feeBps of [1, 333, 500, 1_000, 1_499, 1_500, 9_999]) {
    for (const targetCents of [1n, 99n, 101n, 12_345n, 999_999n]) {
      const result = earningsForTarget({ targetCents, feeBps });

      assert.ok(result.afterFeeCents >= targetCents);

      if (result.earningsCents > 0n) {
        assert.ok(
          calculateServiceFee({ earningsCents: result.earningsCents - 1n, feeBps }).afterFeeCents <
            targetCents,
        );
      }
    }
  }
});
