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

**Status: done 2026-09-15** (branch `feat/launch-blockers-ux-seo`, based on `b06b53b`, not yet committed). The origin comes from `PUBLIC_SITE_URL` rather than a hard-coded `site`. The guard fails a build when `REQUIRE_SITE_URL=true` or `ALCHEMY_STAGE=production` and no site is set. `lastmod` is the last git commit date of each page source, so an uncommitted page gets none. Still open for the release PR: `packages/infra` must pass `astro: { output: "static" }` to Alchemy, which otherwise defaults to server output.

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

**Status: done 2026-09-15** (branch `feat/launch-blockers-ux-seo`, based on `b06b53b`, not yet committed). Calculator, hub, and home H1s now carry the search phrase, and titles derive rates from the fee presets. The four information pages keep their editorial H1s but have 141 to 150 character descriptions. Descriptions say "estimate", not "exact", because provider rounding is disclosed as an estimate.

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

**Status: done 2026-09-15** (branch `feat/launch-blockers-ux-seo`, based on `b06b53b`, not yet committed). Home has `WebSite` with `SearchAction` (the page reads `?q=`) and `Organization`. Calculators have `WebApplication` and `BreadcrumbList`, and hubs have `BreadcrumbList`. JSON-LD is emitted only when a site is set. `FAQPage` waits for P0.7. Validation was structural (valid JSON, absolute URLs, expected types per page); Google's Rich Results Test needs a public URL and was not run.

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

**Status: done 2026-09-15** (branch `feat/launch-blockers-ux-seo`, based on `b06b53b`, not yet committed). An "All calculators" disclosure menu works at every width, with hub links beside it on desktop. The footer lists every calculator, pages have breadcrumbs, and each calculator links five related calculators. Deviation: fee pages show no header call to action, because the menu and related block already offer the sibling tools; the hourly page points to the project quote and the project page back to the hourly rate. Keyboard Enter and Space on the menu could not be exercised in the in-app browser, which does not activate even a native button from key presses; the menu relies on native `details`/`summary` behavior.

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

**Status: done 2026-09-15** (branch `feat/launch-blockers-ux-seo`, based on `b06b53b`, not yet committed), using the sticky bar. Below 1024 px it appears only after the page title scrolls away, while the form is on screen and the full result is not; "Details" scrolls to the full panel. Result rows wrap with a gap, and no label and value touch at 320 px on the hourly, Gumroad, and PayPal pages.

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

**Status: done 2026-09-15** (branch `feat/launch-blockers-ux-seo`, based on `b06b53b`, not yet committed). The parser accepts `$`, `%`, commas, spaces, and a dangling decimal point, with 59 web unit tests. While typing, a failed entry dims the last result and disables copy and transfer; leaving the field or pressing Update shows the error. Money fields tidy to `1,250.00`. A finished edit that happens during a mouse press waits for the release, so a newly shown error cannot move the button being clicked; the browser pass found and fixed that lost-click regression. The shared `NumberField` also moves help text out of the label, which is part of P1.7.

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

**Status: done 2026-09-15** (branch `feat/content-trust-growth`). All six calculators now carry the page template: a plain answer, how to use it, a worked example produced by the calculator code, reference tables computed at build time, a section on what the result leaves out or what other provider fees apply, visible FAQs, related calculators, sources, and updated and reviewed dates. Every provider fact was checked against the provider's own pages on 2026-09-15. Deviation: FAQs are not marked up as `FAQPage`, because Google stopped showing FAQ rich results on May 7, 2026.

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

**Status: done 2026-09-15** (branch `feat/content-trust-growth`). About states that the site is independent and unaffiliated, how numbers are sourced, how to report corrections through the public GitHub issue tracker, and that no ads run today. Privacy and Terms carry last-updated dates, a public contact route, and a commitment to update before any analytics or advertising goes live. Still open for the owner: About does not name a person or company, because that is the owner's decision.

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

