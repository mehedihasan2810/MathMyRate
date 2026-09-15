import { describe, expect, it } from "vitest";

import { embedPath } from "../lib/embed";
import { embeddableTools, findEmbed } from "./embeds";
import { feeCalculators } from "./fee-calculators";
import { findTool, toolsInHub } from "./tools";

describe("embeddable calculators", () => {
  it("covers every fee calculator and every freelance calculator", () => {
    for (const config of feeCalculators) {
      expect(findEmbed(config.toolId)?.kind).toBe("fee");
    }

    for (const tool of toolsInHub("freelance")) {
      expect(findEmbed(tool.id)?.kind).toBe("standalone");
    }
  });

  it("embeds the Upwork calculator", () => {
    expect(findEmbed("upwork-fees")?.kind).toBe("standalone");
  });

  it("does not embed comparisons", () => {
    expect(findEmbed("stripe-vs-paypal")).toBeUndefined();
  });

  it("gives each embed a unique path and a usable height", () => {
    const paths = embeddableTools.map((embed) => embedPath(findTool(embed.toolId)));

    expect(new Set(paths).size).toBe(paths.length);
    expect(embeddableTools.every((embed) => embed.heightPx >= 1000 && embed.heightPx <= 2500)).toBe(
      true,
    );
  });
});
