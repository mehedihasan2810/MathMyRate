/**
 * Scenario menus for the fee calculators. Each scenario points at one
 * official preset; rates, assumptions, and sources live in the preset, never here.
 */

import type { ToolId } from "./tools";

export type FeeCalculatorId =
  | "stripe"
  | "paypal"
  | "square"
  | "etsy"
  | "ebay"
  | "depop"
  | "poshmark"
  | "mercari"
  | "facebook-marketplace"
  | "kickstarter"
  | "patreon"
  | "kofi"
  | "substack"
  | "payhip"
  | "podia"
  | "whop"
  | "indiegogo"
  | "skool"
  | "teachable"
  | "gumroad"
  | "lemon-squeezy";

export interface FeeScenario {
  readonly id: string;
  /** The headline rule, shown in summaries. */
  readonly presetId: string;
  /**
   * For a rule that changes with the amount, every band's preset, lowest
   * amounts first. It includes presetId. The calculator picks the band that
   * covers the amount, so the reader never has to choose one.
   */
  readonly bandPresetIds?: readonly string[];
  readonly label: string;
  readonly description: string;
  /** Names the supported scenario above the form. */
  readonly note: string;
  /** Names the payment in copied results, for example "Stripe domestic card payment". */
  readonly copyName: string;
}

/** Wording for the optional same-size volume field and its totals. */
export interface VolumeLabels {
  readonly fieldLabel: string;
  readonly fieldHelp: string;
  readonly unitSingular: string;
  readonly unitPlural: string;
  /** "a month" for recurring sales, or null for a one-off total such as a campaign. */
  readonly perPeriod: string | null;
  readonly feesLabel: string;
  readonly keepLabel: string;
  readonly yearly: boolean;
  readonly shareLabel: string;
  readonly shareNoun: string;
}

export const salesVolumeLabels: VolumeLabels = {
  fieldLabel: "Sales per month (optional)",
  fieldHelp: "Same-size sales. Adds monthly and yearly totals.",
  unitSingular: "sale",
  unitPlural: "sales",
  perPeriod: "a month",
  feesLabel: "Fees per month",
  keepLabel: "You keep per month",
  yearly: true,
  shareLabel: "Fees as a share of sales",
  shareNoun: "sales",
};

export interface FeeCalculatorConfig {
  readonly id: FeeCalculatorId;
  /** The calculator page in the tool registry, used for embeds and credit links. */
  readonly toolId: ToolId;
  readonly provider: string;
  readonly formHeading: string;
  readonly scenarioLegend: string;
  readonly panelTone: "navy" | "ink";
  /** Help text for the tax field, shown only for scenarios that accept tax. */
  readonly taxHelp: string;
  readonly scenarios: readonly FeeScenario[];
  /** Wording for the volume field; defaults to monthly sales. */
  readonly volume?: VolumeLabels;
  /**
   * For marketplaces that charge their fee on shipping the buyer pays, where
   * that shipping pays for the label. Adds a shipping field, the amount
   * becomes the item price, and shipping and tax are added to it. The fee
   * applies to the whole total, but the shipping is not counted as kept.
   */
  readonly shipping?: ShippingLabels;
  /** Names the amount field when "Amount the customer paid" would mislead. */
  readonly amountLabels?: AmountLabels;
}

/** Wording for the amount field in the customer-paid mode. */
export interface AmountLabels {
  readonly fieldLabel: string;
  readonly fieldHelp: string;
}

/** Wording for the optional shipping field. */
export interface ShippingLabels {
  readonly fieldLabel: string;
  readonly fieldHelp: string;
}

/** The presets a scenario prices with: its bands, or its single rule. */
export function scenarioPresetIds(scenario: FeeScenario): readonly string[] {
  return scenario.bandPresetIds ?? [scenario.presetId];
}

