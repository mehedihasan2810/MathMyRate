import { describe, expect, it } from "vitest";

import {
  articleNode,
  breadcrumbListNode,
  serializeStructuredData,
  webApplicationNode,
  webSiteNode,
} from "./structured-data";

const site = new URL("https://calculators.example/");

describe("structured data", () => {
  it("numbers breadcrumb items from 1 with absolute URLs", () => {
    const node = breadcrumbListNode(site, [
      { name: "Home", href: "/" },
      { name: "Payment fees", href: "/fees/" },
    ]);

    expect(node.itemListElement).toEqual([
      { "@type": "ListItem", position: 1, name: "Home", item: "https://calculators.example/" },
      {
        "@type": "ListItem",
        position: 2,
        name: "Payment fees",
        item: "https://calculators.example/fees/",
      },
    ]);
  });

  it("describes a calculator as a free web application at its canonical URL", () => {
    const node = webApplicationNode(
      site,
      "Stripe Fee Calculator",
      "Estimate fees.",
      "/fees/stripe-fee-calculator/",
    );

    expect(node.url).toBe("https://calculators.example/fees/stripe-fee-calculator/");
    expect(node.offers).toEqual({ "@type": "Offer", price: "0", priceCurrency: "USD" });
    expect(node).not.toHaveProperty("aggregateRating");
  });

  it("points the site search action at the home page query parameter", () => {
    expect(webSiteNode(site).potentialAction.target).toBe(
      "https://calculators.example/?q={search_term_string}",
    );
  });

  it("describes a guide as an article with its printed dates and absolute URLs", () => {
    const node = articleNode(site, {
      headline: "Markup vs Margin",
      description: "The difference, with examples.",
      path: "/guides/markup-vs-margin/",
      image: "/og/markup-vs-margin.png",
      publishedOn: "2026-09-15",
      updatedOn: "2026-09-15",
    });

    expect(node.url).toBe("https://calculators.example/guides/markup-vs-margin/");
    expect(node.image).toBe("https://calculators.example/og/markup-vs-margin.png");
    expect(node.author).toEqual({
      "@type": "Organization",
      name: "MathMyRate",
      url: "https://calculators.example/",
    });
    expect(node.dateModified).toBe("2026-09-15");
  });

  it("escapes angle brackets so text cannot close the script element", () => {
    const node = webApplicationNode(site, "</script><b>", "x", "/");

    expect(serializeStructuredData(node)).not.toContain("<");
    expect(JSON.parse(serializeStructuredData(node))).toEqual(node);
  });
});
