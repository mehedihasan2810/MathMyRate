/**
 * Calculators for platforms that take a percentage fee from a freelancer's
 * earnings, with the withdrawal fees they publish. Every rate and fee here
 * comes from the platform's own pages, reviewed on `reviewedOn`.
 */

import type { ToolId } from "./tools";

export type ServiceFeeCalculatorId = "upwork" | "fiverr";

export interface ContractOption {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  /** A fixed fee in basis points, or null when the freelancer enters the rate from their contract. */
  readonly feeBps: number | null;
  /** Explains where the rate comes from, shown above the form. */
  readonly note: string;
}

export interface WithdrawalOption {
  readonly id: string;
  readonly label: string;
  readonly feeCents: number;
  /** The most one withdrawal can send, when the platform states a limit. */
  readonly maxTransferCents: number | null;
  /** The least one withdrawal can send, when the platform states a minimum. */
  readonly minTransferCents: number | null;
}

export interface ServiceFeeCalculatorConfig {
  readonly id: ServiceFeeCalculatorId;
  readonly toolId: ToolId;
  readonly provider: string;
  readonly feeName: string;
  /** How the rate reads in summaries, such as "20% of each order". */
  readonly rateSummary: string;
  readonly formHeading: string;
  readonly contractLegend: string;
  readonly paidModeLabel: string;
  readonly amountLabel: string;
  readonly amountHelp: string;
  readonly earningsRowLabel: string;
  readonly targetPrimaryLabel: string;
  /** What one payment is called in copied results: "contract" or "order". */
  readonly copyNoun: string;
  /** The amount the page opens with. */
  readonly exampleCents: number;
  /** The example rate for contracts where the freelancer enters the rate. */
  readonly exampleFeeBps: number;
  readonly maxFeeBps: number;
  readonly feeHelp: string;
  readonly contracts: readonly ContractOption[];
  readonly withdrawals: readonly WithdrawalOption[];
  readonly reviewedOn: string;
  readonly sources: readonly { readonly title: string; readonly url: string }[];
}

