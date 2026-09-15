import type { Crumb } from "../data/tools";

/**
 * Schema.org JSON-LD for the facts visible on each page. Nothing here may
 * describe ratings, reviews, prices other than free, or dates that are not
 * real; search engines treat structured data that disagrees with the page as
 * spam.
 */

const SITE_NAME = "MathMyRate";

interface OrganizationReference {
  readonly "@type": "Organization";
  readonly name: string;
  readonly url: string;
}

export interface OrganizationNode {
  readonly "@context": "https://schema.org";
  readonly "@type": "Organization";
  readonly name: string;
  readonly url: string;
  readonly logo: string;
}

export interface WebSiteNode {
  readonly "@context": "https://schema.org";
  readonly "@type": "WebSite";
  readonly name: string;
  readonly url: string;
  readonly publisher: OrganizationReference;
  readonly potentialAction: {
    readonly "@type": "SearchAction";
    readonly target: string;
    readonly "query-input": string;
  };
}

export interface WebApplicationNode {
  readonly "@context": "https://schema.org";
  readonly "@type": "WebApplication";
  readonly name: string;
  readonly url: string;
  readonly description: string;
  readonly applicationCategory: "FinanceApplication";
  readonly operatingSystem: "Any";
  readonly browserRequirements: "Requires JavaScript";
  readonly isAccessibleForFree: true;
  readonly offers: {
    readonly "@type": "Offer";
    readonly price: "0";
    readonly priceCurrency: "USD";
  };
  readonly publisher: OrganizationReference;
}

export interface BreadcrumbListNode {
  readonly "@context": "https://schema.org";
  readonly "@type": "BreadcrumbList";
  readonly itemListElement: readonly {
    readonly "@type": "ListItem";
    readonly position: number;
    readonly name: string;
    readonly item: string;
  }[];
}

export type StructuredDataNode =
  | OrganizationNode
  | WebSiteNode
  | WebApplicationNode
  | BreadcrumbListNode;

function publisher(site: URL): OrganizationReference {
  return { "@type": "Organization", name: SITE_NAME, url: new URL("/", site).href };
}

export function organizationNode(site: URL): OrganizationNode {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: new URL("/", site).href,
    logo: new URL("/icon-512.png", site).href,
  };
}

/** The search action matches the home page, which filters calculators from `?q=`. */
export function webSiteNode(site: URL): WebSiteNode {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: new URL("/", site).href,
    publisher: publisher(site),
    potentialAction: {
      "@type": "SearchAction",
      target: `${new URL("/", site).href}?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function webApplicationNode(
  site: URL,
  name: string,
  description: string,
  path: string,
): WebApplicationNode {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name,
    url: new URL(path, site).href,
    description,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript",
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    publisher: publisher(site),
  };
}

export function breadcrumbListNode(site: URL, crumbs: readonly Crumb[]): BreadcrumbListNode {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: new URL(crumb.href, site).href,
    })),
  };
}

/** Serializes a node for a script element. "<" is escaped so no text can close the tag. */
export function serializeStructuredData(node: StructuredDataNode): string {
  return JSON.stringify(node).replaceAll("<", "\\u003c");
}
