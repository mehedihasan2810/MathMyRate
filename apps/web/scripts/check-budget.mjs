/**
 * Checks the built site against the performance budget in
 * docs/seo-playbook.md. For every page it adds up what a first visit
 * downloads: the HTML, its stylesheets, its module scripts and the chunks
 * they import, and the font files its @font-face rules point to. Text is
 * measured gzipped; font files are already compressed.
 *
 * Run from apps/web after `pnpm run build`: pnpm run budget
 */
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

const DIST = fileURLToPath(new URL("../dist/", import.meta.url));

/** Kilobytes per page. Keep in step with the budget table in the playbook. */
const BUDGET_KB = { html: 20, css: 12, js: 60, fonts: 50, total: 130 };

const KB = 1024;

/** @param {string} dir @returns {string[]} */
function htmlFiles(dir) {
  return readdirSync(dir, { recursive: true, encoding: "utf8" })
    .filter((file) => file.endsWith(".html"))
    .map((file) => join(dir, file));
}

/** @param {string} url */
function distPath(url) {
  return join(DIST, url.replace(/^\//u, ""));
}

/** @param {string} path */
function gzippedBytes(path) {
  return gzipSync(readFileSync(path)).length;
}

/**
 * A module script and every chunk it imports statically, each counted once.
 * @param {string[]} entries
 */
function scriptGraph(entries) {
  const seen = new Set();
  const stack = [...entries];

  while (stack.length > 0) {
    const url = stack.pop();

    if (url === undefined || seen.has(url)) continue;

    seen.add(url);

    const source = readFileSync(distPath(url), "utf8");

    for (const match of source.matchAll(/(?:from|import)\s*"\.\/([^"]+\.js)"/gu)) {
      stack.push(url.replace(/[^/]+$/u, match[1] ?? ""));
    }
  }

  return [...seen];
}

/** Every capture group 1 of a pattern, in order. @param {string} text @param {RegExp} pattern */
function captures(text, pattern) {
  return [...text.matchAll(pattern)].map((match) => match[1] ?? "");
}

const rows = htmlFiles(DIST).map((file) => {
  const html = readFileSync(file, "utf8");

  const scripts = captures(html, /<script[^>]+src="(\/_astro\/[^"]+\.js)"/gu);

  const styles = captures(html, /<link[^>]+href="(\/_astro\/[^"]+\.css)"/gu);

  // Font files named in inline or linked @font-face rules. Every file counts,
  // even one a browser would skip for an unused weight or subset.
  const fontRules = [html, ...styles.map((url) => readFileSync(distPath(url), "utf8"))].join("\n");

  const fonts = [...new Set(captures(fontRules, /url\("?(\/_astro\/[^")]+\.woff2)"?\)/gu))];

  const sizes = {
    html: gzipSync(html).length,
    css: styles.reduce((sum, url) => sum + gzippedBytes(distPath(url)), 0),
    js: scriptGraph(scripts).reduce((sum, url) => sum + gzippedBytes(distPath(url)), 0),
    fonts: fonts.reduce((sum, url) => sum + readFileSync(distPath(url)).length, 0),
  };

  return {
    page: `/${relative(DIST, file)}`,
    ...sizes,
    total: sizes.html + sizes.css + sizes.js + sizes.fonts,
  };
});

/** @type {readonly ("html" | "css" | "js" | "fonts" | "total")[]} */
const measures = ["html", "css", "js", "fonts", "total"];

const problems = rows.flatMap((row) =>
  measures.flatMap((key) =>
    row[key] > BUDGET_KB[key] * KB
      ? [
          `${row.page}: ${key} ${(row[key] / KB).toFixed(1)} KB is over the ${BUDGET_KB[key]} KB budget`,
        ]
      : [],
  ),
);

const largest = [...rows].sort((a, b) => b.total - a.total).slice(0, 8);

console.log("Largest pages (KB):");

for (const row of largest) {
  const kb = (/** @type {number} */ bytes) => (bytes / KB).toFixed(1).padStart(6);

  console.log(
    `${kb(row.total)} total ${kb(row.html)} html ${kb(row.css)} css ${kb(row.js)} js ${kb(row.fonts)} fonts  ${row.page}`,
  );
}

console.log(`\n${rows.length} pages checked against ${JSON.stringify(BUDGET_KB)}.`);

if (problems.length > 0) {
  console.error(`\n${problems.length} over budget:\n${problems.join("\n")}`);
  process.exitCode = 1;
}
