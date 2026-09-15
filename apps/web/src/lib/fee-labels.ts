import type { FeeComponent } from "@MathMyRate/calculators";

function formatPercent(rateBps: number): string {
  return `${rateBps / 100}%`;
}

function formatFixed(fixedCents: number): string {
  return fixedCents < 100 ? `${fixedCents}¢` : `$${(fixedCents / 100).toFixed(2)}`;
}

/** Formats one fee component the way providers publish it, for example "2.9% + 30¢". */
export function formatFeeRate(component: FeeComponent): string {
  const percent = formatPercent(component.rateBps);

  return component.fixedCents === 0 ? percent : `${percent} + ${formatFixed(component.fixedCents)}`;
}

/**
 * Formats every component of a scenario as one rate, so 2.9% + 30¢ plus a 1.5%
 * add-on reads "4.4% + 30¢". Percentages and fixed charges both apply to each sale.
 */
export function formatCombinedRate(components: readonly FeeComponent[]): string {
  const rateBps = components.reduce((sum, component) => sum + component.rateBps, 0);
  const fixedCents = components.reduce((sum, component) => sum + component.fixedCents, 0);

  return fixedCents === 0
    ? formatPercent(rateBps)
    : `${formatPercent(rateBps)} + ${formatFixed(fixedCents)}`;
}
