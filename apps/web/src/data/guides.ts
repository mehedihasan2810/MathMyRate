/**
 * Guides answer one question and hand readers to the calculators that finish
 * the job. Every guide names at least two calculators, and each calculator
 * page lists the guides that name it.
 */

import { toolBreadcrumbs, type Crumb, type ToolId } from "./tools";

export type GuideId =
  | "markup-vs-margin"
  | "salary-vs-freelance-rate"
  | "cover-payment-fees"
  | "stripe-fees-explained"
  | "gumroad-threshold"
  | "kdp-royalties-explained"
  | "kickstarter-reward-pricing"
  | "contractor-vs-employee-pay"
  | "raising-your-rates";

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
    id: "contractor-vs-employee-pay",
    href: "/guides/1099-vs-w2-pay/",
    title: "1099 vs W-2: What Contract Work Has to Pay",
    summary:
      "Why the same money is worth less as a contractor, and how much a contract has to pay to match a salary.",
    description:
      "What a contractor must charge to match a salary: both halves of Social Security and Medicare, the benefits you now buy, and the hours you cannot bill.",
    publishedOn: "2026-09-16",
    updatedOn: "2026-09-16",
    tools: ["contractor-rate", "hourly-rate", "salary-to-hourly"],
  },
  {
    id: "raising-your-rates",
    href: "/guides/how-to-raise-your-rates/",
    title: "How to Raise Your Rates Without Earning Less",
    summary:
      "What a raise adds over a year, how much work you could lose and still break even, and how to stage an increase.",
    description:
      "How to raise your freelance rates: what a raise adds each month, how many billable hours you could lose and still earn the same, and how to stage it.",
    publishedOn: "2026-09-16",
    updatedOn: "2026-09-16",
    tools: ["rate-increase", "hourly-rate", "project-rate"],
  },
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
  {
    id: "stripe-fees-explained",
    href: "/guides/stripe-fees-explained/",
    title: "Stripe Fees Explained: What You Pay per Payment",
    summary:
      "Stripe's 2.9% + 30¢, the add-ons for international and manually entered cards, and the fees outside a normal payment, worked out in cents.",
    description:
      "Stripe's 2.9% + 30¢ card fee explained with worked examples: international and manual card add-ons, disputes, refunds, payouts, and what to charge.",
    publishedOn: "2026-09-15",
    updatedOn: "2026-09-15",
    tools: ["stripe-fees", "stripe-vs-paypal"],
  },
  {
    id: "gumroad-threshold",
    href: "/guides/gumroad-20000-threshold/",
    title: "How Gumroad's $20,000 Monthly Threshold Works",
    summary:
      "When Gumroad's direct-sale fee drops from 10% + 50¢ to 5% + 50¢, what it saves on each sale, and what it does not change.",
    description:
      "Gumroad's direct-sale fee drops from 10% + 50¢ to 5% + 50¢ after $20,000 of paid sales in a month. See when it applies and what it saves per sale.",
    publishedOn: "2026-09-15",
    updatedOn: "2026-09-15",
    tools: ["gumroad-fees", "gumroad-vs-lemon-squeezy", "digital-product-fees"],
  },
  {
    id: "kdp-royalties-explained",
    href: "/guides/how-kdp-royalties-work/",
    title: "How KDP Royalties Work: eBooks, Paperbacks, and Printing Costs",
    summary:
      "When 35% beats 70% on a large eBook file, why $9.99 matters for paperbacks, and how printing costs set your lowest price.",
    description:
      "How Amazon KDP pays authors: the 70% and 35% eBook options, delivery costs on large files, the $9.99 paperback threshold, and printing costs.",
    publishedOn: "2026-09-16",
    updatedOn: "2026-09-16",
    tools: ["kdp-royalties", "digital-product-fees"],
  },
  {
    id: "kickstarter-reward-pricing",
    href: "/guides/price-kickstarter-rewards-for-fees/",
    title: "How to Price Kickstarter Rewards to Cover Fees",
    summary:
      "What each pledge leaves after Kickstarter's fees, what a reward must cost to keep a target, and how many backers it takes to net your goal.",
    description:
      "Price Kickstarter rewards after the 5% fee and 3% + 30¢ processing: what each pledge leaves you, what to charge, and how many backers net your goal.",
    publishedOn: "2026-09-16",
    updatedOn: "2026-09-16",
    tools: ["kickstarter-fees", "markup-margin"],
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
