export type FieldName = string;

const MAX_CENTS = 100_000_000_000_000n;

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

export function requireHtmlButton(id: string): HTMLButtonElement {
  const element = document.getElementById(id);

  if (!(element instanceof HTMLButtonElement)) {
    throw new InputProblem(id, `Missing button ${id}.`);
  }

  return element;
}

export function usdToCents(value: string, field: FieldName): bigint {
  const clean = value.trim();

  if (clean.length === 0) throw new InputProblem(field, "Enter an amount.");

  if (!/^(0|[1-9]\d*)(\.\d{1,2})?$/.test(clean)) {
    throw new InputProblem(field, "Use a nonnegative amount with up to 2 decimal places.");
  }

  const [whole, decimal = ""] = clean.split(".");
  const cents = BigInt(whole) * 100n + BigInt(decimal.padEnd(2, "0"));

  if (cents > MAX_CENTS) throw new InputProblem(field, "Amount is above the supported maximum.");

  return cents;
}

export function percentToBps(value: string, field: FieldName, maximumBps: number): number {
  const clean = value.trim();

  if (clean.length === 0) throw new InputProblem(field, "Enter a percentage.");

  if (!/^(0|[1-9]\d?|100)(\.\d{1,2})?$/.test(clean)) {
    throw new InputProblem(field, "Use a percentage with up to 2 decimal places.");
  }

  const [whole, decimal = ""] = clean.split(".");
  const bps = Number(whole) * 100 + Number(decimal.padEnd(2, "0"));

  if (bps > maximumBps) {
    throw new InputProblem(field, `Enter a value no higher than ${maximumBps / 100}%.`);
  }

  return bps;
}

export function wholeNumber(
  value: string,
  field: FieldName,
  minimum: number,
  maximum: number,
): number {
  if (!/^\d+$/.test(value.trim())) throw new InputProblem(field, "Enter a whole number.");

  const parsed = Number(value);

  if (!Number.isSafeInteger(parsed) || parsed < minimum || parsed > maximum) {
    throw new InputProblem(field, `Enter a whole number from ${minimum} to ${maximum}.`);
  }

  return parsed;
}

export function hoursToMinutes(value: string, field: FieldName): number {
  const clean = value.trim();

  if (!/^(0|[1-9]\d*)(\.\d{1,2})?$/.test(clean)) {
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

export function formatUsdInput(cents: bigint): string {
  const absolute = cents < 0n ? -cents : cents;

  return `${cents < 0n ? "-" : ""}${absolute / 100n}.${String(absolute % 100n).padStart(2, "0")}`;
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
