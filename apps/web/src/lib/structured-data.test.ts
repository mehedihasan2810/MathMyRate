import { describe, expect, it } from "vitest";

import {
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

  it("escapes angle brackets so text cannot close the script element", () => {
    const node = webApplicationNode(site, "</script><b>", "x", "/");

    expect(serializeStructuredData(node)).not.toContain("<");
    expect(JSON.parse(serializeStructuredData(node))).toEqual(node);
  });
});