export const serviceFeeCalculators: readonly ServiceFeeCalculatorConfig[] = [
  {
    id: "upwork",
    toolId: "upwork-fees",
    provider: "Upwork",
    feeName: "Freelancer Service Fee",
    rateSummary: "0% to 15%, set per contract",
    formHeading: "Contract earnings",
    contractLegend: "What kind of contract is it?",
    paidModeLabel: "Client paid an amount",
    amountLabel: "Earnings billed to the client",
    amountHelp: "Hourly, fixed-price, bonus, or expense payments.",
    earningsRowLabel: "Earnings billed",
    targetPrimaryLabel: "Bill the client",
    copyNoun: "contract",
    exampleCents: 100_000,
    exampleFeeBps: 1_000,
    maxFeeBps: 1_500,
    feeHelp: "Shown on your proposal, offer, or contract details. Upwork's range is 0% to 15%.",
    contracts: [
      {
        id: "marketplace",
        label: "Marketplace contract",
        description: "Enter the fee shown for this contract.",
        feeBps: null,
        note: "Upwork's Freelancer Service Fee ranges from 0% to 15% per contract and is locked in once a proposal, offer, or contract is sent. The page opens with 10%, the rate Upwork's own examples use.",
      },
      {
        id: "direct",
        label: "Direct Contract",
        description: "A client you brought to Upwork: 5%.",
        feeBps: 500,
        note: "Upwork charges a 5% freelancer service fee on the earnings you make on Direct Contracts.",
      },
      {
        id: "direct-plus",
        label: "Direct Contract with Freelancer Plus",
        description: "An active Freelancer Plus membership: 0%.",
        feeBps: 0,
        note: "Active Freelancer Plus members pay no freelancer service fee on Direct Contracts.",
      },
      {
        id: "enterprise",
        label: "Enterprise client",
        description: "Typically 10%.",
        feeBps: 1_000,
        note: "Upwork says freelancers working with Enterprise clients typically pay 10%, unless the Enterprise client's contract says otherwise.",
      },
    ],
    withdrawals: [
      {
        id: "bank",
        label: "Direct to U.S. Bank (free)",
        feeCents: 0,
        maxTransferCents: null,
        minTransferCents: null,
      },
      {
        id: "instant",
        label: "Instant Pay ($2.00)",
        feeCents: 200,
        maxTransferCents: 299_900,
        minTransferCents: null,
      },
      {
        id: "wire",
        label: "U.S. Dollar Wire Transfer ($50.00)",
        feeCents: 5_000,
        maxTransferCents: null,
        minTransferCents: null,
      },
    ],
    reviewedOn: "2026-09-15",
    sources: [
      {
        title: "Learn about the Freelancer Service Fee – Upwork Help",
        url: "https://support.upwork.com/hc/en-us/articles/211062538-Learn-about-the-Freelancer-Service-Fee",
      },
      {
        title: "Direct Contracts (bring a client to Upwork) – Upwork Help",
        url: "https://support.upwork.com/hc/en-us/articles/360025040794-Direct-Contracts-bring-a-client-to-Upwork",
      },
      {
        title: "How bonus, expense, and misc. payments work – Upwork Help",
        url: "https://support.upwork.com/hc/en-us/articles/41471537743251-How-bonus-expense-and-misc-payments-work",
      },
      {
        title: "How to get paid on Upwork – Upwork Help",
        url: "https://support.upwork.com/hc/en-us/articles/211060918-How-to-get-paid-on-Upwork",
      },
      {
        title: "Direct to U.S. Bank: timing and fees explained – Upwork Help",
        url: "https://support.upwork.com/hc/en-us/articles/227022468-Direct-to-U-S-Bank-timing-and-fees-explained",
      },
      {
        title: "How to set up Instant Pay for fast withdrawals – Upwork Help",
        url: "https://support.upwork.com/hc/en-us/articles/360033794994-How-to-set-up-Instant-Pay-for-fast-withdrawals",
      },
      {
        title: "Upwork Pricing: Plans and Fees for Freelancers",
        url: "https://www.upwork.com/pricing/freelancer",
      },
    ],
  },
  {
    id: "fiverr",
    toolId: "fiverr-fees",
    provider: "Fiverr",
    feeName: "Fiverr's 20% commission",
    rateSummary: "20% of each order",
    formHeading: "Order earnings",
    contractLegend: "What kind of payment is it?",
    paidModeLabel: "Buyer paid for an order",
    amountLabel: "Order price",
    amountHelp: "The order, Gig Extras, or tip, before the buyer's service fee.",
    earningsRowLabel: "Order price",
    targetPrimaryLabel: "Price the order at",
    copyNoun: "order",
    exampleCents: 10_000,
    exampleFeeBps: 2_000,
    maxFeeBps: 2_000,
    feeHelp: "Fiverr keeps 20% of each order.",
    contracts: [
      {
        id: "order",
        label: "Order, Gig Extra, or tip",
        description: "Fiverr keeps 20%.",
        feeBps: 2_000,
        note: "Fiverr keeps 20% of the purchase amount, including Gig Extras and tips, and you earn 80%. With a coupon or promotion, the 20% is taken from the discounted price.",
      },
    ],
    withdrawals: [
      {
        id: "paypal",
        label: "PayPal (free)",
        feeCents: 0,
        maxTransferCents: 500_000,
        minTransferCents: 100,
      },
      {
        id: "payoneer",
        label: "Payoneer Account ($3)",
        feeCents: 300,
        maxTransferCents: 500_000,
        minTransferCents: 1_000,
      },
    ],
    reviewedOn: "2026-09-15",
    sources: [
      {
        title: "Your earnings page – Fiverr Help Center",
        url: "https://help.fiverr.com/hc/en-us/articles/9234443621137-Your-earnings-page",
      },
      {
        title: "How Fiverr works for freelancers – Fiverr Help Center",
        url: "https://help.fiverr.com/hc/en-us/articles/34069565843985-How-Fiverr-works-for-freelancers",
      },
      {
        title: "Growth Tools for Seller Plus – Fiverr Help Center",
        url: "https://help.fiverr.com/hc/en-us/articles/5244747923985-Growth-Tools-for-Seller-Plus",
      },
      {
        title: "Withdrawing your earnings & managing payout methods – Fiverr Help Center",
        url: "https://help.fiverr.com/hc/en-us/articles/360010530058-Withdrawing-your-earnings-managing-payout-methods",
      },
      {
        title: "Setting up PayPal as a payout method – Fiverr Help Center",
        url: "https://help.fiverr.com/hc/en-us/articles/360011149477-Setting-up-PayPal-as-a-payout-method",
      },
      {
        title: "Setting up Payoneer as a payout method – Fiverr Help Center",
        url: "https://help.fiverr.com/hc/en-us/articles/14257019400465-Setting-up-Payoneer-as-a-payout-method",
      },
      {
        title:
          "Managing your orders: A freelancer's guide to the Fiverr order process – Fiverr Help Center",
        url: "https://help.fiverr.com/hc/en-us/articles/360010639617-Managing-your-orders-A-freelancer-s-guide-to-the-Fiverr-order-process",
      },
      {
        title: "Early Payout – Fiverr Help Center",
        url: "https://help.fiverr.com/hc/en-us/articles/4402267122449-Early-Payout",
      },
      {
        title: "Paying for orders, extras, or custom offers – Fiverr Help Center",
        url: "https://help.fiverr.com/hc/en-us/articles/360050216133-Paying-for-orders-extras-or-custom-offers",
      },
      {
        title: "How Fiverr works for clients – Fiverr Help Center",
        url: "https://help.fiverr.com/hc/en-us/articles/360010558038-How-Fiverr-works-for-clients",
      },
      {
        title: "Partial refunds – Fiverr Help Center",
        url: "https://help.fiverr.com/hc/en-us/articles/15770574712977-Partial-refunds",
      },
      {
        title:
          "Seller Plus Standard and Premium: Advanced tools for business growth – Fiverr Help Center",
        url: "https://help.fiverr.com/hc/en-us/articles/360017140717-Seller-Plus-Standard-and-Premium-Advanced-tools-for-business-growth",
      },
    ],
  },
];

export function findServiceFeeCalculator(id: string): ServiceFeeCalculatorConfig {
  const config = serviceFeeCalculators.find((candidate) => candidate.id === id);

  if (!config) throw new Error(`Unknown service fee calculator: ${id}`);

  return config;
}
