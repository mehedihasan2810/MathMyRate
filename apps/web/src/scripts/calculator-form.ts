export type FieldName = string;

/** What started a recalculation: a keystroke, a finished edit, or an explicit update. */
export type CalculationTrigger = "typing" | "commit" | "submit";

const MAX_CENTS = 100_000_000_000_000n;

const MONEY_NOISE = /[\s$,]/gu;

const PERCENT_NOISE = /[,\s%]/gu;

const COUNT_NOISE = /[\s,]/gu;

const HOURS_NOISE = /[\s,]/gu;

export class InputProblem extends Error {
  constructor(
    public field: FieldName,
    message: string,
  ) {
    super(message);
  }
}

export function requireHtmlElement(id: string): HTMLElement {
  const element = document.getElementById(id);

  if (!(element instanceof HTMLElement)) {
    throw new InputProblem(id, `Missing page element ${id}.`);
  }

  return element;
}

export function requireHtmlForm(id: string): HTMLFormElement {
  const element = document.getElementById(id);

  if (!(element instanceof HTMLFormElement)) {
    throw new InputProblem(id, `Missing form ${id}.`);
  }

  return element;
}

export function requireHtmlInput(id: string): HTMLInputElement {
  const element = document.getElementById(id);

  if (!(element instanceof HTMLInputElement)) {
    throw new InputProblem(id, `Missing input ${id}.`);
  }

  return element;
}

export function requireHtmlSelect(id: string): HTMLSelectElement {
  const element = document.getElementById(id);

  if (!(element instanceof HTMLSelectElement)) {
    throw new InputProblem(id, `Missing menu ${id}.`);
  }

  return element;
}

export function requireHtmlButton(id: string): HTMLButtonElement {
  const element = document.getElementById(id);

  if (!(element instanceof HTMLButtonElement)) {
    throw new InputProblem(id, `Missing button ${id}.`);
  }

  return element;
}

/**
 * Removes characters people type or paste around a number ("$1,250", " 27 % ")
 * so validation judges the number itself. A dangling decimal point ("18.",
 * ".5") is completed instead of rejected, because it is usually mid-typing.
 */
function tidyNumber(value: string, noise: RegExp): string {
  const stripped = value.replace(noise, "");
  const withoutTrailingPoint = stripped.endsWith(".") ? stripped.slice(0, -1) : stripped;

  return withoutTrailingPoint.startsWith(".") ? `0${withoutTrailingPoint}` : withoutTrailingPoint;
}

export function usdToCents(value: string, field: FieldName): bigint {
  const clean = tidyNumber(value, MONEY_NOISE);

  if (clean.length === 0) throw new InputProblem(field, "Enter an amount.");

  if (!/^\d+(\.\d{1,2})?$/u.test(clean)) {
    throw new InputProblem(field, "Use a nonnegative amount with up to 2 decimal places.");
  }

  const [whole, decimal = ""] = clean.split(".");
  const cents = BigInt(whole) * 100n + BigInt(decimal.padEnd(2, "0"));

  if (cents > MAX_CENTS) throw new InputProblem(field, "Amount is above the supported maximum.");

  return cents;
}

export function percentToBps(value: string, field: FieldName, maximumBps: number): number {
  const clean = tidyNumber(value, PERCENT_NOISE);

  if (clean.length === 0) throw new InputProblem(field, "Enter a percentage.");

  if (!/^\d+(\.\d{1,2})?$/u.test(clean)) {
    throw new InputProblem(field, "Use a percentage with up to 2 decimal places.");
  }

  const [whole, decimal = ""] = clean.split(".");
  const bps = Number(whole) * 100 + Number(decimal.padEnd(2, "0"));

  if (bps > maximumBps) {
    throw new InputProblem(
      field,
      `Enter a value no higher than ${(maximumBps / 100).toLocaleString("en-US")}%.`,
    );
  }

  return bps;
}

