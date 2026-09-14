import { Schema } from "effect";

import { isOfficialSourceUrl } from "./fee-presets.ts";

const RequiredText = Schema.NonEmptyString.check(Schema.isTrimmed());

const IsoDate = Schema.String.check(
  Schema.isPattern(/^\d{4}-\d{2}-\d{2}$/),
  Schema.makeFilter((value) => {
    const parsed = Date.parse(`${value}T00:00:00.000Z`);

    return (
      Number.isFinite(parsed) &&
      new Date(`${value}T00:00:00.000Z`).toISOString().slice(0, 10) === value
    );
  }),
);

const HttpsUrl = Schema.String.check(
  Schema.makeFilter((value) => {
    try {
      const url = new URL(value);

      return url.protocol === "https:" && url.username === "" && url.password === "";
    } catch {
      return false;
    }
  }),
);

const FeeSource = Schema.Struct({
  title: RequiredText,
  url: HttpsUrl,
});

const FeeComponent = Schema.Struct({
  id: RequiredText,
  label: RequiredText,
  rateBps: Schema.Int.check(Schema.isBetween({ minimum: 0, maximum: 9999 })),
  fixedCents: Schema.Int.check(Schema.isBetween({ minimum: 0, maximum: 100_000_000 })),
  base: Schema.Literal("gross"),
  rounding: Schema.Literal("half-up"),
});

export const FeePresetSchema = Schema.Struct({
  id: RequiredText,
  label: RequiredText,
  provider: RequiredText,
  origin: Schema.Literals(["official", "custom"]),
  kind: Schema.optional(Schema.Literals(["official", "custom"])),
  currency: Schema.Literal("USD"),
  accountCountry: Schema.Literal("US"),
  taxMode: Schema.Literals(["caller-supplied", "zero-only"]),
  paymentProduct: RequiredText,
  channel: RequiredText,
  combinationPolicy: Schema.Literal("exact-scenario-only"),
  effectiveFrom: Schema.NullOr(IsoDate),
  tierPolicy: Schema.Literals([
    "explicitly-excluded",
    "pre-threshold",
    "post-threshold",
    "not-applicable",
  ]),
  capsPolicy: Schema.Literal("none-modeled"),
  customPricingPolicy: Schema.Literals(["excluded", "user-supplied"]),
  revision: Schema.Int.check(Schema.isBetween({ minimum: 1, maximum: 2_147_483_647 })),
  components: Schema.Array(FeeComponent),
  sources: Schema.Array(FeeSource),
  checkedOn: Schema.NullOr(IsoDate),
  assumptions: Schema.NonEmptyArray(RequiredText),
  exclusions: Schema.NonEmptyArray(RequiredText),
  status: Schema.Literals(["supported", "blocked"]),
  blockedReason: Schema.optional(RequiredText),
}).check(
  Schema.makeFilter((preset) => {
    if (preset.kind !== undefined && preset.kind !== preset.origin) {
      return "preset kind must match origin";
    }

    if (preset.origin === "official") {
      if (preset.id.startsWith("custom:")) {
        return "official preset id must not use the custom namespace";
      }

      if (preset.checkedOn === null) return "checkedOn is required";

      if (preset.customPricingPolicy !== "excluded") {
        return "official preset custom pricing must be excluded";
      }

      if (preset.sources.length < 1) return "official presets need at least one source";
    } else {
      if (!preset.id.startsWith("custom:")) {
        return "custom preset id must use the custom: namespace";
      }

      if (preset.checkedOn !== null) return "custom preset checkedOn must be null";

      if (preset.customPricingPolicy !== "user-supplied") {
        return "custom preset pricing must be user-supplied";
      }

      if (preset.sources.some((source) => isOfficialSourceUrl(source.url))) {
        return "custom preset cannot reuse an official source";
      }
    }

    if (preset.status === "blocked") {
      if (preset.blockedReason === undefined) return "blockedReason is required";

      if (preset.components.length > 0) return "blocked rules cannot have actionable components";

      return undefined;
    }

    if (preset.blockedReason !== undefined) return "supported rule has a blockedReason";

    if (preset.components.length < 1 || preset.components.length > 8) {
      return "one to eight components required";
    }

    const ids = new Set(preset.components.map((component) => component.id));

    if (ids.size !== preset.components.length) return "duplicate component id";

    const totalRate = preset.components.reduce((sum, component) => sum + component.rateBps, 0);

    if (totalRate >= 10000) return "combined percentage must be below 100%";

    return undefined;
  }),
);

export const FeePresetsSchema = Schema.NonEmptyArray(FeePresetSchema).check(
  Schema.makeFilter((presets) => {
    const ids = new Set(presets.map((preset) => preset.id));

    return ids.size === presets.length ? undefined : "duplicate preset id";
  }),
);

/**
 * Validate a record's shape and declared provenance at the trust boundary.
 *
 * This is intentionally not an official-registry lookup: an object can pass
 * this structural validator while still being rejected by the fee engine if
 * it claims official provenance but is not an exact immutable registry record.
 */
export const validateFeePreset = Schema.decodeUnknownSync(FeePresetSchema);

export const validateFeePresets = Schema.decodeUnknownSync(FeePresetsSchema);
