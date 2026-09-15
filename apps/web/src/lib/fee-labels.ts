import type { FeeComponent } from "@MathMyRate/calculators";

/** Formats one fee component the way providers publish it, for example "2.9% + 30¢". */
export function formatFeeRate(component: FeeComponent): string {
  const percent = `${component.rateBps / 100}%`;

  if (component.fixedCents === 0) return percent;

  const fixed =
    component.fixedCents < 100
      ? `${component.fixedCents}¢`
      : `$${(component.fixedCents / 100).toFixed(2)}`;

  return `${percent} + ${fixed}`;
}
