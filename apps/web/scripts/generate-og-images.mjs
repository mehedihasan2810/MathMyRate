/**
 * Generates the static Open Graph images (1200x630 PNG) committed to
 * public/og/. Lawn-style: pages reference pre-made images; there is no
 * runtime image generation.
 *
 * Run from apps/web: pnpm run og:images
 * Regenerate whenever a page title/description or the brand palette changes.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";
import satori from "satori";

const WIDTH = 1200;

const HEIGHT = 630;

const OUT_DIR = fileURLToPath(new URL("../public/og/", import.meta.url));

/** Palette mirrors the --color-* tokens in src/styles/global.css. */
const palette = {
  ink: "#131f33",
  paper: "#f4f5f7",
  mist: "#e9edf3",
  navy: "#1f3a5f",
  gold: "#b98d2f",
  line: "#d9dce4",
  eyebrow: "#5c6f95",
  inkSoft: "rgba(19, 31, 51, 0.68)",
};

const font = (pkg, file) =>
  readFileSync(fileURLToPath(import.meta.resolve(`@fontsource/${pkg}/files/${file}`)));

const fonts = [400, 500, 600, 700].map((weight) => ({
  name: "Inter",
  data: font("inter", `inter-latin-${weight}-normal.woff`),
  weight,
  style: "normal",
}));

/**
 * One card per image. Copy mirrors each page's title/description so the
 * shared card matches what crawlers show next to it.
 */
