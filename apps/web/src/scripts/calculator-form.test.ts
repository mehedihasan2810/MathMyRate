import { describe, expect, it } from "vitest";

import {
  formatPercentBps,
  formatUsdInput,
  hoursToMinutes,
  percentToBps,
  usdToCents,
  wholeNumber,
} from "./calculator-form";

describe("usdToCents", () => {
  it.each([
    ["1250.5", 125_050n],
    ["$1,250.50", 125_050n],
    [" 1 250 ", 125_000n],
    ["12.", 1_200n],
    [".5", 50n],
    ["$85,000.00", 8_500_000n],
    ["007", 700n],
    ["0", 0n],
  ])("reads %j as %s cents", (text, cents) => {
    expect(usdToCents(text, "amount")).toBe(cents);
  });

  it.each([
    ["", "Enter an amount."],
    [".", "Enter an amount."],
    ["$", "Enter an amount."],
    ["abc", "Use a nonnegative amount with up to 2 decimal places."],
    ["-5", "Use a nonnegative amount with up to 2 decimal places."],
    ["1.234", "Use a nonnegative amount with up to 2 decimal places."],
    ["1.2.3", "Use a nonnegative amount with up to 2 decimal places."],
    ["1000000000000.01", "Amount is above the supported maximum."],
  ])("rejects %j", (text, message) => {
    expect(() => usdToCents(text, "amount")).toThrow(message);
  });

  it("names the field that failed", () => {
    expect(() => usdToCents("abc", "takeHome")).toThrow(
      expect.objectContaining({ field: "takeHome" }),
    );
  });
});

describe("percentToBps", () => {
  it.each([
    ["27", 2_700],
    ["27 %", 2_700],
    ["27.5%", 2_750],
    ["12.", 1_200],
    ["99.99", 9_999],
  ])("reads %j as %s basis points", (text, bps) => {
    expect(percentToBps(text, "tax", 9_999)).toBe(bps);
  });

  it.each([
    ["", "Enter a percentage."],
    ["100", "Enter a value no higher than 99.99%."],
    ["-1", "Use a percentage with up to 2 decimal places."],
    ["12.345", "Use a percentage with up to 2 decimal places."],
  ])("rejects %j", (text, message) => {
    expect(() => percentToBps(text, "tax", 9_999)).toThrow(message);
  });
});

describe("wholeNumber", () => {
  it.each([
    ["46", 46],
    ["46.", 46],
    [" 40 ", 40],
  ])("reads %j as %s", (text, count) => {
    expect(wholeNumber(text, "weeks", 1, 52)).toBe(count);
  });

  it.each([
    ["", "Enter a whole number."],
    ["4.5", "Enter a whole number."],
    ["0", "Enter a whole number from 1 to 52."],
    ["53", "Enter a whole number from 1 to 52."],
  ])("rejects %j", (text, message) => {
    expect(() => wholeNumber(text, "weeks", 1, 52)).toThrow(message);
  });
  it("groups the digits of a large limit in its message", () => {
    expect(() => wholeNumber("0", "salesPerMonth", 1, 1_000_000)).toThrow(
      "Enter a whole number from 1 to 1,000,000.",
    );
  });
});

describe("hoursToMinutes", () => {
  it.each([
    ["18", 1_080],
    ["18.", 1_080],
    ["1.25", 75],
    [" 4 ", 240],
  ])("reads %j as %s minutes", (text, minutes) => {
    expect(hoursToMinutes(text, "deliveryHours")).toBe(minutes);
  });

  it.each([
    ["", "Enter a number of hours."],
    ["0.33", "Use a time that lands on a whole minute."],
    ["1.234", "Use hours with up to 2 decimal places."],
  ])("rejects %j", (text, message) => {
    expect(() => hoursToMinutes(text, "deliveryHours")).toThrow(message);
  });
});

describe("formatUsdInput", () => {
  it.each([
    [8_500_000n, "85,000.00"],
    [10_363n, "103.63"],
    [5n, "0.05"],
  ])("formats %s cents as %j", (cents, text) => {
    expect(formatUsdInput(cents)).toBe(text);
  });

  it("round-trips through usdToCents", () => {
    expect(usdToCents(formatUsdInput(123_456_789n), "amount")).toBe(123_456_789n);
  });
});

describe("formatPercentBps", () => {
  it.each([
    [292n, "2.92%"],
    [1_250n, "12.50%"],
    [5n, "0.05%"],
    [10_000n, "100.00%"],
  ])("formats %s basis points as %j", (bps, text) => {
    expect(formatPercentBps(bps)).toBe(text);
  });
});
