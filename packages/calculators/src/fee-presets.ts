export type FeePresetOrigin = "official" | "custom";

export interface FeeComponent {
  readonly id: string;
  readonly label: string;
  readonly rateBps: number;
  readonly fixedCents: number;
  readonly base: "gross";
  readonly rounding: "half-up";
}

export interface FeePreset {
  readonly id: string;
  readonly label: string;
  readonly provider: string;
  readonly origin: FeePresetOrigin;
  /**
   * `kind` is retained as an explicit, redundant provenance marker for
   * serialized records. It must agree with `origin` whenever supplied.
   */
  readonly kind?: FeePresetOrigin;
  readonly currency: "USD";
  readonly accountCountry: "US";
  readonly taxMode: "caller-supplied" | "zero-only";
  readonly paymentProduct: string;
  readonly channel: string;
  readonly combinationPolicy: "exact-scenario-only";
  readonly effectiveFrom: string | null;
  readonly tierPolicy:
    | "explicitly-excluded"
    | "pre-threshold"
    | "post-threshold"
    | "not-applicable";
  readonly capsPolicy: "none-modeled";
  readonly customPricingPolicy: "excluded" | "user-supplied";
  readonly revision: number;
  readonly components: readonly FeeComponent[];
  readonly sources: readonly {
    readonly url: string;
    readonly title: string;
  }[];
  /** Null for custom rules: a custom record has not been officially reviewed. */
  readonly checkedOn: string | null;
  readonly assumptions: readonly string[];
  readonly exclusions: readonly string[];
  readonly status: "supported" | "blocked";
  readonly blockedReason?: string;
}

const checkedOn = "2026-09-15";

const stripePricing = {
  url: "https://stripe.com/pricing",
  title: "Pricing & Fees | Stripe",
};

const paypalMerchantFees = {
  url: "https://www.paypal.com/us/business/paypal-business-fees",
  title: "PayPal Merchant Fees | PayPal US",
};

const gumroadPricing = {
  url: "https://gumroad.com/pricing",
  title: "Gumroad pricing: 10% + 50¢ direct, 30% via Discover",
};

const gumroadFees = {
  url: "https://gumroad.com/help/article/66-gumroads-fees.html",
  title: "Gumroad's fees - Gumroad Help Center",
};

const lemonFees = {
  url: "https://docs.lemonsqueezy.com/help/getting-started/fees",
  title: "Docs: Fees • Lemon Squeezy",
};

const lemonSalesTax = {
  url: "https://docs.lemonsqueezy.com/help/payments/sales-tax-vat",
  title: "Docs: Sales Tax and VAT • Lemon Squeezy",
};

const lemonGettingPaid = {
  url: "https://docs.lemonsqueezy.com/help/getting-started/getting-paid",
  title: "Docs: Getting Paid • Lemon Squeezy",
};

/**
 * Official rates are represented as linear estimates only where the selected
 * product and transaction state are explicit. A component's rate is applied to
 * the gross order amount by the fee engine; provider-specific rounding is not
 * asserted by these records.
 */
const officialDefaults = {
  origin: "official" as const,
  kind: "official" as const,
  currency: "USD" as const,
  accountCountry: "US" as const,
  checkedOn,
  effectiveFrom: null,
  combinationPolicy: "exact-scenario-only" as const,
  capsPolicy: "none-modeled" as const,
  customPricingPolicy: "excluded" as const,
  revision: 1,
};

type OfficialDefinition = Omit<
  FeePreset,
  | "origin"
  | "kind"
  | "currency"
  | "accountCountry"
  | "checkedOn"
  | "effectiveFrom"
  | "combinationPolicy"
  | "capsPolicy"
  | "customPricingPolicy"
  | "revision"
  | "components"
> & {
  components: Array<Omit<FeeComponent, "rounding">>;
} & Partial<
    Pick<
      FeePreset,
      | "currency"
      | "accountCountry"
      | "checkedOn"
      | "effectiveFrom"
      | "combinationPolicy"
      | "capsPolicy"
      | "customPricingPolicy"
      | "revision"
    >
  >;

