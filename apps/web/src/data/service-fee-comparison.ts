/**
 * Rows for comparing percentage service fees across freelance platforms. Rates
 * come from the service fee calculator configs, so a rate changes in one place.
 */

import { findServiceFeeCalculator, type ServiceFeeCalculatorId } from "./service-fee-calculators";

export interface ServiceFeeComparisonRow {
  readonly id: string;
  readonly label: string;
  readonly href: string;
  /** The fee in basis points, or null when the freelancer enters the rate from their contract. */
  readonly feeBps: number | null;
}

function contractRow(
  calculatorId: ServiceFeeCalculatorId,
  contractId: string,
  label: string,
  href: string,
): ServiceFeeComparisonRow {
  const contract = findServiceFeeCalculator(calculatorId).contracts.find(
    (candidate) => candidate.id === contractId,
  );

  if (!contract) throw new Error(`Unknown ${calculatorId} contract: ${contractId}`);

  return { id: `${calculatorId}-${contractId}`, label, href, feeBps: contract.feeBps };
}

export const upworkFiverrRows: readonly ServiceFeeComparisonRow[] = [
  contractRow(
    "upwork",
    "marketplace",
    "Upwork, marketplace contract (your rate)",
    "/fees/upwork-fee-calculator/",
  ),
  contractRow("upwork", "direct", "Upwork, Direct Contract", "/fees/upwork-fee-calculator/"),
  contractRow(
    "upwork",
    "direct-plus",
    "Upwork, Direct Contract with Freelancer Plus",
    "/fees/upwork-fee-calculator/",
  ),
  contractRow("fiverr", "order", "Fiverr, order", "/fees/fiverr-fee-calculator/"),
];
