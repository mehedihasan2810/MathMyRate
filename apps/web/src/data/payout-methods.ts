/**
 * Payout methods for the payout fee calculator. Each method lists one or more
 * official presets; rates, limits, and sources live in the presets. A method
 * with a minimum fee or a cap is split into bands by payout amount, in order.
 */

import { effectiveFeeRateBps, getFeePreset, type FeePreset } from "@MathMyRate/calculators";

import { calculateBandedFees } from "../lib/fee-bands";

import { formatPercentBps } from "../scripts/calculator-form";

export interface PayoutMethod {
  readonly id: string;
  /** Contiguous bands, lowest amounts first. */
  readonly presetIds: readonly string[];
  readonly provider: string;
  readonly label: string;
  readonly description: string;
  /** Names the supported scenario above the form. */
  readonly note: string;
  /** Names the payout in copied results. */
  readonly copyName: string;
  /**
   * "on-top": the amount entered reaches you and the fee comes out of the
   * balance as well, as with Stripe Instant Payouts. "from-payout": the fee
   * comes out of the amount entered.
   */
  readonly feeCharged: "from-payout" | "on-top";
}

/** The amount field and result wording for each way a fee is charged. */
export const amountCopy = {
  "from-payout": {
    label: "Balance to pay out",
    help: "The amount leaving your balance. The fee comes out of it.",
    resultNote: "after the payout fee",
  },
  "on-top": {
    label: "Amount to receive",
    help: "What reaches you. The fee comes out of your balance on top.",
    resultNote: "with the fee taken from your balance",
  },
} as const satisfies Record<
  PayoutMethod["feeCharged"],
  Record<"label" | "help" | "resultNote", string>
>;

export const payoutMethods: readonly PayoutMethod[] = [
  {
    id: "gumroad-instant",
    presetIds: ["gumroad-us-instant-payout"],
    provider: "Gumroad",
    label: "Gumroad instant payout",
    description: "3% of the payout, from $1 to $10,000.",
    note: "Supported scenario: eligible US creator taking an instant Gumroad payout of $1 to $10,000.",
    copyName: "Gumroad instant payout",
    feeCharged: "from-payout",
  },
  {
    id: "patreon-direct-deposit",
    presetIds: ["patreon-us-direct-deposit-payout"],
    provider: "Patreon",
    label: "Patreon direct deposit",
    description: "$0.25 per payout.",
    note: "Supported scenario: US creator paid in USD withdrawing a Patreon balance by direct deposit.",
    copyName: "Patreon direct deposit payout",
    feeCharged: "from-payout",
  },
  {
    id: "patreon-paypal",
    presetIds: [
      "patreon-us-paypal-payout-minimum",
      "patreon-us-paypal-payout",
      "patreon-us-paypal-payout-cap",
    ],
    provider: "Patreon",
    label: "Patreon to PayPal",
    description: "1% of the payout, at least $0.25 and at most $20. Payouts of $10 or more.",
    note: "Supported scenario: US creator paid in USD withdrawing a Patreon balance of $10 or more to PayPal.",
    copyName: "Patreon payout to PayPal",
    feeCharged: "from-payout",
  },
  {
    id: "lemon-squeezy-bank",
    presetIds: ["lemon-squeezy-us-bank-payout"],
    provider: "Lemon Squeezy",
    label: "Lemon Squeezy bank payout",
    description: "Free for US bank accounts. Payouts of $50 or more.",
    note: "Supported scenario: seller with a US bank account taking a Lemon Squeezy payout of $50 or more.",
    copyName: "Lemon Squeezy bank payout",
    feeCharged: "from-payout",
  },
  {
    id: "lemon-squeezy-paypal",
    presetIds: ["lemon-squeezy-us-paypal-payout"],
    provider: "Lemon Squeezy",
    label: "Lemon Squeezy to PayPal",
    description: "$0.50 per payout. Payouts of $50 or more.",
    note: "Supported scenario: seller with a verified US PayPal account taking a Lemon Squeezy payout of $50 or more.",
    copyName: "Lemon Squeezy payout to PayPal",
    feeCharged: "from-payout",
  },
  {
    id: "stripe-standard",
    presetIds: ["stripe-us-standard-payout"],
    provider: "Stripe",
    label: "Stripe standard payout",
    description: "Free, on your automatic or manual payout schedule.",
    note: "Supported scenario: US Stripe account paying out USD to its bank account on the standard schedule.",
    copyName: "Stripe standard payout",
    feeCharged: "from-payout",
  },
  {
    id: "stripe-instant",
    presetIds: ["stripe-us-instant-payout-minimum", "stripe-us-instant-payout"],
    provider: "Stripe",
    label: "Stripe Instant Payout",
    description: "1.5% of the payout, at least 50¢, for $0.50 to $9,999. The fee comes on top.",
    note: "Supported scenario: eligible US Stripe Dashboard user taking an Instant Payout of $0.50 to $9,999. Enter the amount you want to receive.",
    copyName: "Stripe Instant Payout",
    feeCharged: "on-top",
  },
  {
    id: "venmo-instant",
    presetIds: [
      "venmo-us-instant-transfer-minimum",
      "venmo-us-instant-transfer",
      "venmo-us-instant-transfer-cap",
    ],
    provider: "Venmo",
    label: "Venmo Instant Transfer",
    description: "1.75% of the transfer, at least 25¢ and at most $25.",
    note: "Supported scenario: US profile transferring USD instantly to an eligible linked debit card or bank account.",
    copyName: "Venmo Instant Transfer",
    feeCharged: "from-payout",
  },
];

/**
 * The payout fee as a share of the payout. A flat fee on a large payout can
 * round to 0.00%, so a fee that exists never reads as zero.
 */
export function payoutFeeShare(feeCents: bigint, payoutCents: bigint): string {
  const bps = effectiveFeeRateBps(feeCents, payoutCents);

  if (bps === 0n && feeCents > 0n) return "under 0.01%";

  return formatPercentBps(bps);
}

export function findPayoutMethod(id: string): PayoutMethod {
  const method = payoutMethods.find((candidate) => candidate.id === id) ?? payoutMethods[0];

  if (!method) throw new Error("No payout methods are configured.");

  return method;
}

export function payoutPresets(method: PayoutMethod): readonly FeePreset[] {
  return method.presetIds.map((id) => {
    const preset = getFeePreset(id);

    if (!preset) throw new Error(`The ${id} payout preset is missing from the registry.`);

    return preset;
  });
}

export interface PayoutBreakdown {
  /** The amount the fee is priced on. */
  readonly payoutCents: bigint;
  readonly feeCents: bigint;
  readonly receivedCents: bigint;
  readonly balanceUsedCents: bigint;
  readonly result: ReturnType<typeof calculateBandedFees>;
}

/** Prices a payout and says what reaches you and what leaves your balance. */
export function payoutBreakdown(method: PayoutMethod, payoutCents: bigint): PayoutBreakdown {
  const result = calculatePayout(method, payoutCents);

  return method.feeCharged === "on-top"
    ? {
        payoutCents,
        feeCents: result.feeCents,
        receivedCents: payoutCents,
        balanceUsedCents: payoutCents + result.feeCents,
        result,
      }
    : {
        payoutCents,
        feeCents: result.feeCents,
        receivedCents: result.sellerProceedsCents,
        balanceUsedCents: payoutCents,
        result,
      };
}

/** Prices a payout with the band that covers it. */
export function calculatePayout(
  method: PayoutMethod,
  payoutCents: bigint,
): ReturnType<typeof calculateBandedFees> {
  return calculateBandedFees(payoutPresets(method), payoutCents);
}
