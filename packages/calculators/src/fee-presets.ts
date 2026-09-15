export type FeePresetOrigin = "official" | "custom";

export interface FeeComponent {
  readonly id: string;
  readonly label: string;
  readonly rateBps: number;
  readonly fixedCents: number;
  /**
   * The amount the percentage applies to: the whole charge, or the charge
   * less the caller-supplied tax, for fees a provider documents as excluding tax.
   */
  readonly base: "gross" | "gross-excluding-tax";
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
  /**
   * The charges this scenario covers, when a provider's rate changes at a
   * documented amount, such as a per-order fee that differs above $10. The
   * engine refuses a charge outside the range instead of mixing two rates.
   */
  readonly grossRangeCents?: { readonly minCents?: number; readonly maxCents?: number };
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

const squarePricing = {
  url: "https://squareup.com/us/en/pricing",
  title: "Square Processing Fees, Plans, and Software Pricing | Square",
};

const squareFees = {
  url: "https://squareup.com/help/us/en/article/5068-what-are-square-s-fees",
  title: "Learn about Square fees | Square Support Center - United States",
};

const etsyFeesPolicy = {
  url: "https://www.etsy.com/legal/fees/",
  title: "Fees & Payments Policy - Our House Rules | Etsy",
};

const etsyPaymentsPolicy = {
  url: "https://www.etsy.com/legal/etsy-payments/",
  title: "Etsy Payments Policy - Our House Rules | Etsy",
};

const ebaySellingFees = {
  url: "https://www.ebay.com/help/selling/fees-credits-invoices/selling-fees?id=4822",
  title: "Selling fees | eBay",
};

const ebayStoreFees = {
  url: "https://www.ebay.com/help/selling/fees-credits-invoices/store-selling-fees-managed-payments-sellers?id=4809",
  title: "Store selling fees | eBay",
};

const kickstarterFees = {
  url: "https://www.kickstarter.com/help/fees",
  title: "Fees: United States — Kickstarter",
};

const kickstarterFeesHelp = {
  url: "https://help.kickstarter.com/en-us/articles/16236674-what-are-the-fees",
  title: "What are the fees? | Kickstarter Help Center",
};

const patreonPricing = {
  url: "https://www.patreon.com/pricing",
  title: "Patreon Pricing Plans — Patreon",
};

const patreonFees = {
  url: "https://support.patreon.com/hc/en-us/articles/11111747095181-Creator-fees-overview",
  title: "Creator fees overview",
};

const patreonIos = {
  url: "https://support.patreon.com/hc/en-us/articles/20009513905933-How-iOS-in-app-payment-works-for-one-time-purchases",
  title: "How iOS in-app payment works for one-time purchases",
};

const kofiFees = {
  url: "https://help.ko-fi.com/hc/en-us/articles/360002506494-Does-Ko-fi-take-a-fee",
  title: "Does Ko-fi take a fee?",
};

const kofiGold = {
  url: "https://help.ko-fi.com/hc/en-us/articles/360005506873-What-is-Ko-fi-Gold",
  title: "What is Ko-fi Gold?",
};

const kofiStripe = {
  url: "https://help.ko-fi.com/hc/en-us/articles/360007522474-Connect-your-Stripe-account-and-start-earning",
  title: "Connect your Stripe account and start earning ✨",
};

const substackCost = {
  url: "https://support.substack.com/hc/en-us/articles/360037607131-How-much-does-Substack-cost",
  title: "How much does Substack cost?",
};

const stripeBillingPricing = {
  url: "https://stripe.com/billing/pricing",
  title: "Stripe Billing | Pricing",
};

const payhipPricing = {
  url: "https://payhip.com/pricing",
  title: "Pricing - Payhip",
};

const payhipBilling = {
  url: "https://help.payhip.com/article/102-billing-and-upgrading",
  title: "Billing and Upgrading - Help Center",
};

const payhipStripe = {
  url: "https://help.payhip.com/article/65-connecting-your-stripe-account",
  title: "Connect Your Stripe Account - Help Center",
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

  if (preset.grossRangeCents) Object.freeze(preset.grossRangeCents);

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
    id: "square-us-free-in-person-card",
    label: "Square Free in-person card payment",
    provider: "square",
    taxMode: "caller-supplied",
    paymentProduct: "Square Free",
    channel: "in-person",
    tierPolicy: "not-applicable",
    components: [
      {
        id: "square-in-person-processing",
        label: "Square in-person processing",
        rateBps: 260,
        fixedCents: 15,
        base: "gross",
      },
    ],
    sources: [squarePricing, squareFees],
    assumptions: [
      "US Square account on the Square Free plan, charging USD for a US-issued card that is tapped, dipped, or swiped in person.",
      "Square's fees article says processing fees are taken out of the total amount of each transaction, including tax and tip.",
      "The estimator rounds each component to cents; Square's published pages do not establish a rounding policy.",
    ],
    exclusions: [
      "Cards issued outside the US, online and invoice payments, manually entered and card-on-file payments, Afterpay, Cash App Pay, and ACH bank transfers.",
      "Monthly plan fees, refunds, disputes, instant and same-day transfers, Square Pro, and custom pricing.",
    ],
    status: "supported",
  }),
  official({
    id: "square-us-plus-in-person-card",
    label: "Square Plus in-person card payment",
    provider: "square",
    taxMode: "caller-supplied",
    paymentProduct: "Square Plus",
    channel: "in-person",
    tierPolicy: "not-applicable",
    components: [
      {
        id: "square-in-person-processing",
        label: "Square in-person processing",
        rateBps: 250,
        fixedCents: 15,
        base: "gross",
      },
    ],
    sources: [squarePricing, squareFees],
    assumptions: [
      "US Square account on the Square Plus plan ($49 a month per location, not included), charging USD for a US-issued card that is tapped, dipped, or swiped in person.",
      "Square's fees article says processing fees are taken out of the total amount of each transaction, including tax and tip.",
      "The estimator rounds each component to cents; Square's published pages do not establish a rounding policy.",
    ],
    exclusions: [
      "Cards issued outside the US, online and invoice payments, manually entered and card-on-file payments, Afterpay, Cash App Pay, and ACH bank transfers.",
      "Monthly plan fees, refunds, disputes, instant and same-day transfers, Square Pro, and custom pricing.",
    ],
    status: "supported",
  }),
  official({
    id: "square-us-premium-in-person-card",
    label: "Square Premium in-person card payment",
    provider: "square",
    taxMode: "caller-supplied",
    paymentProduct: "Square Premium",
    channel: "in-person",
    tierPolicy: "not-applicable",
    components: [
      {
        id: "square-in-person-processing",
        label: "Square in-person processing",
        rateBps: 240,
        fixedCents: 15,
        base: "gross",
      },
    ],
    sources: [squarePricing, squareFees],
    assumptions: [
      "US Square account on the Square Premium plan ($149 a month per location, not included), charging USD for a US-issued card that is tapped, dipped, or swiped in person.",
      "Square's fees article says processing fees are taken out of the total amount of each transaction, including tax and tip.",
      "The estimator rounds each component to cents; Square's published pages do not establish a rounding policy.",
    ],
    exclusions: [
      "Cards issued outside the US, online and invoice payments, manually entered and card-on-file payments, Afterpay, Cash App Pay, and ACH bank transfers.",
      "Monthly plan fees, refunds, disputes, instant and same-day transfers, Square Pro, and custom pricing.",
    ],
    status: "supported",
  }),
  official({
    id: "square-us-free-online-card",
    label: "Square Free online or invoice card payment",
    provider: "square",
    taxMode: "caller-supplied",
    paymentProduct: "Square Free",
    channel: "online or invoice",
    tierPolicy: "not-applicable",
    components: [
      {
        id: "square-online-processing",
        label: "Square online processing",
        rateBps: 330,
        fixedCents: 30,
        base: "gross",
      },
    ],
    sources: [squarePricing, squareFees],
    assumptions: [
      "US Square account on the Square Free plan, charging USD for a US-issued card paid online or through a Square invoice.",
      "Square's fees article says processing fees are taken out of the total amount of each transaction, including tax and tip.",
      "The estimator rounds each component to cents; Square's published pages do not establish a rounding policy.",
    ],
    exclusions: [
      "Payments through Square's payments APIs (2.9% + 30¢ on every plan), cards issued outside the US, card-on-file payments, Afterpay, Cash App Pay, and ACH bank transfers.",
      "Monthly plan fees, refunds, disputes, instant and same-day transfers, Square Pro, and custom pricing.",
    ],
    status: "supported",
  }),
  official({
    id: "square-us-paid-plan-online-card",
    label: "Square Plus or Premium online or invoice card payment",
    provider: "square",
    taxMode: "caller-supplied",
    paymentProduct: "Square Plus or Square Premium",
    channel: "online or invoice",
    tierPolicy: "not-applicable",
    components: [
      {
        id: "square-online-processing",
        label: "Square online processing",
        rateBps: 290,
        fixedCents: 30,
        base: "gross",
      },
    ],
    sources: [squarePricing, squareFees],
    assumptions: [
      "US Square account on Square Plus ($49 a month per location) or Square Premium ($149 a month per location), charging USD for a US-issued card paid online or through a Square invoice. Both plans list the same online rate.",
      "Square's fees article says processing fees are taken out of the total amount of each transaction, including tax and tip.",
      "The estimator rounds each component to cents; Square's published pages do not establish a rounding policy.",
    ],
    exclusions: [
      "Cards issued outside the US, card-on-file payments, Afterpay, Cash App Pay, and ACH bank transfers.",
      "Monthly plan fees, refunds, disputes, instant and same-day transfers, Square Pro, and custom pricing.",
    ],
    status: "supported",
  }),
  official({
    id: "square-us-manual-or-card-on-file",
    label: "Square manually entered or card-on-file payment",
    provider: "square",
    taxMode: "caller-supplied",
    paymentProduct: "Square Free, Plus, or Premium",
    channel: "manual entry or card on file",
    tierPolicy: "not-applicable",
    components: [
      {
        id: "square-manual-processing",
        label: "Square manual entry or card-on-file processing",
        rateBps: 350,
        fixedCents: 15,
        base: "gross",
      },
    ],
    sources: [squarePricing, squareFees],
    assumptions: [
      "US Square account on any of Square Free, Plus, or Premium, which list the same rate, charging USD to a US-issued card whose number is entered manually or saved on file.",
      "Square's fees article says processing fees are taken out of the total amount of each transaction, including tax and tip.",
      "The estimator rounds each component to cents; Square's published pages do not establish a rounding policy.",
    ],
    exclusions: [
      "Cards issued outside the US, in-person and online card payments, Afterpay, Cash App Pay, and ACH bank transfers.",
      "Monthly plan fees, refunds, disputes, instant and same-day transfers, Square Pro, and custom pricing.",
    ],
    status: "supported",
  }),
  official({
    id: "square-us-free-in-person-international-card",
    label: "Square Free in-person payment with an international card",
    provider: "square",
    taxMode: "caller-supplied",
    paymentProduct: "Square Free",
    channel: "in-person",
    tierPolicy: "not-applicable",
    components: [
      {
        id: "square-in-person-processing",
        label: "Square in-person processing",
        rateBps: 260,
        fixedCents: 15,
        base: "gross",
      },
      {
        id: "square-international-card",
        label: "Square international card transaction fee",
        rateBps: 150,
        fixedCents: 0,
        base: "gross",
      },
    ],
    sources: [squarePricing, squareFees],
    assumptions: [
      "US Square account on the Square Free plan, charging USD in person to a card issued outside the US.",
      "Square lists a 1.5% international card transaction fee in addition to its base processing fees. This estimate adds the two, because no page states the combined rate in words.",
      "Square's fees article says processing fees are taken out of the total amount of each transaction, including tax and tip.",
      "The estimator rounds each component to cents; Square's published pages do not establish a rounding policy.",
    ],
    exclusions: [
      "Currency conversion charged to the cardholder by their own card issuer, which Square does not collect.",
      "Paid-plan rates, online, manual, and card-on-file international payments, Afterpay, Cash App Pay, and ACH bank transfers.",
      "Monthly plan fees, refunds, disputes, instant and same-day transfers, Square Pro, and custom pricing.",
    ],
    status: "supported",
  }),
  official({
    id: "square-us-afterpay",
    label: "Square Afterpay payment",
    provider: "square",
    taxMode: "caller-supplied",
    paymentProduct: "Afterpay on Square",
    channel: "Afterpay",
    tierPolicy: "not-applicable",
    components: [
      {
        id: "square-afterpay",
        label: "Square Afterpay fee",
        rateBps: 600,
        fixedCents: 30,
        base: "gross",
      },
    ],
    sources: [squarePricing, squareFees],
    assumptions: [
      "US Square account taking a USD Afterpay payment. Square states Afterpay rates are fixed and do not vary by subscription type, hardware, or custom pricing.",
      "The fee is charged once on the order; Square states no processing fees apply to the remaining installments or to late payments.",
      "Square's fees article says processing fees are taken out of the total amount of each transaction, including tax and tip.",
      "The estimator rounds each component to cents; Square's published pages do not establish a rounding policy.",
    ],
    exclusions: [
      "Card, Cash App Pay, and ACH payments, and the international card fee, which Square says does not apply to Afterpay.",
      "Monthly plan fees, refunds, disputes, instant and same-day transfers, Square Pro, and custom pricing.",
    ],
    status: "supported",
  }),
  official({
    id: "square-us-invoice-ach",
    label: "Square invoice paid by ACH bank transfer",
    provider: "square",
    taxMode: "zero-only",
    paymentProduct: "Square Invoices",
    channel: "ACH bank transfer",
    tierPolicy: "explicitly-excluded",
    components: [],
    sources: [squarePricing, squareFees],
    assumptions: [
      "Square lists ACH bank transfer payments on invoices at 1% with a $1 minimum on Square Free, and 1% with a $1 minimum and a $10 fee cap on Plus and Premium.",
      "Square lists $0 fees for ACH payments deposited into Square Checking.",
    ],
    exclusions: [
      "No linear estimate is given, because the fee has a minimum, a plan-dependent cap, and a waiver that depends on where funds are deposited.",
    ],
    status: "blocked",
    blockedReason:
      "Square's ACH invoice fee has a $1 minimum and, on paid plans, a $10 cap. The fee engine models percentage and fixed charges only, so it does not estimate minimums or caps.",
  }),
  official({
    id: "etsy-us-order-with-listing-fee",
    label: "Etsy US shop order with its listing fee",
    provider: "etsy",
    taxMode: "caller-supplied",
    paymentProduct: "Etsy Payments",
    channel: "Etsy.com marketplace",
    tierPolicy: "not-applicable",
    components: [
      {
        id: "etsy-transaction",
        label: "Etsy transaction fee",
        rateBps: 650,
        fixedCents: 0,
        base: "gross-excluding-tax",
      },
      {
        id: "etsy-payment-processing",
        label: "Etsy Payments processing fee",
        rateBps: 300,
        fixedCents: 25,
        base: "gross",
      },
      {
        id: "etsy-listing",
        label: "Etsy listing fee",
        rateBps: 0,
        fixedCents: 20,
        base: "gross",
      },
    ],
    sources: [etsyFeesPolicy, etsyPaymentsPolicy],
    assumptions: [
      "US shop with a US bank account, listing in USD and paid through Etsy Payments, so no currency conversion fee applies.",
      "The amount is the order total the buyer paid: item price, shipping, gift wrap, and any sales tax Etsy collected. The 6.5% transaction fee applies to that total less sales tax, because Etsy's Fees & Payments Policy says it does not apply to sales tax for US sellers. The 3% + 25¢ processing fee applies to the gross order amount, including shipping and tax, as Etsy's Payments Policy states.",
      "One $0.20 listing fee is counted for the item sold: the fee paid to list it, or the automatic renewal Etsy charges after an item sells from a listing with quantity left.",
      "The estimator rounds each component to cents; Etsy's published pages do not establish a rounding policy.",
    ],
    exclusions: [
      "Offsite Ads, Etsy Ads, shipping labels, Etsy Plus and Pattern subscriptions, the one-time shop set-up fee, and instant transfers.",
      "Coupons and discounts, refunds, cancellations, orders with more than one unit from a listing (each extra unit sold is charged another $0.20), and regulatory operating fees charged to sellers outside the US.",
    ],
    status: "supported",
  }),
  official({
    id: "etsy-us-order-fees-only",
    label: "Etsy US shop order, transaction and processing fees",
    provider: "etsy",
    taxMode: "caller-supplied",
    paymentProduct: "Etsy Payments",
    channel: "Etsy.com marketplace",
    tierPolicy: "not-applicable",
    components: [
      {
        id: "etsy-transaction",
        label: "Etsy transaction fee",
        rateBps: 650,
        fixedCents: 0,
        base: "gross-excluding-tax",
      },
      {
        id: "etsy-payment-processing",
        label: "Etsy Payments processing fee",
        rateBps: 300,
        fixedCents: 25,
        base: "gross",
      },
    ],
    sources: [etsyFeesPolicy, etsyPaymentsPolicy],
    assumptions: [
      "US shop with a US bank account, listing in USD and paid through Etsy Payments, so no currency conversion fee applies.",
      "The amount is the order total the buyer paid: item price, shipping, gift wrap, and any sales tax Etsy collected. The 6.5% transaction fee applies to that total less sales tax, because Etsy's Fees & Payments Policy says it does not apply to sales tax for US sellers. The 3% + 25¢ processing fee applies to the gross order amount, including shipping and tax, as Etsy's Payments Policy states.",
      "The $0.20 listing fee is left out, for sellers who count it as a cost of listing rather than of each sale.",
      "The estimator rounds each component to cents; Etsy's published pages do not establish a rounding policy.",
    ],
    exclusions: [
      "Offsite Ads, Etsy Ads, shipping labels, Etsy Plus and Pattern subscriptions, the one-time shop set-up fee, and instant transfers.",
      "Coupons and discounts, refunds, cancellations, orders with more than one unit from a listing (each extra unit sold is charged another $0.20), and regulatory operating fees charged to sellers outside the US.",
    ],
    status: "supported",
  }),
  official({
    id: "etsy-us-offsite-ads",
    label: "Etsy order attributed to Offsite Ads",
    provider: "etsy",
    taxMode: "zero-only",
    paymentProduct: "Etsy Offsite Ads",
    channel: "Etsy.com marketplace",
    tierPolicy: "explicitly-excluded",
    components: [],
    sources: [etsyFeesPolicy],
    assumptions: [
      "Etsy charges 15% on orders attributed to Offsite Ads, or 12% for the lifetime of a shop that has reached $10,000 in sales over a prior 365 days.",
      "For US sellers the Offsite Ads fee does not apply to sales tax, and the fee on a single order will not exceed $100.",
    ],
    exclusions: [
      "No estimate is given, because the fee is capped per order and its rate depends on the shop's sales history.",
    ],
    status: "blocked",
    blockedReason:
      "Etsy's Offsite Ads fee is 15% or 12% depending on the shop's sales history and is capped at $100 per order. The fee engine does not model caps, so it does not estimate Offsite Ads.",
  }),
  official({
    id: "ebay-us-most-categories",
    label: "eBay sale in most categories, order over $10",
    provider: "ebay",
    taxMode: "caller-supplied",
    paymentProduct: "eBay selling fees",
    channel: "ebay.com marketplace",
    tierPolicy: "pre-threshold",
    components: [
      {
        id: "ebay-final-value",
        label: "eBay final value fee",
        rateBps: 1360,
        fixedCents: 0,
        base: "gross",
      },
      {
        id: "ebay-per-order",
        label: "eBay per-order fee",
        rateBps: 0,
        fixedCents: 40,
        base: "gross",
      },
    ],
    grossRangeCents: { minCents: 1001, maxCents: 750000 },
    sources: [ebaySellingFees],
    assumptions: [
      "US eBay account selling on ebay.com with no Store or a Starter Store, which pays the same rates, in a category charged 13.6%, such as most categories on eBay's fee table.",
      "The amount is the total amount of the sale, which eBay's selling fees page defines as the item price, handling charges, shipping charged to the buyer, sales tax, and other applicable fees. eBay's older seller fees FAQ says sales tax is excluded; its current help pages and worked examples include it, and this estimate follows the help pages.",
      "One item in the order. eBay calculates the percentage per item and charges the per-order fee once for each order.",
      "The order is over $10.00, so the per-order fee is $0.40. eBay does not say whether its $10.00 test uses the item price or the whole order, so this scenario assumes both are over $10.00.",
      "The total amount of the sale is at most $7,500.00; above that, eBay charges a lower rate on the portion over $7,500.00, which this scenario does not model, so larger amounts are refused.",
      "The estimator rounds each component to cents; eBay's pages do not establish a rounding policy.",
    ],
    exclusions: [
      "Insertion fees and listing upgrades, Promoted Listings ad fees, Below Standard and item-not-as-described surcharges, the $20 dispute fee, Store subscription prices, express payouts, and currency conversion.",
      "eBay's shipping exceptions (such as charging on the cheapest domestic shipping option), orders with more than one item, refunds, and cancellations.",
    ],
    status: "supported",
  }),
  official({
    id: "ebay-us-most-categories-small-order",
    label: "eBay sale in most categories, order of $10 or less",
    provider: "ebay",
    taxMode: "caller-supplied",
    paymentProduct: "eBay selling fees",
    channel: "ebay.com marketplace",
    tierPolicy: "pre-threshold",
    components: [
      {
        id: "ebay-final-value",
        label: "eBay final value fee",
        rateBps: 1360,
        fixedCents: 0,
        base: "gross",
      },
      {
        id: "ebay-per-order",
        label: "eBay per-order fee",
        rateBps: 0,
        fixedCents: 30,
        base: "gross",
      },
    ],
    grossRangeCents: { minCents: 1, maxCents: 1000 },
    sources: [ebaySellingFees],
    assumptions: [
      "US eBay account selling on ebay.com with no Store or a Starter Store, which pays the same rates, in a category charged 13.6%, such as most categories on eBay's fee table.",
      "The amount is the total amount of the sale, which eBay's selling fees page defines as the item price, handling charges, shipping charged to the buyer, sales tax, and other applicable fees. eBay's older seller fees FAQ says sales tax is excluded; its current help pages and worked examples include it, and this estimate follows the help pages.",
      "One item in the order. eBay calculates the percentage per item and charges the per-order fee once for each order.",
      "The order is $10.00 or less, so the per-order fee is $0.30. The item price is then also $10.00 or less.",
      "The total amount of the sale is at most $10.00; above that, eBay charges a lower rate on the portion over $10.00, which this scenario does not model, so larger amounts are refused.",
      "The estimator rounds each component to cents; eBay's pages do not establish a rounding policy.",
    ],
    exclusions: [
      "Insertion fees and listing upgrades, Promoted Listings ad fees, Below Standard and item-not-as-described surcharges, the $20 dispute fee, Store subscription prices, express payouts, and currency conversion.",
      "eBay's shipping exceptions (such as charging on the cheapest domestic shipping option), orders with more than one item, refunds, and cancellations.",
    ],
    status: "supported",
  }),
  official({
    id: "ebay-us-books-movies-music",
    label: "eBay sale in Books, Movies & TV, or Music, order over $10",
    provider: "ebay",
    taxMode: "caller-supplied",
    paymentProduct: "eBay selling fees",
    channel: "ebay.com marketplace",
    tierPolicy: "pre-threshold",
    components: [
      {
        id: "ebay-final-value",
        label: "eBay final value fee",
        rateBps: 1530,
        fixedCents: 0,
        base: "gross",
      },
      {
        id: "ebay-per-order",
        label: "eBay per-order fee",
        rateBps: 0,
        fixedCents: 40,
        base: "gross",
      },
    ],
    grossRangeCents: { minCents: 1001, maxCents: 750000 },
    sources: [ebaySellingFees],
    assumptions: [
      "US eBay account selling on ebay.com with no Store or a Starter Store, which pays the same rates, in Books & Magazines, Movies & TV (except Movie NFTs), or Music (except Vinyl Records and Music NFTs), charged 15.3%.",
      "The amount is the total amount of the sale, which eBay's selling fees page defines as the item price, handling charges, shipping charged to the buyer, sales tax, and other applicable fees. eBay's older seller fees FAQ says sales tax is excluded; its current help pages and worked examples include it, and this estimate follows the help pages.",
      "One item in the order. eBay calculates the percentage per item and charges the per-order fee once for each order.",
      "The order is over $10.00, so the per-order fee is $0.40. eBay does not say whether its $10.00 test uses the item price or the whole order, so this scenario assumes both are over $10.00.",
      "The total amount of the sale is at most $7,500.00; above that, eBay charges a lower rate on the portion over $7,500.00, which this scenario does not model, so larger amounts are refused.",
      "The estimator rounds each component to cents; eBay's pages do not establish a rounding policy.",
    ],
    exclusions: [
      "Insertion fees and listing upgrades, Promoted Listings ad fees, Below Standard and item-not-as-described surcharges, the $20 dispute fee, Store subscription prices, express payouts, and currency conversion.",
      "eBay's shipping exceptions (such as charging on the cheapest domestic shipping option), orders with more than one item, refunds, and cancellations.",
    ],
    status: "supported",
  }),
  official({
    id: "ebay-us-cards-comics-coins",
    label: "eBay sale in trading cards, comics, or coins, order over $10",
    provider: "ebay",
    taxMode: "caller-supplied",
    paymentProduct: "eBay selling fees",
    channel: "ebay.com marketplace",
    tierPolicy: "pre-threshold",
    components: [
      {
        id: "ebay-final-value",
        label: "eBay final value fee",
        rateBps: 1325,
        fixedCents: 0,
        base: "gross",
      },
      {
        id: "ebay-per-order",
        label: "eBay per-order fee",
        rateBps: 0,
        fixedCents: 40,
        base: "gross",
      },
    ],
    grossRangeCents: { minCents: 1001, maxCents: 750000 },
    sources: [ebaySellingFees],
    assumptions: [
      "US eBay account selling on ebay.com with no Store or a Starter Store, which pays the same rates, in Comic Books & Memorabilia, Non-Sport Trading Cards, Sports Trading Cards, Collectible Card Games, or Coins & Paper Money (except Bullion), charged 13.25%.",
      "The amount is the total amount of the sale, which eBay's selling fees page defines as the item price, handling charges, shipping charged to the buyer, sales tax, and other applicable fees. eBay's older seller fees FAQ says sales tax is excluded; its current help pages and worked examples include it, and this estimate follows the help pages.",
      "One item in the order. eBay calculates the percentage per item and charges the per-order fee once for each order.",
      "The order is over $10.00, so the per-order fee is $0.40. eBay does not say whether its $10.00 test uses the item price or the whole order, so this scenario assumes both are over $10.00.",
      "The total amount of the sale is at most $7,500.00; above that, eBay charges a lower rate on the portion over $7,500.00, which this scenario does not model, so larger amounts are refused.",
      "The estimator rounds each component to cents; eBay's pages do not establish a rounding policy.",
    ],
    exclusions: [
      "Insertion fees and listing upgrades, Promoted Listings ad fees, Below Standard and item-not-as-described surcharges, the $20 dispute fee, Store subscription prices, express payouts, and currency conversion.",
      "eBay's shipping exceptions (such as charging on the cheapest domestic shipping option), orders with more than one item, refunds, and cancellations.",
    ],
    status: "supported",
  }),
  official({
    id: "ebay-us-guitars-basses",
    label: "eBay sale in Guitars & Basses, order over $10",
    provider: "ebay",
    taxMode: "caller-supplied",
    paymentProduct: "eBay selling fees",
    channel: "ebay.com marketplace",
    tierPolicy: "pre-threshold",
    components: [
      {
        id: "ebay-final-value",
        label: "eBay final value fee",
        rateBps: 670,
        fixedCents: 0,
        base: "gross",
      },
      {
        id: "ebay-per-order",
        label: "eBay per-order fee",
        rateBps: 0,
        fixedCents: 40,
        base: "gross",
      },
    ],
    grossRangeCents: { minCents: 1001, maxCents: 750000 },
    sources: [ebaySellingFees],
    assumptions: [
      "US eBay account selling on ebay.com with no Store or a Starter Store, which pays the same rates, in Musical Instruments & Gear > Guitars & Basses, charged 6.7%.",
      "The amount is the total amount of the sale, which eBay's selling fees page defines as the item price, handling charges, shipping charged to the buyer, sales tax, and other applicable fees. eBay's older seller fees FAQ says sales tax is excluded; its current help pages and worked examples include it, and this estimate follows the help pages.",
      "One item in the order. eBay calculates the percentage per item and charges the per-order fee once for each order.",
      "The order is over $10.00, so the per-order fee is $0.40. eBay does not say whether its $10.00 test uses the item price or the whole order, so this scenario assumes both are over $10.00.",
      "The total amount of the sale is at most $7,500.00; above that, eBay charges a lower rate on the portion over $7,500.00, which this scenario does not model, so larger amounts are refused.",
      "The estimator rounds each component to cents; eBay's pages do not establish a rounding policy.",
    ],
    exclusions: [
      "Insertion fees and listing upgrades, Promoted Listings ad fees, Below Standard and item-not-as-described surcharges, the $20 dispute fee, Store subscription prices, express payouts, and currency conversion.",
      "eBay's shipping exceptions (such as charging on the cheapest domestic shipping option), orders with more than one item, refunds, and cancellations.",
    ],
    status: "supported",
  }),
  official({
    id: "ebay-us-international-most-categories",
    label: "eBay international sale in most categories, order over $10",
    provider: "ebay",
    taxMode: "caller-supplied",
    paymentProduct: "eBay selling fees",
    channel: "ebay.com marketplace",
    tierPolicy: "pre-threshold",
    components: [
      {
        id: "ebay-final-value",
        label: "eBay final value fee",
        rateBps: 1360,
        fixedCents: 0,
        base: "gross",
      },
      {
        id: "ebay-international",
        label: "eBay international fee",
        rateBps: 165,
        fixedCents: 0,
        base: "gross",
      },
      {
        id: "ebay-per-order",
        label: "eBay per-order fee",
        rateBps: 0,
        fixedCents: 40,
        base: "gross",
      },
    ],
    grossRangeCents: { minCents: 1001, maxCents: 750000 },
    sources: [ebaySellingFees],
    assumptions: [
      "US eBay account selling on ebay.com with no Store or a Starter Store, which pays the same rates, in a category charged 13.6%.",
      "The amount is the total amount of the sale, which eBay's selling fees page defines as the item price, handling charges, shipping charged to the buyer, sales tax, and other applicable fees. eBay's older seller fees FAQ says sales tax is excluded; its current help pages and worked examples include it, and this estimate follows the help pages.",
      "One item in the order. eBay calculates the percentage per item and charges the per-order fee once for each order.",
      "The order is over $10.00, so the per-order fee is $0.40. eBay does not say whether its $10.00 test uses the item price or the whole order, so this scenario assumes both are over $10.00.",
      "The total amount of the sale is at most $7,500.00; above that, eBay charges a lower rate on the portion over $7,500.00, which this scenario does not model, so larger amounts are refused.",
      "The buyer's delivery address or registered address is outside the US, and the item is not shipped with eBay International Shipping, so eBay's 1.65% international fee applies to the total amount of the sale.",
      "The estimator rounds each component to cents; eBay's pages do not establish a rounding policy.",
    ],
    exclusions: [
      "Sales shipped with eBay International Shipping, which eBay says have no international fee.",
      "Insertion fees and listing upgrades, Promoted Listings ad fees, Below Standard and item-not-as-described surcharges, the $20 dispute fee, Store subscription prices, express payouts, and currency conversion.",
      "eBay's shipping exceptions (such as charging on the cheapest domestic shipping option), orders with more than one item, refunds, and cancellations.",
    ],
    status: "supported",
  }),
  official({
    id: "ebay-us-store-most-categories",
    label: "eBay Basic Store or above, most categories, order over $10",
    provider: "ebay",
    taxMode: "caller-supplied",
    paymentProduct: "eBay Store selling fees",
    channel: "ebay.com marketplace",
    tierPolicy: "pre-threshold",
    components: [
      {
        id: "ebay-final-value",
        label: "eBay final value fee",
        rateBps: 1270,
        fixedCents: 0,
        base: "gross",
      },
      {
        id: "ebay-per-order",
        label: "eBay per-order fee",
        rateBps: 0,
        fixedCents: 40,
        base: "gross",
      },
    ],
    grossRangeCents: { minCents: 1001, maxCents: 250000 },
    sources: [ebayStoreFees],
    assumptions: [
      "US eBay account with a Basic, Premium, Anchor, or Enterprise Store, in a category charged 12.7%, such as Antiques, Baby, Crafts, Health & Beauty, Home & Garden, Sporting Goods, most Collectibles, most Clothing, Shoes & Accessories, and all other categories on eBay's Store fee table.",
      "The amount is the total amount of the sale, which eBay's selling fees page defines as the item price, handling charges, shipping charged to the buyer, sales tax, and other applicable fees. eBay's older seller fees FAQ says sales tax is excluded; its current help pages and worked examples include it, and this estimate follows the help pages.",
      "One item in the order. eBay calculates the percentage per item and charges the per-order fee once for each order.",
      "The order is over $10.00, so the per-order fee is $0.40. eBay does not say whether its $10.00 test uses the item price or the whole order, so this scenario assumes both are over $10.00.",
      "The total amount of the sale is at most $2,500.00; above that, eBay charges a lower rate on the portion over $2,500.00, which this scenario does not model, so larger amounts are refused.",
      "The estimator rounds each component to cents; eBay's pages do not establish a rounding policy.",
    ],
    exclusions: [
      "Insertion fees and listing upgrades, Promoted Listings ad fees, Below Standard and item-not-as-described surcharges, the $20 dispute fee, Store subscription prices, express payouts, and currency conversion.",
      "eBay's shipping exceptions (such as charging on the cheapest domestic shipping option), orders with more than one item, refunds, and cancellations.",
    ],
    status: "supported",
  }),
  official({
    id: "ebay-us-above-threshold",
    label: "eBay sale above its category's rate threshold",
    provider: "ebay",
    taxMode: "zero-only",
    paymentProduct: "eBay selling fees",
    channel: "ebay.com marketplace",
    tierPolicy: "explicitly-excluded",
    components: [],
    sources: [ebaySellingFees, ebayStoreFees],
    assumptions: [
      "eBay charges most categories 13.6% on the total amount of the sale up to $7,500 and 2.35% on the portion over $7,500, and Basic Store subscribers 12.7% up to $2,500 and 2.35% on the portion over $2,500.",
      "Some categories switch the rate for the whole sale at a threshold instead, such as Women's Bags & Handbags at $2,000 and Jewelry & Watches at $5,000.",
    ],
    exclusions: ["No estimate is given for a sale above its category's threshold."],
    status: "blocked",
    blockedReason:
      "Above a category's threshold, eBay charges a second rate on part or all of the sale. The fee engine applies one rate to the whole charge, so it does not estimate these sales.",
  }),
  official({
    id: "kickstarter-us-pledge",
    label: "Kickstarter US pledge of $10 or more",
    provider: "kickstarter",
    taxMode: "zero-only",
    paymentProduct: "Kickstarter campaign pledge",
    channel: "crowdfunding",
    tierPolicy: "post-threshold",
    components: [
      {
        id: "kickstarter-platform",
        label: "Kickstarter fee",
        rateBps: 500,
        fixedCents: 0,
        base: "gross",
      },
      {
        id: "kickstarter-processing",
        label: "Payment processing fee",
        rateBps: 300,
        fixedCents: 30,
        base: "gross",
      },
    ],
    grossRangeCents: { minCents: 1_000 },
    sources: [kickstarterFees, kickstarterFeesHelp],
    assumptions: [
      "US project raising USD that is successfully funded. Kickstarter charges no fees when a project does not reach its goal.",
      "The pledge was collected. Kickstarter takes fees only from pledges it successfully collects, so dropped pledges pay nothing.",
      "The amount is the pledge charged to the backer, including any shipping charged with it: Kickstarter collects its fees from the funding total, and its help pages say shipping charged at pledge time is part of the funding amount.",
      "The pledge is $10 or more, so the payment processing fee is 3% + $0.30. Kickstarter does not say whether its under-$10 test includes shipping, so this scenario assumes the pledge is $10 or more either way.",
      "Late Pledges pay the same fees, and each Pledge Over Time charge pays these fees separately.",
      "Campaign pledges carry no sales tax; Kickstarter collects sales tax only through its Pledge Manager after the campaign.",
      "The estimator rounds each component to cents; Kickstarter's pages do not establish a rounding policy.",
    ],
    exclusions: [
      "Pledge Manager payments, refunds, chargebacks, and fiscal sponsor fees.",
      "Projects outside the US, where Kickstarter says processing fees can differ.",
    ],
    status: "supported",
  }),
  official({
    id: "kickstarter-us-micropledge",
    label: "Kickstarter US pledge under $10",
    provider: "kickstarter",
    taxMode: "zero-only",
    paymentProduct: "Kickstarter campaign pledge",
    channel: "crowdfunding",
    tierPolicy: "pre-threshold",
    components: [
      {
        id: "kickstarter-platform",
        label: "Kickstarter fee",
        rateBps: 500,
        fixedCents: 0,
        base: "gross",
      },
      {
        id: "kickstarter-processing",
        label: "Payment processing fee",
        rateBps: 500,
        fixedCents: 8,
        base: "gross",
      },
    ],
    grossRangeCents: { maxCents: 999 },
    sources: [kickstarterFees, kickstarterFeesHelp],
    assumptions: [
      "US project raising USD that is successfully funded. Kickstarter charges no fees when a project does not reach its goal.",
      "The pledge was collected. Kickstarter takes fees only from pledges it successfully collects, so dropped pledges pay nothing.",
      "The amount is the pledge charged to the backer, including any shipping charged with it: Kickstarter collects its fees from the funding total, and its help pages say shipping charged at pledge time is part of the funding amount.",
      "The pledge is under $10, so Kickstarter's discounted micropledge processing fee of 5% + $0.08 applies. A pledge under $10 including shipping is also under $10 without it.",
      "Late Pledges pay the same fees, and each Pledge Over Time charge pays these fees separately.",
      "Campaign pledges carry no sales tax; Kickstarter collects sales tax only through its Pledge Manager after the campaign.",
      "The estimator rounds each component to cents; Kickstarter's pages do not establish a rounding policy.",
    ],
    exclusions: [
      "Pledge Manager payments, refunds, chargebacks, and fiscal sponsor fees.",
      "Projects outside the US, where Kickstarter says processing fees can differ.",
    ],
    status: "supported",
  }),
  official({
    id: "kickstarter-us-pledge-manager",
    label: "Kickstarter Pledge Manager payment",
    provider: "kickstarter",
    taxMode: "zero-only",
    paymentProduct: "Kickstarter Pledge Manager",
    channel: "crowdfunding",
    tierPolicy: "explicitly-excluded",
    components: [],
    sources: [kickstarterFeesHelp],
    assumptions: [
      "In Kickstarter's Pledge Manager, the 5% fee applies to all funds except taxes, and the payment processing fee applies to the full payment, including taxes.",
      "Kickstarter describes that processing fee only as roughly 3-5%.",
    ],
    exclusions: ["No estimate is given for Pledge Manager payments."],
    status: "blocked",
    blockedReason:
      "Kickstarter describes the Pledge Manager processing fee only as roughly 3-5% and does not publish its formula, so no estimate is given.",
  }),
  official({
    id: "patreon-us-standard-web",
    label: "Patreon standard plan, web payment by card or US PayPal",
    provider: "patreon",
    taxMode: "zero-only",
    paymentProduct: "Patreon membership",
    channel: "web",
    tierPolicy: "not-applicable",
    components: [
      {
        id: "patreon-platform",
        label: "Patreon platform fee",
        rateBps: 1000,
        fixedCents: 0,
        base: "gross",
      },
      {
        id: "patreon-processing",
        label: "Payment processing fee",
        rateBps: 290,
        fixedCents: 30,
        base: "gross",
      },
    ],
    sources: [patreonPricing, patreonFees, patreonIos],
    assumptions: [
      "US creator paid in USD on Patreon's standard plan, which charges a 10% platform fee to pages published after August 4, 2025.",
      "The member pays in USD on the web by card or Apple Pay, or from the US by PayPal or Venmo, so processing is 2.9% + $0.30 at any amount.",
      "The payment carries no sales tax. Patreon calculates its platform fee before sales tax, and its pages disagree on whether the processing fee applies to tax.",
      "The estimator rounds each component to cents; Patreon's published pages do not establish a rounding policy.",
    ],
    exclusions: [
      "Currency conversion, non-US PayPal or Venmo payments, and iOS in-app purchases (separate scenarios).",
      "One-time purchases, whose platform fee Patreon's pages state differently: 10%, between 5% and 12%, or a flat 5%.",
      "Payout fees ($0.25 per Stripe bank payout, or 1% with a $0.25 minimum and $20 cap for PayPal), tax on Patreon's fees, merch, refunds, and chargebacks.",
    ],
    status: "supported",
  }),
  official({
    id: "patreon-us-standard-non-us-paypal",
    label: "Patreon standard plan, PayPal or Venmo payment from outside the US",
    provider: "patreon",
    taxMode: "zero-only",
    paymentProduct: "Patreon membership",
    channel: "web",
    tierPolicy: "not-applicable",
    components: [
      {
        id: "patreon-platform",
        label: "Patreon platform fee",
        rateBps: 1000,
        fixedCents: 0,
        base: "gross",
      },
      {
        id: "patreon-processing",
        label: "Payment processing fee",
        rateBps: 390,
        fixedCents: 30,
        base: "gross",
      },
    ],
    sources: [patreonFees],
    assumptions: [
      "US creator paid in USD on Patreon's standard plan, which charges a 10% platform fee to pages published after August 4, 2025.",
      "A member outside the US pays in USD by PayPal or Venmo, so processing is 3.9% + $0.30.",
      "The payment carries no sales tax. Patreon calculates its platform fee before sales tax, and its pages disagree on whether the processing fee applies to tax.",
      "The estimator rounds each component to cents; Patreon's published pages do not establish a rounding policy.",
    ],
    exclusions: [
      "Currency conversion (a separate scenario) and iOS in-app purchases.",
      "Payout fees ($0.25 per Stripe bank payout, or 1% with a $0.25 minimum and $20 cap for PayPal), tax on Patreon's fees, merch, refunds, and chargebacks.",
    ],
    status: "supported",
  }),
  official({
    id: "patreon-us-standard-currency-conversion",
    label: "Patreon standard plan, card payment in another currency",
    provider: "patreon",
    taxMode: "zero-only",
    paymentProduct: "Patreon membership",
    channel: "web",
    tierPolicy: "not-applicable",
    components: [
      {
        id: "patreon-platform",
        label: "Patreon platform fee",
        rateBps: 1000,
        fixedCents: 0,
        base: "gross",
      },
      {
        id: "patreon-processing",
        label: "Payment processing fee",
        rateBps: 290,
        fixedCents: 30,
        base: "gross",
      },
      {
        id: "patreon-currency-conversion",
        label: "Currency conversion fee",
        rateBps: 250,
        fixedCents: 0,
        base: "gross",
      },
    ],
    sources: [patreonFees],
    assumptions: [
      "US creator paid in USD on Patreon's standard plan, which charges a 10% platform fee to pages published after August 4, 2025.",
      "The member pays by card in a currency other than USD, so Patreon's 2.5% currency conversion fee applies on top of 2.9% + $0.30 processing. The amount is the payment converted to USD.",
      "The payment carries no sales tax. Patreon calculates its platform fee before sales tax, and its pages disagree on whether the processing fee applies to tax.",
      "The estimator rounds each component to cents; Patreon's published pages do not establish a rounding policy.",
    ],
    exclusions: [
      "The exchange rate Patreon uses, non-US PayPal or Venmo payments, and iOS in-app purchases.",
      "Payout fees ($0.25 per Stripe bank payout, or 1% with a $0.25 minimum and $20 cap for PayPal), tax on Patreon's fees, merch, refunds, and chargebacks.",
    ],
    status: "supported",
  }),
  official({
    id: "patreon-us-standard-ios-first-year",
    label: "Patreon standard plan, iOS in-app purchase",
    provider: "patreon",
    taxMode: "zero-only",
    paymentProduct: "Patreon iOS in-app purchase",
    channel: "iOS app",
    tierPolicy: "pre-threshold",
    components: [
      {
        id: "apple-app-store",
        label: "Apple App Store fee",
        rateBps: 3000,
        fixedCents: 0,
        base: "gross",
      },
      {
        id: "patreon-platform",
        label: "Patreon platform fee",
        rateBps: 1000,
        fixedCents: 0,
        base: "gross",
      },
    ],
    sources: [patreonFees, patreonIos],
    assumptions: [
      "US creator paid in USD on Patreon's standard plan, which charges a 10% platform fee to pages published after August 4, 2025.",
      "The purchase is made in Patreon's iOS app, where Apple's in-app purchase system applies a 30% App Store fee and Patreon charges no payment processing fee. The platform fee applies to the iOS sale price before tax.",
      "The amount is the iOS sale price, which Patreon raises by default to cover Apple's fee. The results match Patreon's own example of a $14.50 iOS price.",
      "The payment carries no sales tax. Patreon calculates its platform fee before sales tax, and its pages disagree on whether the processing fee applies to tax.",
      "The estimator rounds each component to cents; Patreon's published pages do not establish a rounding policy.",
    ],
    exclusions: [
      "Memberships billed continuously for more than a year (a separate scenario), App Store rates in China, and Apple's handling of refunds.",
      "Payout fees ($0.25 per Stripe bank payout, or 1% with a $0.25 minimum and $20 cap for PayPal), tax on Patreon's fees, merch, refunds, and chargebacks.",
    ],
    status: "supported",
  }),
  official({
    id: "patreon-us-standard-ios-after-year",
    label: "Patreon standard plan, iOS membership after one year",
    provider: "patreon",
    taxMode: "zero-only",
    paymentProduct: "Patreon iOS in-app purchase",
    channel: "iOS app",
    tierPolicy: "post-threshold",
    components: [
      {
        id: "apple-app-store",
        label: "Apple App Store fee",
        rateBps: 1500,
        fixedCents: 0,
        base: "gross",
      },
      {
        id: "patreon-platform",
        label: "Patreon platform fee",
        rateBps: 1000,
        fixedCents: 0,
        base: "gross",
      },
    ],
    sources: [patreonFees],
    assumptions: [
      "US creator paid in USD on Patreon's standard plan, which charges a 10% platform fee to pages published after August 4, 2025.",
      "A membership bought in Patreon's iOS app has been billed continuously for more than a year, so Apple's App Store fee drops from 30% to 15%. Patreon charges no payment processing fee on iOS payments.",
      "The payment carries no sales tax. Patreon calculates its platform fee before sales tax, and its pages disagree on whether the processing fee applies to tax.",
      "The estimator rounds each component to cents; Patreon's published pages do not establish a rounding policy.",
    ],
    exclusions: [
      "The first year of an iOS membership (a separate scenario) and App Store rates in China.",
      "Payout fees ($0.25 per Stripe bank payout, or 1% with a $0.25 minimum and $20 cap for PayPal), tax on Patreon's fees, merch, refunds, and chargebacks.",
    ],
    status: "supported",
  }),
  official({
    id: "patreon-us-pro-over-3",
    label: "Patreon Pro plan, payment over $3",
    provider: "patreon",
    taxMode: "zero-only",
    paymentProduct: "Patreon membership",
    channel: "web",
    tierPolicy: "post-threshold",
    components: [
      {
        id: "patreon-platform",
        label: "Patreon platform fee",
        rateBps: 800,
        fixedCents: 0,
        base: "gross",
      },
      {
        id: "patreon-processing",
        label: "Payment processing fee",
        rateBps: 290,
        fixedCents: 30,
        base: "gross",
      },
    ],
    grossRangeCents: { minCents: 301 },
    sources: [patreonFees],
    assumptions: [
      "US creator paid in USD on Patreon's legacy Pro plan, which keeps its 8% platform fee for pages published on or before August 4, 2025 that have stayed published.",
      "The member pays over $3 in USD by card, Apple Pay, or US PayPal or Venmo, so processing is 2.9% + $0.30.",
      "The payment carries no sales tax. Patreon calculates its platform fee before sales tax, and its pages disagree on whether the processing fee applies to tax.",
      "The estimator rounds each component to cents; Patreon's published pages do not establish a rounding policy.",
    ],
    exclusions: [
      "Pro plus Merch, the Founders plan, non-US PayPal or Venmo payments, currency conversion, and iOS in-app purchases.",
      "Payout fees ($0.25 per Stripe bank payout, or 1% with a $0.25 minimum and $20 cap for PayPal), tax on Patreon's fees, merch, refunds, and chargebacks.",
    ],
    status: "supported",
  }),
  official({
    id: "patreon-us-pro-3-or-less",
    label: "Patreon Pro plan, payment of $3 or less",
    provider: "patreon",
    taxMode: "zero-only",
    paymentProduct: "Patreon membership",
    channel: "web",
    tierPolicy: "pre-threshold",
    components: [
      {
        id: "patreon-platform",
        label: "Patreon platform fee",
        rateBps: 800,
        fixedCents: 0,
        base: "gross",
      },
      {
        id: "patreon-processing",
        label: "Payment processing fee",
        rateBps: 500,
        fixedCents: 10,
        base: "gross",
      },
    ],
    grossRangeCents: { maxCents: 300 },
    sources: [patreonFees],
    assumptions: [
      "US creator paid in USD on Patreon's legacy Pro plan, which keeps its 8% platform fee for pages published on or before August 4, 2025 that have stayed published.",
      "The tier is priced at $3 or less, so legacy micropayment processing of 5% + $0.10 applies.",
      "The payment carries no sales tax. Patreon calculates its platform fee before sales tax, and its pages disagree on whether the processing fee applies to tax.",
      "The estimator rounds each component to cents; Patreon's published pages do not establish a rounding policy.",
    ],
    exclusions: [
      "Pro plus Merch, the Founders plan, non-US PayPal or Venmo payments, currency conversion, and iOS in-app purchases.",
      "Payout fees ($0.25 per Stripe bank payout, or 1% with a $0.25 minimum and $20 cap for PayPal), tax on Patreon's fees, merch, refunds, and chargebacks.",
    ],
    status: "supported",
  }),
  official({
    id: "kofi-us-stripe-5-percent",
    label: "Ko-fi 5% service fee, card payment through Stripe",
    provider: "kofi",
    taxMode: "zero-only",
    paymentProduct: "Ko-fi shop, membership, commission, or tip",
    channel: "Stripe",
    tierPolicy: "not-applicable",
    components: [
      {
        id: "kofi-service",
        label: "Ko-fi service fee",
        rateBps: 500,
        fixedCents: 0,
        base: "gross",
      },
      {
        id: "stripe-processing",
        label: "Stripe card processing",
        rateBps: 290,
        fixedCents: 30,
        base: "gross",
      },
    ],
    sources: [kofiFees, kofiStripe, stripePricing],
    assumptions: [
      "US creator paid in USD, with the supporter paying by US card through the creator's own Stripe account. Ko-fi says standard Stripe fees apply, and Stripe's pricing page lists 2.9% + 30¢ for domestic cards on standard pricing.",
      "The payment is a shop sale, membership, commission, or monthly tip, or a one-off tip while Contributor status is on, so Ko-fi's 5% service fee applies.",
      "The payment has no shipping or sales tax: Ko-fi says it takes no fee on shipping and does not say whether its fee applies to tax.",
      "The estimator rounds each component to cents; Ko-fi's published pages do not establish a rounding policy.",
    ],
    exclusions: [
      "PayPal payments (a separate scenario) and Ko-fi Gold.",
      "Currency conversion, Stripe instant payouts, disputes, refunds, and Stripe's custom pricing.",
    ],
    status: "supported",
  }),
  official({
    id: "kofi-us-stripe-no-fee",
    label: "No Ko-fi fee, card payment through Stripe",
    provider: "kofi",
    taxMode: "zero-only",
    paymentProduct: "Ko-fi with Gold, or a one-off tip",
    channel: "Stripe",
    tierPolicy: "not-applicable",
    components: [
      {
        id: "stripe-processing",
        label: "Stripe card processing",
        rateBps: 290,
        fixedCents: 30,
        base: "gross",
      },
    ],
    sources: [kofiFees, kofiGold, kofiStripe, stripePricing],
    assumptions: [
      "US creator paid in USD, with the supporter paying by US card through the creator's own Stripe account. Ko-fi says standard Stripe fees apply, and Stripe's pricing page lists 2.9% + 30¢ for domestic cards on standard pricing.",
      "No Ko-fi service fee applies: the creator has Ko-fi Gold ($12 a month, not included) with Contributor status off, or the payment is a one-off tip or Goal without Contributor status. Memberships that began before Gold keep the 5% fee.",
      "The payment has no shipping or sales tax: Ko-fi says it takes no fee on shipping and does not say whether its fee applies to tax.",
      "The estimator rounds each component to cents; Ko-fi's published pages do not establish a rounding policy.",
    ],
    exclusions: [
      "The Ko-fi Gold subscription price and PayPal payments.",
      "Currency conversion, Stripe instant payouts, disputes, refunds, and Stripe's custom pricing.",
    ],
    status: "supported",
  }),
  official({
    id: "kofi-us-paypal-5-percent",
    label: "Ko-fi 5% service fee on a PayPal payment",
    provider: "kofi",
    taxMode: "zero-only",
    paymentProduct: "Ko-fi shop, membership, commission, or tip",
    channel: "PayPal",
    tierPolicy: "not-applicable",
    components: [
      {
        id: "kofi-service",
        label: "Ko-fi service fee",
        rateBps: 500,
        fixedCents: 0,
        base: "gross",
      },
    ],
    sources: [kofiFees],
    assumptions: [
      "US creator paid in USD through their own PayPal account, on a payment where Ko-fi's 5% service fee applies.",
      "Only Ko-fi's fee is estimated. PayPal charges its own transaction fee, which Ko-fi does not publish, so it is not added.",
      "The payment has no shipping or sales tax: Ko-fi says it takes no fee on shipping and does not say whether its fee applies to tax.",
      "The estimator rounds each component to cents; Ko-fi's published pages do not establish a rounding policy.",
    ],
    exclusions: [
      "PayPal's transaction fee, currency conversion, PayPal holds, disputes, and refunds.",
    ],
    status: "supported",
  }),
  official({
    id: "substack-us-web-domestic-card",
    label: "Substack paid subscription on the web, domestic card",
    provider: "substack",
    taxMode: "zero-only",
    paymentProduct: "Substack paid subscription",
    channel: "web",
    tierPolicy: "not-applicable",
    components: [
      {
        id: "substack-platform",
        label: "Substack fee",
        rateBps: 1000,
        fixedCents: 0,
        base: "gross",
      },
      {
        id: "stripe-processing",
        label: "Stripe card processing",
        rateBps: 290,
        fixedCents: 30,
        base: "gross",
      },
      {
        id: "stripe-billing",
        label: "Stripe Billing fee",
        rateBps: 70,
        fixedCents: 0,
        base: "gross",
      },
    ],
    sources: [substackCost, stripePricing, stripeBillingPricing],
    assumptions: [
      "US writer with a US Stripe account, charging a reader in USD on the web with a card issued in the US and no currency conversion.",
      "Substack takes 10% of each paid transaction. Stripe charges its standard 2.9% + 30¢ card fee and its Billing fee on recurring subscription payments: 0.7% on Substack's cost page and on Stripe's Billing pricing page. An older Substack page still says 0.5%, a rate Substack's cost page says ended June 30, 2025.",
      "No sales tax is collected: Substack collects tax only when a writer turns on Stripe Tax, and does not say whether its fee applies to tax.",
      "The estimator rounds each component to cents; Substack's and Stripe's published pages do not establish a rounding policy.",
    ],
    exclusions: [
      "iOS in-app purchases, where Apple charges 15-30%, and local-currency prices with Stripe's 1% to 2% conversion fee.",
      "Stripe Tax, Radar, disputes, refunds, the $50 custom domain fee, and Stripe's custom pricing.",
    ],
    status: "supported",
  }),
  official({
    id: "substack-us-web-international-card",
    label: "Substack paid subscription on the web, international card in USD",
    provider: "substack",
    taxMode: "zero-only",
    paymentProduct: "Substack paid subscription",
    channel: "web",
    tierPolicy: "not-applicable",
    components: [
      {
        id: "substack-platform",
        label: "Substack fee",
        rateBps: 1000,
        fixedCents: 0,
        base: "gross",
      },
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
      {
        id: "stripe-billing",
        label: "Stripe Billing fee",
        rateBps: 70,
        fixedCents: 0,
        base: "gross",
      },
    ],
    sources: [substackCost, stripePricing, stripeBillingPricing],
    assumptions: [
      "US writer with a US Stripe account, charging a reader in USD on the web with a card issued outside the US and no currency conversion, for example with localized pricing turned off.",
      "Substack takes 10% of each paid transaction. Stripe charges its standard 2.9% + 30¢ card fee, 1.5% more for international cards, and its 0.7% Billing fee on recurring subscription payments.",
      "No sales tax is collected: Substack collects tax only when a writer turns on Stripe Tax, and does not say whether its fee applies to tax.",
      "The estimator rounds each component to cents; Substack's and Stripe's published pages do not establish a rounding policy.",
    ],
    exclusions: [
      "Local-currency prices, which Substack turns on by default and which add Stripe's 1% to 2% conversion fee, and iOS in-app purchases.",
      "Stripe Tax, Radar, disputes, refunds, the $50 custom domain fee, and Stripe's custom pricing.",
    ],
    status: "supported",
  }),
  official({
    id: "payhip-us-free-stripe-card",
    label: "Payhip Free Forever plan, domestic card through Stripe",
    provider: "payhip",
    taxMode: "zero-only",
    paymentProduct: "Payhip one-time sale",
    channel: "Stripe",
    tierPolicy: "not-applicable",
    components: [
      {
        id: "payhip-transaction",
        label: "Payhip transaction fee",
        rateBps: 500,
        fixedCents: 0,
        base: "gross",
      },
      {
        id: "stripe-processing",
        label: "Stripe card processing",
        rateBps: 290,
        fixedCents: 30,
        base: "gross",
      },
    ],
    sources: [payhipPricing, payhipBilling, payhipStripe, stripePricing],
    assumptions: [
      "US seller in USD on Payhip's Free Forever plan, which costs nothing a month and adds a 5% transaction fee, with the buyer paying by US card through the seller's own Stripe account.",
      "Stripe charges its standard 2.9% + 30¢ domestic card fee, which Payhip's Stripe article also quotes and says goes to Stripe, not Payhip.",
      "A one-time sale with no sales tax, VAT, shipping, or discount. Payhip's VAT example charges its fee on the price before VAT, but Payhip does not say how its fee treats US sales tax, shipping, or coupons.",
      "The estimator rounds each component to cents; Payhip's published pages do not establish a rounding policy.",
    ],
    exclusions: [
      "Subscriptions and payment plans, which Payhip bills through Stripe without saying whether Stripe's Billing fee applies.",
      "PayPal and Square payments, international cards, currency conversion, refunds, disputes, and video hosting.",
    ],
    status: "supported",
  }),
  official({
    id: "payhip-us-plus-stripe-card",
    label: "Payhip Plus plan, domestic card through Stripe",
    provider: "payhip",
    taxMode: "zero-only",
    paymentProduct: "Payhip one-time sale",
    channel: "Stripe",
    tierPolicy: "not-applicable",
    components: [
      {
        id: "payhip-transaction",
        label: "Payhip transaction fee",
        rateBps: 200,
        fixedCents: 0,
        base: "gross",
      },
      {
        id: "stripe-processing",
        label: "Stripe card processing",
        rateBps: 290,
        fixedCents: 30,
        base: "gross",
      },
    ],
    sources: [payhipPricing, payhipBilling, payhipStripe, stripePricing],
    assumptions: [
      "US seller in USD on Payhip's Plus plan, which costs $29 a month (not included here) and lowers the transaction fee to 2%, with the buyer paying by US card through the seller's own Stripe account.",
      "Stripe charges its standard 2.9% + 30¢ domestic card fee, which Payhip's Stripe article also quotes and says goes to Stripe, not Payhip.",
      "A one-time sale with no sales tax, VAT, shipping, or discount. Payhip's VAT example charges its fee on the price before VAT, but Payhip does not say how its fee treats US sales tax, shipping, or coupons.",
      "The estimator rounds each component to cents; Payhip's published pages do not establish a rounding policy.",
    ],
    exclusions: [
      "The $29 monthly plan price, and subscriptions and payment plans, which Payhip bills through Stripe without saying whether Stripe's Billing fee applies.",
      "PayPal and Square payments, international cards, currency conversion, refunds, disputes, and video hosting.",
    ],
    status: "supported",
  }),
  official({
    id: "payhip-us-pro-stripe-card",
    label: "Payhip Pro plan, domestic card through Stripe",
    provider: "payhip",
    taxMode: "zero-only",
    paymentProduct: "Payhip one-time sale",
    channel: "Stripe",
    tierPolicy: "not-applicable",
    components: [
      {
        id: "stripe-processing",
        label: "Stripe card processing",
        rateBps: 290,
        fixedCents: 30,
        base: "gross",
      },
    ],
    sources: [payhipPricing, payhipBilling, payhipStripe, stripePricing],
    assumptions: [
      "US seller in USD on Payhip's Pro plan, which costs $99 a month (not included here) and has no Payhip transaction fee, with the buyer paying by US card through the seller's own Stripe account.",
      "Stripe charges its standard 2.9% + 30¢ domestic card fee, which Payhip's Stripe article also quotes and says goes to Stripe, not Payhip.",
      "A one-time sale with no sales tax, VAT, shipping, or discount.",
      "The estimator rounds each component to cents; Stripe's published pages do not establish a rounding policy.",
    ],
    exclusions: [
      "The $99 monthly plan price, and subscriptions and payment plans, which Payhip bills through Stripe without saying whether Stripe's Billing fee applies.",
      "PayPal and Square payments, international cards, currency conversion, refunds, disputes, and video hosting.",
    ],
    status: "supported",
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
