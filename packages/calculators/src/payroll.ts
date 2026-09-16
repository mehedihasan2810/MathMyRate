import { Schema } from "effect";

import { Cents } from "./money.ts";

const BASIS_POINTS = 10_000n;

/** Rounds a nonnegative ratio to the nearest cent, with halves rounded up. */
function roundHalfUp(numerator: bigint, denominator: bigint): bigint {
  return (numerator * 2n + denominator) / (denominator * 2n);
}

function ceilDivide(numerator: bigint, denominator: bigint): bigint {
  return numerator === 0n ? 0n : (numerator + denominator - 1n) / denominator;
}

export const FilingStatus = Schema.Literals([
  "single",
  "married-jointly",
  "married-separately",
  "head-of-household",
]);

export type FilingStatus = typeof FilingStatus.Type;

/**
 * One year of published US Social Security and Medicare rates. Every figure
 * comes from the linked IRS or SSA page; nothing here is inferred.
 */
export interface PayrollTaxYear {
  readonly year: number;
  readonly socialSecurityWageBaseCents: bigint;
  /** Each of the employee and the employer pays this rate on wages up to the base. */
  readonly socialSecurityEmployeeBps: number;
  readonly socialSecuritySelfEmployedBps: number;
  readonly medicareEmployeeBps: number;
  readonly medicareSelfEmployedBps: number;
  readonly additionalMedicareBps: number;
  /** The share of net earnings from self-employment that self-employment tax applies to. */
  readonly selfEmploymentBaseBps: number;
  /** Self-employment tax is owed once that share reaches this amount. */
  readonly selfEmploymentMinimumCents: bigint;
  readonly additionalMedicareThresholdCents: Readonly<Record<FilingStatus, bigint>>;
  readonly checkedOn: string;
  readonly sources: readonly { readonly url: string; readonly title: string }[];
}

export const payrollTax2026: PayrollTaxYear = Object.freeze({
  year: 2026,
  socialSecurityWageBaseCents: 18_450_000n,
  socialSecurityEmployeeBps: 620,
  socialSecuritySelfEmployedBps: 1_240,
  medicareEmployeeBps: 145,
  medicareSelfEmployedBps: 290,
  additionalMedicareBps: 90,
  selfEmploymentBaseBps: 9_235,
  selfEmploymentMinimumCents: 40_000n,
  additionalMedicareThresholdCents: Object.freeze({
    single: 20_000_000n,
    "married-jointly": 25_000_000n,
    "married-separately": 12_500_000n,
    "head-of-household": 20_000_000n,
  }),
  checkedOn: "2026-09-16",
  sources: Object.freeze([
    Object.freeze({
      url: "https://www.ssa.gov/oact/cola/cbb.html",
      title: "Contribution and Benefit Base",
    }),
    Object.freeze({
      url: "https://www.irs.gov/taxtopics/tc751",
      title: "Topic no. 751, Social Security and Medicare withholding rates",
    }),
    Object.freeze({
      url: "https://www.irs.gov/taxtopics/tc554",
      title: "Topic no. 554, Self-employment tax",
    }),
    Object.freeze({
      url: "https://www.irs.gov/businesses/small-businesses-self-employed/self-employment-tax-social-security-and-medicare-taxes",
      title: "Self-employment tax (Social Security and Medicare taxes)",
    }),
    Object.freeze({
      url: "https://www.irs.gov/businesses/small-businesses-self-employed/questions-and-answers-for-the-additional-medicare-tax",
      title: "Questions and answers for the Additional Medicare Tax",
    }),
    Object.freeze({
      url: "https://www.irs.gov/publications/p15",
      title: "Publication 15 (2026), (Circular E), Employer's Tax Guide",
    }),
  ]),
});

/** Social Security and Medicare on wages, for the worker and for the employer. */
export interface EmployeeTaxResult {
  readonly wagesCents: bigint;
  readonly socialSecurityCents: bigint;
  readonly medicareCents: bigint;
  readonly additionalMedicareCents: bigint;
  readonly employeeTaxCents: bigint;
  readonly employerTaxCents: bigint;
  readonly afterTaxCents: bigint;
}

