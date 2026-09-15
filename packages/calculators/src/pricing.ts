import { Schema } from "effect";

import { Cents } from "./money.ts";

const BASIS_POINTS = 10_000n;

function ceilDivide(numerator: bigint, denominator: bigint): bigint {
  return numerator === 0n ? 0n : (numerator + denominator - 1n) / denominator;
}

/** Rounds a signed ratio to the nearest integer, with halves rounded away from zero. */
function roundHalfAwayFromZero(numerator: bigint, denominator: bigint): bigint {
  const magnitude = numerator < 0n ? -numerator : numerator;
  const rounded = (magnitude * 2n + denominator) / (denominator * 2n);

  return numerator < 0n ? -rounded : rounded;
}

/* ----------------------------- Markup and margin ----------------------------- */

const PriceCheckInput = Schema.Struct({
  costCents: Cents,
  priceCents: Cents,
});

const MarkupInput = Schema.Struct({
  costCents: Cents,
  markupBps: Schema.Int.check(Schema.isBetween({ minimum: 0, maximum: 1_000_000 })),
});

const MarginInput = Schema.Struct({
  costCents: Cents,
  marginBps: Schema.Int.check(Schema.isBetween({ minimum: 0, maximum: 9_999 })),
});

/**
 * Price, cost, and the two ways of expressing their difference. Markup is
 * profit as a share of cost; margin is profit as a share of price. Both are
 * signed basis points rounded half away from zero, and null when their base
 * is zero.
 */
export interface PriceBreakdown {
  readonly costCents: bigint;
  readonly priceCents: bigint;
  readonly profitCents: bigint;
  readonly markupBps: bigint | null;
  readonly marginBps: bigint | null;
}

/** Markup and margin for a price you already charge. A price below cost gives negative values. */
export function analyzePrice(input: { costCents: bigint; priceCents: bigint }): PriceBreakdown {
  const { costCents, priceCents } = Schema.decodeSync(PriceCheckInput)(input);
  const profitCents = priceCents - costCents;

  return {
    costCents,
    priceCents,
    profitCents,
    markupBps:
      costCents === 0n ? null : roundHalfAwayFromZero(profitCents * BASIS_POINTS, costCents),
    marginBps:
      priceCents === 0n ? null : roundHalfAwayFromZero(profitCents * BASIS_POINTS, priceCents),
  };
}

/** The price for a markup on cost, rounded up to the cent so the markup is never below target. */
export function priceFromMarkup(input: { costCents: bigint; markupBps: number }): PriceBreakdown {
  const { costCents, markupBps } = Schema.decodeSync(MarkupInput)(input);
  const priceCents = ceilDivide(costCents * (BASIS_POINTS + BigInt(markupBps)), BASIS_POINTS);

  return analyzePrice({ costCents, priceCents });
}

/** The price for a margin on price, rounded up to the cent so the margin is never below target. */
export function priceFromMargin(input: { costCents: bigint; marginBps: number }): PriceBreakdown {
  const { costCents, marginBps } = Schema.decodeSync(MarginInput)(input);
  const priceCents = ceilDivide(costCents * BASIS_POINTS, BASIS_POINTS - BigInt(marginBps));

  return analyzePrice({ costCents, priceCents });
}

/* ------------------------------ Salary to hourly ----------------------------- */

export const PayPeriod = Schema.Literals([
  "hour",
  "day",
  "week",
  "biweekly",
  "semimonthly",
  "month",
  "year",
]);

export type PayPeriod = typeof PayPeriod.Type;

const PayConversionInput = Schema.Struct({
  amountCents: Cents,
  period: PayPeriod,
  /** Working hours per week in hundredths, so 37.5 hours is 3750. */
  hoursPerWeekHundredths: Schema.Int.check(Schema.isBetween({ minimum: 1, maximum: 16_800 })),
  daysPerWeek: Schema.Int.check(Schema.isBetween({ minimum: 1, maximum: 7 })),
  weeksPerYear: Schema.Int.check(Schema.isBetween({ minimum: 1, maximum: 52 })),
});

export type PayConversionInput = typeof PayConversionInput.Type;

/**
 * The same pay expressed per period. Hourly, daily, and weekly figures divide
 * the yearly total by the time actually worked. Every-two-weeks, twice-a-month,
 * and monthly figures spread it across 26, 24, and 12 calendar pay periods.
 * Each figure is rounded half up to the cent from the exact yearly amount.
 */
export interface PayConversionResult {
  readonly hourlyCents: bigint;
  readonly dailyCents: bigint;
  readonly weeklyCents: bigint;
  readonly biweeklyCents: bigint;
  readonly semimonthlyCents: bigint;
  readonly monthlyCents: bigint;
  readonly yearlyCents: bigint;
  readonly hoursPerYear: number;
}

