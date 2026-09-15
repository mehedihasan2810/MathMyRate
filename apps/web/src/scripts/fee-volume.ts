import { effectiveFeeRateBps, repeatSale } from "@MathMyRate/calculators";

import {
  formatPercentBps,
  formatUsdGrouped,
  requireHtmlElement,
  requireHtmlInput,
  wholeNumber,
} from "./calculator-form";

const MAX_SALES_PER_MONTH = 1_000_000;

interface EvaluatedSale {
  readonly grossCents: bigint;
  readonly taxCents: bigint;
  readonly feeCents: bigint;
  readonly sellerProceedsCents: bigint;
}

/** Reads the optional sales-per-month field. An empty field means a single sale. */
export function readSalesPerMonth(): number | null {
  const value = requireHtmlInput("salesPerMonth").value.trim();

  return value.length === 0 ? null : wholeNumber(value, "salesPerMonth", 1, MAX_SALES_PER_MONTH);
}

function setText(id: string, text: string): void {
  requireHtmlElement(id).textContent = text;
}

/**
 * Shows monthly and yearly totals for same-size sales, or hides the block when
 * there is no sale or no monthly count. Returns a sentence for the copied result.
 */
export function renderVolume(sale: EvaluatedSale | null, salesPerMonth: number | null): string {
  const block = requireHtmlElement("volume-block");

  if (sale === null || salesPerMonth === null) {
    block.hidden = true;

    return "";
  }

  const month = repeatSale(sale, salesPerMonth);
  const rate = formatPercentBps(effectiveFeeRateBps(sale.feeCents, sale.grossCents));
  const salesLabel = `${salesPerMonth.toLocaleString("en-US")} ${salesPerMonth === 1 ? "sale" : "sales"} a month`;

  setText("volume-heading", `At ${salesLabel}`);
  setText("volume-fees-month", formatUsdGrouped(month.feeCents));
  setText("volume-keep-month", formatUsdGrouped(month.sellerProceedsCents));
  setText("volume-fees-year", formatUsdGrouped(month.feeCents * 12n));
  setText("volume-rate", rate);
  block.hidden = false;

  return ` At ${salesLabel}: ${formatUsdGrouped(month.feeCents)} in fees and ${formatUsdGrouped(month.sellerProceedsCents)} kept each month (fees are ${rate} of sales).`;
}
