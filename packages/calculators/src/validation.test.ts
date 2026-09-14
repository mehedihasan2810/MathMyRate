import assert from "node:assert/strict";
import { test } from "vitest";

import { requireFiniteNumber } from "./validation.ts";

test("preserves valid numbers, including zero", () => {
  for (const value of [0, -1, 0.01, 1000000]) {
    assert.equal(requireFiniteNumber(value), value);
  }
});

test("rejects non-finite values and unparsed input without coercion", () => {
  for (const value of [NaN, Infinity, -Infinity, "", "100", null, undefined, true]) {
    assert.throws(() => requireFiniteNumber(value));
  }
});