**Status: done 2026-09-15** (branch `feat/content-trust-growth`). Added Stripe international and manually entered cards; PayPal standard card payments, invoices paid through PayPal or by card, international Checkout, and QR codes; and Lemon Squeezy international card, PayPal, and subscription orders with tax-inclusive totals, tested against the worked examples on Lemon Squeezy's own pages. Still unsupported, with reasons on the pages: Stripe ACH Direct Debit (its $5.00 cap is not modeled) and currency conversion; PayPal Pay Later, Advanced card payments, and micropayments; Gumroad PayPal sales (Gumroad does not publish the rate); and Lemon Squeezy fee combinations its fee page does not document.

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

**Status: done 2026-09-15** (branch `feat/content-trust-growth`). Every fee calculator has an optional sales-per-month field that adds fees per month, what you keep per month, fees per year, and fees as a share of sales. The engine's `repeatSale` multiplies one evaluated sale, so every sale pays its own fixed charge.

- Inputs: average sale and transactions per month. Outputs: fee per sale,
  monthly fees, annual fees, monthly net, effective rate. Keep the single-sale
  mode as the default.
- Accept: switching modes preserves the amount; copy includes the volume
  figures.

### P1.3 Comparison pages (M each)

**Status: done 2026-09-15** (branch `feat/content-trust-growth`). `/fees/stripe-vs-paypal-fees/` and `/fees/gumroad-vs-lemon-squeezy-fees/` each price one live sale under every relevant preset, mark the lowest fee, and explain refunds, disputes, payouts, and tax from sourced facts.

- `/fees/stripe-vs-paypal-fees/` and `/fees/gumroad-vs-lemon-squeezy-fees/`:
  a two-column live calculator using the existing presets, a table at common
  amounts, and an explanation of when each wins. Only sourced scenarios.
- Accept: each page has its own H1, description, structured data, and links
  to the four underlying tools.

### P1.4 Trust and freshness signals (S)

**Status: done 2026-09-15** (branch `feat/content-trust-growth`). Every calculator page shows a byline linking to About, an updated date, and, for fee pages, the fee source review date. `/changelog/` records every fee rule change with sources.

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

