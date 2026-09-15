/** Side-by-side fee comparisons. Every option points at one official preset. */

export type FeeComparisonId =
  | "stripe-vs-paypal"
  | "gumroad-vs-lemon-squeezy"
  | "digital-products"
  | "patreon-vs-kofi";

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
];

export function findFeeComparison(id: string): FeeComparisonConfig {
  const config = feeComparisons.find((candidate) => candidate.id === id);

  if (!config) throw new Error(`Unknown fee comparison: ${id}`);

  return config;
}
