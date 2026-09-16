/**
 * Calculators that can be embedded on other sites. Each one has a noindex
 * /embed/<slug>/ page and a snippet on its own page when a site is configured.
 */

import { feeCalculators, type FeeCalculatorId } from "./fee-calculators";
import type { ToolId } from "./tools";

export type StandaloneEmbedId =
  | "hourly-rate"
  | "project-rate"
  | "retainer"
  | "markup-margin"
  | "salary-to-hourly"
  | "upwork-fees"
  | "fiverr-fees"
  | "kdp-royalties"
  | "early-payment-discount"
  | "rate-increase"
  | "contractor-rate";

export type EmbeddableTool =
  | {
      readonly kind: "fee";
      readonly toolId: ToolId;
      readonly calculatorId: FeeCalculatorId;
      /** Suggested iframe height: the embed page's height at 360 px wide, rounded up. */
      readonly heightPx: number;
    }
  | { readonly kind: "standalone"; readonly toolId: StandaloneEmbedId; readonly heightPx: number };

const feeHeights: Readonly<Record<FeeCalculatorId, number>> = {
  stripe: 1_800,
  paypal: 2_100,
  square: 2_300,
  etsy: 1_850,
  ebay: 2_250,
  kickstarter: 1_650,
  patreon: 2_150,
  kofi: 1_800,
  substack: 1_700,
  payhip: 1_750,
  gumroad: 1_750,
  "lemon-squeezy": 1_900,
};

const standaloneEmbedIds: readonly StandaloneEmbedId[] = [
  "hourly-rate",
  "project-rate",
  "retainer",
  "markup-margin",
  "salary-to-hourly",
  "upwork-fees",
  "fiverr-fees",
  "kdp-royalties",
  "early-payment-discount",
  "rate-increase",
  "contractor-rate",
];

const standaloneHeights: Readonly<Record<StandaloneEmbedId, number>> = {
  "hourly-rate": 1_750,
  "project-rate": 1_500,
  retainer: 1_550,
  "markup-margin": 1_400,
  "salary-to-hourly": 1_500,
  "upwork-fees": 1_950,
  "fiverr-fees": 1_400,
  "kdp-royalties": 1_650,
  "early-payment-discount": 1_400,
  "rate-increase": 1_750,
  "contractor-rate": 2_000,
};

export const embeddableTools: readonly EmbeddableTool[] = [
  ...feeCalculators.map((config) => ({
    kind: "fee" as const,
    toolId: config.toolId,
    calculatorId: config.id,
    heightPx: feeHeights[config.id],
  })),
  ...standaloneEmbedIds.map((toolId) => ({
    kind: "standalone" as const,
    toolId,
    heightPx: standaloneHeights[toolId],
  })),
];

export function findEmbed(id: ToolId): EmbeddableTool | undefined {
  return embeddableTools.find((embed) => embed.toolId === id);
}
