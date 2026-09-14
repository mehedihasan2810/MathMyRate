import assert from "node:assert/strict";
import { test } from "node:test";
import { ceilDivide, formatUsd, MAX_CENTS, parseUsd, requireCents } from "./money.ts";

test("decimal input is exact, including cent boundaries and maximum", () => {
  for (const [input, cents] of [
    ["0", 0n],
    ["0.01", 1n],
    ["1.2", 120n],
    ["999.99", 99999n],
  ] as const) {
    assert.equal(parseUsd(input), cents);
    assert.equal(parseUsd(formatUsd(cents)), cents);
  }
  assert.equal(parseUsd(formatUsd(MAX_CENTS)), MAX_CENTS);
  assert.equal(formatUsd(-1n), "-0.01");
});

test("reject ambiguous, non-decimal, malformed and out-of-range money", () => {
  for (const input of [
    "",
    " ",
    "-1",
    "01",
    ".5",
    "1.",
    "0.001",
    "1e3",
    "1,000",
    "NaN",
    "Infinity",
    " 1",
    "1 ",
    "+1",
  ]) {
    assert.throws(() => parseUsd(input));
  }
  assert.throws(() => parseUsd(formatUsd(MAX_CENTS + 1n)));
  assert.throws(() => requireCents(0.1));
  assert.throws(() => requireCents(-1n));
  assert.equal(ceilDivide(101n, 100n), 2n);
  assert.throws(() => ceilDivide(1n, 0n));
});