const EmployeeTaxInput = Schema.Struct({
  wagesCents: Cents,
  filingStatus: FilingStatus,
});

export type EmployeeTaxInput = typeof EmployeeTaxInput.Type;

function additionalMedicareOn(
  amountCents: bigint,
  filingStatus: FilingStatus,
  year: PayrollTaxYear,
): bigint {
  const threshold = year.additionalMedicareThresholdCents[filingStatus];

  if (amountCents <= threshold) return 0n;

  return roundHalfUp((amountCents - threshold) * BigInt(year.additionalMedicareBps), BASIS_POINTS);
}

/**
 * Payroll tax on a salary, before income tax. The employee and the employer
 * each pay Social Security up to the wage base and Medicare on every dollar;
 * the worker alone pays the Additional Medicare Tax above the threshold for
 * their filing status, which assumes no other household wages.
 */
export function employeePayrollTax(
  input: EmployeeTaxInput,
  year: PayrollTaxYear = payrollTax2026,
): EmployeeTaxResult {
  const { wagesCents, filingStatus } = Schema.decodeSync(EmployeeTaxInput)(input);

  const socialSecurityBase =
    wagesCents < year.socialSecurityWageBaseCents ? wagesCents : year.socialSecurityWageBaseCents;

  const socialSecurityCents = roundHalfUp(
    socialSecurityBase * BigInt(year.socialSecurityEmployeeBps),
    BASIS_POINTS,
  );

  const medicareCents = roundHalfUp(wagesCents * BigInt(year.medicareEmployeeBps), BASIS_POINTS);
  const additionalMedicareCents = additionalMedicareOn(wagesCents, filingStatus, year);
  const employeeTaxCents = socialSecurityCents + medicareCents + additionalMedicareCents;

  return {
    wagesCents,
    socialSecurityCents,
    medicareCents,
    additionalMedicareCents,
    employeeTaxCents,
    employerTaxCents: socialSecurityCents + medicareCents,
    afterTaxCents: wagesCents - employeeTaxCents,
  };
}

/** Self-employment tax on net earnings, before income tax. */
export interface SelfEmploymentTaxResult {
  readonly netEarningsCents: bigint;
  readonly taxableBaseCents: bigint;
  readonly socialSecurityCents: bigint;
  readonly medicareCents: bigint;
  readonly additionalMedicareCents: bigint;
  readonly selfEmploymentTaxCents: bigint;
  /** Half of the Social Security and Medicare parts, which reduces adjusted gross income. */
  readonly deductibleHalfCents: bigint;
  readonly afterTaxCents: bigint;
}

const SelfEmploymentTaxInput = Schema.Struct({
  netEarningsCents: Cents,
  filingStatus: FilingStatus,
});

export type SelfEmploymentTaxInput = typeof SelfEmploymentTaxInput.Type;

/**
 * Self-employment tax on net earnings after business expenses. Tax applies to
 * 92.35% of those earnings, and only once that amount reaches the year's
 * minimum. Social Security stops at the wage base; Medicare does not.
 */
export function selfEmploymentTax(
  input: SelfEmploymentTaxInput,
  year: PayrollTaxYear = payrollTax2026,
): SelfEmploymentTaxResult {
  const { netEarningsCents, filingStatus } = Schema.decodeSync(SelfEmploymentTaxInput)(input);

  const taxableBaseCents = roundHalfUp(
    netEarningsCents * BigInt(year.selfEmploymentBaseBps),
    BASIS_POINTS,
  );

  if (taxableBaseCents < year.selfEmploymentMinimumCents) {
    return {
      netEarningsCents,
      taxableBaseCents,
      socialSecurityCents: 0n,
      medicareCents: 0n,
      additionalMedicareCents: 0n,
      selfEmploymentTaxCents: 0n,
      deductibleHalfCents: 0n,
      afterTaxCents: netEarningsCents,
    };
  }

  const socialSecurityBase =
    taxableBaseCents < year.socialSecurityWageBaseCents
      ? taxableBaseCents
      : year.socialSecurityWageBaseCents;

  const socialSecurityCents = roundHalfUp(
    socialSecurityBase * BigInt(year.socialSecuritySelfEmployedBps),
    BASIS_POINTS,
  );

  const medicareCents = roundHalfUp(
    taxableBaseCents * BigInt(year.medicareSelfEmployedBps),
    BASIS_POINTS,
  );

  const additionalMedicareCents = additionalMedicareOn(taxableBaseCents, filingStatus, year);
  const selfEmploymentTaxCents = socialSecurityCents + medicareCents + additionalMedicareCents;

  return {
    netEarningsCents,
    taxableBaseCents,
    socialSecurityCents,
    medicareCents,
    additionalMedicareCents,
    selfEmploymentTaxCents,
    deductibleHalfCents: (socialSecurityCents + medicareCents) / 2n,
    afterTaxCents: netEarningsCents - selfEmploymentTaxCents,
  };
}

