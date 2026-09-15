import { calculateFees, getFeePreset, grossUpFees, type FeePreset } from "@MathMyRate/calculators";

import {
  findFeeCalculator,
  type FeeCalculatorConfig,
  type FeeScenario,
} from "../data/fee-calculators";
import {
  type CalculationTrigger,
  focusProblemField,
  formatUsdGrouped,
  InputProblem,
  markResultsCurrent,
  markResultsStale,
  requireHtmlButton,
  requireHtmlElement,
  requireHtmlForm,
  requireHtmlInput,
  setFieldState,
  shouldDeferProblem,
  usdToCents,
  watchCalculatorFields,
} from "./calculator-form";
import { readSalesPerMonth, renderVolume } from "./fee-volume";

type FeeMode = "received" | "net";

function requirePreset(id: string): FeePreset {
  const preset = getFeePreset(id);

  if (!preset) throw new Error(`The ${id} fee preset is missing from the registry.`);

  return preset;
}

function setText(id: string, text: string): void {
  requireHtmlElement(id).textContent = text;
}

function renderLineItems(items: ReadonlyArray<{ label: string; feeCents: bigint }>): void {
  const container = requireHtmlElement("line-items");

  container.replaceChildren();

  for (const item of items) {
    const row = document.createElement("div");
    row.className =
      "mt-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 text-sm text-paper/70";

    const label = document.createElement("span");
    label.textContent = item.label;

    const value = document.createElement("strong");
    value.className = "ml-auto text-right text-paper";
    value.textContent = formatUsdGrouped(item.feeCents);

    row.appendChild(label);
    row.appendChild(value);
    container.appendChild(row);
  }
}

/** Wires the fee calculator rendered by FeeCalculator.astro, if the page has one. */
export function mountFeeCalculator(): void {
  const root = document.querySelector<HTMLElement>("[data-fee-calculator]");

  if (!root) return;

  const config: FeeCalculatorConfig = findFeeCalculator(root.dataset.feeCalculator ?? "");
  const form = requireHtmlForm("fee-form");
  const panel = requireHtmlElement("fee-panel");
  const copyButton = requireHtmlButton("copy-fee");
  const taxField = document.getElementById("tax-field");
  let latestCopy: string | null = null;

  const currentScenario = (): FeeScenario => {
    const checked = form.querySelector('input[name="scenario"]:checked');
    const value = checked instanceof HTMLInputElement ? checked.value : "";

    const scenario =
      config.scenarios.find((candidate) => candidate.id === value) ?? config.scenarios[0];

    if (!scenario) throw new Error(`${config.provider} has no fee scenarios.`);

    return scenario;
  };

  const currentMode = (): FeeMode => {
    const checked = form.querySelector('input[name="feeMode"]:checked');

    return checked instanceof HTMLInputElement && checked.value === "net" ? "net" : "received";
  };

  const scenarioAcceptsTax = (): boolean =>
    requirePreset(currentScenario().presetId).taxMode === "caller-supplied";

  const applyText = (): void => {
    const scenario = currentScenario();
    const acceptsTax = scenarioAcceptsTax();
    const net = currentMode() === "net";

    setText("scenario-note", scenario.note);
    setText("amount-label", net ? "Amount you want to keep" : "Amount the customer paid");
    setText(
      "amount-help",
      net
        ? `What should reach you after ${config.provider}'s fee${acceptsTax ? " and any tax you collect" : ""}.`
        : acceptsTax
          ? "The full amount charged, including any tax."
          : "The customer's full order amount.",
    );
    setText("primary-label", net ? "Charge the customer" : "You keep from this sale");
    requireHtmlElement("keep-row").hidden = !net;

    if (taxField) taxField.hidden = !acceptsTax;
  };

  const readTax = (): bigint => {
    if (!taxField || taxField.hidden) return 0n;

    const value = requireHtmlInput("taxIncluded").value.trim();

    return value.length === 0 ? 0n : usdToCents(value, "taxIncluded");
  };

  const clear = (): void => {
    for (const id of [
      "fee-result",
      "fee-total-result",
      "net-result",
      "tax-result",
      "keep-result",
    ]) {
      setText(id, "—");
    }

    requireHtmlElement("tax-row").hidden = true;
    renderLineItems([]);
    renderVolume(null, null);
    markResultsCurrent(panel, []);
    copyButton.disabled = true;
    latestCopy = null;
  };

  const calculate = (trigger: CalculationTrigger): void => {
    const scenario = currentScenario();
    const preset = requirePreset(scenario.presetId);
    const mode = currentMode();

    try {
      const amount = usdToCents(requireHtmlInput("amount").value, "amount");
      const tax = readTax();

      if (tax > amount) {
        throw new InputProblem("taxIncluded", "Tax cannot be larger than the amount.");
      }

      const salesPerMonth = readSalesPerMonth();

      const result =
        mode === "received"
          ? calculateFees({ preset, grossCents: amount, taxCents: tax })
          : grossUpFees({ preset, targetProceedsCents: amount, taxCents: tax });

      setText(
        "fee-result",
        formatUsdGrouped(mode === "received" ? result.sellerProceedsCents : result.grossCents),
      );
      setText("fee-total-result", formatUsdGrouped(result.feeCents));
      setText("net-result", formatUsdGrouped(result.netAfterFeesCents));
      renderLineItems(preset.components.length > 1 ? result.lineItems : []);

      const taxRow = requireHtmlElement("tax-row");

      taxRow.hidden = result.taxCents === 0n;

      if (result.taxCents > 0n) setText("tax-result", formatUsdGrouped(result.taxCents));

      if (mode === "net") setText("keep-result", formatUsdGrouped(result.sellerProceedsCents));

      const volumeText = renderVolume(result, salesPerMonth);
      const reviewed = result.checkedOn ?? "date not recorded";

      const saleText =
        mode === "received"
          ? `${scenario.copyName} of ${formatUsdGrouped(result.grossCents)}: ${formatUsdGrouped(result.feeCents)} fee, you keep ${formatUsdGrouped(result.sellerProceedsCents)}.`
          : `To keep ${formatUsdGrouped(amount)} from a ${scenario.copyName}, charge ${formatUsdGrouped(result.grossCents)}.`;

      latestCopy = `${saleText}${volumeText} Estimate; source reviewed ${reviewed}.`;
      markResultsCurrent(panel, [copyButton]);
      setText("fee-message", "");
      setFieldState(form);
    } catch (error) {
      const problem =
        error instanceof InputProblem
          ? error
          : new InputProblem(
              "amount",
              mode === "received"
                ? "Enter an amount above zero."
                : "This target cannot be reached. Try a smaller amount.",
            );

      if (shouldDeferProblem(form, trigger)) {
        markResultsStale(panel, [copyButton]);

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

  requireHtmlButton("fee-update").addEventListener("click", () => calculate("submit"));

  form.querySelectorAll('input[name="scenario"], input[name="feeMode"]').forEach((element) => {
    element.addEventListener("change", () => {
      applyText();
      calculate("commit");
    });
  });

  watchCalculatorFields(form, calculate);

  requireHtmlButton("fee-reset").addEventListener("click", () => {
    form.reset();
    applyText();
    calculate("commit");
  });

  copyButton.addEventListener("click", async () => {
    if (latestCopy === null) return;

    try {
      await navigator.clipboard.writeText(latestCopy);
      setText("fee-message", "Result copied.");
    } catch {
      setText("fee-message", "Copy was unavailable. Select the result to copy it manually.");
    }
  });

  applyText();
  calculate("commit");
}
