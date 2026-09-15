import { describe, expect, it } from "vitest";

import { hubs, relatedTools, toolAtPath, toolBreadcrumbs, tools } from "./tools";

describe("calculator registry", () => {
  it("gives every page a unique path with a trailing slash", () => {
    const paths = [...hubs.map((hub) => hub.href), ...tools.map((tool) => tool.href)];

    expect(new Set(paths).size).toBe(paths.length);

    for (const path of paths) {
      expect(path).toMatch(/^\/[a-z0-9/-]*\/$/u);
    }
  });

  it("files every tool under its hub path", () => {
    for (const tool of tools) {
      const hub = hubs.find((candidate) => candidate.id === tool.hub);

      expect(hub).toBeDefined();
      expect(tool.href.startsWith(hub?.href ?? "missing")).toBe(true);
    }
  });

  it("lists sibling calculators first and never the tool itself", () => {
    const related = relatedTools("stripe-fees");

    expect(related.map((tool) => tool.id)).toEqual([
      "paypal-fees",
      "gumroad-fees",
      "lemon-squeezy-fees",
      "stripe-vs-paypal",
      "gumroad-vs-lemon-squeezy",
      "hourly-rate",
      "project-rate",
    ]);
  });

  it("builds a home, hub, tool breadcrumb trail", () => {
    expect(toolBreadcrumbs("hourly-rate")).toEqual([
      { name: "Home", href: "/" },
      { name: "Freelance pricing", href: "/freelance/" },
      { name: "Freelance Hourly Rate Calculator", href: "/freelance/hourly-rate-calculator/" },
    ]);
  });

  it("finds a tool only by its exact path", () => {
    expect(toolAtPath("/fees/paypal-fee-calculator/")?.id).toBe("paypal-fees");
    expect(toolAtPath("/fees/paypal-fee-calculator")).toBeUndefined();
  });
});
