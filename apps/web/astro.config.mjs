// @ts-check
import { execFileSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

/**
 * Reads the production origin from PUBLIC_SITE_URL. An absent value keeps the
 * build in preview mode: noindex pages, `Disallow: /`, and no sitemap.
 * @param {string | undefined} value
 * @returns {string | undefined}
 */
function readSiteOrigin(value) {
  const trimmed = value?.trim() ?? "";

  if (trimmed === "") return undefined;

  const url = new URL(trimmed);

  if (url.protocol !== "https:" && url.hostname !== "localhost") {
    throw new Error(`PUBLIC_SITE_URL must use https: ${trimmed}`);
  }

  if (url.pathname !== "/" || url.search !== "" || url.hash !== "") {
    throw new Error(`PUBLIC_SITE_URL must be an origin with no path, query, or hash: ${trimmed}`);
  }

  return url.origin;
}

/**
 * Production deploys must never fall back to preview indexing rules. Either an
 * explicit flag or Alchemy's production stage makes a missing site fatal.
 * @returns {boolean}
 */
function siteIsRequired() {
  return process.env.REQUIRE_SITE_URL === "true" || process.env.ALCHEMY_STAGE === "production";
}

/**
 * Maps each page route to the date of the last commit that touched its source
 * file. Pages without history (uncommitted, or no repository) get no lastmod
 * rather than an invented date.
 * @param {URL} root
 * @returns {Array<[string, string]>}
 */
function pageLastModified(root) {
  const rootPath = fileURLToPath(root);
  const pagesPath = fileURLToPath(new URL("./src/pages/", root));

  /** @type {Array<[string, string]>} */
  const entries = [];

  for (const file of readdirSync(pagesPath, { recursive: true, encoding: "utf8" })) {
    const relative = file.replaceAll("\\", "/");

    if (!relative.endsWith(".astro") || relative.endsWith("404.astro")) continue;

    const route = `/${relative.replace(/(^|\/)index\.astro$/u, "$1").replace(/\.astro$/u, "/")}`;

    try {
      const date = execFileSync(
        "git",
        ["log", "-1", "--format=%cs", "--", `src/pages/${relative}`],
        {
          cwd: rootPath,
          encoding: "utf8",
          stdio: ["ignore", "pipe", "ignore"],
        },
      ).trim();

      if (/^\d{4}-\d{2}-\d{2}$/u.test(date)) entries.push([route, date]);
    } catch {
      // No git history is available here (for example, a source archive); omit lastmod.
    }
  }

  return entries;
}

/**
 * Indexing plumbing. Registers /sitemap.xml only when a production site is
 * configured, and refuses a production build that has no site.
 * @returns {import("astro").AstroIntegration}
 */
function seoIntegration() {
  return {
    name: "mathmyrate-seo",
    hooks: {
      "astro:config:setup"({ command, config, injectRoute, updateConfig }) {
        if (command === "build" && siteIsRequired() && !config.site) {
          throw new Error(
            "This production build has no site. Set PUBLIC_SITE_URL (or Alchemy's astro.site) so pages are indexable; refusing to ship noindex and Disallow: / to production.",
          );
        }

        if (config.site) {
          updateConfig({
            vite: {
              define: { __SITEMAP_LASTMOD__: JSON.stringify(pageLastModified(config.root)) },
            },
          });

          injectRoute({
            pattern: "/sitemap.xml",
            entrypoint: fileURLToPath(new URL("./src/routes/sitemap.xml.ts", import.meta.url)),
            prerender: true,
          });
        }
      },
    },
  };
}

// https://astro.build/config
export default defineConfig({
  output: "static",
  site: readSiteOrigin(process.env.PUBLIC_SITE_URL),
  trailingSlash: "always",
  integrations: [seoIntegration()],
  vite: {
    plugins: [tailwindcss()],
  },
});