export function wholeNumber(
  value: string,
  field: FieldName,
  minimum: number,
  maximum: number,
): number {
  const clean = tidyNumber(value, COUNT_NOISE);

  if (!/^\d+$/u.test(clean)) throw new InputProblem(field, "Enter a whole number.");

  const parsed = Number(clean);

  if (!Number.isSafeInteger(parsed) || parsed < minimum || parsed > maximum) {
    throw new InputProblem(
      field,
      `Enter a whole number from ${minimum.toLocaleString("en-US")} to ${maximum.toLocaleString("en-US")}.`,
    );
  }

  return parsed;
}

/** Reads hours with up to two decimals as hundredths of an hour, so "37.5" becomes 3750. */
export function hoursToHundredths(
  value: string,
  field: FieldName,
  maximumHundredths: number,
): number {
  const clean = tidyNumber(value, HOURS_NOISE);

  if (clean.length === 0) throw new InputProblem(field, "Enter a number of hours.");

  if (!/^\d+(\.\d{1,2})?$/u.test(clean)) {
    throw new InputProblem(field, "Use hours with up to 2 decimal places.");
  }

  const [whole, decimal = ""] = clean.split(".");
  const hundredths = Number(whole) * 100 + Number(decimal.padEnd(2, "0"));

  if (hundredths < 1 || hundredths > maximumHundredths) {
    throw new InputProblem(
      field,
      `Enter from 0.01 to ${(maximumHundredths / 100).toLocaleString("en-US")} hours.`,
    );
  }

  return hundredths;
}

/** Reads a positive decimal with up to two places as hundredths, so "2.5" MB becomes 250. */
export function decimalToHundredths(
  value: string,
  field: FieldName,
  unit: string,
  maximumHundredths: number,
): number {
  const clean = tidyNumber(value, COUNT_NOISE);

  if (clean.length === 0) throw new InputProblem(field, `Enter a size in ${unit}.`);

  if (!/^\d+(\.\d{1,2})?$/u.test(clean)) {
    throw new InputProblem(field, "Use a number with up to 2 decimal places.");
  }

  const [whole, decimal = ""] = clean.split(".");
  const hundredths = Number(whole) * 100 + Number(decimal.padEnd(2, "0"));

  if (hundredths < 1 || hundredths > maximumHundredths) {
    throw new InputProblem(
      field,
      `Enter from 0.01 to ${(maximumHundredths / 100).toLocaleString("en-US")} ${unit}.`,
    );
  }

  return hundredths;
}

export function hoursToMinutes(value: string, field: FieldName): number {
  const clean = tidyNumber(value, HOURS_NOISE);

  if (clean.length === 0) throw new InputProblem(field, "Enter a number of hours.");

  if (!/^\d+(\.\d{1,2})?$/u.test(clean)) {
    throw new InputProblem(field, "Use hours with up to 2 decimal places.");
  }

  const [whole, decimal = ""] = clean.split(".");
  const hundredths = BigInt(whole) * 100n + BigInt(decimal.padEnd(2, "0"));
  const minuteNumerator = hundredths * 60n;

  if (minuteNumerator % 100n !== 0n) {
    throw new InputProblem(field, "Use a time that lands on a whole minute.");
  }

  const minutes = Number(minuteNumerator / 100n);

  if (!Number.isSafeInteger(minutes)) throw new InputProblem(field, "Time is too large.");

  return minutes;
}

export function formatUsdGrouped(cents: bigint): string {
  const sign = cents < 0n ? "-" : "";
  const absolute = cents < 0n ? -cents : cents;

  return `${sign}$${(absolute / 100n).toLocaleString("en-US")}.${String(absolute % 100n).padStart(2, "0")}`;
}

/** Formats basis points as a percentage with two decimals, so 292n becomes "2.92%" and -3333n "-33.33%". */
export function formatPercentBps(bps: bigint): string {
  const sign = bps < 0n ? "-" : "";
  const absolute = bps < 0n ? -bps : bps;

  return `${sign}${(absolute / 100n).toLocaleString("en-US")}.${String(absolute % 100n).padStart(2, "0")}%`;
}

