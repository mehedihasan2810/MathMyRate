import { describe, expect, it } from "vitest";

import { formatReadableDate } from "./dates";

describe("formatReadableDate", () => {
  it("formats an ISO date without shifting the day", () => {
    expect(formatReadableDate("2026-09-15")).toBe("September 15, 2026");
    expect(formatReadableDate("2026-01-01")).toBe("January 1, 2026");
  });

  it("rejects anything that is not an ISO calendar date", () => {
    expect(() => formatReadableDate("15/09/2026")).toThrow("Not an ISO calendar date");
  });
});
