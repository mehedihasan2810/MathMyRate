/**
 * Generates the site icons and web manifest into public/ from the shared
 * MathMyRate mark (moss tile, paper percent slash, clay rate dots):
 *
 * - favicon.ico              16/32/48 PNG-in-ICO fallback for Google and Safari
 * - apple-touch-icon.png     180x180, square corners (iOS applies its own mask)
 * - icon-192.png / icon-512.png          rounded tile for "any" contexts
 * - icon-maskable-*.png      full-bleed tile with the mark in the safe zone
 * - manifest.webmanifest     installability + brand metadata
 *
 * Run from apps/web: pnpm run icons:generate
 * Regenerate whenever the brand palette changes. favicon.svg is hand-edited
 * and never generated.
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";

const OUT_DIR = fileURLToPath(new URL("../public/", import.meta.url));

/** Palette mirrors the --color-* tokens in src/styles/global.css. */
const palette = {
  moss: "#426455",
  paper: "#f5f1e7",
  clay: "#c86c4e",
};

const manifest = {
  id: "/",
  name: "MathMyRate",
  short_name: "MathMyRate",
  description: "Practical pricing calculators for independent work.",
  start_url: "/",
  display: "standalone",
  background_color: palette.moss,
  theme_color: palette.moss,
  icons: [
    { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
    { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    { src: "/icon-maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
    { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
  ],
};

/** The mark on a 100x100 grid; scale shrinks it around the center for masks. */
function markSvg({ radius = 22, scale = 1 }) {
  const p = (value) => Number((50 + (value - 50) * scale).toFixed(2));

  const dot = ([cx, cy]) =>
    `<circle cx="${p(cx)}" cy="${p(cy)}" r="${Number((9.5 * scale).toFixed(2))}" fill="${palette.clay}" />`;

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">`,
    `<rect width="100" height="100" rx="${radius}" fill="${palette.moss}" />`,
    `<line x1="${p(67)}" y1="${p(27)}" x2="${p(33)}" y2="${p(73)}" stroke="${palette.paper}" stroke-width="${Number((9 * scale).toFixed(2))}" stroke-linecap="round" />`,
    dot([34, 35]),
    dot([66, 65]),
    `</svg>`,
  ].join("");
}

function renderPng(svg, size) {
  return new Resvg(svg, { fitTo: { mode: "width", value: size } }).render();
}

/** PNG-in-ICO container: valid since Windows Vista, read by every crawler. */
function buildIco(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);

  const entries = [];
  let offset = 6 + 16 * images.length;

  for (const { size, data } of images) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size, 0);
    entry.writeUInt8(size, 1);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(data.length, 8);
    entry.writeUInt32LE(offset, 12);
    entries.push(entry);
    offset += data.length;
  }

  return Buffer.concat([header, ...entries, ...images.map((image) => image.data)]);
}

function hexToRgb(hex) {
  return [1, 3, 5].map((index) => Number.parseInt(hex.slice(index, index + 2), 16));
}

/** Samples rendered pixels so a broken palette or geometry fails the run. */
function expectPixels(rendered, size, samples) {
  const pixels = rendered.pixels;

  for (const [x, y, hex, label] of samples) {
    const at = (Math.round(y * size) * size + Math.round(x * size)) * 4;
    const [r, g, b] = hexToRgb(hex);

    if (pixels[at] !== r || pixels[at + 1] !== g || pixels[at + 2] !== b) {
      throw new Error(`Pixel check failed at ${x},${y} (${label}): expected ${hex}`);
    }
  }
}

const rounded = markSvg({ radius: 22 });

const square = markSvg({ radius: 0 });

const maskable = markSvg({ radius: 0, scale: 0.6 });

// Center lands on the slash, dot samples sit in the clay circles, and a
// near-corner sample separates the rounded tile from the full-bleed variants.
const roundedSamples = [
  [0.5, 0.5, palette.paper, "slash center"],
  [0.34, 0.35, palette.clay, "top dot"],
  [0.66, 0.65, palette.clay, "bottom dot"],
  [0.5, 0.1, palette.moss, "tile top"],
  [0.02, 0.02, "000000", "rounded corner transparency"],
];

const squareSamples = [
  [0.5, 0.5, palette.paper, "slash center"],
  [0.34, 0.35, palette.clay, "top dot"],
  [0.02, 0.02, palette.moss, "square corner fill"],
];

const maskableSamples = [
  [0.5, 0.5, palette.paper, "slash center"],
  [0.404, 0.41, palette.clay, "scaled top dot"],
  [0.02, 0.02, palette.moss, "full-bleed corner"],
];

expectPixels(renderPng(rounded, 512), 512, roundedSamples);

expectPixels(renderPng(square, 180), 180, squareSamples);

expectPixels(renderPng(maskable, 512), 512, maskableSamples);

const ico = buildIco(
  [16, 32, 48].map((size) => ({ size, data: renderPng(rounded, size).asPng() })),
);

writeFileSync(`${OUT_DIR}favicon.ico`, ico);

writeFileSync(`${OUT_DIR}apple-touch-icon.png`, renderPng(square, 180).asPng());

writeFileSync(`${OUT_DIR}icon-192.png`, renderPng(rounded, 192).asPng());

writeFileSync(`${OUT_DIR}icon-512.png`, renderPng(rounded, 512).asPng());

writeFileSync(`${OUT_DIR}icon-maskable-192.png`, renderPng(maskable, 192).asPng());

writeFileSync(`${OUT_DIR}icon-maskable-512.png`, renderPng(maskable, 512).asPng());

writeFileSync(`${OUT_DIR}manifest.webmanifest`, `${JSON.stringify(manifest, null, 2)}\n`);

console.log("generated public/favicon.ico, apple-touch-icon.png, icon-*.png, manifest.webmanifest");
