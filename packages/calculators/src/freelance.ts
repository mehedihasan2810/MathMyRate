import { Schema } from "effect";

import { Cents } from "./money.ts";

const BASIS_POINTS = 10_000n;

const SafeMinutes = Schema.Int.check(
  Schema.isBetween({ minimum: 1, maximum: Number.MAX_SAFE_INTEGER }),
);

/**
 * Inputs for calculating a sustainable freelance hourly rate.
 *
 * All monetary values are integer cents. Rates expressed as percentages use
 * integer basis points, where 10,000 basis points represent 100%.
 */
export const FreelanceRateInput = Schema.Struct({
  annualTakeHomeCents: Cents,
  annualExpensesCents: Cents,
  taxRateBps: Schema.Int.check(Schema.isBetween({ minimum: 0, maximum: 9_999 })),
  weeksPerYear: Schema.Int.check(Schema.isBetween({ minimum: 1, maximum: 52 })),
  hoursPerWeek: Schema.Int.check(Schema.isBetween({ minimum: 1, maximum: 168 })),
  billablePercentBps: Schema.Int.check(Schema.isBetween({ minimum: 1, maximum: 10_000 })),
  hoursPerDay: Schema.Int.check(Schema.isBetween({ minimum: 1, maximum: 24 })),
});

export type FreelanceRateInput = typeof FreelanceRateInput.Type;

/**
 * Values returned by {@link calculateFreelanceRate}.
 *
 * `annualBillableHours` is a number intended for display. The calculation
 * itself uses the exact rational capacity represented by the configured
 * weeks, hours, and billable percentage. All monetary results remain integer
 * cents and are rounded up when a division is required.
 */
export interface FreelanceRateResult {
  annualRevenueCents: bigint;
  annualBillableHours: number;
  hourlyRateCents: bigint;
  dayRateCents: bigint;
}

/**
 * Inputs for calculating the receipt target for one project.
 *
 * `estimatedMinutes` includes all delivery and administrative time for the
 * project. Contingency applies to labor only; direct expenses are added
 * separately and are not marked up.
 */
export const ProjectRateInput = Schema.Struct({
  hourlyRateCents: Cents,
  estimatedMinutes: SafeMinutes,
  directExpensesCents: Cents,
  contingencyBps: Schema.Int.check(Schema.isBetween({ minimum: 0, maximum: 10_000 })),
});

export type ProjectRateInput = typeof ProjectRateInput.Type;

/**
 * Values returned by {@link calculateProjectRate}.
 *
 * `laborCents` is the labor estimate before contingency. `contingencyCents`
 * is the additional labor amount after applying contingency and rounding the
 * adjusted labor total up to a cent. `targetReceiptsCents` is adjusted labor
 * plus direct expenses; it does not apply a tax or payment gross-up.
 */
export interface ProjectRateResult {
  laborCents: bigint;
  contingencyCents: bigint;
  expensesCents: bigint;
  targetReceiptsCents: bigint;
}

function ceilDiv(numerator: bigint, denominator: bigint): bigint {
  if (denominator <= 0n) {
    throw new RangeError("ceilDiv denominator must be positive");
  }

  return numerator === 0n ? 0n : (numerator + denominator - 1n) / denominator;
}

/**
 * Calculates the annual revenue, hourly rate, and day rate needed to reach
 * the requested take-home amount.
 *
 * Tax is grossed up once while calculating annual revenue. The resulting
 * hourly rate already includes that tax requirement, so callers should not
 * add tax again when using the returned hourly rate for project pricing.
 */
export function calculateFreelanceRate(input: FreelanceRateInput): FreelanceRateResult {
  const values = Schema.decodeSync(FreelanceRateInput)(input);
  const netOfTaxBps = BASIS_POINTS - BigInt(values.taxRateBps);
  const afterTaxRevenueCents = ceilDiv(values.annualTakeHomeCents * BASIS_POINTS, netOfTaxBps);
  const annualRevenueCents = values.annualExpensesCents + afterTaxRevenueCents;

  const annualCapacityNumerator =
    BigInt(values.weeksPerYear) * BigInt(values.hoursPerWeek) * BigInt(values.billablePercentBps);

  const annualBillableHours = Number(annualCapacityNumerator) / Number(BASIS_POINTS);
  const hourlyRateCents = ceilDiv(annualRevenueCents * BASIS_POINTS, annualCapacityNumerator);
  const dayRateCents = hourlyRateCents * BigInt(values.hoursPerDay);

  return {
    annualRevenueCents,
    annualBillableHours,
    hourlyRateCents,
    dayRateCents,
  };
}

/**
 * Calculates a project receipt target from an already tax-aware hourly rate.
 *
 * Labor is calculated from combined project time in minutes and rounded up
 * to cents. Contingency is applied to that labor time before one final
 * ceiling operation, while direct expenses are added without contingency.
 */
export function calculateProjectRate(input: ProjectRateInput): ProjectRateResult {
  const values = Schema.decodeSync(ProjectRateInput)(input);
  const laborNumerator = values.hourlyRateCents * BigInt(values.estimatedMinutes);
  const laborCents = ceilDiv(laborNumerator, 60n);

  const contingencyAdjustedLaborCents = ceilDiv(
    laborNumerator * (BASIS_POINTS + BigInt(values.contingencyBps)),
    60n * BASIS_POINTS,
  );

  const contingencyCents = contingencyAdjustedLaborCents - laborCents;
  const targetReceiptsCents = contingencyAdjustedLaborCents + values.directExpensesCents;

  return {
    laborCents,
    contingencyCents,
    expensesCents: values.directExpensesCents,
    targetReceiptsCents,
  };
}
