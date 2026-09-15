import { describe, expect, it } from "vitest";

import { findGuide, guideBreadcrumbs, guides, guidesForTool } from "./guides";
import { findTool } from "./tools";

describe("guides", () => {
  it("hands every guide to at least two calculators that exist", () => {
    for (const guide of guides) {
      expect(guide.tools.length).toBeGreaterThanOrEqual(2);

      for (const id of guide.tools) {
        expect(findTool(id).id).toBe(id);
      }
    }
  });

  it("gives every guide a search-length meta description", () => {
    for (const guide of guides) {
      expect(guide.description.length).toBeGreaterThanOrEqual(120);
      expect(guide.description.length).toBeLessThanOrEqual(160);
    }
  });

  it("uses unique trailing-slash paths under /guides/", () => {
    const paths = guides.map((guide) => guide.href);

    expect(new Set(paths).size).toBe(paths.length);
    expect(paths.every((path) => path.startsWith("/guides/") && path.endsWith("/"))).toBe(true);
  });

  it("lists a guide under each calculator it names", () => {
    expect(guidesForTool("markup-margin").map((guide) => guide.id)).toContain("markup-vs-margin");
    expect(guidesForTool("gumroad-fees")).toEqual([]);
  });

  it("builds breadcrumbs through the guides index", () => {
    const guide = findGuide("cover-payment-fees");

    expect(guideBreadcrumbs(guide.id)).toEqual([
      { name: "Home", href: "/" },
      { name: "Guides", href: "/guides/" },
      { name: guide.title, href: guide.href },
    ]);
  });
});