const ContractorComparisonInput = Schema.Struct({
  salaryCents: Cents,
  /** What the employer's benefits are worth to the worker, such as insurance and a match. */
  benefitsCents: Cents,
  /** What the contractor spends to do the same work, deducted before self-employment tax. */
  businessExpensesCents: Cents,
  filingStatus: FilingStatus,
  /** Billable minutes a year, for the hourly rate; null leaves the rate out. */
  billableMinutesPerYear: Schema.NullOr(
    Schema.Int.check(Schema.isBetween({ minimum: 1, maximum: 5_000_000 })),
  ),
});

export type ContractorComparisonInput = typeof ContractorComparisonInput.Type;

export interface ContractorComparisonResult {
  readonly year: number;
  readonly employee: EmployeeTaxResult;
  readonly benefitsCents: bigint;
  /** Salary after payroll tax, plus the value of the benefits. */
  readonly employeePackageCents: bigint;
  /** Salary, the employer's share of payroll tax, and the benefits. */
  readonly employerCostCents: bigint;
  readonly contractor: SelfEmploymentTaxResult;
  readonly businessExpensesCents: bigint;
  /** Net earnings plus business expenses: what the contractor must invoice. */
  readonly contractorRevenueCents: bigint;
  readonly hourlyRateCents: bigint | null;
  /** Invoiced revenue as a share of the salary, in basis points. */
  readonly revenueOverSalaryBps: bigint | null;
}

/**
 * The contractor income that matches an employee package after Social Security
 * and Medicare tax, before income tax. What remains after self-employment tax
 * never falls as earnings rise, so the least matching amount is found by
 * halving the interval; each step uses the real rounded tax.
 */
export function compareContractorWithEmployee(
  input: ContractorComparisonInput,
  year: PayrollTaxYear = payrollTax2026,
): ContractorComparisonResult {
  const values = Schema.decodeSync(ContractorComparisonInput)(input);

  const employee = employeePayrollTax(
    { wagesCents: values.salaryCents, filingStatus: values.filingStatus },
    year,
  );

  const targetCents = employee.afterTaxCents + values.benefitsCents;

  const afterTax = (netEarningsCents: bigint): bigint =>
    selfEmploymentTax({ netEarningsCents, filingStatus: values.filingStatus }, year).afterTaxCents;

  let low = targetCents;
  let high = targetCents * 2n + 1n;

  while (low < high) {
    const middle = (low + high) / 2n;

    if (afterTax(middle) >= targetCents) high = middle;
    else low = middle + 1n;
  }

  const contractor = selfEmploymentTax(
    { netEarningsCents: low, filingStatus: values.filingStatus },
    year,
  );

  const contractorRevenueCents = contractor.netEarningsCents + values.businessExpensesCents;

  return {
    year: year.year,
    employee,
    benefitsCents: values.benefitsCents,
    employeePackageCents: targetCents,
    employerCostCents: values.salaryCents + employee.employerTaxCents + values.benefitsCents,
    contractor,
    businessExpensesCents: values.businessExpensesCents,
    contractorRevenueCents,
    hourlyRateCents:
      values.billableMinutesPerYear === null
        ? null
        : ceilDivide(contractorRevenueCents * 60n, BigInt(values.billableMinutesPerYear)),
    revenueOverSalaryBps:
      values.salaryCents === 0n
        ? null
        : roundHalfUp(contractorRevenueCents * BASIS_POINTS, values.salaryCents),
  };
}
