# Improvement plan

Last updated: 2026-09-15. Derived from
[the honest review](honest-review-2026-09-15.md). Standing rules for every
page are in [the SEO playbook](seo-playbook.md).

Priorities:

- **P0**: do before the production `site` is configured and the site is
  submitted to Search Console. Shipping without these wastes the first crawl.
- **P1**: first four weeks after launch.
- **P2**: months two to four; this is where traffic comes from.
- **P3**: later or optional.

Effort: S = under a day, M = one to three days, L = a week or more. Every
item keeps the existing rules: official sources only, exact cents, no invented
numbers, no tracking without disclosure, `pnpm run lint` and
`pnpm run format:check` clean, and a real browser pass on every UI change.

## P0: launch blockers

### P0.1 Production site configuration and build guard (S)

- Set `site` in `apps/web/astro.config.mjs` from an environment value (for
  example `PUBLIC_SITE_URL` in the Varlock schema) and set
  `trailingSlash: "always"`.
- Fail `astro build` when `NODE_ENV=production` and `site` is missing, so a
  production deploy can never ship `noindex` and `Disallow: /` by accident.
- Add `lastmod` to the sitemap from git commit dates or a per-page constant.
- Accept: production build emits canonical, `og:url`, `og:image`,
  `robots.txt` with `Allow: /` and the sitemap URL, and `/sitemap.xml`
  listing every public route with trailing slashes.

### P0.2 Keyword H1s, titles, and descriptions (S)

- H1 becomes the tool name searchers type: "Stripe Fee Calculator",
  "Freelance Hourly Rate Calculator". Keep the current taglines as a
  subtitle paragraph under the H1.
