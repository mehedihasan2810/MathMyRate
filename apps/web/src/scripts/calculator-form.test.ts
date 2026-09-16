import { describe, expect, it } from "vitest";

import {
  decimalToHundredths,
  formatPercentBps,
  formatUsdInput,
  hoursToHundredths,
  hoursToMinutes,
  percentToBps,
  resultAnnouncement,
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

describe("percentToBps above 100%", () => {
  it("reads markups over 100% when the maximum allows them", () => {
    expect(percentToBps("250", "markup", 1_000_000)).toBe(25_000);
    expect(percentToBps("1,000.5%", "markup", 1_000_000)).toBe(100_050);
  });

  it("names a grouped maximum", () => {
    expect(() => percentToBps("10001", "markup", 1_000_000)).toThrow(
      "Enter a value no higher than 10,000%.",
    );
  });
});

describe("hoursToHundredths", () => {
  it.each([
    ["40", 4_000],
    ["37.5", 3_750],
    ["37.33", 3_733],
    ["0.01", 1],
  ])("reads %j as %s hundredths", (text, hundredths) => {
    expect(hoursToHundredths(text, "hours", 16_800)).toBe(hundredths);
  });

  it.each([
    ["", "Enter a number of hours."],
    ["0", "Enter from 0.01 to 168 hours."],
    ["168.01", "Enter from 0.01 to 168 hours."],
    ["1.234", "Use hours with up to 2 decimal places."],
  ])("rejects %j", (text, message) => {
    expect(() => hoursToHundredths(text, "hours", 16_800)).toThrow(message);
  });
});

describe("formatPercentBps", () => {
  it.each([
    [292n, "2.92%"],
    [-3_333n, "-33.33%"],
    [-2_500n, "-25.00%"],
    [100_000n, "1,000.00%"],
  ])("formats %s basis points as %s", (bps, text) => {
    expect(formatPercentBps(bps)).toBe(text);
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

describe("decimalToHundredths", () => {
  it.each([
    ["2.5", 250],
    ["0.01", 1],
    ["12.75", 1_275],
  ])("reads %j as %s hundredths", (text, hundredths) => {
    expect(decimalToHundredths(text, "size", "MB", 65_000)).toBe(hundredths);
  });

  it.each([
    ["", "Enter a size in MB."],
    ["0", "Enter from 0.01 to 650 MB."],
    ["1.234", "Use a number with up to 2 decimal places."],
  ])("rejects %j", (text, message) => {
    expect(() => decimalToHundredths(text, "size", "MB", 65_000)).toThrow(message);
  });
});

describe("resultAnnouncement", () => {
  it("names the primary result with its label", () => {
    expect(resultAnnouncement({ label: " Reaches you ", value: "$970.00", stale: false })).toBe(
      "Reaches you: $970.00.",
    );
    expect(
      resultAnnouncement({ label: "You keep\n  from this sale", value: "$96.80", stale: false }),
    ).toBe("You keep from this sale: $96.80.");
    expect(resultAnnouncement({ label: null, value: "$96.80", stale: false })).toBe("$96.80.");
  });

  it("says a comparison changed when there is no single result", () => {
    expect(resultAnnouncement({ label: null, value: null, stale: false })).toBe(
      "Comparison updated.",
    );
  });

  it("stays quiet while the result is stale or empty", () => {
    expect(resultAnnouncement({ label: "Reaches you", value: "$970.00", stale: true })).toBeNull();
    expect(resultAnnouncement({ label: "Reaches you", value: "—", stale: false })).toBeNull();
    expect(resultAnnouncement({ label: "Reaches you", value: "  ", stale: false })).toBeNull();
  });
});