export function convertPay(input: PayConversionInput): PayConversionResult {
  const values = Schema.decodeSync(PayConversionInput)(input);
  const amount = values.amountCents;
  const hundredths = BigInt(values.hoursPerWeekHundredths);
  const days = BigInt(values.daysPerWeek);
  const weeks = BigInt(values.weeksPerYear);

  // The exact yearly amount in cents, as yearlyNumerator / 100.
  const yearlyNumerator = {
    hour: amount * hundredths * weeks,
    day: amount * days * weeks * 100n,
    week: amount * weeks * 100n,
    biweekly: amount * 26n * 100n,
    semimonthly: amount * 24n * 100n,
    month: amount * 12n * 100n,
    year: amount * 100n,
  }[values.period];

  const per = (divisor: bigint) => roundHalfAwayFromZero(yearlyNumerator, 100n * divisor);

  return {
    hourlyCents: roundHalfAwayFromZero(yearlyNumerator, hundredths * weeks),
    dailyCents: per(days * weeks),
    weeklyCents: per(weeks),
    biweeklyCents: per(26n),
    semimonthlyCents: per(24n),
    monthlyCents: per(12n),
    yearlyCents: per(1n),
    hoursPerYear: (values.hoursPerWeekHundredths * values.weeksPerYear) / 100,
  };
}

/* --------------------------------- Retainer --------------------------------- */

const RetainerInput = Schema.Struct({
  hourlyRateCents: Cents,
  includedMinutes: Schema.Int.check(Schema.isBetween({ minimum: 1, maximum: 100_000 })),
  discountBps: Schema.Int.check(Schema.isBetween({ minimum: 0, maximum: 9_999 })),
  usedMinutes: Schema.Int.check(Schema.isBetween({ minimum: 0, maximum: 100_000 })),
  months: Schema.Int.check(Schema.isBetween({ minimum: 1, maximum: 120 })),
});

export type RetainerInput = typeof RetainerInput.Type;

/**
 * A monthly retainer. The fee is rounded up to the cent so the discount never
 * exceeds what was agreed. Effective hourly rates are rounded half up.
 */
export interface RetainerResult {
  readonly fullValueCents: bigint;
  readonly monthlyFeeCents: bigint;
  readonly clientSavingsCents: bigint;
  readonly ratePerIncludedHourCents: bigint;
  readonly ratePerUsedHourCents: bigint | null;
  readonly contractTotalCents: bigint;
}

export function calculateRetainer(input: RetainerInput): RetainerResult {
  const values = Schema.decodeSync(RetainerInput)(input);
  const laborNumerator = values.hourlyRateCents * BigInt(values.includedMinutes);
  const fullValueCents = ceilDivide(laborNumerator, 60n);

  const monthlyFeeCents = ceilDivide(
    laborNumerator * (BASIS_POINTS - BigInt(values.discountBps)),
    60n * BASIS_POINTS,
  );

  return {
    fullValueCents,
    monthlyFeeCents,
    clientSavingsCents: fullValueCents - monthlyFeeCents,
    ratePerIncludedHourCents: roundHalfAwayFromZero(
      monthlyFeeCents * 60n,
      BigInt(values.includedMinutes),
    ),
    ratePerUsedHourCents:
      values.usedMinutes === 0
        ? null
        : roundHalfAwayFromZero(monthlyFeeCents * 60n, BigInt(values.usedMinutes)),
    contractTotalCents: monthlyFeeCents * BigInt(values.months),
  };
}

/* ------------------------------- Service fees ------------------------------- */

const ServiceFeeInput = Schema.Struct({
  earningsCents: Cents,
  feeBps: Schema.Int.check(Schema.isBetween({ minimum: 0, maximum: 9_999 })),
});

const ServiceFeeTargetInput = Schema.Struct({
  targetCents: Cents,
  feeBps: Schema.Int.check(Schema.isBetween({ minimum: 0, maximum: 9_999 })),
});

/** Earnings, a platform's percentage service fee on them, and what remains. */
export interface ServiceFeeResult {
  readonly earningsCents: bigint;
  readonly feeCents: bigint;
  readonly afterFeeCents: bigint;
}

function serviceFeeOn(earningsCents: bigint, feeBps: bigint): ServiceFeeResult {
  const feeCents = (earningsCents * feeBps + 5_000n) / BASIS_POINTS;

  return { earningsCents, feeCents, afterFeeCents: earningsCents - feeCents };
}

/** A service fee taken as a percentage of earnings, rounded half up to the cent. */
export function calculateServiceFee(input: {
  earningsCents: bigint;
  feeBps: number;
}): ServiceFeeResult {
  const { earningsCents, feeBps } = Schema.decodeSync(ServiceFeeInput)(input);

  return serviceFeeOn(earningsCents, BigInt(feeBps));
}

/**
 * The least earnings that leave at least the target after a percentage service
 * fee. The fee rounds to the cent, so the exact inverse is only within a cent of
 * the answer; the search checks that narrow interval in order. What remains
 * never decreases as earnings rise, so the first match is the least.
 */
export function earningsForTarget(input: {
  targetCents: bigint;
  feeBps: number;
}): ServiceFeeResult {
  const { targetCents, feeBps } = Schema.decodeSync(ServiceFeeTargetInput)(input);
  const rate = BigInt(feeBps);
  const remaining = BASIS_POINTS - rate;
  const lowerNumerator = targetCents * BASIS_POINTS - 5_000n;
  const lower = lowerNumerator > 0n ? ceilDivide(lowerNumerator, remaining) : 0n;
  const upper = ceilDivide(targetCents * BASIS_POINTS + 5_000n, remaining);

  for (let earningsCents = lower; earningsCents <= upper; earningsCents++) {
    const result = serviceFeeOn(earningsCents, rate);

    if (result.afterFeeCents >= targetCents) return result;
  }

  throw new RangeError("No earnings reach the target");
}
