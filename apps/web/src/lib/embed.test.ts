import { describe, expect, it } from "vitest";

import { findTool } from "../data/tools";
import { embedPath, embedSnippet } from "./embed";

describe("embed snippet", () => {
  const tool = findTool("stripe-fees");

  it("places the embed page under /embed/ with the calculator's slug", () => {
    expect(embedPath(tool)).toBe("/embed/stripe-fee-calculator/");
  });

  it("frames the embed page and credits the full calculator with absolute links", () => {
    const snippet = embedSnippet(new URL("https://calculators.example/"), tool);

    expect(snippet).toContain('src="https://calculators.example/embed/stripe-fee-calculator/"');
    expect(snippet).toContain(
      '<a href="https://calculators.example/fees/stripe-fee-calculator/">Stripe Fee Calculator</a>',
    );
  });
});
