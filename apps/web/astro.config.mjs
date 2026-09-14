// @ts-check
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

/**
 * Registers /sitemap.xml only when a production site is configured. Preview
 * and local builds have no truthful absolute URLs, so they ship no sitemap at
 * all instead of a fabricated or error-bodied one.
 * @returns {import("astro").AstroIntegration}
 */
function sitemapWhenSiteConfigured() {
  return {
    name: "sitemap-when-site-configured",
    hooks: {
      "astro:config:setup"({ config, injectRoute }) {
        if (config.site) {
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
  integrations: [sitemapWhenSiteConfigured()],
  vite: {
    plugins: [tailwindcss()],
  },
});
