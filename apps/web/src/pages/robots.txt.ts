import type { APIRoute } from "astro";

/**
 * Robots policy that mirrors the site's indexing state.
 * With no configured site (preview/local builds) every page is served with a
 * noindex meta tag, so crawling is disallowed outright. Once a production site
 * is configured, all public pages are crawlable and the sitemap is advertised.
 */
export const GET: APIRoute = ({ site }) => {
  const body = site
    ? `User-agent: *\nAllow: /\n\nSitemap: ${new URL("sitemap.xml", site).href}\n`
    : "User-agent: *\nDisallow: /\n";

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
