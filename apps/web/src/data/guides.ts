/**
 * Guides answer one question and hand readers to the calculators that finish
 * the job. Every guide names at least two calculators, and each calculator
 * page lists the guides that name it.
 */

import { toolBreadcrumbs, type Crumb, type ToolId } from "./tools";

export type GuideId = "markup-vs-margin" | "salary-vs-freelance-rate" | "cover-payment-fees";

export interface Guide {
  readonly id: GuideId;
  readonly href: string;
  /** The page H1 and Article headline. */
  readonly title: string;
  readonly summary: string;
  /** The meta description: 120 to 160 characters. */
  readonly description: string;
  readonly publishedOn: string;
  readonly updatedOn: string;
  /** Calculators the guide hands readers to, most relevant first. */
  readonly tools: readonly ToolId[];
}

export const guidesIndex: Crumb = { name: "Guides", href: "/guides/" };

export const guides: readonly Guide[] = [
  {
    id: "markup-vs-margin",
    href: "/guides/markup-vs-margin/",
    title: "Markup vs Margin: What's the Difference?",
    summary:
      "Why a 50% markup is only a 33.33% margin, how to convert between the two, and how to price for the margin you want.",
    description:
      "Markup is profit as a share of cost; margin is profit as a share of price. See why a 50% markup is a 33.33% margin, with formulas and conversion tables.",
    publishedOn: "2026-09-15",
    updatedOn: "2026-09-15",
    tools: ["markup-margin", "project-rate"],
  },
  {
    id: "salary-vs-freelance-rate",
    href: "/guides/salary-vs-freelance-rate/",
    title: "How to Compare a Salary With a Freelance Rate",
    summary:
      "Turn a salary into an hourly figure, then see why the freelance rate that replaces it has to be higher.",
    description:
      "Turn a salary into an hourly figure, then see why a freelance rate that replaces it must be higher once unbillable hours, time off, and costs count.",
    publishedOn: "2026-09-15",
    updatedOn: "2026-09-15",
    tools: ["salary-to-hourly", "hourly-rate", "retainer"],
  },
  {
    id: "cover-payment-fees",
    href: "/guides/how-to-cover-payment-processing-fees/",
    title: "How to Charge Enough to Cover Payment Processing Fees",
    summary:
      "Why adding the fee to your price falls short, the formula that works, and what to charge on Stripe, PayPal, Square, and Etsy.",
    description:
      "Why adding the fee to your price falls a few cents short, the formula that works, and what to charge to keep $100 on Stripe, PayPal, Square, and Etsy.",
    publishedOn: "2026-09-15",
    updatedOn: "2026-09-15",
    tools: ["stripe-fees", "paypal-fees", "square-fees", "etsy-fees", "stripe-vs-paypal"],
  },
];

export function findGuide(id: GuideId): Guide {
  const guide = guides.find((candidate) => candidate.id === id);

  if (!guide) throw new Error(`Unknown guide: ${id}`);

  return guide;
}

export function guidesForTool(id: ToolId): readonly Guide[] {
  return guides.filter((guide) => guide.tools.includes(id));
}

export function guideBreadcrumbs(id: GuideId): readonly Crumb[] {
  const guide = findGuide(id);
  const [home] = toolBreadcrumbs("hourly-rate");

  if (!home) throw new Error("The breadcrumb trail has no home link.");

  return [home, guidesIndex, { name: guide.title, href: guide.href }];
}
