const BASIS_POINTS = 10_000n;
const MAX_MONEY_CENTS = 100_000_000_000_000n;

/**
 * Inputs for calculating a sustainable freelance hourly rate.
 *
 * All monetary values are integer cents. Rates expressed as percentages use
 * integer basis points, where 10,000 basis points represent 100%.
 */
export interface FreelanceRateInput {
  annualTakeHomeCents: bigint;
  annualExpensesCents: bigint;
  taxRateBps: number;
  weeksPerYear: number;
  hoursPerWeek: number;
  billablePercentBps: number;
  hoursPerDay: number;
}

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
export interface ProjectRateInput {
  hourlyRateCents: bigint;
  estimatedMinutes: number;
  directExpensesCents: bigint;
  contingencyBps: number;
}

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

function requireInputRecord(value: unknown, field: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new TypeError(`${field} must be an object`);
  }

  return value as Record<string, unknown>;
}

function requireMoneyCents(value: unknown, field: string): bigint {
  if (typeof value !== "bigint") {
    throw new TypeError(`${field} must be a bigint number of cents`);
  }

  if (value < 0n || value > MAX_MONEY_CENTS) {
    throw new RangeError(`${field} must be between 0 and ${MAX_MONEY_CENTS} cents`);
  }

  return value;
}

function requireSafeInteger(
  value: unknown,
  field: string,
  minimum: number,
  maximum: number,
): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value)) {
    throw new TypeError(`${field} must be a safe integer`);
  }

  if (value < minimum || value > maximum) {
    throw new RangeError(`${field} must be between ${minimum} and ${maximum}`);
  }

  return value;
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
  const values = requireInputRecord(input, "input");
  const annualTakeHomeCents = requireMoneyCents(values.annualTakeHomeCents, "annualTakeHomeCents");
  const annualExpensesCents = requireMoneyCents(values.annualExpensesCents, "annualExpensesCents");
  const taxRateBps = requireSafeInteger(values.taxRateBps, "taxRateBps", 0, 9_999);
  const weeksPerYear = requireSafeInteger(values.weeksPerYear, "weeksPerYear", 1, 52);
  const hoursPerWeek = requireSafeInteger(values.hoursPerWeek, "hoursPerWeek", 1, 168);
  const billablePercentBps = requireSafeInteger(
    values.billablePercentBps,
    "billablePercentBps",
    1,
    10_000,
  );
  const hoursPerDay = requireSafeInteger(values.hoursPerDay, "hoursPerDay", 1, 24);

  const netOfTaxBps = BASIS_POINTS - BigInt(taxRateBps);
  const afterTaxRevenueCents = ceilDiv(annualTakeHomeCents * BASIS_POINTS, netOfTaxBps);
  const annualRevenueCents = annualExpensesCents + afterTaxRevenueCents;

  const annualCapacityNumerator =
    BigInt(weeksPerYear) * BigInt(hoursPerWeek) * BigInt(billablePercentBps);
  const annualBillableHours = Number(annualCapacityNumerator) / Number(BASIS_POINTS);
  const hourlyRateCents = ceilDiv(annualRevenueCents * BASIS_POINTS, annualCapacityNumerator);
  const dayRateCents = hourlyRateCents * BigInt(hoursPerDay);

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
  const values = requireInputRecord(input, "input");
  const hourlyRateCents = requireMoneyCents(values.hourlyRateCents, "hourlyRateCents");
  const estimatedMinutes = requireSafeInteger(
    values.estimatedMinutes,
    "estimatedMinutes",
    1,
    Number.MAX_SAFE_INTEGER,
  );
  const directExpensesCents = requireMoneyCents(values.directExpensesCents, "directExpensesCents");
  const contingencyBps = requireSafeInteger(values.contingencyBps, "contingencyBps", 0, 10_000);

  const laborNumerator = hourlyRateCents * BigInt(estimatedMinutes);
  const laborCents = ceilDiv(laborNumerator, 60n);
  const contingencyAdjustedLaborCents = ceilDiv(
    laborNumerator * (BASIS_POINTS + BigInt(contingencyBps)),
    60n * BASIS_POINTS,
  );
  const contingencyCents = contingencyAdjustedLaborCents - laborCents;
  const targetReceiptsCents = contingencyAdjustedLaborCents + directExpensesCents;

  return {
    laborCents,
    contingencyCents,
    expensesCents: directExpensesCents,
    targetReceiptsCents,
  };
}
