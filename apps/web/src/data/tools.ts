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
  | "early-payment-discount"
  | "rate-increase"
  | "contractor-rate"
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
  | "substack-fees"
  | "payhip-fees"
  | "podia-fees"
  | "whop-fees"
  | "indiegogo-fees"
  | "skool-fees"
  | "teachable-fees"
  | "kdp-royalties"
  | "gumroad-fees"
  | "lemon-squeezy-fees"
  | "stripe-vs-paypal"
  | "gumroad-vs-lemon-squeezy"
  | "digital-product-fees"
  | "upwork-vs-fiverr"
  | "patreon-vs-kofi"
  | "substack-vs-patreon"
  | "payhip-vs-gumroad"
  | "kickstarter-vs-indiegogo"
  | "creator-platform-fees";

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
    id: "early-payment-discount",
    hub: "freelance",
    href: "/freelance/early-payment-discount-calculator/",
    name: "Early Payment Discount Calculator",
    menuLabel: "Early payment discount",
    summary:
      "What terms like 2/10 net 30 cost you, and the yearly rate a client gives up by paying late.",
    searchTerms:
      "early payment discount 2/10 net 30 invoice payment terms prompt payment cash discount annualized cost",
  },
  {
    id: "rate-increase",
    hub: "freelance",
    href: "/freelance/rate-increase-calculator/",
    name: "Rate Increase Calculator",
    menuLabel: "Rate increase",
    summary:
      "What a higher hourly rate adds each month and year, and how many hours you could lose.",
    searchTerms:
      "raise rates rate increase hourly rate price increase percentage freelancer clients revenue",
  },
  {
    id: "contractor-rate",
    hub: "freelance",
    href: "/freelance/1099-vs-w2-calculator/",
    name: "1099 vs W-2 Rate Calculator",
    menuLabel: "1099 vs W-2",
    summary:
      "The contractor income and hourly rate that match a salary after Social Security and Medicare tax.",
    searchTerms:
      "1099 vs w2 contractor employee salary equivalent self employment tax fica payroll tax hourly rate convert",
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
    id: "substack-fees",
    hub: "fees",
    href: "/fees/substack-fee-calculator/",
    name: "Substack Fee Calculator",
    menuLabel: "Substack fees",
    summary: "Substack's 10% fee and Stripe's card and Billing fees on a paid subscription.",
    searchTerms:
      "substack newsletter paid subscription writer 10% fee stripe billing founding member annual plan",
  },
  {
    id: "payhip-fees",
    hub: "fees",
    href: "/fees/payhip-fee-calculator/",
    name: "Payhip Fee Calculator",
    menuLabel: "Payhip fees",
    summary: "Payhip's 5%, 2%, or 0% plan fee and Stripe processing on a digital product sale.",
    searchTerms:
      "payhip digital downloads ebooks courses coaching free plus pro plan transaction fee stripe",
  },
  {
    id: "podia-fees",
    hub: "fees",
    href: "/fees/podia-fee-calculator/",
    name: "Podia Fee Calculator",
    menuLabel: "Podia fees",
    summary: "Podia's 5% Mover fee or no fee on the paid plans, with Stripe card processing.",
    searchTerms:
      "podia courses coaching community digital downloads mover shaker earthquaker transaction fee stripe",
  },
  {
    id: "whop-fees",
    hub: "fees",
    href: "/fees/whop-fee-calculator/",
    name: "Whop Fee Calculator",
    menuLabel: "Whop fees",
    summary: "Whop's 2.7% + 30¢ card fee, the international card rate, and its optional add-ons.",
    searchTerms:
      "whop communities memberships digital products courses card processing fee international add-ons discover",
  },
  {
    id: "indiegogo-fees",
    hub: "fees",
    href: "/fees/indiegogo-fee-calculator/",
    name: "Indiegogo Fee Calculator",
    menuLabel: "Indiegogo fees",
    summary:
      "Indiegogo's 5% platform fee and 3% + 20¢ processing on a contribution and a campaign.",
    searchTerms:
      "indiegogo crowdfunding campaign platform fee payment processing pledge manager late pledge goal funds raised",
  },
  {
    id: "skool-fees",
    hub: "fees",
    href: "/fees/skool-fee-calculator/",
    name: "Skool Fee Calculator",
    menuLabel: "Skool fees",
    summary:
      "Skool's Pro and Hobby transaction fees on a membership payment, including the $900 band.",
    searchTerms:
      "skool community membership group pro hobby transaction fee 2.9% 10% payout stripe express",
  },
  {
    id: "teachable-fees",
    hub: "fees",
    href: "/fees/teachable-fee-calculator/",
    name: "Teachable Fee Calculator",
    menuLabel: "Teachable fees",
    summary: "Teachable's 7.5% Starter fee or no plan fee, with card processing and subscriptions.",
    searchTerms:
      "teachable course school starter builder growth transaction fee processing subscription payment plan",
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
  {
    id: "patreon-vs-kofi",
    hub: "fees",
    href: "/fees/patreon-vs-ko-fi-fees/",
    name: "Patreon vs Ko-fi Fees",
    menuLabel: "Patreon vs Ko-fi",
    summary: "Compare what Patreon and Ko-fi keep from the same membership or tip, side by side.",
    searchTerms:
      "patreon ko-fi kofi compare comparison creator membership tips fees which is cheaper gold",
  },
  {
    id: "substack-vs-patreon",
    hub: "fees",
    href: "/fees/substack-vs-patreon-fees/",
    name: "Substack vs Patreon Fees",
    menuLabel: "Substack vs Patreon",
    summary: "Substack's and Patreon's fees on the same subscription or membership payment.",
    searchTerms:
      "substack patreon compare comparison newsletter paid subscription membership writer fees which is cheaper",
  },
  {
    id: "payhip-vs-gumroad",
    hub: "fees",
    href: "/fees/payhip-vs-gumroad-fees/",
    name: "Payhip vs Gumroad Fees",
    menuLabel: "Payhip vs Gumroad",
    summary:
      "Payhip's plans and Gumroad's direct and Discover fees on the same digital product sale.",
    searchTerms:
      "payhip gumroad compare comparison digital products ebook course fees which is cheaper discover plus pro",
  },
  {
    id: "kickstarter-vs-indiegogo",
    hub: "fees",
    href: "/fees/kickstarter-vs-indiegogo-fees/",
    name: "Kickstarter vs Indiegogo Fees",
    menuLabel: "Kickstarter vs Indiegogo",
    summary:
      "What Kickstarter and Indiegogo each keep from the same pledge and from a whole campaign.",
    searchTerms:
      "kickstarter indiegogo compare comparison crowdfunding campaign fees which is cheaper platform processing",
  },
  {
    id: "creator-platform-fees",
    hub: "fees",
    href: "/fees/creator-platform-fees/",
    name: "Creator Platform Fees Compared",
    menuLabel: "Creator platforms",
    summary:
      "Patreon, Substack, Ko-fi, Podia, and Whop fees on the same payment, and their monthly cost.",
    searchTerms:
      "creator platform fees compare patreon substack ko-fi kofi podia whop membership community newsletter cheapest",
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
