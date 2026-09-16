import assert from "node:assert/strict";
import { test } from "vitest";

import {
  compareContractorWithEmployee,
  employeePayrollTax,
  payrollTax2026,
  selfEmploymentTax,
} from "./payroll.ts";

test("the 2026 rates match the published IRS and SSA figures", () => {
  assert.equal(payrollTax2026.year, 2026);
  assert.equal(payrollTax2026.socialSecurityWageBaseCents, 18_450_000n); // $184,500
  assert.equal(payrollTax2026.socialSecurityEmployeeBps, 620); // 6.2%
  assert.equal(payrollTax2026.socialSecuritySelfEmployedBps, 1_240); // 12.4%
  assert.equal(payrollTax2026.medicareEmployeeBps, 145); // 1.45%
  assert.equal(payrollTax2026.medicareSelfEmployedBps, 290); // 2.9%
  assert.equal(payrollTax2026.additionalMedicareBps, 90); // 0.9%
  assert.equal(payrollTax2026.selfEmploymentBaseBps, 9_235); // 92.35%
  assert.equal(payrollTax2026.selfEmploymentMinimumCents, 40_000n); // $400
  assert.equal(payrollTax2026.additionalMedicareThresholdCents.single, 20_000_000n);
  assert.equal(payrollTax2026.additionalMedicareThresholdCents["married-jointly"], 25_000_000n);
  assert.equal(payrollTax2026.additionalMedicareThresholdCents["married-separately"], 12_500_000n);
  assert.ok(payrollTax2026.sources.length >= 4);
  assert(Object.isFrozen(payrollTax2026));
  assert(Object.isFrozen(payrollTax2026.sources));
});

test("a $100,000 salary pays $7,650 in Social Security and Medicare, matched by the employer", () => {
  const result = employeePayrollTax({ wagesCents: 10_000_000n, filingStatus: "single" });

  assert.equal(result.socialSecurityCents, 620_000n); // 6.2% of $100,000
  assert.equal(result.medicareCents, 145_000n); // 1.45% of $100,000
  assert.equal(result.additionalMedicareCents, 0n);
  assert.equal(result.employeeTaxCents, 765_000n);
  assert.equal(result.employerTaxCents, 765_000n);
  assert.equal(result.afterTaxCents, 9_235_000n);
});

test("Social Security stops at the wage base while Medicare does not", () => {
  const result = employeePayrollTax({ wagesCents: 20_000_000n, filingStatus: "single" });

  assert.equal(result.socialSecurityCents, 1_143_900n); // 6.2% of $184,500
  assert.equal(result.medicareCents, 290_000n); // 1.45% of $200,000
  assert.equal(result.additionalMedicareCents, 0n); // exactly at the $200,000 threshold
  assert.equal(result.employeeTaxCents, 1_433_900n);
});

test("the Additional Medicare Tax follows the filing status threshold", () => {
  const joint = employeePayrollTax({ wagesCents: 30_000_000n, filingStatus: "married-jointly" });

  assert.equal(joint.additionalMedicareCents, 45_000n); // 0.9% of $50,000 over $250,000
  assert.equal(joint.employeeTaxCents, 1_623_900n);
  assert.equal(joint.employerTaxCents, 1_578_900n); // the employer never pays it

  const separate = employeePayrollTax({
    wagesCents: 25_000_000n,
    filingStatus: "married-separately",
  });

  assert.equal(separate.additionalMedicareCents, 112_500n); // 0.9% of $125,000 over $125,000
  assert.equal(separate.employeeTaxCents, 1_618_900n);
});

test("self-employment tax applies to 92.35% of net earnings", () => {
  const result = selfEmploymentTax({ netEarningsCents: 5_000_000n, filingStatus: "single" });

  assert.equal(result.taxableBaseCents, 4_617_500n); // 92.35% of $50,000
  assert.equal(result.socialSecurityCents, 572_570n); // 12.4%
  assert.equal(result.medicareCents, 133_908n); // 2.9%, rounded half up from $1,339.075
  assert.equal(result.selfEmploymentTaxCents, 706_478n);
  assert.equal(result.deductibleHalfCents, 353_239n);
  assert.equal(result.afterTaxCents, 4_293_522n);
});

