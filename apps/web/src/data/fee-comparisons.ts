/** Side-by-side fee comparisons. Every option points at one official preset. */

export type FeeComparisonId =
  | "stripe-vs-paypal"
  | "gumroad-vs-lemon-squeezy"
  | "digital-products"
  | "patreon-vs-kofi"
  | "substack-vs-patreon"
  | "payhip-vs-gumroad"
  | "kickstarter-vs-indiegogo"
  | "creator-platforms"
  | "teachable-vs-podia";

export interface ComparisonOption {
  readonly id: string;
  readonly presetId: string;
  readonly label: string;
  /** A compact name for table headings; defaults to the label. */
  readonly shortLabel?: string;
  readonly href: string;
}

export interface FeeComparisonConfig {
  readonly id: FeeComparisonId;
  readonly caption: string;
  readonly options: readonly ComparisonOption[];
}

export const feeComparisons: readonly FeeComparisonConfig[] = [
  {
    id: "stripe-vs-paypal",
    caption: "Stripe and PayPal fees on the same sale, US account, USD, no tax",
    options: [
      {
        id: "stripe-domestic",
        presetId: "stripe-us-online-domestic-card",
        label: "Stripe, domestic card",
        href: "/fees/stripe-fee-calculator/",
      },
      {
        id: "paypal-card",
        presetId: "paypal-us-standard-card-payment",
        label: "PayPal, standard card payment",
        href: "/fees/paypal-fee-calculator/",
      },
      {
        id: "paypal-checkout",
        presetId: "paypal-us-checkout-paypal-payment",
        label: "PayPal Checkout",
        href: "/fees/paypal-fee-calculator/",
      },
      {
        id: "stripe-international",
        presetId: "stripe-us-online-international-card",
        label: "Stripe, international card",
        href: "/fees/stripe-fee-calculator/",
      },
      {
        id: "paypal-international",
        presetId: "paypal-us-checkout-international",
        label: "PayPal Checkout, international buyer",
        href: "/fees/paypal-fee-calculator/",
      },
    ],
  },
  {
    id: "gumroad-vs-lemon-squeezy",
    caption: "Gumroad and Lemon Squeezy fees on the same card sale, USD, no tax",
    options: [
      {
        id: "gumroad-direct",
        presetId: "gumroad-us-direct-card",
        label: "Gumroad, direct sale",
        href: "/fees/gumroad-fee-calculator/",
      },
      {
        id: "gumroad-high-volume",
        presetId: "gumroad-us-direct-card-high-volume",
        label: "Gumroad, direct sale after $20,000 month",
        href: "/fees/gumroad-fee-calculator/",
      },
      {
        id: "gumroad-discover",
        presetId: "gumroad-us-discover",
        label: "Gumroad, Discover sale",
        href: "/fees/gumroad-fee-calculator/",
      },
      {
        id: "lemon-domestic",
        presetId: "lemon-squeezy-us-domestic-card",
        label: "Lemon Squeezy, US card order",
        href: "/fees/lemon-squeezy-fee-calculator/",
      },
      {
        id: "lemon-international",
        presetId: "lemon-squeezy-us-international-card",
        label: "Lemon Squeezy, international card order",
        href: "/fees/lemon-squeezy-fee-calculator/",
      },
    ],
  },
  {
    id: "digital-products",
    caption: "Fees on the same digital product sale, USD, no tax",
    options: [
      {
        id: "lemon",
        presetId: "lemon-squeezy-us-domestic-card",
        label: "Lemon Squeezy, US card order",
        shortLabel: "Lemon Squeezy",
        href: "/fees/lemon-squeezy-fee-calculator/",
      },
      {
        id: "gumroad-direct",
        presetId: "gumroad-us-direct-card",
        label: "Gumroad, direct sale",
        shortLabel: "Gumroad direct",
        href: "/fees/gumroad-fee-calculator/",
      },
      {
        id: "gumroad-discover",
        presetId: "gumroad-us-discover",
        label: "Gumroad, Discover sale",
        shortLabel: "Gumroad Discover",
        href: "/fees/gumroad-fee-calculator/",
      },
      {
        id: "payhip",
        presetId: "payhip-us-free-stripe-card",
        label: "Payhip Free Forever plan, card through Stripe",
        shortLabel: "Payhip",
        href: "/fees/payhip-fee-calculator/",
      },
      {
        id: "etsy",
        presetId: "etsy-us-order-with-listing-fee",
        label: "Etsy, order with listing fee",
        shortLabel: "Etsy",
        href: "/fees/etsy-fee-calculator/",
      },
      {
        id: "stripe",
        presetId: "stripe-us-online-domestic-card",
        label: "Stripe card payment (payment only)",
        shortLabel: "Stripe",
        href: "/fees/stripe-fee-calculator/",
      },
      {
        id: "paypal",
        presetId: "paypal-us-checkout-paypal-payment",
        label: "PayPal Checkout (payment only)",
        shortLabel: "PayPal Checkout",
        href: "/fees/paypal-fee-calculator/",
      },
    ],
  },
  {
    id: "patreon-vs-kofi",
    caption: "Patreon and Ko-fi fees on the same card payment, USD, no tax",
    options: [
      {
        id: "patreon-web",
        presetId: "patreon-us-standard-web",
        label: "Patreon, standard plan on the web",
        shortLabel: "Patreon (web)",
        href: "/fees/patreon-fee-calculator/",
      },
      {
        id: "patreon-ios",
        presetId: "patreon-us-standard-ios-first-year",
        label: "Patreon, iOS app purchase",
        shortLabel: "Patreon (iOS app)",
        href: "/fees/patreon-fee-calculator/",
      },
      {
        id: "kofi-5",
        presetId: "kofi-us-stripe-5-percent",
        label: "Ko-fi, 5% fee, card through Stripe",
        shortLabel: "Ko-fi 5%",
        href: "/fees/ko-fi-fee-calculator/",
      },
      {
        id: "kofi-0",
        presetId: "kofi-us-stripe-no-fee",
        label: "Ko-fi, no Ko-fi fee, card through Stripe",
        shortLabel: "Ko-fi, no fee",
        href: "/fees/ko-fi-fee-calculator/",
      },
    ],
  },
  {
    id: "substack-vs-patreon",
    caption: "Substack and Patreon fees on the same web payment, USD, no tax",
    options: [
      {
        id: "substack-us",
        presetId: "substack-us-web-domestic-card",
        label: "Substack, US card",
        shortLabel: "Substack",
        href: "/fees/substack-fee-calculator/",
      },
      {
        id: "patreon-web",
        presetId: "patreon-us-standard-web",
        label: "Patreon, standard plan on the web",
        shortLabel: "Patreon",
        href: "/fees/patreon-fee-calculator/",
      },
      {
        id: "substack-international",
        presetId: "substack-us-web-international-card",
        label: "Substack, international card in USD",
        shortLabel: "Substack, international card",
        href: "/fees/substack-fee-calculator/",
      },
    ],
  },
  {
    id: "payhip-vs-gumroad",
    caption: "Payhip and Gumroad fees on the same card sale, USD, no tax",
    options: [
      {
        id: "payhip-free",
        presetId: "payhip-us-free-stripe-card",
        label: "Payhip, Free Forever plan",
        shortLabel: "Payhip Free",
        href: "/fees/payhip-fee-calculator/",
      },
      {
        id: "payhip-plus",
        presetId: "payhip-us-plus-stripe-card",
        label: "Payhip, Plus plan (plus $29 a month)",
        shortLabel: "Payhip Plus",
        href: "/fees/payhip-fee-calculator/",
      },
      {
        id: "payhip-pro",
        presetId: "payhip-us-pro-stripe-card",
        label: "Payhip, Pro plan (plus $99 a month)",
        shortLabel: "Payhip Pro",
        href: "/fees/payhip-fee-calculator/",
      },
      {
        id: "gumroad-direct",
        presetId: "gumroad-us-direct-card",
        label: "Gumroad, direct sale",
        shortLabel: "Gumroad direct",
        href: "/fees/gumroad-fee-calculator/",
      },
      {
        id: "gumroad-discover",
        presetId: "gumroad-us-discover",
        label: "Gumroad, Discover sale",
        shortLabel: "Gumroad Discover",
        href: "/fees/gumroad-fee-calculator/",
      },
    ],
  },
  {
    id: "kickstarter-vs-indiegogo",
    caption: "Kickstarter and Indiegogo fees on the same pledge, USD, funded project, no tax",
    options: [
      {
        id: "kickstarter",
        presetId: "kickstarter-us-pledge",
        label: "Kickstarter, pledge of $10 or more",
        shortLabel: "Kickstarter",
        href: "/fees/kickstarter-fee-calculator/",
      },
      {
        id: "kickstarter-micro",
        presetId: "kickstarter-us-micropledge",
        label: "Kickstarter, pledge under $10",
        shortLabel: "Kickstarter micropledge",
        href: "/fees/kickstarter-fee-calculator/",
      },
      {
        id: "indiegogo",
        presetId: "indiegogo-us-contribution",
        label: "Indiegogo, project reaches its goal",
        shortLabel: "Indiegogo",
        href: "/fees/indiegogo-fee-calculator/",
      },
    ],
  },
  {
    id: "creator-platforms",
    caption: "Fees on the same payment from a fan or member, USD, no tax",
    options: [
      {
        id: "whop",
        presetId: "whop-us-card",
        label: "Whop, card payment",
        shortLabel: "Whop",
        href: "/fees/whop-fee-calculator/",
      },
      {
        id: "kofi-gold",
        presetId: "kofi-us-stripe-no-fee",
        label: "Ko-fi Gold, card through Stripe",
        shortLabel: "Ko-fi Gold",
        href: "/fees/ko-fi-fee-calculator/",
      },
      {
        id: "podia-paid",
        presetId: "podia-us-no-fee-stripe-card",
        label: "Podia Shaker or Earthquaker, card through Stripe",
        shortLabel: "Podia paid plan",
        href: "/fees/podia-fee-calculator/",
      },
      {
        id: "kofi",
        presetId: "kofi-us-stripe-5-percent",
        label: "Ko-fi free plan, card through Stripe",
        shortLabel: "Ko-fi",
        href: "/fees/ko-fi-fee-calculator/",
      },
      {
        id: "podia-mover",
        presetId: "podia-us-mover-stripe-card",
        label: "Podia Mover, card through Stripe",
        shortLabel: "Podia Mover",
        href: "/fees/podia-fee-calculator/",
      },
      {
        id: "teachable-paid",
        presetId: "teachable-us-paid-plan-card",
        label: "Teachable Builder or Growth, US card",
        shortLabel: "Teachable paid plan",
        href: "/fees/teachable-fee-calculator/",
      },
      {
        id: "skool-pro",
        presetId: "skool-us-pro-standard",
        label: "Skool Pro, charge up to $899",
        shortLabel: "Skool Pro",
        href: "/fees/skool-fee-calculator/",
      },
      {
        id: "teachable-starter",
        presetId: "teachable-us-starter-card",
        label: "Teachable Starter, US card",
        shortLabel: "Teachable Starter",
        href: "/fees/teachable-fee-calculator/",
      },
      {
        id: "skool-hobby",
        presetId: "skool-us-hobby",
        label: "Skool Hobby plan",
        shortLabel: "Skool Hobby",
        href: "/fees/skool-fee-calculator/",
      },
      {
        id: "patreon",
        presetId: "patreon-us-standard-web",
        label: "Patreon, standard plan on the web",
        shortLabel: "Patreon",
        href: "/fees/patreon-fee-calculator/",
      },
      {
        id: "substack",
        presetId: "substack-us-web-domestic-card",
        label: "Substack, US card on the web",
        shortLabel: "Substack",
        href: "/fees/substack-fee-calculator/",
      },
    ],
  },
  {
    id: "teachable-vs-podia",
    caption: "Teachable and Podia fees on the same course sale, US card, USD, no tax",
    options: [
      {
        id: "teachable-starter",
        presetId: "teachable-us-starter-card",
        label: "Teachable Starter, $39 a month",
        shortLabel: "Teachable Starter",
        href: "/fees/teachable-fee-calculator/",
      },
      {
        id: "teachable-paid",
        presetId: "teachable-us-paid-plan-card",
        label: "Teachable Builder or Growth, from $89 a month",
        shortLabel: "Teachable paid plan",
        href: "/fees/teachable-fee-calculator/",
      },
      {
        id: "podia-mover",
        presetId: "podia-us-mover-stripe-card",
        label: "Podia Mover, $49 a month",
        shortLabel: "Podia Mover",
        href: "/fees/podia-fee-calculator/",
      },
      {
        id: "podia-paid",
        presetId: "podia-us-no-fee-stripe-card",
        label: "Podia Shaker or Earthquaker, from $99 a month",
        shortLabel: "Podia paid plan",
        href: "/fees/podia-fee-calculator/",
      },
    ],
  },
];

export function findFeeComparison(id: string): FeeComparisonConfig {
  const config = feeComparisons.find((candidate) => candidate.id === id);

  if (!config) throw new Error(`Unknown fee comparison: ${id}`);

  return config;
}
