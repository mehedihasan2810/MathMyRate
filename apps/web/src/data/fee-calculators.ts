/**
 * Scenario menus for the four fee calculators. Each scenario points at one
 * official preset; rates, assumptions, and sources live in the preset, never here.
 */

export type FeeCalculatorId = "stripe" | "paypal" | "gumroad" | "lemon-squeezy";

export interface FeeScenario {
  readonly id: string;
  readonly presetId: string;
  readonly label: string;
  readonly description: string;
  /** Names the supported scenario above the form. */
  readonly note: string;
  /** Names the payment in copied results, for example "Stripe domestic card payment". */
  readonly copyName: string;
}

export interface FeeCalculatorConfig {
  readonly id: FeeCalculatorId;
  readonly provider: string;
  readonly formHeading: string;
  readonly scenarioLegend: string;
  readonly panelTone: "navy" | "ink";
  /** Help text for the tax field, shown only for scenarios that accept tax. */
  readonly taxHelp: string;
  readonly scenarios: readonly FeeScenario[];
}

export const feeCalculators: readonly FeeCalculatorConfig[] = [
  {
    id: "stripe",
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
    id: "gumroad",
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
