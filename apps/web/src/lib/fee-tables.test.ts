import { describe, expect, it } from "vitest";

import {
  feeColumnsByAmount,
  feeFor,
  feeRowsByAmount,
  formatSaleLabel,
  requireOfficialPreset,
  scenarioRowsAt,
} from "./fee-tables";

describe("fee reference tables", () => {
  it("labels whole-dollar sales without cents", () => {
    expect(formatSaleLabel(100_000n)).toBe("$1,000");
    expect(formatSaleLabel(1_250n)).toBe("$12.50");
  });

  it("prices a $100 Stripe domestic card sale at $3.20", () => {
    // 2.9% of $100.00 is $2.90, plus 30¢.
    expect(
      feeRowsByAmount(requireOfficialPreset("stripe-us-online-domestic-card"), [10_000n]),
    ).toEqual([["$100", "$3.20", "$96.80", "3.20%"]]);
  });

  it("shows every scenario's combined rate for the same sale", () => {
    expect(
      scenarioRowsAt(
        [{ label: "International card", presetId: "stripe-us-online-international-card" }],
        10_000n,
      ),
    ).toEqual([["International card", "4.4% + 30¢", "$4.70", "$95.30"]]);
  });

  it("puts one fee column per preset", () => {
    // Stripe: 290 + 30; PayPal standard card: 299 + 49.
    expect(
      feeColumnsByAmount(
        ["stripe-us-online-domestic-card", "paypal-us-standard-card-payment"],
        [10_000n],
      ),
    ).toEqual([["$100", "$3.20", "$3.48"]]);
    expect(feeFor("gumroad-us-discover", 10_000n)).toBe("$30.00");
  });

  it("refuses an unknown preset", () => {
    expect(() => requireOfficialPreset("missing")).toThrow("missing from the registry");
  });
});
