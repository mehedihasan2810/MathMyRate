import { effectiveFeeRateBps, repeatSale } from "@MathMyRate/calculators";

import { salesVolumeLabels, type VolumeLabels } from "../data/fee-calculators";
import {
  formatPercentBps,
  formatUsdGrouped,
  requireHtmlElement,
  requireHtmlInput,
  setTextContent,
  wholeNumber,
} from "./calculator-form";

const MAX_SALES_PER_MONTH = 1_000_000;

interface EvaluatedSale {
  readonly grossCents: bigint;
  readonly taxCents: bigint;
  readonly feeCents: bigint;
  readonly sellerProceedsCents: bigint;
}

/** Reads the optional volume field. An empty field means a single sale. */
export function readSalesPerMonth(): number | null {
  const value = requireHtmlInput("salesPerMonth").value.trim();

  return value.length === 0 ? null : wholeNumber(value, "salesPerMonth", 1, MAX_SALES_PER_MONTH);
}

function setText(id: string, text: string): void {
  setTextContent(id, text);
}

/**
 * Shows totals for a number of same-size sales, or hides the block when there
 * is no sale or no count. Returns a sentence for the copied result.
 */
export function renderVolume(
  sale: EvaluatedSale | null,
  count: number | null,
  labels: VolumeLabels = salesVolumeLabels,
): string {
  const block = requireHtmlElement("volume-block");

  if (sale === null || count === null) {
    block.hidden = true;

    return "";
  }

  const total = repeatSale(sale, count);
  const rate = formatPercentBps(effectiveFeeRateBps(sale.feeCents, sale.grossCents));
  const countLabel = `${count.toLocaleString("en-US")} ${count === 1 ? labels.unitSingular : labels.unitPlural}`;

  const heading =
    labels.perPeriod === null ? `Across ${countLabel}` : `At ${countLabel} ${labels.perPeriod}`;

  setText("volume-heading", heading);
  setText("volume-fees-month", formatUsdGrouped(total.feeCents));
  setText("volume-keep-month", formatUsdGrouped(total.sellerProceedsCents));
  setText("volume-fees-year", labels.yearly ? formatUsdGrouped(total.feeCents * 12n) : "—");
  setText("volume-rate", rate);
  block.hidden = false;

  const kept = labels.perPeriod === null ? "kept" : "kept each month";

  return ` ${heading}: ${formatUsdGrouped(total.feeCents)} in fees and ${formatUsdGrouped(total.sellerProceedsCents)} ${kept} (fees are ${rate} of ${labels.shareNoun}).`;
}
