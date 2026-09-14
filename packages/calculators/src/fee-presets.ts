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

const checkedOn = "2026-09-14";

const stripePricing = {
  url: "https://stripe.com/us/pricing",
  title: "Pricing & Fees | Stripe",
};

const paypalCheckout = {
  url: "https://www.paypal.com/us/business/accept-payments/checkout?locale.x=en_US",
  title: "PayPal Checkout Solutions for Businesses | PayPal US",
};

const paypalMerchantFees = {
  url: "https://www.paypal.com/webapps/mpp/merchant-fees",
  title: "PayPal Merchant Fees",
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
    currency: "USD",
    accountCountry: "US",
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
    ],
    sources: [stripePricing],
    checkedOn,
    assumptions: [
      "US Stripe account charging a USD amount through standard online Payments pricing.",
      "The card is issued domestically and the charge succeeds.",
      "The estimator rounds the component to cents; Stripe's published page does not establish a component-rounding policy.",
    ],
    exclusions: [
      "International cards, currency conversion, manually entered cards, in-person payments, and non-card payment methods.",
      "Connect, Billing, Tax, disputes, refunds, payout costs, custom pricing, and negotiated volume discounts.",
    ],
    status: "supported",
  }),
  official({
    id: "paypal-us-checkout-paypal-payment",
    label: "PayPal US PayPal Checkout payment",
    provider: "paypal",
    currency: "USD",
    accountCountry: "US",
    taxMode: "caller-supplied",
    paymentProduct: "PayPal Checkout",
    channel: "online",
    tierPolicy: "not-applicable",
    components: [
      {
        id: "paypal-checkout-processing",
        label: "PayPal Checkout PayPal payment",
        rateBps: 349,
        fixedCents: 49,
        base: "gross",
      },
    ],
    sources: [paypalCheckout, paypalMerchantFees],
    checkedOn,
    assumptions: [
      "US PayPal Business account receiving a domestic USD commercial transaction.",
      "The selected product is PayPal Checkout's PayPal payment method, not a card entered through Checkout.",
      "The estimator rounds the component to cents; PayPal's published pages do not establish a component-rounding policy.",
    ],
    exclusions: [
      "PayPal Checkout credit or debit card payments, Expanded Checkout, Venmo, Pay Later, invoices, Goods and Services, international transactions, disputes, refunds, and custom pricing.",
    ],
    status: "supported",
  }),
  official({
    id: "gumroad-us-direct-card",
    label: "Gumroad US direct sale with card processing",
    provider: "gumroad",
    currency: "USD",
    accountCountry: "US",
    taxMode: "zero-only",
    paymentProduct: "Gumroad direct sale",
    channel: "online",
    tierPolicy: "pre-threshold",
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
    checkedOn,
    assumptions: [
      "US creator account and USD direct sale through the creator's profile or a direct customer link.",
      "This is a new direct sale before the documented calendar-month high-volume threshold, paid by credit card.",
      "The Help Center's 2.9% + $0.30 card-processing example is used in addition to Gumroad's 10% + $0.50 direct-sale fee.",
      "The estimator rounds each component to cents; Gumroad's published pages do not establish a component-rounding policy.",
    ],
    exclusions: [
      "PayPal direct-sale fees, Gumroad or fee sales tax, Discover marketplace sales, affiliate allocations, refunds, connected payment accounts, custom account fees, payouts, and high-volume threshold-crossing transactions.",
    ],
    status: "supported",
  }),
  official({
    id: "gumroad-us-direct-card-high-volume",
    label: "Gumroad US direct card sale after monthly volume threshold",
    provider: "gumroad",
    currency: "USD",
    accountCountry: "US",
    taxMode: "zero-only",
    paymentProduct: "Gumroad direct sale",
    channel: "online",
    tierPolicy: "post-threshold",
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
    checkedOn,
    assumptions: [
      "US creator account and USD direct credit-card sale.",
      "The account has already reached $20,000 in paid sales in the current calendar month before this new direct sale.",
      "The documented 5% + $0.50 direct-sale fee is used after the threshold; the source says the threshold discount does not change the other fee behavior, so standard card processing remains separate.",
      "The estimator rounds each component to cents; Gumroad's published pages do not establish a component-rounding policy.",
    ],
    exclusions: [
      "The transaction that crosses the threshold, a blended month-to-date total, Discover sales, PayPal sales, fee sales tax, affiliates, refunds, custom account fees, and payouts.",
    ],
    status: "supported",
  }),
  official({
    id: "gumroad-us-discover",
    label: "Gumroad US Discover marketplace sale",
    provider: "gumroad",
    currency: "USD",
    accountCountry: "US",
    taxMode: "zero-only",
    paymentProduct: "Gumroad Discover marketplace",
    channel: "online",
    tierPolicy: "not-applicable",
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
    checkedOn,
    assumptions: [
      "US creator account and USD sale originating through Gumroad Discover (Gumroad's marketplace).",
      "The documented flat 30% fee is treated as including processing fees.",
      "The estimator rounds the component to cents; Gumroad's published pages do not establish a component-rounding policy.",
    ],
    exclusions: [
      "Direct/profile sales, high-volume direct discounts, sales tax, affiliate allocations, refunds, custom account fees, and payouts.",
    ],
    status: "supported",
  }),
  official({
    id: "gumroad-us-direct-threshold-crossing",
    label: "Gumroad US direct sale crossing the monthly volume threshold",
    provider: "gumroad",
    currency: "USD",
    accountCountry: "US",
    taxMode: "zero-only",
    paymentProduct: "Gumroad direct sale",
    channel: "online",
    tierPolicy: "explicitly-excluded",
    components: [],
    sources: [gumroadFees],
    checkedOn,
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
    id: "lemon-squeezy-us-card-single-no-tax",
    label: "Lemon Squeezy US domestic card, single order, no tax",
    provider: "lemon-squeezy",
    currency: "USD",
    accountCountry: "US",
    taxMode: "zero-only",
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
    checkedOn,
    assumptions: [
      "US Lemon Squeezy account receiving a USD domestic card order.",
      "This baseline is a single non-subscription order with no sales tax collected, so the supplied gross amount equals the order total and product subtotal.",
      "Lemon Squeezy's published rule calculates the platform fee on the total order value. If tax is collected in a later supported flow, gross must be the tax-inclusive order total and tax must be supplied separately; this preset does not calculate tax.",
      "The estimator rounds the component to cents; Lemon Squeezy's published pages do not establish a universal component-rounding policy.",
    ],
    exclusions: [
      "International transactions, PayPal transactions, subscription payments, tax calculation or remittance, affiliate and abandoned-cart marketing fees, refunds, custom pricing, and payout costs.",
    ],
    status: "supported",
  }),
  official({
    id: "lemon-squeezy-us-international-card",
    label: "Lemon Squeezy US account, international card",
    provider: "lemon-squeezy",
    currency: "USD",
    accountCountry: "US",
    taxMode: "zero-only",
    paymentProduct: "Lemon Squeezy single order",
    channel: "online",
    tierPolicy: "explicitly-excluded",
    components: [],
    sources: [lemonFees],
    checkedOn,
    assumptions: ["The account is US/USD, but the transaction is outside the domestic baseline."],
    exclusions: [
      "The documented international additive fee is not applied without a separate transaction-state option and tax/order-total handling.",
    ],
    status: "blocked",
    blockedReason:
      "The official fee page documents an additional 1.5% for international transactions, but this initial linear preset only supports the domestic baseline.",
  }),
  official({
    id: "lemon-squeezy-us-paypal",
    label: "Lemon Squeezy US account, PayPal order",
    provider: "lemon-squeezy",
    currency: "USD",
    accountCountry: "US",
    taxMode: "zero-only",
    paymentProduct: "Lemon Squeezy PayPal order",
    channel: "online",
    tierPolicy: "explicitly-excluded",
    components: [],
    sources: [lemonFees],
    checkedOn,
    assumptions: [
      "The account is US/USD, but the transaction uses Lemon Squeezy's PayPal payment method.",
    ],
    exclusions: [
      "The documented PayPal additive fee is not combined with the domestic baseline here.",
    ],
    status: "blocked",
    blockedReason:
      "The official fee page documents an additional 1.5% for PayPal transactions, but this initial preset does not expose payment-method combinations.",
  }),
  official({
    id: "lemon-squeezy-us-subscription",
    label: "Lemon Squeezy US account, subscription payment",
    provider: "lemon-squeezy",
    currency: "USD",
    accountCountry: "US",
    taxMode: "zero-only",
    paymentProduct: "Lemon Squeezy subscription",
    channel: "online",
    tierPolicy: "explicitly-excluded",
    components: [],
    sources: [lemonFees],
    checkedOn,
    assumptions: ["The account is US/USD, but the transaction is a subscription payment."],
    exclusions: [
      "The documented subscription additive fee and subscription tax-inclusion behavior are not combined with the single-order baseline here.",
    ],
    status: "blocked",
    blockedReason:
      "The official fee page documents an additional 0.5% for subscription payments, but this initial preset does not model subscription state.",
  }),
  official({
    id: "lemon-squeezy-payout",
    label: "Lemon Squeezy payout fee",
    provider: "lemon-squeezy",
    currency: "USD",
    accountCountry: "US",
    taxMode: "zero-only",
    paymentProduct: "Lemon Squeezy payout",
    channel: "online",
    tierPolicy: "explicitly-excluded",
    components: [],
    sources: [lemonFees, lemonGettingPaid],
    checkedOn,
    assumptions: [
      "Payouts are batch-level rather than fees on each order.",
      "The provider's documented payout amount depends on payout method, region, and settlement currency.",
    ],
    exclusions: [
      "No payout fee is added to an individual order or represented as a per-transaction fixed component.",
    ],
    status: "blocked",
    blockedReason:
      "Payout costs are separate from order fees: US Stripe bank payouts are free while US PayPal payouts are $0.50 per payout, and the payout method is not an order-preset input.",
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