**Status: partly done 2026-09-15** (branch `feat/growth-calculators-guides`). Added the Freelance Retainer, Markup and Margin, and Salary to Hourly calculators, and the Square and Etsy fee calculators, each with the full content template. Square and Etsy rates were read from their official pricing, help, and policy pages on 2026-09-15. Shopify Payments was not built: its official pricing pages show no card rate, so no sourced rate exists to model. The engine now supports a fee charged on the amount before tax (Etsy's transaction fee). Fees with a minimum or a cap (Square ACH invoices, Etsy Offsite Ads) are recorded as blocked presets. Demand was not checked in Search Console or Keyword Planner, because the site has no domain or Search Console property yet.

**Update 2026-09-15** (branch `feat/marketplace-fees-embeds`). Added the eBay, Upwork, and Fiverr fee calculators and a "cheapest way to sell digital products" comparison. eBay's rates change at documented amounts, so each eBay scenario carries a `grossRangeCents` range and the engine refuses charges outside it; sales above a category's threshold are blocked. Upwork sets its fee per contract (0% to 15%), so the freelancer enters the rate shown on their contract. Fiverr's 20% commission is fixed, but its buyer small-order fee and one Payoneer withdrawal fee conflict across its own pages, so those are left out. Every provider fact was checked on the provider's own pages on 2026-09-15.

**Update 2026-09-16** (branch `feat/creator-platform-fees`). Added the Kickstarter, Patreon, and Ko-fi fee calculators, a KDP royalty calculator, and an Upwork vs Fiverr comparison. A scenario range can now be open-ended, for Kickstarter's $10 and Patreon's legacy $3 thresholds. Kickstarter's Pledge Manager, Patreon's one-time purchases, and Ko-fi's PayPal processing fee are left out because the providers do not state them consistently or at all. KDP royalties use a new engine module with KDP's Amazon.com royalty rates and printing cost tables; Expanded Distribution and Kindle Unlimited are not estimated.

**Update 2026-09-16** (branch `feat/creator-guides-more-platforms`). Added the Substack and Payhip fee calculators, a Patreon vs Ko-fi comparison, and guides to KDP royalties and to pricing Kickstarter rewards; the methodology page now explains embedding and citing. Substack uses Stripe's 0.7% Billing fee, the rate on Substack's cost page and Stripe's Billing pricing page, although one older Substack page still says 0.5%. Substack's iOS in-app purchases and local-currency prices, and Payhip's subscriptions, PayPal, and Square payments, are left out because the providers give only ranges or leave the fee unstated. Buy Me a Coffee was researched but not built: its pages give a 5% fee and Stripe's card fee without saying how its extra processing fees combine or what amount the 5% is charged on. A KDP list price outside KDP's range is now an input error, and the fee calculator says when fees are at least as large as the payment.

**Update 2026-09-16** (branch `feat/creator-comparisons-freelance-tools`). Added the Early Payment Discount and Rate Increase calculators, which need no provider rates, and Substack vs Patreon and Payhip vs Gumroad comparisons built from the existing sourced presets. Payhip joins the digital product platform comparison. The About, Methodology, Privacy, and Terms pages have longer, more descriptive titles.

**Update 2026-09-16** (branch `feat/contractor-rate-more-platforms`). Added the 1099 vs W-2 rate calculator on a new `payroll.ts` engine module holding the published 2026 Social Security and Medicare figures: the $184,500 wage base, 6.2% and 1.45% on each side, self-employment tax of 15.3% on 92.35% of net earnings from $400, and the 0.9% Additional Medicare Tax thresholds. Income tax is out of scope, which the page states.

**Update 2026-09-16** (branch `feat/contractor-rate-more-platforms`). Added the Podia, Whop, and Indiegogo fee calculators and a Kickstarter vs Indiegogo comparison. Indiegogo's own $10,000 example reproduces exactly. Buy Me a Coffee stays unbuilt. Comparison rows now handle a scenario that does not cover the amount, which Kickstarter's under-$10 pledge rate needs.

**Update 2026-09-16** (branch `feat/creator-platform-hub`). Added a creator platform comparison with a monthly-cost table that counts plan prices, and the Skool and Teachable calculators. Skool's $899/$900 band gap and Teachable's conflicting international card rate are both refused rather than guessed. The fees hub table now shows a dash where a default scenario does not cover the amount.

**Update 2026-09-16** (branch `feat/payouts-and-guides`). Added a payout fee calculator for Stripe, Gumroad, Patreon, and Lemon Squeezy, plus guides to 1099 vs W-2 pay and raising rates. Minimum fees and caps (Patreon's PayPal payouts, Stripe's 50¢ Instant Payout minimum) are priced as exact bands. Stripe's Instant Payout fee is added on top of the amount received, as Stripe's Dashboard asks for the amount to receive. Gumroad's bank payouts have no published fee, and its PayPal payouts apply only in countries without bank deposits, so neither is estimated for US creators.

Add tools inside the niche so topical authority compounds. Verify demand in
Search Console and Keyword Planner before building; do not publish a tool
without the eight content sections. Free demand and competition research from 2026-09-16 is in
[keyword research](keyword-research.md); its section 3 ranks the next pages
(reseller fees such as Depop, Poshmark, Mercari, and Facebook Marketplace,
then Cash App and Venmo). Candidates, grouped by hub:

Freelance pricing

- Day rate to annual salary (and salary to hourly for contractors).
- Contractor versus employee rate (the "1099 vs W-2" conversion) (done 2026-09-16).
- Retainer calculator (hours, rollover, discount).
- Markup and margin calculator.
- Discount and late-fee calculator for invoices (early payment discount done 2026-09-16; late fees not built, because limits depend on local law).
- Time and materials estimate with contingency ranges.
- Rate increase calculator (what a 10% raise does across a year) (done 2026-09-16).

Platform and marketplace fees (all from official pricing pages)

- Etsy fees, eBay fees, Shopify Payments fees, Square fees.
- Upwork freelancer fee, Fiverr seller fee.
- Patreon, Ko-fi, Buy Me a Coffee (blocked: fee combination unstated), Substack, Payhip, Podia, Whop, Skool, Teachable: all done 2026-09-16 except Buy Me a Coffee.
- Kickstarter and Indiegogo fees (both done; Indiegogo 2026-09-16).
- Amazon KDP royalty.
- Payout estimators where a provider documents them (Lemon Squeezy, Gumroad,
  Stripe Instant Payouts) (done 2026-09-16, with Patreon).

Comparisons and hubs

- "Cheapest way to sell digital products" comparison across the sourced
  platforms at $10, $25, $50, $100.
- A hub page per platform family with its own content (creator platforms done 2026-09-16).

### P2.2 Hub pages with real content (M)

**Status: done 2026-09-15** (branch `feat/growth-calculators-guides`). `/fees/` (about 830 words) has a registry-driven table of every fee calculator's default rate, scenario count, and review date, plus a fee comparison at $10, $100, and $1,000. `/freelance/` (about 570 words) shows how the five calculators connect, with engine-computed examples. The freelance hub is below the 800-word target.

**Update 2026-09-15** (branch `feat/marketplace-fees-embeds`). `/freelance/` now has about 820 words, meeting the target, and `/fees/` about 980 words, with eBay, Upwork, and Fiverr in its summary table.

- `/freelance/` and `/fees/` gain 800 to 1,200 words: who the tools are for,
  how they connect, and a summary table of every tool with its rate and
  review date. Done; the freelance hub's table and flow were extended to the
  invoice, rate increase, and 1099 vs W-2 calculators on 2026-09-16. Hubs link to every child and every child links back in the
  breadcrumb and related block.

### P2.3 Guides that feed the calculators (M each)

**Status: first three done 2026-09-15** (branch `feat/growth-calculators-guides`). `/guides/` lists "Markup vs Margin", "How to Compare a Salary With a Freelance Rate", and "How to Charge Enough to Cover Payment Processing Fees". Each guide computes its numbers with the engine, emits `Article` JSON-LD with the dates printed on the page, and links to two or more calculators. Calculator pages list the guides that name them, from `apps/web/src/data/guides.ts`.

**Update 2026-09-15** (branch `feat/marketplace-fees-embeds`). Added "Stripe Fees Explained" and "How Gumroad's $20,000 Monthly Threshold Works", for five guides in total.

- Short, sourced guides that answer a question and hand off to a tool: "How
  to set a freelance hourly rate", "Stripe fees explained", "How Gumroad's
  $20,000 threshold works". Each links to two or more tools; each tool page
  links back. No guide without a tool to send readers to.

### P2.4 Links (ongoing)

**Status: embed snippet done 2026-09-15** (branch `feat/growth-calculators-guides`). Each fee calculator has a noindex `/embed/<calculator>/` page with no header, footer, or pinned result bar, and a credit link. The copyable snippet appears on fee pages only when `PUBLIC_SITE_URL` is set, because it needs absolute URLs. Freelance calculators do not have embeds yet.

**Update 2026-09-15** (branch `feat/marketplace-fees-embeds`). The five freelance calculators now live in components, and every calculator, including Upwork and Fiverr, has a noindex embed page. Suggested iframe heights are each embed page's measured height at 360 px wide.

- An "Embed this calculator" snippet (iframe with a credit link) on each
  tool. Free tools with embeds earn links from blogs and course sites.
- List the exact-math and sourced-rules approach on the methodology page as a
  citable resource; that page is the one most likely to earn links.

### P2.5 Ads rollout (M)

**Status: not started.** It depends on a deployed site with a domain, which is deferred. The site now has 13 calculator and comparison pages with full content, short of the 20-page gate below.

**Update 2026-09-15.** The site has 17 calculator and comparison pages with full content, still short of the 20-page gate, and ads still wait for a deployed domain.

**Update 2026-09-16.** The site now has 22 calculator and comparison pages with full content, past the 20-page gate. Ads still wait for a deployed site with a domain.

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