const cards = [
  {
    file: "default",
    eyebrow: "MathMyRate",
    accent: palette.navy,
    title: "Practical pricing calculators for independent work.",
    description: "Planning tools, not financial advice.",
    path: "/",
  },
  {
    file: "home",
    eyebrow: "Price your independent work",
    accent: palette.navy,
    title: "Every calculator, one page.",
    description: "Practical, transparent rate planning for independent work.",
    path: "/",
  },
  {
    file: "hourly-rate",
    eyebrow: "Freelance / Hourly & day rate",
    accent: palette.navy,
    title: "Freelance hourly rate calculator",
    description: "Turn an annual take-home target into a practical floor rate.",
    path: "/freelance/hourly-rate-calculator/",
  },
  {
    file: "project-rate",
    eyebrow: "Freelance / Project quote",
    accent: palette.navy,
    title: "Project rate calculator",
    description: "Turn scope, contingency, and expenses into a clear project quote.",
    path: "/freelance/project-rate-calculator/",
  },
  {
    file: "retainer",
    eyebrow: "Freelance / Retainer",
    accent: palette.navy,
    title: "Freelance retainer calculator",
    description: "Price a monthly retainer from your rate, included hours, and discount.",
    path: "/freelance/retainer-calculator/",
  },
  {
    file: "markup-margin",
    eyebrow: "Freelance / Markup & margin",
    accent: palette.navy,
    title: "Markup and margin calculator",
    description: "Set a price from a markup or a margin, or check the numbers on a price.",
    path: "/freelance/markup-margin-calculator/",
  },
  {
    file: "salary-to-hourly",
    eyebrow: "Freelance / Salary to hourly",
    accent: palette.navy,
    title: "Salary to hourly calculator",
    description: "Hourly, daily, weekly, monthly, and yearly pay from one number.",
    path: "/freelance/salary-to-hourly-calculator/",
  },
  {
    file: "fees",
    eyebrow: "Payment fees",
    accent: palette.gold,
    title: "Platform fee calculators",
    description:
      "Estimate platform and processing fees for a sale, and what the sale really pays you.",
    path: "/fees/",
  },
  {
    file: "stripe",
    eyebrow: "Payment fees / Stripe",
    accent: palette.gold,
    title: "Stripe fee calculator",
    description: "What you keep from a sale, and what to charge to net a target amount.",
    path: "/fees/stripe-fee-calculator/",
  },
  {
    file: "paypal",
    eyebrow: "Payment fees / PayPal",
    accent: palette.gold,
    title: "PayPal fee calculator",
    description: "What you keep from a sale, and what to charge to net a target amount.",
    path: "/fees/paypal-fee-calculator/",
  },
  {
    file: "square",
    eyebrow: "Payment fees / Square",
    accent: palette.gold,
    title: "Square fee calculator",
    description: "In-person, online, and keyed-in fees on every Square plan.",
    path: "/fees/square-fee-calculator/",
  },
  {
    file: "etsy",
    eyebrow: "Payment fees / Etsy",
    accent: palette.gold,
    title: "Etsy fee calculator",
    description: "Transaction, processing, and listing fees on an Etsy order.",
    path: "/fees/etsy-fee-calculator/",
  },
  {
    file: "ebay",
    eyebrow: "Payment fees / eBay",
    accent: palette.gold,
    title: "eBay fee calculator",
    description: "Final value and per-order fees by category, and what you keep.",
    path: "/fees/ebay-fee-calculator/",
  },
  {
    file: "upwork",
    eyebrow: "Payment fees / Upwork",
    accent: palette.gold,
    title: "Upwork fee calculator",
    description: "The Freelancer Service Fee and withdrawal fees on your earnings.",
    path: "/fees/upwork-fee-calculator/",
  },
  {
    file: "fiverr",
    eyebrow: "Payment fees / Fiverr",
    accent: palette.gold,
    title: "Fiverr fee calculator",
    description: "The 20% seller commission and withdrawal fees on an order.",
    path: "/fees/fiverr-fee-calculator/",
  },
  {
    file: "kickstarter",
    eyebrow: "Payment fees / Kickstarter",
    accent: palette.gold,
    title: "Kickstarter fee calculator",
    description: "The 5% fee and processing on each pledge, and campaign totals.",
    path: "/fees/kickstarter-fee-calculator/",
  },
  {
    file: "patreon",
    eyebrow: "Payment fees / Patreon",
    accent: palette.gold,
    title: "Patreon fee calculator",
    description: "Platform, processing, and iOS fees on a membership.",
    path: "/fees/patreon-fee-calculator/",
  },
  {
    file: "kofi",
    eyebrow: "Payment fees / Ko-fi",
    accent: palette.gold,
    title: "Ko-fi fee calculator",
    description: "Ko-fi's 5% fee and Stripe processing on tips and sales.",
    path: "/fees/ko-fi-fee-calculator/",
  },
  {
    file: "kdp-royalties",
    eyebrow: "Royalties / Amazon KDP",
    accent: palette.navy,
    title: "KDP royalty calculator",
    description: "eBook, paperback, and hardcover royalties on Amazon.com.",
    path: "/fees/kdp-royalty-calculator/",
  },
  {
    file: "gumroad",
    eyebrow: "Payment fees / Gumroad",
    accent: palette.gold,
    title: "Gumroad fee calculator",
    description: "What you keep from a sale, and what to charge to net a target amount.",
    path: "/fees/gumroad-fee-calculator/",
  },
  {
    file: "lemon-squeezy",
    eyebrow: "Payment fees / Lemon Squeezy",
    accent: palette.gold,
    title: "Lemon Squeezy fee calculator",
    description: "What you keep from a sale, and what to charge to net a target amount.",
    path: "/fees/lemon-squeezy-fee-calculator/",
  },
  {
    file: "stripe-vs-paypal",
    eyebrow: "Compare / Stripe vs PayPal",
    accent: palette.navy,
    title: "Stripe vs PayPal fees",
    description: "The same sale priced under both providers' published US rates.",
    path: "/fees/stripe-vs-paypal-fees/",
  },
  {
    file: "gumroad-vs-lemon-squeezy",
    eyebrow: "Compare / Digital products",
    accent: palette.gold,
    title: "Gumroad vs Lemon Squeezy fees",
    description: "What each platform keeps from the same digital product sale.",
    path: "/fees/gumroad-vs-lemon-squeezy-fees/",
  },
  {
    file: "guides",
    eyebrow: "Guides",
    accent: palette.navy,
    title: "Pricing and fee guides",
    description: "Short, worked answers that hand off to a calculator.",
    path: "/guides/",
  },
  {
    file: "markup-vs-margin",
    eyebrow: "Guide / Pricing",
    accent: palette.navy,
    title: "Markup vs margin",
    description: "Why a 50% markup is only a 33.33% margin, and how to price for either.",
    path: "/guides/markup-vs-margin/",
  },
  {
    file: "salary-vs-freelance-rate",
    eyebrow: "Guide / Freelance rates",
    accent: palette.navy,
    title: "Salary vs freelance rate",
    description: "Turn a salary into an hourly figure, then see what replacing it takes.",
    path: "/guides/salary-vs-freelance-rate/",
  },
  {
    file: "cover-payment-fees",
    eyebrow: "Guide / Payment fees",
    accent: palette.gold,
    title: "Charge enough to cover payment fees",
    description: "Why adding the fee to the price falls short, and what to charge instead.",
    path: "/guides/how-to-cover-payment-processing-fees/",
  },
  {
    file: "digital-product-fees",
    eyebrow: "Compare / Digital products",
    accent: palette.gold,
    title: "Cheapest way to sell digital products",
    description: "Lemon Squeezy, Gumroad, Etsy, Stripe, and PayPal fees on one sale.",
    path: "/fees/digital-product-platform-fees/",
  },
  {
    file: "upwork-vs-fiverr",
    eyebrow: "Compare / Freelance platforms",
    accent: palette.navy,
    title: "Upwork vs Fiverr fees",
    description: "What each platform keeps from the same freelance job.",
    path: "/fees/upwork-vs-fiverr-fees/",
  },
  {
    file: "stripe-fees-explained",
    eyebrow: "Guide / Payment fees",
    accent: palette.gold,
    title: "Stripe fees explained",
    description: "2.9% + 30¢, the card add-ons, and the fees outside a payment.",
    path: "/guides/stripe-fees-explained/",
  },
  {
    file: "gumroad-threshold",
    eyebrow: "Guide / Payment fees",
    accent: palette.gold,
    title: "Gumroad's $20,000 threshold",
    description: "When the direct-sale fee drops to 5% + 50¢, and what it saves.",
    path: "/guides/gumroad-20000-threshold/",
  },
];

