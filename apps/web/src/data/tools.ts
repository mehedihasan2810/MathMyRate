/**
 * The one registry of public calculators and hubs. Navigation, the footer,
 * breadcrumbs, related-tool blocks, home search, and the sitemap all read it,
 * so a new calculator is linked everywhere by adding one entry.
 */

export type HubId = "freelance" | "fees";

export type ToolId =
  | "hourly-rate"
  | "project-rate"
  | "retainer"
  | "markup-margin"
  | "salary-to-hourly"
  | "stripe-fees"
  | "paypal-fees"
  | "square-fees"
  | "etsy-fees"
  | "ebay-fees"
  | "upwork-fees"
  | "fiverr-fees"
  | "kickstarter-fees"
  | "patreon-fees"
  | "kofi-fees"
  | "kdp-royalties"
  | "gumroad-fees"
  | "lemon-squeezy-fees"
  | "stripe-vs-paypal"
  | "gumroad-vs-lemon-squeezy"
  | "digital-product-fees"
  | "upwork-vs-fiverr";

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
    id: "retainer",
    hub: "freelance",
    href: "/freelance/retainer-calculator/",
    name: "Freelance Retainer Calculator",
    menuLabel: "Retainer",
    summary: "Price a monthly retainer from your hourly rate, included hours, and discount.",
    searchTerms: "retainer monthly fee hours discount contract client agreement",
  },
  {
    id: "markup-margin",
    hub: "freelance",
    href: "/freelance/markup-margin-calculator/",
    name: "Markup and Margin Calculator",
    menuLabel: "Markup & margin",
    summary: "Set a price from a markup or a margin, or check the markup and margin of a price.",
    searchTerms: "markup margin profit price cost percentage gross margin resale",
  },
  {
    id: "salary-to-hourly",
    hub: "freelance",
    href: "/freelance/salary-to-hourly-calculator/",
    name: "Salary to Hourly Calculator",
    menuLabel: "Salary to hourly",
    summary: "Convert a salary or wage into hourly, daily, weekly, monthly, and yearly pay.",
    searchTerms: "salary hourly wage annual monthly weekly biweekly pay convert paycheck job offer",
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
    id: "square-fees",
    hub: "fees",
    href: "/fees/square-fee-calculator/",
    name: "Square Fee Calculator",
    menuLabel: "Square fees",
    summary:
      "In-person, online, keyed-in, and Afterpay fees on each Square plan, and what you keep.",
    searchTerms:
      "square pos in person tap card reader online invoice afterpay processing fee plus premium",
  },
  {
    id: "etsy-fees",
    hub: "fees",
    href: "/fees/etsy-fee-calculator/",
    name: "Etsy Fee Calculator",
    menuLabel: "Etsy fees",
    summary: "Etsy's transaction, processing, and listing fees on an order, and what you keep.",
    searchTerms:
      "etsy seller fees transaction fee listing fee etsy payments processing shop handmade shipping",
  },
  {
    id: "ebay-fees",
    hub: "fees",
    href: "/fees/ebay-fee-calculator/",
    name: "eBay Fee Calculator",
    menuLabel: "eBay fees",
    summary: "eBay's final value fee and per-order fee on a sale, by category, and what you keep.",
    searchTerms:
      "ebay seller fees final value fee per order fee store international category selling",
  },
  {
    id: "upwork-fees",
    hub: "fees",
    href: "/fees/upwork-fee-calculator/",
    name: "Upwork Fee Calculator",
    menuLabel: "Upwork fees",
    summary:
      "Upwork's Freelancer Service Fee and withdrawal fees on contract earnings, and what to bill.",
    searchTerms:
      "upwork freelancer service fee direct contract withdrawal instant pay freelance platform",
  },
  {
    id: "fiverr-fees",
    hub: "fees",
    href: "/fees/fiverr-fee-calculator/",
    name: "Fiverr Fee Calculator",
    menuLabel: "Fiverr fees",
    summary: "Fiverr's 20% seller commission and withdrawal fees on an order, and what to charge.",
    searchTerms:
      "fiverr seller commission fee gig extras tips withdrawal paypal payoneer freelance platform",
  },
  {
    id: "kickstarter-fees",
    hub: "fees",
    href: "/fees/kickstarter-fee-calculator/",
    name: "Kickstarter Fee Calculator",
    menuLabel: "Kickstarter fees",
    summary:
      "Kickstarter's 5% fee and payment processing on each pledge, and your campaign's total fees.",
    searchTerms: "kickstarter crowdfunding campaign pledge fee processing backers funding goal",
  },
  {
    id: "patreon-fees",
    hub: "fees",
    href: "/fees/patreon-fee-calculator/",
    name: "Patreon Fee Calculator",
    menuLabel: "Patreon fees",
    summary:
      "Patreon's platform, processing, and iOS App Store fees on a membership, and what you keep.",
    searchTerms: "patreon creator membership platform fee processing ios app store payout members",
  },
  {
    id: "kofi-fees",
    hub: "fees",
    href: "/fees/ko-fi-fee-calculator/",
    name: "Ko-fi Fee Calculator",
    menuLabel: "Ko-fi fees",
    summary: "Ko-fi's 5% service fee and Stripe processing on tips, shop sales, and memberships.",
    searchTerms:
      "ko-fi kofi tips donations shop memberships commissions gold service fee stripe paypal",
  },
  {
    id: "kdp-royalties",
    hub: "fees",
    href: "/fees/kdp-royalty-calculator/",
    name: "KDP Royalty Calculator",
    menuLabel: "KDP royalties",
    summary:
      "Amazon KDP royalties on eBooks, paperbacks, and hardcovers, after delivery and printing costs.",
    searchTerms:
      "amazon kdp kindle direct publishing royalty ebook paperback hardcover printing cost self publishing book",
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
    summary:
      "Order fees for US, international, PayPal, and subscription orders, and what you keep.",
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
  {
    id: "digital-product-fees",
    hub: "fees",
    href: "/fees/digital-product-platform-fees/",
    name: "Cheapest Way to Sell Digital Products",
    menuLabel: "Digital product fees",
    summary:
      "Compare Lemon Squeezy, Gumroad, Etsy, Stripe, and PayPal fees on the same digital product sale.",
    searchTerms:
      "cheapest way sell digital products ebook course download platform fees compare gumroad lemon squeezy etsy stripe paypal",
  },
  {
    id: "upwork-vs-fiverr",
    hub: "fees",
    href: "/fees/upwork-vs-fiverr-fees/",
    name: "Upwork vs Fiverr Fees",
    menuLabel: "Upwork vs Fiverr",
    summary: "Compare what Upwork and Fiverr keep from the same freelance job, side by side.",
    searchTerms:
      "upwork fiverr compare comparison freelancer fees service fee commission which is cheaper",
  },
];

export const infoLinks: readonly Crumb[] = [
  { name: "Guides", href: "/guides/" },
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

const RELATED_LIMIT = 6;

const SIBLING_LIMIT = 4;

/**
 * Up to six related calculators: siblings from the same hub first, then tools
 * from the other hub, so every page links across hubs; never the tool itself.
 */
export function relatedTools(id: ToolId): readonly Tool[] {
  const current = findTool(id);
  const siblings = tools.filter((tool) => tool.hub === current.hub && tool.id !== id);
  const others = tools.filter((tool) => tool.hub !== current.hub);
  const chosenSiblings = siblings.slice(0, Math.max(SIBLING_LIMIT, RELATED_LIMIT - others.length));

  return [...chosenSiblings, ...others].slice(0, RELATED_LIMIT);
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
