import {
  calculateFees,
  effectiveFeeRateBps,
  getFeePreset,
  GrossOutOfRangeError,
  type FeePreset,
} from "@MathMyRate/calculators";

import { findFeeComparison } from "../data/fee-comparisons";
import { describeRange } from "./fee-range";
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
  setTextContent,
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
  setTextContent(id, text);
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

    setText("comparison-message", "");
    markResultsCurrent(panel, []);
  };

  const calculate = (trigger: CalculationTrigger): void => {
    try {
      const amount = usdToCents(requireHtmlInput("amount").value, "amount");

      const results = config.options.map((option) => {
        const preset = requirePreset(option.presetId);

        try {
          return { option, result: calculateFees({ preset, grossCents: amount }), outside: null };
        } catch (error) {
          if (!(error instanceof GrossOutOfRangeError)) throw error;

          return { option, result: null, outside: describeRange(error.minCents, error.maxCents) };
        }
      });

      let lowestFee: bigint | null = null;

      for (const { result } of results) {
        if (result && (lowestFee === null || result.feeCents < lowestFee)) {
          lowestFee = result.feeCents;
        }
      }

      for (const { option, result } of results) {
        setText(`cmp-${option.id}-fee`, result ? formatUsdGrouped(result.feeCents) : "—");
        setText(
          `cmp-${option.id}-keep`,
          result ? formatUsdGrouped(result.sellerProceedsCents) : "—",
        );
        setText(
          `cmp-${option.id}-share`,
          result ? formatPercentBps(effectiveFeeRateBps(result.feeCents, result.grossCents)) : "—",
        );
        requireHtmlElement(`cmp-${option.id}-lowest`).hidden =
          result === null || result.feeCents !== lowestFee;
      }

      const outside = results.flatMap(({ option, outside: range }) =>
        range === null ? [] : [`${option.shortLabel ?? option.label} covers ${range}`],
      );

      const losing = results.some(
        ({ result }) => result !== null && result.sellerProceedsCents <= 0n,
      );

      setText(
        "comparison-message",
        outside.length > 0
          ? `${outside.join("; ")}.`
          : losing
            ? "At this amount, the fees on at least one option are as large as the payment or larger."
            : "",
      );
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
