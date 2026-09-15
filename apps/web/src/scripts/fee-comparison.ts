import {
  calculateFees,
  effectiveFeeRateBps,
  getFeePreset,
  type FeePreset,
} from "@MathMyRate/calculators";

import { findFeeComparison } from "../data/fee-comparisons";
import {
  type CalculationTrigger,
  focusProblemField,
  formatPercentBps,
  formatUsdGrouped,
  InputProblem,
  markResultsCurrent,
  markResultsStale,
  requireHtmlElement,
  requireHtmlForm,
  requireHtmlInput,
  setFieldState,
  shouldDeferProblem,
  usdToCents,
  watchCalculatorFields,
} from "./calculator-form";

function requirePreset(id: string): FeePreset {
  const preset = getFeePreset(id);

  if (!preset) throw new Error(`The ${id} fee preset is missing from the registry.`);

  return preset;
}

function setText(id: string, text: string): void {
  requireHtmlElement(id).textContent = text;
}

/** Wires the comparison table rendered by FeeComparison.astro, if the page has one. */
export function mountFeeComparison(): void {
  const root = document.querySelector<HTMLElement>("[data-fee-comparison]");

  if (!root) return;

  const config = findFeeComparison(root.dataset.feeComparison ?? "");
  const form = requireHtmlForm("comparison-form");
  const panel = requireHtmlElement("comparison-panel");

  const clear = (): void => {
    for (const option of config.options) {
      setText(`cmp-${option.id}-fee`, "—");
      setText(`cmp-${option.id}-keep`, "—");
      setText(`cmp-${option.id}-share`, "—");
      requireHtmlElement(`cmp-${option.id}-lowest`).hidden = true;
    }

    markResultsCurrent(panel, []);
  };

  const calculate = (trigger: CalculationTrigger): void => {
    try {
      const amount = usdToCents(requireHtmlInput("amount").value, "amount");

      const results = config.options.map((option) => ({
        option,
        result: calculateFees({ preset: requirePreset(option.presetId), grossCents: amount }),
      }));

      let lowestFee: bigint | null = null;

      for (const { result } of results) {
        if (lowestFee === null || result.feeCents < lowestFee) lowestFee = result.feeCents;
      }

      for (const { option, result } of results) {
        setText(`cmp-${option.id}-fee`, formatUsdGrouped(result.feeCents));
        setText(`cmp-${option.id}-keep`, formatUsdGrouped(result.sellerProceedsCents));
        setText(
          `cmp-${option.id}-share`,
          formatPercentBps(effectiveFeeRateBps(result.feeCents, result.grossCents)),
        );
        requireHtmlElement(`cmp-${option.id}-lowest`).hidden = result.feeCents !== lowestFee;
      }

      markResultsCurrent(panel, []);
      setFieldState(form);
    } catch (error) {
      const problem =
        error instanceof InputProblem
          ? error
          : new InputProblem("amount", "Enter an amount above zero.");

      if (shouldDeferProblem(form, trigger)) {
        markResultsStale(panel, []);

        return;
      }

      clear();
      setFieldState(form, problem);

      if (trigger === "submit") focusProblemField(form, problem);
    }
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    calculate("submit");
  });

  watchCalculatorFields(form, calculate);
  calculate("commit");
}