/** Minimal plain-object element builder for satori. */
const h = (type, props, ...children) => ({
  type,
  props: { ...props, children: children.length === 1 ? children[0] : children },
});

function cardToElement({ eyebrow, accent, title, description, path }) {
  return h(
    "div",
    {
      style: {
        width: `${WIDTH}px`,
        height: `${HEIGHT}px`,
        display: "flex",
        backgroundColor: palette.paper,
        padding: "26px",
      },
    },
    h(
      "div",
      {
        style: {
          display: "flex",
          flex: 1,
          flexDirection: "column",
          justifyContent: "space-between",
          border: `1px solid ${palette.line}`,
          padding: "56px 60px",
        },
      },
      // Eyebrow row
      h(
        "div",
        { style: { display: "flex", alignItems: "center", gap: "18px" } },
        h("div", {
          style: { display: "flex", width: "34px", height: "4px", backgroundColor: accent },
        }),
        h(
          "div",
          {
            style: {
              fontFamily: "Inter",
              fontWeight: 500,
              fontSize: "22px",
              letterSpacing: "0.11em",
              textTransform: "uppercase",
              color: palette.eyebrow,
            },
          },
          eyebrow,
        ),
      ),
      // Title + description
      h(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: "30px" } },
        h(
          "div",
          {
            style: {
              fontFamily: "Inter",
              fontWeight: 700,
              fontSize: "76px",
              lineHeight: 1.04,
              letterSpacing: "-0.045em",
              color: palette.ink,
              maxWidth: "980px",
            },
          },
          title,
        ),
        h(
          "div",
          {
            style: {
              fontFamily: "Inter",
              fontWeight: 500,
              fontSize: "30px",
              lineHeight: 1.35,
              color: palette.inkSoft,
              maxWidth: "900px",
            },
          },
          description,
        ),
      ),
      // Divider + wordmark row
      h(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: "26px" } },
        h("div", { style: { display: "flex", height: "1px", backgroundColor: palette.line } }),
        h(
          "div",
          { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline" } },
          h(
            "div",
            {
              style: {
                display: "flex",
                fontFamily: "Inter",
                fontWeight: 700,
                fontSize: "34px",
                letterSpacing: "-0.03em",
                color: palette.ink,
              },
            },
            h("div", {}, "MathMyRate"),
            h("div", { style: { color: palette.gold } }, "."),
          ),
          h(
            "div",
            {
              style: {
                fontFamily: "Inter",
                fontWeight: 400,
                fontSize: "22px",
                letterSpacing: "0.02em",
                color: palette.eyebrow,
              },
            },
            path,
          ),
        ),
      ),
    ),
  );
}

mkdirSync(OUT_DIR, { recursive: true });

for (const card of cards) {
  const svg = await satori(cardToElement(card), {
    width: WIDTH,
    height: HEIGHT,
    fonts,
  });

  const png = new Resvg(svg, { fitTo: { mode: "width", value: WIDTH } }).render().asPng();
  writeFileSync(`${OUT_DIR}${card.file}.png`, png);
  console.log(`generated public/og/${card.file}.png`);
}
