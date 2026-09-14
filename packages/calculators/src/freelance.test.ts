import assert from "node:assert/strict";
import { test } from "vitest";

import { Schema } from "effect";

import { calculateFreelanceRate, calculateProjectRate, FreelanceRateInput } from "./freelance.ts";

test("calculates a hand-derived annual, hourly, and day rate", () => {
  const result = calculateFreelanceRate({
    annualTakeHomeCents: 6_000_000n,
    annualExpensesCents: 1_200_000n,
    taxRateBps: 2_500,
    weeksPerYear: 48,
    hoursPerWeek: 40,
    billablePercentBps: 7_500,
    hoursPerDay: 8,
  });

  assert.deepEqual(result, {
    annualRevenueCents: 9_200_000n,
    annualBillableHours: 1_440,
    hourlyRateCents: 6_389n,
    dayRateCents: 51_112n,
  });
});

test("keeps fractional annual billable capacity exact for the rate calculation", () => {
  const result = calculateFreelanceRate({
    annualTakeHomeCents: 1n,
    annualExpensesCents: 0n,
    taxRateBps: 2_500,
    weeksPerYear: 1,
    hoursPerWeek: 2,
    billablePercentBps: 7_500,
    hoursPerDay: 1,
  });

  assert.equal(result.annualRevenueCents, 2n);
  assert.equal(result.annualBillableHours, 1.5);
  assert.equal(result.hourlyRateCents, 2n);
  assert.equal(result.dayRateCents, 2n);
});

test("allows zero take-home and expenses without manufacturing a rate", () => {
  const result = calculateFreelanceRate({
    annualTakeHomeCents: 0n,
    annualExpensesCents: 0n,
    taxRateBps: 9_999,
    weeksPerYear: 1,
    hoursPerWeek: 1,
    billablePercentBps: 1,
    hoursPerDay: 1,
  });

  assert.deepEqual(result, {
    annualRevenueCents: 0n,
    annualBillableHours: 0.0001,
    hourlyRateCents: 0n,
    dayRateCents: 0n,
  });
});

test("applies project contingency to labor only", () => {
  const result = calculateProjectRate({
    hourlyRateCents: 6_500n,
    estimatedMinutes: 95,
    directExpensesCents: 1_234n,
    contingencyBps: 1_000,
  });

  // ceil(6500 * 95 / 60) = 10292
  // ceil(6500 * 95 * 11000 / (60 * 10000)) = 11321
  assert.deepEqual(result, {
    laborCents: 10_292n,
    contingencyCents: 1_029n,
    expensesCents: 1_234n,
    targetReceiptsCents: 12_555n,
  });
});

test("rounds labor and contingency at cent boundaries", () => {
  assert.deepEqual(
    calculateProjectRate({
      hourlyRateCents: 1n,
      estimatedMinutes: 1,
      directExpensesCents: 0n,
      contingencyBps: 1,
    }),
    {
      laborCents: 1n,
      contingencyCents: 0n,
      expensesCents: 0n,
      targetReceiptsCents: 1n,
    },
  );

  assert.deepEqual(
    calculateProjectRate({
      hourlyRateCents: 60n,
      estimatedMinutes: 1,
      directExpensesCents: 0n,
      contingencyBps: 1,
    }),
    {
      laborCents: 1n,
      contingencyCents: 1n,
      expensesCents: 0n,
      targetReceiptsCents: 2n,
    },
  );
});

test("rejects a zero-minute project to catch blank estimates", () => {
  assert.throws(() =>
    calculateProjectRate({
      hourlyRateCents: 1n,
      estimatedMinutes: 0,
      directExpensesCents: 0n,
      contingencyBps: 0,
    }),
  );
});

test("rate and project prices are monotonic as costs or contingency increase", () => {
  const lowerRate = calculateFreelanceRate({
    annualTakeHomeCents: 100_000n,
    annualExpensesCents: 10_000n,
    taxRateBps: 2_000,
    weeksPerYear: 50,
    hoursPerWeek: 40,
    billablePercentBps: 8_000,
    hoursPerDay: 8,
  });

  const higherRate = calculateFreelanceRate({
    annualTakeHomeCents: 100_001n,
    annualExpensesCents: 10_001n,
    taxRateBps: 2_001,
    weeksPerYear: 50,
    hoursPerWeek: 40,
    billablePercentBps: 8_000,
    hoursPerDay: 8,
  });

  assert.ok(higherRate.annualRevenueCents > lowerRate.annualRevenueCents);
  assert.ok(higherRate.hourlyRateCents >= lowerRate.hourlyRateCents);

  const lowerProject = calculateProjectRate({
    hourlyRateCents: 5_000n,
    estimatedMinutes: 120,
    directExpensesCents: 1_000n,
    contingencyBps: 500,
  });

  const higherProject = calculateProjectRate({
    hourlyRateCents: 5_001n,
    estimatedMinutes: 121,
    directExpensesCents: 1_001n,
    contingencyBps: 501,
  });

  assert.ok(higherProject.targetReceiptsCents > lowerProject.targetReceiptsCents);
});

test("rejects malformed, unsafe, and out-of-range inputs", () => {
  assert.throws(() =>
    Schema.decodeUnknownSync(FreelanceRateInput)({
      annualTakeHomeCents: 1,
      annualExpensesCents: 0n,
      taxRateBps: 0,
      weeksPerYear: 1,
      hoursPerWeek: 1,
      billablePercentBps: 1,
      hoursPerDay: 1,
    }),
  );

  for (const input of [
    { taxRateBps: 10_000 },
    { weeksPerYear: 0 },
    { hoursPerWeek: 169 },
    { billablePercentBps: 0 },
    { hoursPerDay: 25 },
  ]) {
    assert.throws(() =>
      calculateFreelanceRate({
        annualTakeHomeCents: 0n,
        annualExpensesCents: 0n,
        taxRateBps: input.taxRateBps ?? 0,
        weeksPerYear: input.weeksPerYear ?? 1,
        hoursPerWeek: input.hoursPerWeek ?? 1,
        billablePercentBps: input.billablePercentBps ?? 1,
        hoursPerDay: input.hoursPerDay ?? 1,
      }),
    );
  }

  assert.throws(() =>
    calculateFreelanceRate({
      annualTakeHomeCents: 100_000_000_000_001n,
      annualExpensesCents: 0n,
      taxRateBps: 0,
      weeksPerYear: 1,
      hoursPerWeek: 1,
      billablePercentBps: 1,
      hoursPerDay: 1,
    }),
  );
  assert.throws(() =>
    calculateProjectRate({
      hourlyRateCents: 0n,
      estimatedMinutes: Number.MAX_SAFE_INTEGER + 1,
      directExpensesCents: 0n,
      contingencyBps: 0,
    }),
  );
  assert.throws(() =>
    calculateProjectRate({
      hourlyRateCents: 0n,
      estimatedMinutes: 1,
      directExpensesCents: 0n,
      contingencyBps: 10_001,
    }),
  );
  assert.throws(() =>
    calculateProjectRate({
      hourlyRateCents: 0n,
      estimatedMinutes: 1,
      directExpensesCents: 0n,
      contingencyBps: 1.5,
    }),
  );
});
