import type { APIRoute } from "astro";

import { guides } from "../data/guides";
import { hubs, infoLinks, tools } from "../data/tools";

const lastModified = new Map(__SITEMAP_LASTMOD__);

const publicRoutes = [
  "/",
  ...hubs.map((hub) => hub.href),
  ...tools.map((tool) => tool.href),
  ...infoLinks.map((link) => link.href),
  ...guides.map((guide) => guide.href),
];

/**
 * Sitemap of public routes. Preview and local builds have no configured site,
 * so no truthful absolute URLs exist; those builds return 404 instead of a
 * fabricated URL set. `lastmod` is the last commit date of the page source.
 */
export const GET: APIRoute = ({ site }) => {
  if (!site) {
    return new Response("Sitemap is unavailable: no site is configured for this build.\n", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const urls = publicRoutes
    .map((route) => {
      const date = lastModified.get(route);
      const lastmod = date ? `<lastmod>${date}</lastmod>` : "";

      return `  <url><loc>${new URL(route, site).href}</loc>${lastmod}</url>`;
    })
    .join("\n");

  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;

  return new Response(body, {
    headers: { "Content-Type": "text/xml; charset=utf-8" },
  });
};
