import { isOfficialSourceUrl } from "./fee-presets.ts";
import type { FeePreset } from "./fee-presets.ts";

function record(value: unknown, name: string): Record<string, unknown> {
  if (typeof value !== "object" || !value || Array.isArray(value)) {
    throw new TypeError(`${name} must be an object`);
  }
  return value as Record<string, unknown>;
}

function text(value: unknown, name: string): asserts value is string {
  if (typeof value !== "string" || !value.trim()) throw new TypeError(`${name} is required`);
}

function texts(value: unknown, name: string): void {
  if (!Array.isArray(value) || !value.length) throw new TypeError(`${name} must not be empty`);
  for (const entry of value) text(entry, name);
}

function integer(value: unknown, name: string, max: number): asserts value is number {
  if (!Number.isSafeInteger(value) || typeof value !== "number" || value < 0 || value > max) {
    throw new RangeError(`${name} must be an integer from 0 to ${max}`);
  }
}

function isoDate(value: unknown, name: string): asserts value is string {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
    !Number.isFinite(Date.parse(value)) ||
    new Date(value).toISOString().slice(0, 10) !== value
  ) {
    throw new TypeError(`${name} must be a real ISO calendar date`);
  }
}

const tierPolicies = new Set([
  "explicitly-excluded",
  "pre-threshold",
  "post-threshold",
  "not-applicable",
]);

/**
 * Validate a record's shape and declared provenance at the trust boundary.
 *
 * This is intentionally not an official-registry lookup: an object can pass
 * this structural validator while still being rejected by the fee engine if
 * it claims official provenance but is not an exact immutable registry record.
 */
export function validateFeePreset(value: unknown): FeePreset {
  const preset = record(value, "preset");
  for (const key of ["id", "label", "provider", "paymentProduct", "channel"])
    text(preset[key], key);

  if (preset.origin !== "official" && preset.origin !== "custom") {
    throw new TypeError("explicit preset origin required");
  }
  if (preset.kind !== undefined && preset.kind !== preset.origin) {
    throw new TypeError("preset kind must match origin");
  }
  if (preset.currency !== "USD" || preset.accountCountry !== "US") {
    throw new RangeError("Only explicit US-account/USD presets are supported");
  }
  const id = preset.id as string;
  if (preset.taxMode !== "caller-supplied" && preset.taxMode !== "zero-only") {
    throw new TypeError("explicit supported tax mode required");
  }
  if (preset.combinationPolicy !== "exact-scenario-only") {
    throw new TypeError("only exact-scenario-only combinations are supported");
  }
  if (preset.capsPolicy !== "none-modeled") {
    throw new TypeError("only none-modeled caps are supported");
  }
  if (typeof preset.tierPolicy !== "string" || !tierPolicies.has(preset.tierPolicy)) {
    throw new TypeError("explicit supported tier policy required");
  }
  if (preset.customPricingPolicy !== "excluded" && preset.customPricingPolicy !== "user-supplied") {
    throw new TypeError("explicit custom pricing policy required");
  }
  integer(preset.revision, "revision", 2_147_483_647);
  if (preset.revision < 1) throw new RangeError("revision must be at least 1");

  if (preset.effectiveFrom !== null) isoDate(preset.effectiveFrom, "effectiveFrom");
  if (preset.origin === "official") {
    if (!id || id.startsWith("custom:")) {
      throw new TypeError("official preset id must not use the custom namespace");
    }
    isoDate(preset.checkedOn, "checkedOn");
    if (preset.customPricingPolicy !== "excluded") {
      throw new TypeError("official preset custom pricing must be excluded");
    }
  } else {
    if (!id.startsWith("custom:")) {
      throw new TypeError("custom preset id must use the custom: namespace");
    }
    if (preset.checkedOn !== null) {
      throw new TypeError("custom preset checkedOn must be null");
    }
    if (preset.customPricingPolicy !== "user-supplied") {
      throw new TypeError("custom preset pricing must be user-supplied");
    }
  }

  texts(preset.assumptions, "assumptions");
  texts(preset.exclusions, "exclusions");
  if (!Array.isArray(preset.sources) || (preset.origin === "official" && !preset.sources.length)) {
    throw new TypeError("sources array required; official presets need at least one source");
  }
  for (const source of preset.sources) {
    const entry = record(source, "source");
    text(entry.title, "source.title");
    text(entry.url, "source.url");
    const url = new URL(entry.url);
    if (url.protocol !== "https:" || url.username || url.password) {
      throw new TypeError("source must use HTTPS");
    }
    if (preset.origin === "custom" && isOfficialSourceUrl(entry.url)) {
      throw new TypeError("custom preset cannot reuse an official source");
    }
  }

  if (!Array.isArray(preset.components)) throw new TypeError("components required");
  if (preset.status === "blocked") {
    text(preset.blockedReason, "blockedReason");
    if (preset.components.length) {
      throw new TypeError("blocked rules cannot have actionable components");
    }
  } else if (preset.status === "supported") {
    if (preset.blockedReason !== undefined) {
      throw new TypeError("supported rule has a blockedReason");
    }
    if (!preset.components.length || preset.components.length > 8) {
      throw new RangeError("one to eight components required");
    }
    const ids = new Set<string>();
    let totalRate = 0;
    for (const component of preset.components) {
      const entry = record(component, "component");
      text(entry.id, "component.id");
      text(entry.label, "component.label");
      if (ids.has(entry.id)) throw new TypeError("duplicate component id");
      ids.add(entry.id);
      integer(entry.rateBps, "rateBps", 9999);
      integer(entry.fixedCents, "fixedCents", 100_000_000);
      if (entry.base !== "gross") throw new TypeError("unsupported fee base");
      if (entry.rounding !== "half-up") throw new TypeError("unsupported component rounding");
      totalRate += entry.rateBps;
    }
    if (totalRate >= 10000) throw new RangeError("combined percentage must be below 100%");
  } else {
    throw new TypeError("unsupported rule status");
  }
  return value as FeePreset;
}

export function validateFeePresets(values: unknown): FeePreset[] {
  if (!Array.isArray(values) || !values.length) {
    throw new TypeError("preset list must not be empty");
  }
  const ids = new Set<string>();
  return values.map((value) => {
    const preset = validateFeePreset(value);
    if (ids.has(preset.id)) throw new TypeError("duplicate preset id");
    ids.add(preset.id);
    return preset;
  });
}