test("self-employment tax starts once the taxable share reaches $400", () => {
  const under = selfEmploymentTax({ netEarningsCents: 43_200n, filingStatus: "single" });

  assert.equal(under.taxableBaseCents, 39_895n); // 92.35% of $432.00
  assert.equal(under.selfEmploymentTaxCents, 0n);
  assert.equal(under.afterTaxCents, 43_200n);

  const over = selfEmploymentTax({ netEarningsCents: 43_400n, filingStatus: "single" });

  assert.equal(over.taxableBaseCents, 40_080n); // 92.35% of $434.00, the Schedule SE figure
  assert.equal(over.selfEmploymentTaxCents, 6_132n);
});

test("self-employment Social Security stops at the wage base and the extra Medicare applies", () => {
  const result = selfEmploymentTax({ netEarningsCents: 30_000_000n, filingStatus: "single" });

  assert.equal(result.taxableBaseCents, 27_705_000n);
  assert.equal(result.socialSecurityCents, 2_287_800n); // 12.4% of $184,500
  assert.equal(result.medicareCents, 803_445n); // 2.9% of the taxable base
  assert.equal(result.additionalMedicareCents, 69_345n); // 0.9% over $200,000
  assert.equal(result.selfEmploymentTaxCents, 3_160_590n);
});

// Independent fixtures: an outside brute-force search over the published rates.
const matchingEarnings = new Map([
  [10_000_000n, 10_754_573n],
  [20_000_000n, 21_427_768n],
  [5_000_000n, 5_377_287n],
  [100_000n, 107_545n],
]);

test("a contractor needs more income to match a salary after payroll tax", () => {
  for (const [salaryCents, netEarningsCents] of matchingEarnings) {
    const result = compareContractorWithEmployee({
      salaryCents,
      benefitsCents: 0n,
      businessExpensesCents: 0n,
      filingStatus: "single",
      billableMinutesPerYear: null,
    });

    assert.equal(result.contractor.netEarningsCents, netEarningsCents);
    assert.equal(result.contractorRevenueCents, netEarningsCents);
    assert.equal(result.hourlyRateCents, null);
    assert.ok(result.contractor.afterTaxCents >= result.employeePackageCents);

    // One cent less must fall short, so this is the least matching amount.
    const under = selfEmploymentTax({
      netEarningsCents: netEarningsCents - 1n,
      filingStatus: "single",
    });

    assert.ok(under.afterTaxCents < result.employeePackageCents);
  }
});

test("benefits, expenses, and billable hours set the contractor's rate", () => {
  const result = compareContractorWithEmployee({
    salaryCents: 10_000_000n,
    benefitsCents: 1_200_000n,
    businessExpensesCents: 300_000n,
    filingStatus: "single",
    billableMinutesPerYear: 110_400, // 1,840 hours
  });

  assert.equal(result.employee.employeeTaxCents, 765_000n);
  assert.equal(result.employeePackageCents, 10_435_000n); // $92,350 plus $12,000 of benefits
  assert.equal(result.employerCostCents, 11_965_000n); // salary, employer tax, and benefits
  assert.equal(result.contractor.netEarningsCents, 12_152_026n);
  assert.equal(result.contractorRevenueCents, 12_452_026n); // net earnings plus expenses
  assert.equal(result.hourlyRateCents, 6_768n); // rounded up to the cent
  assert.equal(result.revenueOverSalaryBps, 12_452n); // 124.52% of the salary
  assert.equal(result.year, 2026);
});

test("a joint filer's benefits and expenses carry through the same way", () => {
  const result = compareContractorWithEmployee({
    salaryCents: 15_000_000n,
    benefitsCents: 2_400_000n,
    businessExpensesCents: 600_000n,
    filingStatus: "married-jointly",
    billableMinutesPerYear: 108_000, // 1,800 hours
  });

  assert.equal(result.employeePackageCents, 16_252_500n);
  assert.equal(result.contractor.netEarningsCents, 18_926_767n);
  assert.equal(result.contractorRevenueCents, 19_526_767n);
  assert.equal(result.hourlyRateCents, 10_849n);
  assert.equal(result.revenueOverSalaryBps, 13_018n);
});

test("a zero salary has no tax and no rate to compare", () => {
  const result = compareContractorWithEmployee({
    salaryCents: 0n,
    benefitsCents: 0n,
    businessExpensesCents: 0n,
    filingStatus: "single",
    billableMinutesPerYear: 60,
  });

  assert.equal(result.employee.employeeTaxCents, 0n);
  assert.equal(result.contractor.netEarningsCents, 0n);
  assert.equal(result.hourlyRateCents, 0n);
  assert.equal(result.revenueOverSalaryBps, null);
});