export const feeCalculators: readonly FeeCalculatorConfig[] = [
  {
    id: "stripe",
    toolId: "stripe-fees",
    provider: "Stripe",
    formHeading: "Payment details",
    scenarioLegend: "What kind of card payment is it?",
    panelTone: "navy",
    taxHelp:
      "Sales tax you collected on this payment. This calculator never computes tax; Stripe's fee applies to the amount that includes it.",
    scenarios: [
      {
        id: "domestic",
        presetId: "stripe-us-online-domestic-card",
        label: "Domestic card",
        description: "A card issued in the US, paid online.",
        note: "Supported scenario: US Stripe account, USD charge, standard online payment with a card issued in the US.",
        copyName: "Stripe domestic card payment",
      },
      {
        id: "international",
        presetId: "stripe-us-online-international-card",
        label: "International card",
        description: "A card issued outside the US, with no currency conversion.",
        note: "Supported scenario: US Stripe account, USD charge, standard online payment with a card issued outside the US and no currency conversion.",
        copyName: "Stripe international card payment",
      },
      {
        id: "manual",
        presetId: "stripe-us-online-manual-domestic-card",
        label: "Manually entered card",
        description: "A US card typed in by hand.",
        note: "Supported scenario: US Stripe account, USD charge, US-issued card entered manually.",
        copyName: "Stripe manually entered card payment",
      },
    ],
  },
  {
    id: "paypal",
    toolId: "paypal-fees",
    provider: "PayPal",
    formHeading: "Payment details",
    scenarioLegend: "How did the customer pay?",
    panelTone: "ink",
    taxHelp:
      "Sales tax you collected on this payment. This calculator never computes tax; PayPal's fee applies to the amount that includes it.",
    scenarios: [
      {
        id: "checkout",
        presetId: "paypal-us-checkout-paypal-payment",
        label: "PayPal Checkout",
        description: "Paid through PayPal, Venmo, or guest checkout.",
        note: "Supported scenario: US PayPal Business account, domestic USD payment through PayPal Checkout.",
        copyName: "PayPal Checkout payment",
      },
      {
        id: "card",
        presetId: "paypal-us-standard-card-payment",
        label: "Standard card payment",
        description: "A credit or debit card through standard card payments.",
        note: "Supported scenario: US PayPal Business account, domestic USD payment through Standard Credit and Debit Card Payments.",
        copyName: "PayPal standard card payment",
      },
      {
        id: "invoice-paypal",
        presetId: "paypal-us-invoice-paypal-payment",
        label: "Invoice paid with PayPal",
        description: "A PayPal invoice paid through PayPal, Venmo, or guest checkout.",
        note: "Supported scenario: US PayPal Business account, domestic USD invoice paid through PayPal Checkout, Venmo, or Guest Checkout.",
        copyName: "PayPal invoice paid with PayPal",
      },
      {
        id: "invoice-card",
        presetId: "paypal-us-invoice-card-payment",
        label: "Invoice paid by card",
        description: "A PayPal invoice paid by card, Apple Pay, or another wallet.",
        note: "Supported scenario: US PayPal Business account, domestic USD invoice paid by card, Apple Pay, or another third-party wallet.",
        copyName: "PayPal invoice paid by card",
      },
      {
        id: "international",
        presetId: "paypal-us-checkout-international",
        label: "International Checkout",
        description: "PayPal Checkout from a buyer in another country, no conversion.",
        note: "Supported scenario: US PayPal Business account, USD PayPal Checkout payment from a buyer in another market, with no currency conversion.",
        copyName: "international PayPal Checkout payment",
      },
      {
        id: "qr",
        presetId: "paypal-us-qr-code",
        label: "QR code",
        description: "An in-person PayPal QR code payment.",
        note: "Supported scenario: US PayPal Business account, domestic USD QR code payment.",
        copyName: "PayPal QR code payment",
      },
    ],
  },
  {
    id: "square",
    toolId: "square-fees",
    provider: "Square",
    formHeading: "Payment details",
    scenarioLegend: "How was it paid, and on which plan?",
    panelTone: "ink",
    taxHelp:
      "Sales tax included in this payment. Square takes its fee from the full total, including tax and tip; this calculator never computes tax.",
    scenarios: [
      {
        id: "free-in-person",
        presetId: "square-us-free-in-person-card",
        label: "In person, Square Free",
        description: "A US card tapped, dipped, or swiped.",
        note: "Supported scenario: US Square account on Square Free, USD in-person payment with a US-issued card that is tapped, dipped, or swiped.",
        copyName: "Square Free in-person payment",
      },
      {
        id: "plus-in-person",
        presetId: "square-us-plus-in-person-card",
        label: "In person, Square Plus",
        description: "The same payment on the $49 a month plan.",
        note: "Supported scenario: US Square account on Square Plus, USD in-person payment with a US-issued card. The $49 monthly plan price is not included.",
        copyName: "Square Plus in-person payment",
      },
      {
        id: "premium-in-person",
        presetId: "square-us-premium-in-person-card",
        label: "In person, Square Premium",
        description: "The same payment on the $149 a month plan.",
        note: "Supported scenario: US Square account on Square Premium, USD in-person payment with a US-issued card. The $149 monthly plan price is not included.",
        copyName: "Square Premium in-person payment",
      },
      {
        id: "free-online",
        presetId: "square-us-free-online-card",
        label: "Online or invoice, Square Free",
        description: "A US card paid online or on a Square invoice.",
        note: "Supported scenario: US Square account on Square Free, USD card payment made online or through a Square invoice.",
        copyName: "Square Free online payment",
      },
      {
        id: "paid-online",
        presetId: "square-us-paid-plan-online-card",
        label: "Online or invoice, Plus or Premium",
        description: "The same online payment on a paid plan.",
        note: "Supported scenario: US Square account on Square Plus or Premium, USD card payment made online or through a Square invoice.",
        copyName: "Square Plus or Premium online payment",
      },
      {
        id: "manual",
        presetId: "square-us-manual-or-card-on-file",
        label: "Keyed in or card on file",
        description: "Any plan. The card number is typed in or saved.",
        note: "Supported scenario: US Square account on any plan, USD payment with a US-issued card entered manually or saved on file.",
        copyName: "Square keyed-in or card-on-file payment",
      },
      {
        id: "international",
        presetId: "square-us-free-in-person-international-card",
        label: "International card in person, Square Free",
        description: "A card issued outside the US, tapped, dipped, or swiped.",
        note: "Supported scenario: US Square account on Square Free, USD in-person payment with a card issued outside the US.",
        copyName: "Square Free in-person international card payment",
      },
      {
        id: "afterpay",
        presetId: "square-us-afterpay",
        label: "Afterpay",
        description: "Any plan. The customer pays over time.",
        note: "Supported scenario: US Square account on any plan, USD payment made with Afterpay.",
        copyName: "Square Afterpay payment",
      },
    ],
  },
  {
    id: "etsy",
    toolId: "etsy-fees",
    provider: "Etsy",
    formHeading: "Order details",
    scenarioLegend: "Which fees should the result include?",
    panelTone: "navy",
    taxHelp:
      "Sales tax Etsy collected on this order. Etsy's 6.5% transaction fee leaves it out, its 3% + 25¢ processing fee includes it, and the tax itself is passed on, not kept.",
    scenarios: [
      {
        id: "with-listing",
        presetId: "etsy-us-order-with-listing-fee",
        label: "Order plus its listing fee",
        description: "Transaction, processing, and the item's $0.20 listing fee.",
        note: "Supported scenario: US shop with a US bank account, one item sold in USD through Etsy Payments, counting its $0.20 listing fee.",
        copyName: "Etsy order with its listing fee",
      },
      {
        id: "order-only",
        presetId: "etsy-us-order-fees-only",
        label: "Per-order fees only",
        description: "Transaction and processing fees, without the listing fee.",
        note: "Supported scenario: US shop with a US bank account, order paid in USD through Etsy Payments, transaction and processing fees only.",
        copyName: "Etsy order",
      },
    ],
  },
  {
    id: "ebay",
    toolId: "ebay-fees",
    provider: "eBay",
    formHeading: "Sale details",
    scenarioLegend: "What did you sell?",
    panelTone: "ink",
    taxHelp:
      "Sales tax on this order. eBay's final value fee is charged on the total amount of the sale, including sales tax; this calculator never computes tax.",
    scenarios: [
      {
        id: "most",
        presetId: "ebay-us-most-categories",
        label: "Most categories",
        description: "An order over $10, up to $7,500.",
        note: "Supported scenario: US eBay account with no Store or a Starter Store, one item in an order over $10.00 and up to $7,500.00, in a category charged 13.6%.",
        copyName: "eBay sale",
      },
      {
        id: "small",
        presetId: "ebay-us-most-categories-small-order",
        label: "Most categories, $10 or less",
        description: "A small order, with the 30¢ per-order fee.",
        note: "Supported scenario: US eBay account with no Store or a Starter Store, one item in an order of $10.00 or less, in a category charged 13.6%.",
        copyName: "eBay order of $10 or less",
      },
      {
        id: "books",
        presetId: "ebay-us-books-movies-music",
        label: "Books, movies, and music",
        description: "Books & Magazines, Movies & TV, and most Music.",
        note: "Supported scenario: US eBay account with no Store or a Starter Store, one item in an order over $10.00 and up to $7,500.00, charged 15.3%.",
        copyName: "eBay books, movies, or music sale",
      },
      {
        id: "cards",
        presetId: "ebay-us-cards-comics-coins",
        label: "Trading cards, comics, and coins",
        description: "Cards, comics, card games, and most coins.",
        note: "Supported scenario: US eBay account with no Store or a Starter Store, one item in an order over $10.00 and up to $7,500.00, charged 13.25%.",
        copyName: "eBay trading card, comic, or coin sale",
      },
      {
        id: "guitars",
        presetId: "ebay-us-guitars-basses",
        label: "Guitars and basses",
        description: "Musical Instruments & Gear > Guitars & Basses.",
        note: "Supported scenario: US eBay account with no Store or a Starter Store, one guitar or bass in an order over $10.00 and up to $7,500.00, charged 6.7%.",
        copyName: "eBay guitar or bass sale",
      },
      {
        id: "international",
        presetId: "ebay-us-international-most-categories",
        label: "International buyer",
        description: "Most categories, plus eBay's 1.65% international fee.",
        note: "Supported scenario: US eBay account with no Store or a Starter Store, one item in a most-categories order over $10.00 and up to $7,500.00, to a buyer outside the US, not shipped with eBay International Shipping.",
        copyName: "eBay international sale",
      },
      {
        id: "store",
        presetId: "ebay-us-store-most-categories",
        label: "Basic Store or above",
        description: "Most categories at 12.7%, orders over $10 up to $2,500.",
        note: "Supported scenario: US eBay account with a Basic, Premium, Anchor, or Enterprise Store, one item in an order over $10.00 and up to $2,500.00, in a category charged 12.7%.",
        copyName: "eBay Store sale",
      },
    ],
  },
  {
    id: "depop",
    toolId: "depop-fees",
    provider: "Depop",
    formHeading: "Sale details",
    scenarioLegend: "How was it paid?",
    panelTone: "navy",
    taxHelp:
      "Sales tax on this order. Depop charges its processing fee on the item, shipping, and tax together; this calculator never computes tax.",
    shipping: {
      fieldLabel: "Shipping the buyer paid (optional)",
      fieldHelp: "It pays for the shipping label, so it is not counted as yours.",
    },
    scenarios: [
      {
        id: "depop-payments",
        presetId: "depop-us-sale",
        label: "Depop Payments",
        description: "No selling fee; 3.3% + 45¢ processing on the whole order.",
        note: "Supported scenario: US seller paid through Depop Payments, with no selling fee. The processing fee applies to the item price, shipping, and sales tax the buyer paid.",
        copyName: "Depop sale",
      },
    ],
  },
  {
    id: "poshmark",
    toolId: "poshmark-fees",
    provider: "Poshmark",
    formHeading: "Sale details",
    scenarioLegend: "What sold?",
    panelTone: "ink",
    taxHelp: "",
    amountLabels: {
      fieldLabel: "Sale price",
      fieldHelp: "The final order price after offers and discounts, without shipping or tax.",
    },
    scenarios: [
      {
        id: "one-item",
        presetId: "poshmark-us-sale",
        bandPresetIds: ["poshmark-us-sale-under-15", "poshmark-us-sale"],
        label: "One-item order",
        description: "$2.95 under $15, and 20% from $15.",
        note: "Supported scenario: US seller, one-item order. Enter the final order price after offers and discounts, without the buyer's shipping or sales tax.",
        copyName: "Poshmark sale",
      },
    ],
  },
  {
    id: "mercari",
    toolId: "mercari-fees",
    provider: "Mercari",
    formHeading: "Sale details",
    scenarioLegend: "What sold?",
    panelTone: "navy",
    taxHelp: "",
    shipping: {
      fieldLabel: "Shipping the buyer paid (optional)",
      fieldHelp:
        "Mercari's fee applies to it, but it pays for the label, so it is not counted as yours.",
    },
    scenarios: [
      {
        id: "sale",
        presetId: "mercari-us-sale",
        label: "Listing from January 6, 2025",
        description: "10% of the item price plus buyer-paid shipping.",
        note: "Supported scenario: US seller, listing created or updated on or after January 6, 2025. Leave shipping empty if you pay for the label yourself.",
        copyName: "Mercari sale",
      },
    ],
  },
  {
    id: "facebook-marketplace",
    toolId: "facebook-marketplace-fees",
    provider: "Facebook Marketplace",
    formHeading: "Order details",
    scenarioLegend: "How did it sell?",
    panelTone: "ink",
    taxHelp:
      "Sales tax on this order. Meta charges the selling fee on the sale price, shipping, and tax together; this calculator never computes tax.",
    shipping: {
      fieldLabel: "Shipping the buyer paid (optional)",
      fieldHelp: "Part of the fee base, but it pays for the label, so it is not counted as yours.",
    },
    scenarios: [
      {
        id: "shipped",
        presetId: "facebook-marketplace-us-shipped",
        bandPresetIds: [
          "facebook-marketplace-us-shipped-minimum",
          "facebook-marketplace-us-shipped",
        ],
        label: "Shipped with checkout",
        description: "10% of the order total, at least 80¢.",
        note: "Supported scenario: US individual seller using checkout on Facebook, items shipped together. Local pickup paid outside checkout is not covered.",
        copyName: "Facebook Marketplace shipped order",
      },
    ],
  },
  {
    id: "kickstarter",
    toolId: "kickstarter-fees",
    provider: "Kickstarter",
    formHeading: "Pledge details",
    scenarioLegend: "How large is the pledge?",
    panelTone: "navy",
    taxHelp: "",
    volume: {
      fieldLabel: "Number of pledges (optional)",
      fieldHelp: "Same-size collected pledges. Adds campaign totals.",
      unitSingular: "pledge",
      unitPlural: "pledges",
      perPeriod: null,
      feesLabel: "Fees on these pledges",
      keepLabel: "You receive",
      yearly: false,
      shareLabel: "Fees as a share of pledges",
      shareNoun: "pledges",
    },
    scenarios: [
      {
        id: "standard",
        presetId: "kickstarter-us-pledge",
        label: "Pledge of $10 or more",
        description: "Kickstarter's 5% plus 3% + 30¢ processing.",
        note: "Supported scenario: US project in USD that is successfully funded, one collected pledge of $10 or more.",
        copyName: "Kickstarter pledge",
      },
      {
        id: "micro",
        presetId: "kickstarter-us-micropledge",
        label: "Pledge under $10",
        description: "Kickstarter's 5% plus the 5% + 8¢ micropledge rate.",
        note: "Supported scenario: US project in USD that is successfully funded, one collected pledge under $10.",
        copyName: "Kickstarter micropledge",
      },
    ],
  },
  {
    id: "patreon",
    toolId: "patreon-fees",
    provider: "Patreon",
    formHeading: "Payment details",
    scenarioLegend: "How is the member paying, and on which plan?",
    panelTone: "ink",
    taxHelp: "",
    volume: {
      fieldLabel: "Paying members (optional)",
      fieldHelp: "Members paying this amount each month. Adds monthly and yearly totals.",
      unitSingular: "member",
      unitPlural: "members",
      perPeriod: "a month",
      feesLabel: "Fees per month",
      keepLabel: "You keep per month",
      yearly: true,
      shareLabel: "Fees as a share of payments",
      shareNoun: "payments",
    },
    scenarios: [
      {
        id: "web",
        presetId: "patreon-us-standard-web",
        label: "Card or US PayPal, standard plan",
        description: "10% platform fee plus 2.9% + 30¢.",
        note: "Supported scenario: US creator on Patreon's standard 10% plan, USD membership payment on the web by card, Apple Pay, or US PayPal or Venmo, with no sales tax.",
        copyName: "Patreon membership payment",
      },
      {
        id: "non-us-paypal",
        presetId: "patreon-us-standard-non-us-paypal",
        label: "PayPal or Venmo from outside the US",
        description: "10% platform fee plus 3.9% + 30¢.",
        note: "Supported scenario: US creator on Patreon's standard 10% plan, USD membership payment by PayPal or Venmo from a member outside the US.",
        copyName: "Patreon PayPal payment from outside the US",
      },
      {
        id: "conversion",
        presetId: "patreon-us-standard-currency-conversion",
        label: "Card payment in another currency",
        description: "Adds Patreon's 2.5% currency conversion fee.",
        note: "Supported scenario: US creator on Patreon's standard 10% plan, membership paid by card in a currency other than USD.",
        copyName: "Patreon payment in another currency",
      },
      {
        id: "ios",
        presetId: "patreon-us-standard-ios-first-year",
        label: "iOS app purchase",
        description: "Apple's 30% plus the 10% platform fee.",
        note: "Supported scenario: US creator on Patreon's standard 10% plan, purchase made in Patreon's iOS app, where Apple takes 30% and Patreon charges no processing fee.",
        copyName: "Patreon iOS purchase",
      },
      {
        id: "ios-year",
        presetId: "patreon-us-standard-ios-after-year",
        label: "iOS membership after a year",
        description: "Apple's 15% plus the 10% platform fee.",
        note: "Supported scenario: US creator on Patreon's standard 10% plan, iOS membership billed continuously for more than a year, where Apple takes 15%.",
        copyName: "Patreon iOS membership after a year",
      },
      {
        id: "pro",
        presetId: "patreon-us-pro-over-3",
        label: "Legacy Pro plan, over $3",
        description: "8% platform fee plus 2.9% + 30¢.",
        note: "Supported scenario: US creator on Patreon's legacy 8% Pro plan, USD payment over $3 by card or US PayPal.",
        copyName: "Patreon Pro plan payment",
      },
      {
        id: "pro-small",
        presetId: "patreon-us-pro-3-or-less",
        label: "Legacy Pro plan, $3 or less",
        description: "8% platform fee plus 5% + 10¢.",
        note: "Supported scenario: US creator on Patreon's legacy 8% Pro plan, USD tier priced at $3 or less.",
        copyName: "Patreon Pro plan micropayment",
      },
    ],
  },
  {
    id: "kofi",
    toolId: "kofi-fees",
    provider: "Ko-fi",
    formHeading: "Payment details",
    scenarioLegend: "Which fees apply to this payment?",
    panelTone: "navy",
    taxHelp: "",
    scenarios: [
      {
        id: "stripe-5",
        presetId: "kofi-us-stripe-5-percent",
        label: "5% Ko-fi fee, card through Stripe",
        description: "Shop, membership, commission, monthly tip, or tip as a Contributor.",
        note: "Supported scenario: US creator in USD, supporter paying by US card through the creator's own Stripe account, with Ko-fi's 5% service fee.",
        copyName: "Ko-fi payment through Stripe",
      },
      {
        id: "stripe-0",
        presetId: "kofi-us-stripe-no-fee",
        label: "No Ko-fi fee, card through Stripe",
        description: "Ko-fi Gold, or a one-off tip without Contributor status.",
        note: "Supported scenario: US creator in USD with Ko-fi Gold or a one-off tip without Contributor status, paid by US card through Stripe.",
        copyName: "Ko-fi payment with no Ko-fi fee",
      },
      {
        id: "paypal-5",
        presetId: "kofi-us-paypal-5-percent",
        label: "5% Ko-fi fee, PayPal",
        description: "Ko-fi's fee only; PayPal's own fee is not added.",
        note: "Supported scenario: US creator in USD paid through PayPal. Only Ko-fi's 5% is estimated, because Ko-fi does not publish PayPal's fee.",
        copyName: "Ko-fi PayPal payment, Ko-fi fee only",
      },
    ],
  },
  {
    id: "substack",
    toolId: "substack-fees",
    provider: "Substack",
    formHeading: "Subscription details",
    scenarioLegend: "What card is the reader paying with?",
    panelTone: "ink",
    taxHelp: "",
    volume: {
      fieldLabel: "Paid subscribers (optional)",
      fieldHelp: "Subscribers paying this price each month. Adds monthly and yearly totals.",
      unitSingular: "subscriber",
      unitPlural: "subscribers",
      perPeriod: "a month",
      feesLabel: "Fees per month",
      keepLabel: "You keep per month",
      yearly: true,
      shareLabel: "Fees as a share of payments",
      shareNoun: "payments",
    },
    scenarios: [
      {
        id: "domestic",
        presetId: "substack-us-web-domestic-card",
        label: "US card on the web",
        description: "Substack's 10%, 2.9% + 30¢ card fee, and 0.7% Billing fee.",
        note: "Supported scenario: US writer with a US Stripe account, reader paying in USD on the web with a US card, and no sales tax collected.",
        copyName: "Substack subscription payment",
      },
      {
        id: "international",
        presetId: "substack-us-web-international-card",
        label: "International card in USD",
        description: "Adds Stripe's 1.5% international card fee, with no conversion.",
        note: "Supported scenario: US writer with a US Stripe account, reader paying in USD on the web with a card issued outside the US, no currency conversion, and no sales tax collected.",
        copyName: "Substack subscription payment by international card",
      },
    ],
  },
  {
    id: "payhip",
    toolId: "payhip-fees",
    provider: "Payhip",
    formHeading: "Sale details",
    scenarioLegend: "Which Payhip plan are you on?",
    panelTone: "navy",
    taxHelp: "",
    scenarios: [
      {
        id: "free",
        presetId: "payhip-us-free-stripe-card",
        label: "Free Forever plan",
        description: "$0 a month. 5% Payhip fee plus Stripe's 2.9% + 30¢.",
        note: "Supported scenario: US seller in USD on Payhip's Free Forever plan, a one-time sale paid by US card through Stripe, with no tax, shipping, or discount.",
        copyName: "Payhip Free plan sale",
      },
      {
        id: "plus",
        presetId: "payhip-us-plus-stripe-card",
        label: "Plus plan",
        description: "$29 a month. 2% Payhip fee plus Stripe's 2.9% + 30¢.",
        note: "Supported scenario: US seller in USD on Payhip's Plus plan, a one-time sale paid by US card through Stripe, with no tax, shipping, or discount. The $29 monthly price is not included.",
        copyName: "Payhip Plus plan sale",
      },
      {
        id: "pro",
        presetId: "payhip-us-pro-stripe-card",
        label: "Pro plan",
        description: "$99 a month. No Payhip fee; Stripe's 2.9% + 30¢ still applies.",
        note: "Supported scenario: US seller in USD on Payhip's Pro plan, a one-time sale paid by US card through Stripe, with no tax, shipping, or discount. The $99 monthly price is not included.",
        copyName: "Payhip Pro plan sale",
      },
    ],
  },
  {
    id: "podia",
    toolId: "podia-fees",
    provider: "Podia",
    formHeading: "Sale details",
    scenarioLegend: "Which Podia plan are you on?",
    panelTone: "ink",
    taxHelp: "",
    scenarios: [
      {
        id: "mover",
        presetId: "podia-us-mover-stripe-card",
        label: "Mover plan",
        description: "$49 a month. 5% Podia fee plus Stripe's 2.9% + 30¢.",
        note: "Supported scenario: US creator in USD on Podia's Mover plan, a sale paid by US card through the creator's own Stripe account, with no tax collected. The plan price is not included.",
        copyName: "Podia Mover plan sale",
      },
      {
        id: "no-fee",
        presetId: "podia-us-no-fee-stripe-card",
        label: "Shaker or Earthquaker plan",
        description: "$99 or $179 a month. No Podia fee; Stripe's 2.9% + 30¢ applies.",
        note: "Supported scenario: US creator in USD on Podia's Shaker or Earthquaker plan, a sale paid by US card through the creator's own Stripe account, with no tax collected. The plan price is not included.",
        copyName: "Podia sale with no Podia fee",
      },
    ],
  },
  {
    id: "whop",
    toolId: "whop-fees",
    provider: "Whop",
    formHeading: "Sale details",
    scenarioLegend: "Where is the buyer's card from?",
    panelTone: "navy",
    taxHelp: "",
    scenarios: [
      {
        id: "domestic",
        presetId: "whop-us-card",
        label: "US card",
        description: "Whop's standard 2.7% + 30¢ per successful card transaction.",
        note: "Supported scenario: US seller in USD on Whop's standard pricing, a card issued in the US, no add-ons enabled, and no tax collected.",
        copyName: "Whop sale",
      },
      {
        id: "international",
        presetId: "whop-us-international-card",
        label: "International card",
        description: "Adds Whop's 1.5% for cards issued outside the US.",
        note: "Supported scenario: US seller in USD on Whop's standard pricing, a card issued outside the US with no currency conversion, no add-ons enabled, and no tax collected.",
        copyName: "Whop sale on an international card",
      },
    ],
  },
  {
    id: "indiegogo",
    toolId: "indiegogo-fees",
    provider: "Indiegogo",
    formHeading: "Contribution details",
    scenarioLegend: "Which fees apply?",
    panelTone: "navy",
    taxHelp: "",
    volume: {
      fieldLabel: "Number of contributions (optional)",
      fieldHelp: "Same-size collected contributions. Adds campaign totals.",
      unitSingular: "contribution",
      unitPlural: "contributions",
      perPeriod: null,
      feesLabel: "Fees on these contributions",
      keepLabel: "You receive",
      yearly: false,
      shareLabel: "Fees as a share of funds raised",
      shareNoun: "funds raised",
    },
    scenarios: [
      {
        id: "funded",
        presetId: "indiegogo-us-contribution",
        label: "Project reaches its goal",
        description: "Indiegogo's 5% platform fee plus 3% + 20¢ processing.",
        note: "Supported scenario: US project in USD that reaches its goal, one collected contribution with no shipping, tax, or tip. A project that misses its goal pays nothing.",
        copyName: "Indiegogo contribution",
      },
    ],
  },
  {
    id: "skool",
    toolId: "skool-fees",
    provider: "Skool",
    formHeading: "Payment details",
    scenarioLegend: "Which plan and charge size?",
    panelTone: "navy",
    taxHelp: "",
    volume: {
      fieldLabel: "Paying members (optional)",
      fieldHelp: "Members paying this amount each month. Adds monthly and yearly totals.",
      unitSingular: "member",
      unitPlural: "members",
      perPeriod: "a month",
      feesLabel: "Fees per month",
      keepLabel: "You keep per month",
      yearly: true,
      shareLabel: "Fees as a share of payments",
      shareNoun: "payments",
    },
    scenarios: [
      {
        id: "pro",
        presetId: "skool-us-pro-standard",
        label: "Pro plan, charge up to $899",
        description: "2.9% + 30¢ per transaction. The plan costs $99 a month.",
        note: "Supported scenario: US creator on Skool's Pro plan with a charge of $899 or less, no tax. The $99 monthly plan price is not included.",
        copyName: "Skool Pro plan payment",
      },
      {
        id: "pro-large",
        presetId: "skool-us-pro-large",
        label: "Pro plan, charge of $900 or more",
        description: "3.9% + 30¢ per transaction, up to Skool's $100,000 limit.",
        note: "Supported scenario: US creator on Skool's Pro plan with a charge of $900 or more, no tax. The $99 monthly plan price is not included.",
        copyName: "Skool Pro plan payment above $900",
      },
      {
        id: "hobby",
        presetId: "skool-us-hobby",
        label: "Hobby plan",
        description: "10% + 30¢ per transaction. The plan costs $9 a month.",
        note: "Supported scenario: US creator on Skool's Hobby plan, no tax. The $9 monthly plan price is not included.",
        copyName: "Skool Hobby plan payment",
      },
    ],
  },
  {
    id: "teachable",
    toolId: "teachable-fees",
    provider: "Teachable",
    formHeading: "Sale details",
    scenarioLegend: "Which plan, and is it a subscription?",
    panelTone: "ink",
    taxHelp: "",
    scenarios: [
      {
        id: "starter",
        presetId: "teachable-us-starter-card",
        label: "Starter plan, one-time sale",
        description: "7.5% Teachable fee plus 2.9% + 30¢ card processing.",
        note: "Supported scenario: US school on Teachable's Starter plan, a one-time sale paid by US card through Teachable Payments on the Standard bundle, with no tax assessed. The $39 monthly plan price is not included.",
        copyName: "Teachable Starter plan sale",
      },
      {
        id: "paid",
        presetId: "teachable-us-paid-plan-card",
        label: "Builder or Growth plan, one-time sale",
        description: "No Teachable fee; 2.9% + 30¢ card processing.",
        note: "Supported scenario: US school on Teachable's Builder, Growth, or Advanced plan, a one-time sale paid by US card through Teachable Payments on the Standard bundle, with no tax assessed. The monthly plan price is not included.",
        copyName: "Teachable sale with no plan fee",
      },
      {
        id: "starter-subscription",
        presetId: "teachable-us-starter-subscription",
        label: "Starter plan, subscription payment",
        description: "Adds Teachable's 0.7% recurring transaction fee.",
        note: "Supported scenario: US school on Teachable's Starter plan, a subscription or payment plan instalment paid by US card through Teachable Payments on the Standard bundle, with no tax assessed.",
        copyName: "Teachable Starter plan subscription payment",
      },
      {
        id: "paid-subscription",
        presetId: "teachable-us-paid-plan-subscription",
        label: "Builder or Growth plan, subscription payment",
        description: "0.7% recurring fee plus 2.9% + 30¢ card processing.",
        note: "Supported scenario: US school on Teachable's Builder, Growth, or Advanced plan, a subscription or payment plan instalment paid by US card through Teachable Payments on the Standard bundle, with no tax assessed.",
        copyName: "Teachable subscription payment",
      },
    ],
  },
  {
    id: "gumroad",
    toolId: "gumroad-fees",
    provider: "Gumroad",
    formHeading: "Sale details",
    scenarioLegend: "What kind of sale was it?",
    panelTone: "ink",
    taxHelp: "",
    scenarios: [
      {
        id: "direct",
        presetId: "gumroad-us-direct-card",
        label: "Direct sale",
        description: "From your profile or a direct link, before the volume threshold.",
        note: "Supported scenario: US Gumroad creator account, USD direct sale paid by credit card, before the $20,000 calendar-month volume threshold, with no tax collected.",
        copyName: "Gumroad direct sale",
      },
      {
        id: "direct-high-volume",
        presetId: "gumroad-us-direct-card-high-volume",
        label: "Direct sale after threshold",
        description: "Your paid sales already passed $20,000 this calendar month.",
        note: "Supported scenario: US Gumroad creator account, USD direct credit-card sale after the account passed $20,000 in paid sales this calendar month, with no tax collected.",
        copyName: "Gumroad direct sale after the monthly threshold",
      },
      {
        id: "discover",
        presetId: "gumroad-us-discover",
        label: "Discover sale",
        description: "A new customer found the product through Gumroad Discover.",
        note: "Supported scenario: US Gumroad creator account, USD sale made through Gumroad's Discover marketplace, with no tax collected.",
        copyName: "Gumroad Discover sale",
      },
    ],
  },
  {
    id: "lemon-squeezy",
    toolId: "lemon-squeezy-fees",
    provider: "Lemon Squeezy",
    formHeading: "Order details",
    scenarioLegend: "What kind of order is it?",
    panelTone: "navy",
    taxHelp:
      "Tax Lemon Squeezy added to the order. The platform fee is calculated on the total including it, and the tax itself is passed on, not kept.",
    scenarios: [
      {
        id: "domestic",
        presetId: "lemon-squeezy-us-domestic-card",
        label: "US card order",
        description: "A one-time card order from a buyer in the US.",
        note: "Supported scenario: store selling in USD, one-time card order from a buyer in the US.",
        copyName: "Lemon Squeezy US card order",
      },
      {
        id: "international",
        presetId: "lemon-squeezy-us-international-card",
        label: "International card order",
        description: "A one-time card order from a buyer outside the US.",
        note: "Supported scenario: store selling in USD, one-time card order from a buyer outside the US.",
        copyName: "Lemon Squeezy international card order",
      },
      {
        id: "paypal",
        presetId: "lemon-squeezy-us-paypal",
        label: "PayPal order",
        description: "A one-time PayPal order from a buyer in the US.",
        note: "Supported scenario: store selling in USD, one-time PayPal order from a buyer in the US.",
        copyName: "Lemon Squeezy PayPal order",
      },
      {
        id: "subscription",
        presetId: "lemon-squeezy-us-subscription",
        label: "Subscription payment",
        description: "A card subscription payment from a buyer in the US.",
        note: "Supported scenario: store selling in USD, card subscription payment from a buyer in the US.",
        copyName: "Lemon Squeezy subscription payment",
      },
    ],
  },
];

export function findFeeCalculator(id: string): FeeCalculatorConfig {
  const config = feeCalculators.find((candidate) => candidate.id === id);

  if (!config) throw new Error(`Unknown fee calculator: ${id}`);

  return config;
}
