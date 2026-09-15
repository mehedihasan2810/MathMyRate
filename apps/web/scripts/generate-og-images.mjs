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
  ink: "#23302a",
  paper: "#f5f1e7",
  mist: "#e7eee6",
  moss: "#426455",
  clay: "#c86c4e",
  line: "#d6d7cc",
  eyebrow: "#567465",
  inkSoft: "rgba(35, 48, 42, 0.68)",
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
    accent: palette.moss,
    title: "Practical pricing calculators for independent work.",
    description: "Planning tools, not financial advice.",
    path: "/",
  },
  {
    file: "home",
    eyebrow: "Price your independent work",
    accent: palette.moss,
    title: "Price work that can carry your life.",
    description: "Practical, transparent rate planning for independent work.",
    path: "/",
  },
  {
    file: "hourly-rate",
    eyebrow: "Freelance / Hourly & day rate",
    accent: palette.moss,
    title: "Freelance hourly rate calculator",
    description: "Turn an annual take-home target into a practical floor rate.",
    path: "/freelance/hourly-rate-calculator/",
  },
  {
    file: "project-rate",
    eyebrow: "Freelance / Project quote",
    accent: palette.moss,
    title: "Project rate calculator",
    description: "Turn scope, contingency, and expenses into a clear project quote.",
    path: "/freelance/project-rate-calculator/",
  },
  {
    file: "fees",
    eyebrow: "Payment fees",
    accent: palette.clay,
    title: "Platform fee calculators",
    description:
      "Estimate platform and processing fees for a sale, and what the sale really pays you.",
    path: "/fees/",
  },
  {
    file: "stripe",
    eyebrow: "Payment fees / Stripe",
    accent: palette.clay,
    title: "Stripe fee calculator",
    description: "What you keep from a sale, and what to charge to net a target amount.",
    path: "/fees/stripe-fee-calculator/",
  },
  {
    file: "paypal",
    eyebrow: "Payment fees / PayPal",
    accent: palette.clay,
    title: "PayPal fee calculator",
    description: "What you keep from a sale, and what to charge to net a target amount.",
    path: "/fees/paypal-fee-calculator/",
  },
  {
    file: "gumroad",
    eyebrow: "Payment fees / Gumroad",
    accent: palette.clay,
    title: "Gumroad fee calculator",
    description: "What you keep from a sale, and what to charge to net a target amount.",
    path: "/fees/gumroad-fee-calculator/",
  },
  {
    file: "lemon-squeezy",
    eyebrow: "Payment fees / Lemon Squeezy",
    accent: palette.clay,
    title: "Lemon Squeezy fee calculator",
    description: "What you keep from a sale, and what to charge to net a target amount.",
    path: "/fees/lemon-squeezy-fee-calculator/",
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
            h("div", { style: { color: palette.clay } }, "."),
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
