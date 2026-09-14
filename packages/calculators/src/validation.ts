import { Schema } from "effect";

/**
 * Reject invalid numeric inputs instead of returning a plausible fallback.
 * UI parsing and monetary precision policies belong to the consuming engine.
 */
export const FiniteNumber = Schema.Number.check(Schema.isFinite());

export const requireFiniteNumber = Schema.decodeUnknownSync(FiniteNumber);