/** Formats cents for an input field: digit groups and two decimals, without a currency sign. */
export function formatUsdInput(cents: bigint): string {
  const sign = cents < 0n ? "-" : "";
  const absolute = cents < 0n ? -cents : cents;

  return `${sign}${(absolute / 100n).toLocaleString("en-US")}.${String(absolute % 100n).padStart(2, "0")}`;
}

export function setFieldState(form: HTMLFormElement, problem?: InputProblem): void {
  form.querySelectorAll("[data-field]").forEach((node) => {
    if (!(node instanceof HTMLInputElement)) return;

    const error = document.getElementById(`${node.id}-error`);
    const active = problem?.field === node.dataset.field;

    node.setAttribute("aria-invalid", active ? "true" : "false");

    if (error) {
      error.textContent = active && problem ? problem.message : "";
      error.classList.toggle("visible", Boolean(active));
    }
  });

  const summary = form.querySelector("[data-error-summary]");

  if (summary instanceof HTMLElement) {
    summary.textContent = problem ? problem.message : "";
    summary.hidden = !problem;
  }
}

/** Scrolls the first invalid field into view and moves focus to it. */
export function focusProblemField(form: HTMLFormElement, problem: InputProblem): void {
  const field = form.querySelector<HTMLInputElement>(`[data-field="${problem.field}"]`);

  if (field instanceof HTMLInputElement) {
    field.scrollIntoView({ block: "center" });
    field.focus({ preventScroll: true });
  }
}

/**
 * While someone is still typing and no error is on screen yet, an unfinished
 * entry should not flash an error or wipe the result. A finished edit or an
 * explicit update always shows the problem.
 */
export function shouldDeferProblem(form: HTMLFormElement, trigger: CalculationTrigger): boolean {
  return trigger === "typing" && form.querySelector('[data-field][aria-invalid="true"]') === null;
}

/**
 * Keeps the last good result visible but dimmed, and disables the actions that
 * would copy or transfer it, so an unfinished entry never reads as a live answer.
 */
export function markResultsStale(panel: HTMLElement, actions: readonly HTMLButtonElement[]): void {
  panel.setAttribute("data-stale", "");

  for (const action of actions) {
    action.disabled = true;
  }
}

export function markResultsCurrent(
  panel: HTMLElement,
  actions: readonly HTMLButtonElement[],
): void {
  panel.removeAttribute("data-stale");

  for (const action of actions) {
    action.disabled = false;
  }
}

function tidyMoneyField(input: HTMLInputElement): void {
  if (input.value.trim().length === 0) return;

  try {
    input.value = formatUsdInput(usdToCents(input.value, input.id));
  } catch {
    // Leave unreadable text in place so the error message can describe it.
  }
}

/**
 * Recalculates on every keystroke. When an edit is finished (the change event
 * fires as the field loses focus), money fields are tidied to "1,250.00" and
 * the inputs are validated in full.
 *
 * A mouse press on a button blurs the field before the button's click fires.
 * Showing a new error at that moment would push the button down, the release
 * would land elsewhere, and the click would be lost. So a finished edit that
 * happens while a pointer is held waits until the press ends and its click has
 * run.
 */
export function watchCalculatorFields(
  form: HTMLFormElement,
  calculate: (trigger: CalculationTrigger) => void,
): void {
  let pointerHeld = false;
  let commitWaiting = false;

  const releasePointer = () => {
    pointerHeld = false;

    if (!commitWaiting) return;

    commitWaiting = false;
    window.setTimeout(() => calculate("commit"), 0);
  };

  document.addEventListener(
    "pointerdown",
    () => {
      pointerHeld = true;
    },
    { capture: true },
  );

  document.addEventListener("pointerup", releasePointer, { capture: true });
  document.addEventListener("pointercancel", releasePointer, { capture: true });

  form.querySelectorAll("input[data-field]").forEach((node) => {
    if (!(node instanceof HTMLInputElement)) return;

    node.addEventListener("input", () => calculate("typing"));

    node.addEventListener("change", () => {
      if (node.dataset.format === "usd") tidyMoneyField(node);

      if (pointerHeld) {
        commitWaiting = true;

        return;
      }

      calculate("commit");
    });
  });
}
