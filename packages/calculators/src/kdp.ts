import { Schema } from "effect";

import { Cents } from "./money.ts";

/**
 * Amazon KDP royalties for books sold on Amazon.com in USD, from KDP's
 * published royalty, pricing, and printing cost pages. Every amount is in
 * cents; KDP rounds costs and royalties to 2 decimal places, applied here
 * half away from zero.
 */

const BASIS_POINTS = 10_000n;

function roundHalfAwayFromZero(numerator: bigint, denominator: bigint): bigint {
  const magnitude = numerator < 0n ? -numerator : numerator;
  const rounded = (magnitude * 2n + denominator) / (denominator * 2n);

  return numerator < 0n ? -rounded : rounded;
}

function ceilDivide(numerator: bigint, denominator: bigint): bigint {
  return (numerator + denominator - 1n) / denominator;
}

/* --------------------------------- eBooks --------------------------------- */

export const EbookRoyaltyOption = Schema.Literals(["35", "70"]);

export type EbookRoyaltyOption = typeof EbookRoyaltyOption.Type;

const EbookInput = Schema.Struct({
  listPriceCents: Cents,
  option: EbookRoyaltyOption,
  /** The file size KDP shows, in hundredths of a megabyte, so 2.5 MB is 250. */
  fileSizeHundredthsMb: Schema.Int.check(Schema.isBetween({ minimum: 1, maximum: 65_000 })),
});

export interface EbookRoyaltyResult {
  readonly listPriceCents: bigint;
  readonly royaltyRateBps: number;
  /** Charged only under the 70% option: $0.15 per MB, at least $0.01. */
  readonly deliveryCostCents: bigint;
  readonly royaltyCents: bigint;
  readonly minimumListPriceCents: bigint;
  readonly maximumListPriceCents: bigint;
  readonly priceInRange: boolean;
}

/**
 * The royalty on one Amazon.com eBook sale to a US customer, where no VAT
 * applies. 70% royalty = 70% × (list price − delivery cost); 35% royalty =
 * 35% × list price. The list price range depends on the option and, for 35%,
 * the file size.
 */
export function calculateEbookRoyalty(input: {
  listPriceCents: bigint;
  option: EbookRoyaltyOption;
  fileSizeHundredthsMb: number;
}): EbookRoyaltyResult {
  const { listPriceCents, option, fileSizeHundredthsMb } = Schema.decodeSync(EbookInput)(input);
  const seventy = option === "70";
  const royaltyRateBps = seventy ? 7_000 : 3_500;
  const deliveryExact = roundHalfAwayFromZero(15n * BigInt(fileSizeHundredthsMb), 100n);
  const deliveryCostCents = seventy ? (deliveryExact > 1n ? deliveryExact : 1n) : 0n;

  const minimumListPriceCents = seventy
    ? 299n
    : fileSizeHundredthsMb < 300
      ? 99n
      : fileSizeHundredthsMb < 1_000
        ? 199n
        : 299n;

  const maximumListPriceCents = seventy ? 1_299n : 20_000n;

  return {
    listPriceCents,
    royaltyRateBps,
    deliveryCostCents,
    royaltyCents: roundHalfAwayFromZero(
      (listPriceCents - deliveryCostCents) * BigInt(royaltyRateBps),
      BASIS_POINTS,
    ),
    minimumListPriceCents,
    maximumListPriceCents,
    priceInRange:
      listPriceCents >= minimumListPriceCents && listPriceCents <= maximumListPriceCents,
  };
}

/* ------------------------------ Print books ------------------------------- */

export const PrintFormat = Schema.Literals(["paperback", "hardcover"]);

export type PrintFormat = typeof PrintFormat.Type;

export const PrintInk = Schema.Literals(["black", "groundwood", "standard-color", "premium-color"]);

export type PrintInk = typeof PrintInk.Type;

export const TrimSize = Schema.Literals(["regular", "large"]);

export type TrimSize = typeof TrimSize.Type;

/** One row of a printing cost table, in hundredths of a cent, as [regular trim, large trim]. */
interface CostRow {
  readonly minPages: number;
  readonly maxPages: number;
  readonly fixed: readonly [number, number];
  readonly perPage: readonly [number, number];
}

/**
 * Amazon.com printing costs. Black-ink paperbacks with 24 to 110 pages, and
 * black-ink hardcovers with 75 to 108 pages, pay only the fixed cost.
 */
