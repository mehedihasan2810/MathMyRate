/**
 * The one registry of public calculators and hubs. Navigation, the footer,
 * breadcrumbs, related-tool blocks, home search, and the sitemap all read it,
 * so a new calculator is linked everywhere by adding one entry.
 */

export type HubId = "freelance" | "fees";

export type ToolId =
  | "hourly-rate"
  | "project-rate"
  | "stripe-fees"
  | "paypal-fees"
  | "gumroad-fees"
  | "lemon-squeezy-fees"
  | "stripe-vs-paypal"
  | "gumroad-vs-lemon-squeezy";

export interface Crumb {
  readonly name: string;
  readonly href: string;
}

export interface Hub {
  readonly id: HubId;
  readonly name: string;
  readonly href: string;
}

export interface Tool {
  readonly id: ToolId;
  readonly hub: HubId;
  readonly href: string;
  /** The phrase people search for. It is also the page H1. */
  readonly name: string;
  /** A short label for tight spaces. */
  readonly menuLabel: string;
  readonly summary: string;
  /** Extra words that should match the home page search. */
  readonly searchTerms: string;
}

export const hubs: readonly Hub[] = [
  { id: "freelance", name: "Freelance pricing", href: "/freelance/" },
  { id: "fees", name: "Payment fees", href: "/fees/" },
];

export const tools: readonly Tool[] = [
  {
    id: "hourly-rate",
    hub: "freelance",
    href: "/freelance/hourly-rate-calculator/",
    name: "Freelance Hourly Rate Calculator",
    menuLabel: "Hourly & day rate",
    summary: "Turn an annual take-home target into a practical floor hourly and day rate.",
    searchTerms: "hourly day rate capacity billable tax reserve take-home salary income contractor",
  },
  {
    id: "project-rate",
    hub: "freelance",
    href: "/freelance/project-rate-calculator/",
    name: "Freelance Project Rate Calculator",
    menuLabel: "Project quote",
    summary: "Build a fixed-price quote from scope, contingency, and reimbursable costs.",
    searchTerms: "project quote fixed price flat fee scope estimate contingency",
  },
  {
    id: "stripe-fees",
    hub: "fees",
    href: "/fees/stripe-fee-calculator/",
    name: "Stripe Fee Calculator",
    menuLabel: "Stripe fees",
    summary: "See the card-processing fee and what a sale really pays you.",
    searchTerms: "stripe card processing fee gross up net sale checkout",
  },
  {
    id: "paypal-fees",
    hub: "fees",
    href: "/fees/paypal-fee-calculator/",
    name: "PayPal Fee Calculator",
    menuLabel: "PayPal fees",
    summary: "See PayPal's checkout fee and what a sale really pays you.",
    searchTerms: "paypal wallet checkout fee net sale",
  },
  {
    id: "gumroad-fees",
    hub: "fees",
    href: "/fees/gumroad-fee-calculator/",
    name: "Gumroad Fee Calculator",
    menuLabel: "Gumroad fees",
    summary: "Compare direct sales with Discover marketplace sales, fees side by side.",
    searchTerms: "gumroad marketplace discover digital products fee sale",
  },
  {
    id: "lemon-squeezy-fees",
    hub: "fees",
    href: "/fees/lemon-squeezy-fee-calculator/",
    name: "Lemon Squeezy Fee Calculator",
    menuLabel: "Lemon Squeezy fees",
    summary: "Order fees for domestic card sales, with payout costs kept separate.",
    searchTerms: "lemon squeezy digital products order fee merchant of record",
  },
  {
    id: "stripe-vs-paypal",
    hub: "fees",
    href: "/fees/stripe-vs-paypal-fees/",
    name: "Stripe vs PayPal Fees",
    menuLabel: "Stripe vs PayPal",
    summary: "Compare Stripe and PayPal fees on the same sale, side by side.",
    searchTerms: "stripe paypal compare comparison cheaper card checkout fees",
  },
  {
    id: "gumroad-vs-lemon-squeezy",
    hub: "fees",
    href: "/fees/gumroad-vs-lemon-squeezy-fees/",
    name: "Gumroad vs Lemon Squeezy Fees",
    menuLabel: "Gumroad vs Lemon Squeezy",
    summary: "Compare what Gumroad and Lemon Squeezy keep from a digital product sale.",
    searchTerms:
      "gumroad lemon squeezy compare comparison digital products merchant of record fees",
  },
];

export const infoLinks: readonly Crumb[] = [
  { name: "Methodology", href: "/methodology/" },
  { name: "Changelog", href: "/changelog/" },
  { name: "About", href: "/about/" },
  { name: "Privacy", href: "/privacy/" },
  { name: "Terms", href: "/terms/" },
];

export function findTool(id: ToolId): Tool {
  const tool = tools.find((candidate) => candidate.id === id);

  if (!tool) throw new Error(`Unknown calculator: ${id}`);

  return tool;
}

export function findHub(id: HubId): Hub {
  const hub = hubs.find((candidate) => candidate.id === id);

  if (!hub) throw new Error(`Unknown hub: ${id}`);

  return hub;
}

export function toolsInHub(id: HubId): readonly Tool[] {
  return tools.filter((tool) => tool.hub === id);
}

export function toolAtPath(pathname: string): Tool | undefined {
  return tools.find((tool) => tool.href === pathname);
}

/** Sibling calculators in the same hub first, then every other calculator; never the tool itself. */
export function relatedTools(id: ToolId): readonly Tool[] {
  const current = findTool(id);
  const siblings = tools.filter((tool) => tool.hub === current.hub && tool.id !== id);
  const others = tools.filter((tool) => tool.hub !== current.hub);

  return [...siblings, ...others];
}

export function hubBreadcrumbs(id: HubId): readonly Crumb[] {
  const hub = findHub(id);

  return [
    { name: "Home", href: "/" },
    { name: hub.name, href: hub.href },
  ];
}

export function toolBreadcrumbs(id: ToolId): readonly Crumb[] {
  const tool = findTool(id);

  return [...hubBreadcrumbs(tool.hub), { name: tool.name, href: tool.href }];
}
