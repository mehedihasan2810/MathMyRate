import { type FeePreset, getFeePreset, GrossOutOfRangeError } from "@MathMyRate/calculators";

import {
  findFeeCalculator,
  type FeeCalculatorConfig,
  type FeeScenario,
  scenarioPresetIds,
} from "../data/fee-calculators";
import { calculateBandedFees, grossUpBandedFees } from "../lib/fee-bands";
import {
  type CalculationTrigger,
  focusProblemField,
  formatUsdGrouped,
  InputProblem,
  markResultsCurrent,
  markResultsStale,
  repeatMessage,
  requireHtmlButton,
  requireHtmlElement,
  requireHtmlForm,
  requireHtmlInput,
  setFieldState,
  setTextContent,
  shouldDeferProblem,
  usdToCents,
  watchCalculatorFields,
} from "./calculator-form";
import { describeRange } from "./fee-range";
import { readSalesPerMonth, renderVolume } from "./fee-volume";

type FeeMode = "received" | "net";

function requirePreset(id: string): FeePreset {
  const preset = getFeePreset(id);

  if (!preset) throw new Error(`The ${id} fee preset is missing from the registry.`);

  return preset;
}

function setText(id: string, text: string): void {
  setTextContent(id, text);
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
  const volumeField = document.getElementById("volume-field");
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

  // A sender-paid fee, such as a credit card fee, is charged on top of the
  // payment, so the receiver-side modes do not apply.
  const currentSenderPaid = (): boolean => currentScenario().feeCharged === "sender";

  const scenarioAcceptsTax = (): boolean =>
    requirePreset(currentScenario().presetId).taxMode === "caller-supplied";

  // With a shipping field, the amount is the item price and shipping and tax are added to it.
  const itemised = config.shipping !== undefined;

  const amountHelp = (net: boolean, acceptsTax: boolean): string => {
    if (!net && config.amountLabels) return config.amountLabels.fieldHelp;

    if (itemised) {
      return net
        ? `What should reach you after ${config.provider}'s fee, with shipping${acceptsTax ? " and tax" : ""} paid by the buyer.`
        : `The item's price, before shipping${acceptsTax ? " and sales tax" : ""}.`;
    }

    return net
      ? `What should reach you after ${config.provider}'s fee${acceptsTax ? " and any tax you collect" : ""}.`
      : acceptsTax
        ? "The full amount charged, including any tax."
        : "The customer's full order amount.";
  };

  const applyText = (): void => {
    const scenario = currentScenario();
    const acceptsTax = scenarioAcceptsTax();
    const net = currentMode() === "net";
    const senderPaid = currentSenderPaid();

    setText("scenario-note", scenario.note);
    setText(
      "amount-label",
      senderPaid
        ? "What you send"
        : net
          ? "Amount you want to keep"
          : (config.amountLabels?.fieldLabel ??
            (itemised ? "Item price" : "Amount the customer paid")),
    );
    setText(
      "amount-help",
      senderPaid
        ? "What the recipient gets. You pay the fee on top of it."
        : amountHelp(net, acceptsTax),
    );
    setText(
      "primary-label",
      senderPaid
        ? "It costs you"
        : net
          ? itemised
            ? "List the item at"
            : "Charge the customer"
          : "You keep from this sale",
    );
    requireHtmlElement("keep-row").hidden = !net || senderPaid;
    requireHtmlElement("net-row").hidden = itemised || senderPaid;
    requireHtmlElement("recipient-row").hidden = !senderPaid;
    requireHtmlElement("fee-mode-fieldset").hidden = senderPaid;

    if (volumeField) volumeField.hidden = senderPaid;

    if (taxField) taxField.hidden = !acceptsTax;
  };

  const readShipping = (): bigint => {
    if (!itemised) return 0n;

    const value = requireHtmlInput("shippingPaid").value.trim();

    return value.length === 0 ? 0n : usdToCents(value, "shippingPaid");
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
      "shipping-result",
      "total-result",
    ]) {
      setText(id, "—");
    }

    requireHtmlElement("tax-row").hidden = true;
    requireHtmlElement("shipping-row").hidden = true;
    renderLineItems([]);
    renderVolume(null, null);
    markResultsCurrent(panel, []);
    copyButton.disabled = true;
    latestCopy = null;
  };

  const calculate = (trigger: CalculationTrigger): void => {
    const scenario = currentScenario();
    const presets = scenarioPresetIds(scenario).map(requirePreset);
    const senderPaid = currentSenderPaid();
    const mode: FeeMode = senderPaid ? "received" : currentMode();

    try {
      const amount = usdToCents(requireHtmlInput("amount").value, "amount");
      const shipping = readShipping();
      const tax = readTax();

      // Only a customer-paid amount includes the tax; a target to keep does not.
      if (!itemised && mode === "received" && tax > amount) {
        throw new InputProblem("taxIncluded", "Tax cannot be larger than the amount.");
      }

      if (itemised && mode === "received" && amount === 0n) {
        throw new InputProblem("amount", "Enter an item price above zero.");
      }

      const salesPerMonth = senderPaid ? null : readSalesPerMonth();

      // The buyer's shipping is part of the fee base but pays for the label, so it is never kept.
      const result =
        mode === "received"
          ? calculateBandedFees(presets, amount + shipping + (itemised ? tax : 0n), tax)
          : grossUpBandedFees(presets, amount + shipping, tax);

      // A sender-paid fee adds to what you pay instead of reducing what they get.
      const keptCents = senderPaid ? result.grossCents : result.sellerProceedsCents - shipping;
      const listPriceCents = result.grossCents - shipping - (itemised ? tax : 0n);

      setText(
        "fee-result",
        formatUsdGrouped(
          senderPaid
            ? result.grossCents + result.feeCents
            : mode === "received"
              ? keptCents
              : listPriceCents,
        ),
      );
      setText("fee-total-result", formatUsdGrouped(result.feeCents));
      setText("net-result", formatUsdGrouped(result.netAfterFeesCents));
      setText("total-result", formatUsdGrouped(result.grossCents));
      setText("recipient-result", formatUsdGrouped(result.grossCents));
      renderLineItems(result.lineItems.length > 1 ? result.lineItems : []);

      const taxRow = requireHtmlElement("tax-row");

      taxRow.hidden = result.taxCents === 0n;

      if (result.taxCents > 0n) setText("tax-result", formatUsdGrouped(result.taxCents));

      requireHtmlElement("shipping-row").hidden = shipping === 0n;

      if (shipping > 0n) setText("shipping-result", formatUsdGrouped(shipping));

      if (mode === "net") setText("keep-result", formatUsdGrouped(keptCents));

      const volumeText = renderVolume(
        {
          grossCents: result.grossCents,
          taxCents: result.taxCents,
          feeCents: result.feeCents,
          sellerProceedsCents: keptCents,
        },
        salesPerMonth,
        config.volume,
      );

      const reviewed = result.checkedOn ?? "date not recorded";
      const shippingText = shipping > 0n ? ` with ${formatUsdGrouped(shipping)} shipping` : "";

      const saleText = senderPaid
        ? `${scenario.copyName} of ${formatUsdGrouped(result.grossCents)}: ${formatUsdGrouped(result.feeCents)} fee, it costs ${formatUsdGrouped(result.grossCents + result.feeCents)}, and the recipient gets ${formatUsdGrouped(result.grossCents)}.`
        : itemised
          ? mode === "received"
            ? `${scenario.copyName}, item ${formatUsdGrouped(amount)}${shippingText}${tax > 0n ? ` and ${formatUsdGrouped(tax)} tax` : ""}: ${formatUsdGrouped(result.feeCents)} fee, you keep ${formatUsdGrouped(keptCents)}.`
            : `To keep ${formatUsdGrouped(amount)} from a ${scenario.copyName}${shippingText}, list the item at ${formatUsdGrouped(listPriceCents)}.`
          : mode === "received"
            ? `${scenario.copyName} of ${formatUsdGrouped(result.grossCents)}: ${formatUsdGrouped(result.feeCents)} fee, you keep ${formatUsdGrouped(keptCents)}.`
            : `To keep ${formatUsdGrouped(amount)} from a ${scenario.copyName}, charge ${formatUsdGrouped(result.grossCents)}.`;

      latestCopy = `${saleText}${volumeText} Estimate; source reviewed ${reviewed}.`;
      markResultsCurrent(panel, [copyButton]);

      const lossNote = senderPaid
        ? ""
        : mode !== "received" || keptCents > 0n
          ? ""
          : keptCents === 0n
            ? "The fees take this whole payment, so nothing reaches you."
            : "The fees are more than this payment, so you would lose money on it.";

      setText("fee-message", lossNote);
      setFieldState(form);
    } catch (error) {
      const outOfRange = error instanceof GrossOutOfRangeError ? error : null;

      const rangeText = outOfRange ? describeRange(outOfRange.minCents, outOfRange.maxCents) : "";

      const problem =
        error instanceof InputProblem
          ? error
          : new InputProblem(
              "amount",
              outOfRange && mode === "received"
                ? `This scenario covers amounts of ${rangeText}. Choose another scenario for this amount.`
                : outOfRange
                  ? `The charge for this amount falls outside the amounts this scenario covers: ${rangeText}.`
                  : mode === "received"
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
      repeatMessage("fee-message", "Result copied.");
    } catch {
      repeatMessage("fee-message", "Copy was unavailable. Select the result to copy it manually.");
    }
  });

  applyText();
  calculate("commit");
}
