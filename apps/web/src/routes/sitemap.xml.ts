import type { APIRoute } from "astro";

const publicRoutes = [
  "/",
  "/freelance/",
  "/freelance/hourly-rate-calculator/",
  "/freelance/project-rate-calculator/",
  "/fees/",
  "/fees/stripe-fee-calculator/",
  "/fees/paypal-fee-calculator/",
  "/fees/gumroad-fee-calculator/",
  "/fees/lemon-squeezy-fee-calculator/",
  "/methodology/",
  "/about/",
  "/privacy/",
  "/terms/",
];

/**
 * Sitemap of public routes. Preview and local builds have no configured site,
 * so no truthful absolute URLs exist; those builds return 404 instead of a
 * fabricated URL set.
 */
export const GET: APIRoute = ({ site }) => {
  if (!site) {
    return new Response("Sitemap is unavailable: no site is configured for this build.\n", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const urls = publicRoutes
    .map((route) => `  <url><loc>${new URL(route, site).href}</loc></url>`)
    .join("\n");

  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;

  return new Response(body, {
    headers: { "Content-Type": "text/xml; charset=utf-8" },
  });
};