const printingCosts: Readonly<Record<PrintFormat, Partial<Record<PrintInk, readonly CostRow[]>>>> =
  {
    paperback: {
      black: [
        { minPages: 24, maxPages: 110, fixed: [23_000, 28_400], perPage: [0, 0] },
        { minPages: 111, maxPages: 828, fixed: [10_000, 10_000], perPage: [120, 170] },
      ],
      groundwood: [
        { minPages: 24, maxPages: 112, fixed: [22_300, 27_500], perPage: [0, 0] },
        { minPages: 114, maxPages: 828, fixed: [10_000, 10_000], perPage: [114, 162] },
      ],
      "premium-color": [
        { minPages: 24, maxPages: 40, fixed: [36_000, 42_000], perPage: [0, 0] },
        { minPages: 42, maxPages: 828, fixed: [10_000, 10_000], perPage: [650, 800] },
      ],
      "standard-color": [
        { minPages: 72, maxPages: 600, fixed: [10_000, 10_000], perPage: [255, 402] },
      ],
    },
    hardcover: {
      black: [
        { minPages: 75, maxPages: 108, fixed: [68_000, 74_900], perPage: [0, 0] },
        { minPages: 110, maxPages: 550, fixed: [56_500, 56_500], perPage: [120, 170] },
      ],
      "premium-color": [
        { minPages: 75, maxPages: 550, fixed: [56_500, 56_500], perPage: [650, 800] },
      ],
    },
  };

/** A print specification KDP's Amazon.com printing cost tables do not price. */
export class PrintSpecificationError extends RangeError {
  constructor(
    readonly problem: "ink" | "pages",
    message: string,
  ) {
    super(message);
    this.name = "PrintSpecificationError";
  }
}

const PrintInput = Schema.Struct({
  format: PrintFormat,
  ink: PrintInk,
  trim: TrimSize,
  pages: Schema.Int.check(Schema.isBetween({ minimum: 1, maximum: 5_000 })),
  listPriceCents: Cents,
});

export interface PrintRoyaltyResult {
  readonly listPriceCents: bigint;
  readonly printingCostCents: bigint;
  readonly royaltyRateBps: number;
  readonly royaltyCents: bigint;
  /** The printing cost divided by the royalty rate this list price gets, rounded up to the cent. */
  readonly minimumListPriceCents: bigint;
  /** The printing cost divided by 50% and by 60%, rounded up to the cent. KDP does not say how it chooses between them near $9.99. */
  readonly minimumAtFiftyCents: bigint;
  readonly minimumAtSixtyCents: bigint;
  readonly maximumListPriceCents: bigint;
  readonly priceInRange: boolean;
}

/** The printing cost of one book, rounded to the cent. */
export function calculatePrintingCost(input: {
  format: PrintFormat;
  ink: PrintInk;
  trim: TrimSize;
  pages: number;
}): bigint {
  const { format, ink, trim, pages } = Schema.decodeSync(PrintInput)({
    ...input,
    listPriceCents: 0n,
  });

  const rows = printingCosts[format][ink];

  if (!rows) {
    throw new PrintSpecificationError(
      "ink",
      `KDP does not offer ${ink.replace("-", " ")} ink for ${format}s.`,
    );
  }

  const row = rows.find((candidate) => pages >= candidate.minPages && pages <= candidate.maxPages);

  if (!row) {
    throw new PrintSpecificationError(
      "pages",
      `KDP's printing cost table for this ${format} has no row for ${pages} pages.`,
    );
  }

  const column = trim === "regular" ? 0 : 1;
  const hundredthsOfCent = BigInt(row.fixed[column]) + BigInt(pages) * BigInt(row.perPage[column]);

  return roundHalfAwayFromZero(hundredthsOfCent, 100n);
}

/**
 * The royalty on one Amazon.com paperback or hardcover sale: (royalty rate ×
 * list price) − printing cost. The rate is 50% at a list price of $9.98 or
 * less and 60% at $9.99 or more. List prices exclude tax.
 */
export function calculatePrintRoyalty(input: {
  format: PrintFormat;
  ink: PrintInk;
  trim: TrimSize;
  pages: number;
  listPriceCents: bigint;
}): PrintRoyaltyResult {
  const values = Schema.decodeSync(PrintInput)(input);
  const printingCostCents = calculatePrintingCost(values);
  const royaltyRateBps = values.listPriceCents <= 998n ? 5_000 : 6_000;
  const rate = BigInt(royaltyRateBps);
  const minimumListPriceCents = ceilDivide(printingCostCents * BASIS_POINTS, rate);
  const maximumListPriceCents = 25_000n;

  return {
    listPriceCents: values.listPriceCents,
    printingCostCents,
    royaltyRateBps,
    royaltyCents:
      roundHalfAwayFromZero(values.listPriceCents * rate, BASIS_POINTS) - printingCostCents,
    minimumListPriceCents,
    minimumAtFiftyCents: ceilDivide(printingCostCents * BASIS_POINTS, 5_000n),
    minimumAtSixtyCents: ceilDivide(printingCostCents * BASIS_POINTS, 6_000n),
    maximumListPriceCents,
    priceInRange:
      values.listPriceCents >= minimumListPriceCents &&
      values.listPriceCents <= maximumListPriceCents,
  };
}
