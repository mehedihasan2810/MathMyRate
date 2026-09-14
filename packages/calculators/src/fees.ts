import { Schema } from "effect";

import { getFeePreset } from "./fee-presets.ts";
import type { FeePreset } from "./fee-presets.ts";
import { ceilDivide, Cents, MAX_CENTS, PositiveCents } from "./money.ts";

export const FEE_ENGINE_VERSION = "1";

export const ROUNDING_POLICY = "Estimate: round each component to nearest USD cent, half up.";

const FeePayment = Schema.Struct({
  grossCents: PositiveCents,
  taxCents: Schema.optional(Cents),
});

const FeePayments = Schema.Array(FeePayment).check(Schema.isLengthBetween(1, 1000));

function serializeFeePreset(preset: FeePreset): string {
  return JSON.stringify({
    accountCountry: preset.accountCountry,
    assumptions: [...preset.assumptions],
    blockedReason: preset.blockedReason ?? null,
    capsPolicy: preset.capsPolicy,
    channel: preset.channel,
    checkedOn: preset.checkedOn,
    combinationPolicy: preset.combinationPolicy,
    components: preset.components.map((component) => ({
      base: component.base,
      fixedCents: component.fixedCents,
      id: component.id,
      label: component.label,
      rateBps: component.rateBps,
      rounding: component.rounding,
    })),
    currency: preset.currency,
    customPricingPolicy: preset.customPricingPolicy,
    effectiveFrom: preset.effectiveFrom,
    exclusions: [...preset.exclusions],
    id: preset.id,
    kind: preset.kind ?? null,
    label: preset.label,
    origin: preset.origin,
    paymentProduct: preset.paymentProduct,
    provider: preset.provider,
    revision: preset.revision,
    sources: preset.sources.map((source) => ({
      title: source.title,
      url: source.url,
    })),
    status: preset.status,
    taxMode: preset.taxMode,
    tierPolicy: preset.tierPolicy,
  });
}

function trustedPreset(input: FeePreset): FeePreset {
  const canonical = getFeePreset(input.id);

  if (
    !canonical ||
    canonical.revision !== input.revision ||
    serializeFeePreset(input) !== serializeFeePreset(canonical)
  ) {
    throw new TypeError(
      "Official preset does not exactly match the immutable registry; use getFeePreset(id)",
    );
  }

  return canonical;
}

function usablePreset(preset: FeePreset): FeePreset {
  const trusted = preset.origin === "official" ? trustedPreset(preset) : preset;

  if (trusted.status !== "supported") {
    throw new RangeError(`Unsupported scenario: ${trusted.blockedReason}`);
  }

  return trusted;
}

function evaluate(preset: FeePreset, grossCents: bigint, taxCents: bigint) {
  const lineItems = preset.components.map((component) => ({
    id: component.id,
    label: component.label,
    feeCents:
      (grossCents * BigInt(component.rateBps) + 5000n) / 10000n + BigInt(component.fixedCents),
  }));

  const feeCents = lineItems.reduce((sum, item) => sum + item.feeCents, 0n);

  return {
    currency: "USD" as const,
    origin: preset.origin,
    checkedOn: preset.checkedOn,
    effectiveFrom: preset.effectiveFrom,
    paymentProduct: preset.paymentProduct,
    engineVersion: FEE_ENGINE_VERSION,
    presetId: preset.id,
    ruleRevision: `${preset.id}@${preset.revision}`,
    roundingPolicy: ROUNDING_POLICY,
    grossCents,
    taxCents,
    feeCents,
    netAfterFeesCents: grossCents - feeCents,
    sellerProceedsCents: grossCents - taxCents - feeCents,
    lineItems,
    assumptions: [...preset.assumptions],
    exclusions: [...preset.exclusions],
    sources: preset.sources.map((source) => ({ ...source })),
    warnings: [
      ...(preset.origin === "custom"
        ? ["Custom preset: user-supplied configuration, not an official provider rate."]
        : []),
      "Estimate, not a processor quote. Published sources do not establish component rounding for every scenario.",
    ],
  };
}

function requireTaxCents(taxCents: bigint | undefined): bigint {
  return Schema.decodeSync(Cents)(taxCents === undefined ? 0n : taxCents);
}

/** One successfully charged transaction. Tax is included in gross, never added again.
 * Tax is only an explicitly supplied pass-through amount; this does not calculate tax.
 * The caller must match the preset's full assumptions; no jurisdiction is inferred.
 */
export function calculateFees(input: { preset: FeePreset; grossCents: bigint; taxCents?: bigint }) {
  const preset = usablePreset(input.preset);
  const grossCents = Schema.decodeSync(PositiveCents)(input.grossCents);
  const taxCents = requireTaxCents(input.taxCents);

  if (preset.taxMode === "zero-only" && taxCents !== 0n) {
    throw new RangeError("This preset supports no-tax orders only");
  }

  if (taxCents > grossCents) throw new RangeError("taxCents cannot exceed grossCents");

  return evaluate(preset, grossCents, taxCents);
}

/**
 * Find the least gross amount that reaches target seller proceeds after fees
 * and explicitly supplied tax. Separately rounded components can make net
 * non-monotonic by a cent, so binary search is NOT correct.
 *
 * Each rounded component differs from its exact value by at most half a cent.
 * This gives a narrow guaranteed interval around the unrounded inverse.
 * Search that interval from left to right, recomputing real rounded fees.
 */
export function grossUpFees(input: {
  preset: FeePreset;
  targetProceedsCents: bigint;
  taxCents?: bigint;
}) {
  const preset = usablePreset(input.preset);
  const target = Schema.decodeSync(Cents)(input.targetProceedsCents);
  const tax = requireTaxCents(input.taxCents);

  if (preset.taxMode === "zero-only" && tax !== 0n) {
    throw new RangeError("This preset supports no-tax orders only");
  }

  const totalRate = preset.components.reduce((sum, item) => sum + BigInt(item.rateBps), 0n);
  const fixed = preset.components.reduce((sum, item) => sum + BigInt(item.fixedCents), 0n);
  const denominator = 10000n - totalRate;
  const errorBound = BigInt(preset.components.length) * 5000n;
  const numerator = (target + tax + fixed) * 10000n;
  const lower = ceilDivide(numerator > errorBound ? numerator - errorBound : 0n, denominator);
  const upper = ceilDivide(numerator + errorBound, denominator);
  const start = lower > tax ? lower : tax;
  const end = upper < MAX_CENTS ? upper : MAX_CENTS;

  for (let gross = start > 0n ? start : 1n; gross <= end; gross++) {
    const result = evaluate(preset, gross, tax);

    if (result.sellerProceedsCents >= target) return { ...result, targetProceedsCents: target };
  }

  throw new RangeError("Target cannot be reached within the supported monetary limit");
}

/** Totals for explicitly supplied individual payments; never infer a split. */
export function calculatePaymentBatch(
  preset: FeePreset,
  payments: ReadonlyArray<{ grossCents: bigint; taxCents?: bigint }>,
) {
  const decoded = Schema.decodeSync(FeePayments)(payments);
  const results = decoded.map((payment) => calculateFees({ ...payment, preset }));

  return {
    results,
    feeCents: results.reduce((sum, result) => sum + result.feeCents, 0n),
    sellerProceedsCents: results.reduce((sum, result) => sum + result.sellerProceedsCents, 0n),
  };
}