function official(preset: OfficialDefinition): FeePreset {
  return {
    ...officialDefaults,
    ...preset,
    components: preset.components.map((component) => ({
      ...component,
      rounding: "half-up" as const,
    })),
  };
}

function freezeFeePreset(preset: FeePreset): FeePreset {
  for (const component of preset.components) {
    Object.freeze(component);
  }

  for (const source of preset.sources) {
    Object.freeze(source);
  }

  Object.freeze(preset.components);
  Object.freeze(preset.sources);
  Object.freeze(preset.assumptions);
  Object.freeze(preset.exclusions);

  return Object.freeze(preset);
}

const officialPresetRecords: FeePreset[] = [
  official({
    id: "stripe-us-online-domestic-card",
    label: "Stripe US standard online domestic card",
    provider: "stripe",
    taxMode: "caller-supplied",
    paymentProduct: "Stripe Payments",
    channel: "online",
    tierPolicy: "not-applicable",
    revision: 2,
    components: [
      {
        id: "stripe-processing",
        label: "Stripe card processing",
        rateBps: 290,
        fixedCents: 30,
        base: "gross",
      },
    ],
    sources: [stripePricing],
    assumptions: [
      "US Stripe account charging a USD amount through standard online Payments pricing.",
      "The card is issued in the US, entered by the customer online, and the charge succeeds.",
      "The estimator rounds each component to cents; Stripe's published page does not establish a component-rounding policy.",
    ],
    exclusions: [
      "International cards and manually entered cards (separate scenarios), currency conversion, in-person payments, ACH Direct Debit, and other payment methods.",
      "Connect, Billing, Tax, disputes, refunds, Instant Payouts, custom pricing, and negotiated volume discounts.",
    ],
    status: "supported",
  }),
  official({
    id: "stripe-us-online-international-card",
    label: "Stripe US standard online international card",
    provider: "stripe",
    taxMode: "caller-supplied",
    paymentProduct: "Stripe Payments",
    channel: "online",
    tierPolicy: "not-applicable",
    components: [
      {
        id: "stripe-processing",
        label: "Stripe card processing",
        rateBps: 290,
        fixedCents: 30,
        base: "gross",
      },
      {
        id: "stripe-international-card",
        label: "Stripe international card fee",
        rateBps: 150,
        fixedCents: 0,
        base: "gross",
      },
    ],
    sources: [stripePricing],
    assumptions: [
      "US Stripe account charging a USD amount through standard online Payments pricing, with a card issued outside the US.",
      'Stripe\'s pricing page lists "+ 1.5% for international cards" under the 2.9% + 30¢ domestic rate. This estimate adds the two, because no page states the combined rate in words.',
      "No currency conversion is needed. Stripe adds 1% when conversion is required, which this scenario does not model.",
      "The estimator rounds each component to cents; Stripe's published page does not establish a component-rounding policy.",
    ],
    exclusions: [
      "Currency conversion, manually entered cards, in-person payments, and non-card payment methods.",
      "Connect, Billing, Tax, disputes, refunds, Instant Payouts, custom pricing, and negotiated volume discounts.",
    ],
    status: "supported",
  }),
  official({
    id: "stripe-us-online-manual-domestic-card",
    label: "Stripe US manually entered domestic card",
    provider: "stripe",
    taxMode: "caller-supplied",
    paymentProduct: "Stripe Payments",
    channel: "manual entry",
    tierPolicy: "not-applicable",
    components: [
      {
        id: "stripe-processing",
        label: "Stripe card processing",
        rateBps: 290,
        fixedCents: 30,
        base: "gross",
      },
      {
        id: "stripe-manual-entry",
        label: "Stripe manually entered card fee",
        rateBps: 50,
        fixedCents: 0,
        base: "gross",
      },
    ],
    sources: [stripePricing],
    assumptions: [
      "US Stripe account charging a USD amount with a US-issued card that is entered manually.",
      'Stripe\'s pricing page lists "+ 0.5% for manually entered cards" under the 2.9% + 30¢ domestic rate. This estimate adds the two, because no page states the combined rate in words.',
      "The pricing page does not define which entry methods count as manually entered.",
      "The estimator rounds each component to cents; Stripe's published page does not establish a component-rounding policy.",
    ],
    exclusions: [
      "International manually entered cards, currency conversion, in-person payments, and non-card payment methods.",
      "Connect, Billing, Tax, disputes, refunds, Instant Payouts, custom pricing, and negotiated volume discounts.",
    ],
    status: "supported",
  }),
  official({
    id: "paypal-us-checkout-paypal-payment",
    label: "PayPal US PayPal Checkout payment",
    provider: "paypal",
    taxMode: "caller-supplied",
    paymentProduct: "PayPal Checkout",
    channel: "online",
    tierPolicy: "not-applicable",
    revision: 2,
    components: [
      {
        id: "paypal-checkout-processing",
        label: "PayPal Checkout fee",
        rateBps: 349,
        fixedCents: 49,
        base: "gross",
      },
    ],
    sources: [paypalMerchantFees],
    assumptions: [
      "US PayPal Business account receiving a domestic USD commercial transaction.",
      "The buyer pays through PayPal Checkout. PayPal lists PayPal Checkout, PayPal Guest Checkout, and Pay with Venmo at the same 3.49% + fixed fee, and the USD fixed fee is 0.49 USD.",
      "The estimator rounds each component to cents; PayPal's published pages do not establish a component-rounding policy.",
    ],
    exclusions: [
      "Card payments, Pay Later, invoices, QR codes, micropayments, and international transactions.",
      "Currency conversion, refunds (PayPal does not return the original fees), disputes, chargebacks, instant transfers, and custom pricing.",
    ],
    status: "supported",
  }),
  official({
    id: "paypal-us-standard-card-payment",
    label: "PayPal US standard credit and debit card payment",
    provider: "paypal",
    taxMode: "caller-supplied",
    paymentProduct: "PayPal Standard Credit and Debit Card Payments",
    channel: "online",
    tierPolicy: "not-applicable",
    components: [
      {
        id: "paypal-standard-card",
        label: "PayPal standard card payment fee",
        rateBps: 299,
        fixedCents: 49,
        base: "gross",
      },
    ],
    sources: [paypalMerchantFees],
    assumptions: [
      "US PayPal Business account receiving a domestic USD commercial transaction paid by card through Standard Credit and Debit Card Payments.",
      "PayPal lists this product at 2.99% + fixed fee, and the USD fixed fee is 0.49 USD.",
      "The estimator rounds each component to cents; PayPal's published pages do not establish a component-rounding policy.",
    ],
    exclusions: [
      "Advanced Credit and Debit Card Payments, Interchange Plus Plus pricing, Virtual Terminal, and international transactions.",
      "Currency conversion, refunds (PayPal does not return the original fees), disputes, chargebacks, instant transfers, and custom pricing.",
    ],
    status: "supported",
  }),
  official({
    id: "paypal-us-invoice-paypal-payment",
    label: "PayPal US invoice paid through PayPal",
    provider: "paypal",
    taxMode: "caller-supplied",
    paymentProduct: "PayPal Invoicing",
    channel: "invoice",
    tierPolicy: "not-applicable",
    components: [
      {
        id: "paypal-invoice-paypal",
        label: "PayPal invoicing fee",
        rateBps: 349,
        fixedCents: 49,
        base: "gross",
      },
    ],
    sources: [paypalMerchantFees],
    assumptions: [
      "US PayPal Business account receiving a domestic USD invoicing transaction.",
      "The customer pays the invoice with PayPal Checkout, Pay with Venmo, or PayPal Guest Checkout, which PayPal lists at 3.49% + fixed fee, with a 0.49 USD fixed fee.",
      "The estimator rounds each component to cents; PayPal's published pages do not establish a component-rounding policy.",
    ],
    exclusions: [
      "Invoices paid by card or wallet, Pay Later, or Pay by Bank; international invoices; and the optional 14.99 USD monthly Invoice Subscription.",
      "Currency conversion, refunds (PayPal does not return the original fees), disputes, chargebacks, instant transfers, and custom pricing.",
    ],
    status: "supported",
  }),
  official({
    id: "paypal-us-invoice-card-payment",
    label: "PayPal US invoice paid by card",
    provider: "paypal",
    taxMode: "caller-supplied",
    paymentProduct: "PayPal Invoicing",
    channel: "invoice",
    tierPolicy: "not-applicable",
    components: [
      {
        id: "paypal-invoice-card",
        label: "PayPal invoicing card fee",
        rateBps: 299,
        fixedCents: 49,
        base: "gross",
      },
    ],
    sources: [paypalMerchantFees],
    assumptions: [
      "US PayPal Business account receiving a domestic USD invoicing transaction.",
      "The customer pays the invoice with a standard credit or debit card, Apple Pay, or another third-party wallet, which PayPal lists at 2.99% + fixed fee, with a 0.49 USD fixed fee.",
      "The estimator rounds each component to cents; PayPal's published pages do not establish a component-rounding policy.",
    ],
    exclusions: [
      "Invoices paid through PayPal, Pay Later, or Pay by Bank; international invoices; and the optional 14.99 USD monthly Invoice Subscription.",
      "Currency conversion, refunds (PayPal does not return the original fees), disputes, chargebacks, instant transfers, and custom pricing.",
    ],
    status: "supported",
  }),
  official({
    id: "paypal-us-checkout-international",
    label: "PayPal US international PayPal Checkout payment",
    provider: "paypal",
    taxMode: "caller-supplied",
    paymentProduct: "PayPal Checkout",
    channel: "online",
    tierPolicy: "not-applicable",
    components: [
      {
        id: "paypal-checkout-processing",
        label: "PayPal Checkout fee",
        rateBps: 349,
        fixedCents: 49,
        base: "gross",
      },
      {
        id: "paypal-international",
        label: "PayPal international transaction fee",
        rateBps: 150,
        fixedCents: 0,
        base: "gross",
      },
    ],
    sources: [paypalMerchantFees],
    assumptions: [
      "US PayPal Business account receiving a USD commercial transaction through PayPal Checkout from a buyer in another market.",
      "PayPal defines a transaction as international when the sender and receiver are residents of different markets, and states that the domestic fee applies plus an additional 1.50% for international commercial transactions.",
      "No currency conversion is involved. A conversion adds a spread to PayPal's exchange rate, which this calculator does not model.",
      "The estimator rounds each component to cents; PayPal's published pages do not establish a component-rounding policy.",
    ],
    exclusions: [
      "Card payments, invoices, QR codes, micropayments, and Pay Later.",
      "Currency conversion, refunds (PayPal does not return the original fees), disputes, chargebacks, instant transfers, and custom pricing.",
    ],
    status: "supported",
  }),
  official({
    id: "paypal-us-qr-code",
    label: "PayPal US QR code payment",
    provider: "paypal",
    taxMode: "caller-supplied",
    paymentProduct: "PayPal QR code transactions",
    channel: "in-person",
    tierPolicy: "not-applicable",
    components: [
      {
        id: "paypal-qr-code",
        label: "PayPal QR code fee",
        rateBps: 229,
        fixedCents: 9,
        base: "gross",
      },
    ],
    sources: [paypalMerchantFees],
    assumptions: [
      "US PayPal Business account receiving a domestic USD QR code transaction.",
      "PayPal lists QR code transactions at 2.29% + fixed fee with a 0.09 USD fixed fee, and the same rate through third-party integrators and PayPal Point of Sale.",
      "The estimator rounds each component to cents; PayPal's published pages do not establish a component-rounding policy.",
    ],
    exclusions: [
      "International QR code transactions, which the fee page does not price separately, and card-present or manually entered card payments at PayPal Point of Sale.",
      "Currency conversion, refunds (PayPal does not return the original fees), disputes, chargebacks, instant transfers, and custom pricing.",
    ],
    status: "supported",
  }),
  official({
    id: "gumroad-us-direct-card",
    label: "Gumroad US direct sale with card processing",
    provider: "gumroad",
    taxMode: "zero-only",
    paymentProduct: "Gumroad direct sale",
    channel: "online",
    tierPolicy: "pre-threshold",
    revision: 2,
    components: [
      {
        id: "gumroad-direct-platform",
        label: "Gumroad direct-sale fee",
        rateBps: 1000,
        fixedCents: 50,
        base: "gross",
      },
      {
        id: "gumroad-direct-card-processing",
        label: "Gumroad direct-sale credit-card processing",
        rateBps: 290,
        fixedCents: 30,
        base: "gross",
      },
    ],
    sources: [gumroadPricing, gumroadFees],
    assumptions: [
      "US creator account and USD direct sale through the creator's profile or a direct customer link.",
      "This is a new direct sale before the documented calendar-month high-volume threshold, paid by credit card.",
      "Gumroad's fee list says its 10% + $0.50 fee does not include credit card processing (2.9% + $0.30), so this estimate adds both. Gumroad's refund section calls processing a portion of the fee, which conflicts with that list; the estimate follows the fee list.",
      "Gumroad is the merchant of record and adds sales tax on top of the price. This scenario covers an order with no tax collected.",
      "The estimator rounds each component to cents; Gumroad's published pages do not establish a component-rounding policy.",
    ],
    exclusions: [
      "PayPal sales, whose processing rate Gumroad does not publish; sales tax; Discover sales; affiliate splits; refunds; Stripe Connect and PayPal Connect accounts; custom account fees; payouts; and the sale that crosses the threshold.",
    ],
    status: "supported",
  }),
  official({
    id: "gumroad-us-direct-card-high-volume",
    label: "Gumroad US direct card sale after monthly volume threshold",
    provider: "gumroad",
    taxMode: "zero-only",
    paymentProduct: "Gumroad direct sale",
    channel: "online",
    tierPolicy: "post-threshold",
    revision: 2,
    components: [
      {
        id: "gumroad-direct-high-volume-platform",
        label: "Gumroad high-volume direct-sale fee",
        rateBps: 500,
        fixedCents: 50,
        base: "gross",
      },
      {
        id: "gumroad-direct-high-volume-card-processing",
        label: "Gumroad direct-sale credit-card processing",
        rateBps: 290,
        fixedCents: 30,
        base: "gross",
      },
    ],
    sources: [gumroadFees],
    assumptions: [
      "US creator account and USD direct credit-card sale.",
      "The account has already reached $20,000 in paid sales in the current calendar month before this new direct sale, so Gumroad's fee is 5% + $0.50.",
      "Card processing (2.9% + $0.30) stays separate, as in the pre-threshold scenario. Gumroad's refund section describes processing as a portion of the fee; the estimate follows the fee list.",
      "Gumroad is the merchant of record and adds sales tax on top of the price. This scenario covers an order with no tax collected.",
      "The estimator rounds each component to cents; Gumroad's published pages do not establish a component-rounding policy.",
    ],
    exclusions: [
      "The sale that crosses the threshold, a blended month-to-date total, Discover sales, PayPal sales, sales tax, affiliate splits, refunds, custom account fees, and payouts.",
    ],
    status: "supported",
  }),
  official({
    id: "gumroad-us-discover",
    label: "Gumroad US Discover marketplace sale",
    provider: "gumroad",
    taxMode: "zero-only",
    paymentProduct: "Gumroad Discover marketplace",
    channel: "online",
    tierPolicy: "not-applicable",
    revision: 2,
    components: [
      {
        id: "gumroad-discover",
        label: "Gumroad Discover marketplace fee",
        rateBps: 3000,
        fixedCents: 0,
        base: "gross",
      },
    ],
    sources: [gumroadPricing, gumroadFees],
    assumptions: [
      "US creator account and USD sale made when a new customer finds the product through Gumroad Discover.",
      "Gumroad's flat 30% Discover fee includes all processing fees.",
      "Gumroad is the merchant of record and adds sales tax on top of the price. This scenario covers an order with no tax collected.",
      "The estimator rounds each component to cents; Gumroad's published pages do not establish a component-rounding policy.",
    ],
    exclusions: [
      "Direct and profile sales, high-volume direct discounts, sales tax, affiliate splits, refunds, custom account fees, and payouts.",
    ],
    status: "supported",
  }),
  official({
    id: "gumroad-us-direct-threshold-crossing",
    label: "Gumroad US direct sale crossing the monthly volume threshold",
    provider: "gumroad",
    taxMode: "zero-only",
    paymentProduct: "Gumroad direct sale",
    channel: "online",
    tierPolicy: "explicitly-excluded",
    components: [],
    sources: [gumroadFees],
    assumptions: [
      "The account and sale are otherwise a US-account/USD direct sale.",
      "The calculator does not receive the month-to-date paid-sales total or a provider-defined split for the threshold-crossing transaction.",
    ],
    exclusions: [
      "No blended fee is inferred for a transaction that reaches $20,000; use the documented pre-threshold and post-threshold scenarios only when their state is known.",
    ],
    status: "blocked",
    blockedReason:
      "Gumroad documents separate pre-threshold and new post-threshold rates, but it does not provide a blended calculation for the transaction that crosses the threshold.",
  }),
  official({
    id: "lemon-squeezy-us-domestic-card",
    label: "Lemon Squeezy US store, domestic card order",
    provider: "lemon-squeezy",
    taxMode: "caller-supplied",
    paymentProduct: "Lemon Squeezy single order",
    channel: "online",
    tierPolicy: "not-applicable",
    components: [
      {
        id: "lemon-squeezy-platform",
        label: "Lemon Squeezy platform fee",
        rateBps: 500,
        fixedCents: 50,
        base: "gross",
      },
    ],
    sources: [lemonFees, lemonSalesTax],
    assumptions: [
      "A store selling in USD. Lemon Squeezy publishes one rate card for all stores.",
      "A one-time card order from a buyer in the US.",
      "The platform fee is calculated on the total order value, including any tax collected, as the fee page states and its worked examples show.",
      "Tax is an amount you supply from the order. Lemon Squeezy collects and remits it as merchant of record; this calculator never computes it.",
      "The estimator rounds each component to cents; Lemon Squeezy's published pages do not establish a universal component-rounding policy.",
    ],
    exclusions: [
      "International orders, PayPal orders, and subscription payments, which are separate scenarios, and any combination of those additional fees.",
      "Abandoned cart recovery and affiliate fees, refunds, the $15 dispute fee, payout fees, and custom pricing.",
    ],
    status: "supported",
  }),
  official({
    id: "lemon-squeezy-us-international-card",
    label: "Lemon Squeezy US store, international card order",
    provider: "lemon-squeezy",
    taxMode: "caller-supplied",
    paymentProduct: "Lemon Squeezy single order",
    channel: "online",
    tierPolicy: "not-applicable",
    revision: 2,
    components: [
      {
        id: "lemon-squeezy-platform",
        label: "Lemon Squeezy platform fee",
        rateBps: 500,
        fixedCents: 50,
        base: "gross",
      },
      {
        id: "lemon-squeezy-international",
        label: "Lemon Squeezy international transaction fee",
        rateBps: 150,
        fixedCents: 0,
        base: "gross",
      },
    ],
    sources: [lemonFees, lemonSalesTax],
    assumptions: [
      "A store selling in USD, with a one-time card order from a buyer outside the US, which Lemon Squeezy treats as an international transaction.",
      "The fee page's worked example charges $0.50 plus 5% plus 1.5% of the tax-inclusive order total for an international card order.",
      "The fee page does not say whether billing address, card country, or location decides that a buyer is outside the US.",
      "Tax is an amount you supply from the order; this calculator never computes it.",
      "The estimator rounds each component to cents; Lemon Squeezy's published pages do not establish a universal component-rounding policy.",
    ],
    exclusions: [
      "International PayPal orders and international subscription payments, because the fee page does not say whether its additional fees combine.",
      "Abandoned cart recovery and affiliate fees, refunds, the $15 dispute fee, payout fees, and custom pricing.",
    ],
    status: "supported",
  }),
  official({
    id: "lemon-squeezy-us-paypal",
    label: "Lemon Squeezy US store, PayPal order",
    provider: "lemon-squeezy",
    taxMode: "caller-supplied",
    paymentProduct: "Lemon Squeezy PayPal order",
    channel: "online",
    tierPolicy: "not-applicable",
    revision: 2,
    components: [
      {
        id: "lemon-squeezy-platform",
        label: "Lemon Squeezy platform fee",
        rateBps: 500,
        fixedCents: 50,
        base: "gross",
      },
      {
        id: "lemon-squeezy-paypal",
        label: "Lemon Squeezy PayPal transaction fee",
        rateBps: 150,
        fixedCents: 0,
        base: "gross",
      },
    ],
    sources: [lemonFees, lemonSalesTax],
    assumptions: [
      "A store selling in USD, with a one-time order paid with PayPal by a buyer in the US.",
      "The fee page adds 1.5% for PayPal transactions to the 5% + 50¢ platform fee, calculated on the total order value.",
      "Tax is an amount you supply from the order; this calculator never computes it.",
      "The estimator rounds each component to cents; Lemon Squeezy's published pages do not establish a universal component-rounding policy.",
    ],
    exclusions: [
      "International PayPal orders and PayPal subscription payments, because the fee page does not say whether its additional fees combine.",
      "Abandoned cart recovery and affiliate fees, refunds, the $15 dispute fee, payout fees, and custom pricing.",
    ],
    status: "supported",
  }),
  official({
    id: "lemon-squeezy-us-subscription",
    label: "Lemon Squeezy US store, subscription payment",
    provider: "lemon-squeezy",
    taxMode: "caller-supplied",
    paymentProduct: "Lemon Squeezy subscription",
    channel: "online",
    tierPolicy: "not-applicable",
    revision: 2,
    components: [
      {
        id: "lemon-squeezy-platform",
        label: "Lemon Squeezy platform fee",
        rateBps: 500,
        fixedCents: 50,
        base: "gross",
      },
      {
        id: "lemon-squeezy-subscription",
        label: "Lemon Squeezy subscription payment fee",
        rateBps: 50,
        fixedCents: 0,
        base: "gross",
      },
    ],
    sources: [lemonFees, lemonSalesTax],
    assumptions: [
      "A store selling in USD, with a subscription payment by card from a buyer in the US.",
      "The fee page adds 0.5% for subscription payments. It does not say whether the first payment and renewals differ, so this applies the fee to each subscription payment.",
      "Tax is an amount you supply from the order; this calculator never computes it.",
      "The estimator rounds each component to cents; Lemon Squeezy's published pages do not establish a universal component-rounding policy.",
    ],
    exclusions: [
      "International or PayPal subscription payments, because the fee page does not say whether its additional fees combine.",
      "Abandoned cart recovery and affiliate fees, refunds, the $15 dispute fee, payout fees, and custom pricing.",
    ],
    status: "supported",
  }),
  official({
    id: "lemon-squeezy-payout",
    label: "Lemon Squeezy payout fee",
    provider: "lemon-squeezy",
    taxMode: "zero-only",
    paymentProduct: "Lemon Squeezy payout",
    channel: "online",
    tierPolicy: "explicitly-excluded",
    revision: 2,
    components: [],
    sources: [lemonFees, lemonGettingPaid],
    assumptions: [
      "Payouts are batch-level rather than fees on each order.",
      "The provider's documented payout amount depends on payout method, region, and settlement currency.",
    ],
    exclusions: [
      "No payout fee is added to an individual order or represented as a per-transaction fixed component.",
    ],
    status: "blocked",
    blockedReason:
      "Payout costs are separate from order fees: Stripe bank payouts are free for US bank accounts and 1% outside the US, and PayPal payouts are $0.50 in the US and 3% capped at $30 outside the US. The payout method and region are not order inputs.",
  }),
];

/** The only records that may claim official provenance. */
export const feePresets: readonly FeePreset[] = officialPresetRecords.map(freezeFeePreset);

const officialById = new Map(feePresets.map((preset) => [preset.id, preset]));

const officialSourceUrls = new Set(
  feePresets.flatMap((preset) => preset.sources.map((source) => source.url)),
);

/**
 * Resolve an official preset to the immutable registry object. Consumers should
 * pass this object to the engine rather than copying official configuration.
 */
export function getFeePreset(id: string): FeePreset | undefined {
  return officialById.get(id);
}

export function isOfficialSourceUrl(url: string): boolean {
  return officialSourceUrls.has(url);
}