- Home H1 becomes a real headline ("Free calculators for freelancers and
  digital sellers: rates, quotes, and platform fees") at heading size; the
  eyebrow style moves to a `<p>`.
- Fix the home heading order (h1 then h2 for the card titles).
- Titles and descriptions follow the templates in the playbook, with the rate
  and year where they are sourced ("2.9% + 30¢").
- Accept: every page has one H1 containing its primary keyword; descriptions
  are 140 to 160 characters; no heading level is skipped.

### P0.3 Structured data (S)

- `Layout.astro` accepts a `jsonLd` prop and renders one
  `<script type="application/ld+json">` per object.
- Home: `WebSite` with `SearchAction` pointing at `/?q={search_term_string}`
  (wire the search input to read `q`) and `Organization`.
- Calculator pages: `WebApplication` (`applicationCategory:
FinanceApplication`, `offers.price: 0`, `browserRequirements`), plus
  `BreadcrumbList`. Add `FAQPage` only for FAQs visibly on the page.
- No ratings, review counts, or `dateModified` values that are not real.
- Accept: every page validates in the Rich Results test with zero errors.

### P0.4 Mobile navigation, footer, and related tools (M)

- Header: a disclosure button ("Menu") below `md` that opens a panel listing
  all six calculators grouped by hub, plus Methodology. Native `<details>` or
  a button with `aria-expanded` and focus management; no framework needed.
- Footer: two columns, "Freelance" and "Platform fees", linking every tool,
  plus the existing information links.
- Every calculator page ends with a "Related calculators" section: sibling
  tools in the same hub first, then the other hub's tools, with one
  descriptive sentence each.
- Header CTA becomes context-aware: on fee pages it links to the fees hub or
  the next fee tool; on the hourly page it links to the project tool.
- Accept: at 375 px every calculator is reachable in two taps from any page;
  each calculator page has at least five in-content links to other tools.

### P0.5 Result visible while editing on mobile (M)

- Below `lg`, render a sticky bar at the bottom of the viewport with the
  primary number and its label, updated live, that scrolls to the full panel
  on tap. Keep the full panel where it is.
- Alternative: order the primary number above the form on small screens with
  CSS `order`, leaving the DOM order (form first) intact for screen readers.
- Fix the summary rows: `flex-wrap` and `gap-x-4` so "Annual revenue needed"
  and its value never touch.
- Accept: at 375 px the primary result is visible without scrolling while any
  field is focused; no row shows label and value touching at 320 px.

### P0.6 Forgiving input parsing without blanking results (M)

- `usdToCents` and `percentToBps` normalize first: strip `$`, `%`, `,`,
  spaces, and a single trailing `.`; treat a leading `.` as `0.`.
- Distinguish "incomplete" (empty, trailing dot, lone minus) from "invalid".
  While a field is incomplete during typing, keep the last valid result and
  show no error; on `blur`, `submit`, or the Update button, run full
  validation and focus the first problem.
- Show `$` and `%` adornments consistently on every money and percent field;
  keep `inputmode` as is.
- Display defaults with digit grouping ("85,000.00") and reformat on blur.
- Accept: `$1,250.5`, `1 250`, and `12.` all compute; `abc` and `-5` still
  error on blur with the existing messages; unit tests cover the normalizer.

### P0.7 Content depth on every calculator page (L)

Use the page template in the playbook. Per tool, write the sections in this
order, in plain language, with real numbers taken from the engine:

1. One-paragraph answer under the H1: what the tool does and the current
   sourced rate.
2. How to use it (three to five steps).
3. How the number is built, with one fully worked example matching the
   default inputs.
4. A reference table: results at five to eight input levels (for fees: $10,
   $25, $50, $100, $250, $500, $1,000, $5,000 with fee, net, and effective
   rate; for rates: take-home targets or billable percentages).
5. Scenario notes: what changes the number (international, subscriptions,
   refunds, disputes, taxes) with the official source for each claim, or an
   explicit "not modeled" statement.
6. FAQ: six to ten questions phrased the way people search ("Does Stripe
   charge fees on refunds?", "Is the 30 cents per transaction or per
   payout?"). Every answer sourced or scoped.
7. Related calculators.
8. Sources and reviewed date (already present on fee pages; add to freelance
   pages).

Target 1,200 to 2,000 words per fee page and 1,000 to 1,500 per freelance
page. Accept: every calculator page has all eight sections, an FAQ with
`FAQPage` markup, and no claim without a source or a scope statement.

### P0.8 Truthful policy pages for the ads plan (S)

- About: name the operator (person or entity), how to contact, and the
  editorial process (official sources, review dates, corrections).
- Privacy: keep the strong promise for calculator inputs; add a section that
  is accurate at launch (hosting logs, cookieless analytics if enabled) and a
  dated note that advertising will be added with consent controls before it
  goes live. Rewrite fully in the same release that adds ads.
- Terms: unchanged except the ads and third-party links clause when ads
  ship.
- Accept: no sentence on any page is false on the day it is deployed.

## P1: first month after launch

### P1.1 Sourced fee scenarios the code already names (M each)

Extend the presets from the same official pages already cited, with their own
assumptions, exclusions, and inverse tests:

- Stripe: international cards (+1.5%), currency conversion (+1%), Stripe
  Billing (+0.7%), ACH direct debit (0.8% capped), manually entered cards,
  Link. Each is a selectable scenario, never a blended guess.
- PayPal: standard card payments (2.99% + $0.49), invoicing, micropayments,
  international (+1.5%), QR code, Goods and Services versus Friends and
  Family (no fee, with the misuse warning).
- Gumroad: PayPal direct sales.
- Lemon Squeezy: international (+1.5%), PayPal (+1.5%), subscription (+0.5%),
  and a separate payout estimator using the documented payout table.
- Accept: each new scenario has an official URL, review date, unit tests
  with independently derived values, and shows on the page as its own radio
  or select option.

### P1.2 Volume mode on every fee tool (M)

- Inputs: average sale and transactions per month. Outputs: fee per sale,
  monthly fees, annual fees, monthly net, effective rate. Keep the single-sale
  mode as the default.
- Accept: switching modes preserves the amount; copy includes the volume
  figures.

### P1.3 Comparison pages (M each)

- `/fees/stripe-vs-paypal-fees/` and `/fees/gumroad-vs-lemon-squeezy-fees/`:
  a two-column live calculator using the existing presets, a table at common
  amounts, and an explanation of when each wins. Only sourced scenarios.
- Accept: each page has its own H1, description, structured data, and links
  to the four underlying tools.

### P1.4 Trust and freshness signals (S)

- "Reviewed on" and "Last updated" lines on every calculator page, including
  freelance pages (model revision date).
- A `/changelog/` page listing fee-rule revisions with dates and sources.
- Author or operator line on each calculator page linking to About.

### P1.5 Copy and share (S)

- Copy the full breakdown as plain text with labels.
- Optional "Copy link" that encodes inputs in the URL fragment (`#a=100&m=net`)
  so nothing reaches server logs. Update the privacy page sentence about URLs
  if this ships. Do not auto-update the URL on keystroke.

### P1.6 Measurement (S)

- Verify the domain in Google Search Console and Bing Webmaster Tools;
  submit the sitemap.
- Add cookieless analytics (Cloudflare Web Analytics or self-hosted
  Plausible) and disclose it on the privacy page.
- Track a fixed keyword list per page (see the playbook) weekly.

### P1.7 Accessibility polish (S)

- Move `aria-live` to the primary result and a status line; drop
  `role="alert"` from per-field errors (keep it on the summary).
- Move help text out of the `<label>` element (keep `aria-describedby`).
- Accept: a screen reader announces one message per error and the result
  once per change.

### P1.8 Performance trim (M)

- Keep Effect Schema for tests and the build-time example, but decode in the
  browser with a small hand-written guard so the shipped chunk drops from
  about 27 KB to under 8 KB gzipped. If that conflicts with the anti-slop
  rules, keep Effect and accept the size; it is not a ranking problem.
- Load two Inter weights (400 and 700), preload the 400 woff2, and use
  `font-display: swap` (already set by Fontsource).
- Set a performance budget in the playbook and check it on each release with
  a Lighthouse run on a throttled mobile profile.

## P2: growth (months two to four)

### P2.1 New calculators, one keyword each (M each)

Add tools inside the niche so topical authority compounds. Verify demand in
Search Console and Keyword Planner before building; do not publish a tool
without the eight content sections. Candidates, grouped by hub:

Freelance pricing

- Day rate to annual salary (and salary to hourly for contractors).
- Contractor versus employee rate (the "1099 vs W-2" conversion).
- Retainer calculator (hours, rollover, discount).
- Markup and margin calculator.
- Discount and late-fee calculator for invoices.
- Time and materials estimate with contingency ranges.
- Rate increase calculator (what a 10% raise does across a year).

Platform and marketplace fees (all from official pricing pages)

- Etsy fees, eBay fees, Shopify Payments fees, Square fees.
- Upwork freelancer fee, Fiverr seller fee.
- Patreon, Ko-fi, Buy Me a Coffee, Substack, Payhip, Podia, Whop.
- Kickstarter and Indiegogo fees.
- Amazon KDP royalty.
- Payout estimators where a provider documents them (Lemon Squeezy, Gumroad,
  Stripe Instant Payouts).

Comparisons and hubs

- "Cheapest way to sell digital products" comparison across the sourced
  platforms at $10, $25, $50, $100.
- A hub page per platform family with its own content.

### P2.2 Hub pages with real content (M)

- `/freelance/` and `/fees/` gain 800 to 1,200 words: who the tools are for,
  how they connect, and a summary table of every tool with its rate and
  review date. Hubs link to every child and every child links back in the
  breadcrumb and related block.

### P2.3 Guides that feed the calculators (M each)

- Short, sourced guides that answer a question and hand off to a tool: "How
  to set a freelance hourly rate", "Stripe fees explained", "How Gumroad's
  $20,000 threshold works". Each links to two or more tools; each tool page
  links back. No guide without a tool to send readers to.

### P2.4 Links (ongoing)

- An "Embed this calculator" snippet (iframe with a credit link) on each
  tool. Free tools with embeds earn links from blogs and course sites.
- List the exact-math and sourced-rules approach on the methodology page as a
  citable resource; that page is the one most likely to earn links.

### P2.5 Ads rollout (M)

- Only after P0.7 and P2.1 have at least 20 tool pages with full content.
- Reserve fixed-height slots (one below the result panel, one after the
  content, none inside the form). Lazy-load below the fold. No ads on 404,
  privacy, or terms.
- Consent: a lightweight CMP or Google consent mode for EU/UK/CA visitors;
  ads load only after consent where required.
- Rewrite Privacy and About in the same release; keep the "calculator inputs
  never leave your browser" promise true by never passing inputs to ad or
  analytics scripts.
- Measure CLS and LCP after ads; if CLS exceeds 0.1, remove the slot that
  caused it.

## P3: later

- Display-only currency formatting for non-US visitors (no conversion, no
  jurisdiction change), with the scope stated on the page.
- Dark mode via `prefers-color-scheme`.
- Installable PWA with offline calculators (the app is already static).
- A framework island only if an interaction (for example, live comparison
  charts) proves the native scripts insufficient.
- Localized pages once English pages rank; never machine-translated fee
  rules without a sourced local pricing page.

## Suggested sequence

1. Week 1: P0.1, P0.2, P0.3, P0.4, P0.5, P0.6 together (one PR each, small).
2. Weeks 2 to 3: P0.7 for the four fee pages first (least contested
   keywords), then the two freelance pages; P0.8; configure `site`; submit
   the sitemap.
3. Weeks 4 to 7: P1.1 to P1.8, comparisons first.
4. Months 2 to 4: P2.1 at two to three tools per week, P2.2, P2.3, P2.4.
5. Ads (P2.5) once 20+ pages have full content and Search Console shows
   impressions on more than the brand.
