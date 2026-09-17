# SEO playbook

Last updated: 2026-09-15. Standing rules for every public page. The one-off
findings that produced these rules are in
[the honest review](honest-review-2026-09-15.md); the ordered work is in
[the improvement plan](improvement-plan.md).

The strategy in one sentence: every calculator page is a keyword, every fee
scenario is a sub-keyword, and the site's edge is exact math with official
sources and review dates, said plainly on every page.

## Metadata templates

Primary keyword = the phrase people type most, from the
[keyword map](#keyword-map-for-existing-pages). For most tools it is
"{provider} fee calculator", "{thing} calculator", or "{a} vs {b} fees". For
creator platforms, [keyword research](keyword-research.md) found that people
type "{provider} fees" or "how much does {provider} charge" far more often, so
the title leads with "{Provider} Fees" while the H1 keeps the tool name.

| Element     | Rule                                                                                                              | Example                                                                                                                                      |
| ----------- | ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `<title>`   | Primary keyword first, then the sourced rate or year, then the brand; 50 to 60 characters                         | `Stripe Fee Calculator (2.9% + 30¢) \| MathMyRate`, `Substack Fees 2026: How Much Substack Takes \| MathMyRate`                              |
| H1          | The tool name from the registry, title case, one per page; it contains the primary keyword or its calculator form | `Stripe Fee Calculator`                                                                                                                      |
| Subtitle    | The former tagline as a `<p>` under the H1                                                                        | `Know the fee before you quote.`                                                                                                             |
| Description | 140 to 160 characters: what it does, the rate, the differentiator                                                 | `Estimate Stripe's 2.9% + 30¢ US card fee, what you keep from a sale, and what to charge to net a target, using Stripe's published pricing.` |
| Canonical   | Absolute, trailing slash, from `Astro.site`; never a query string                                                 | `https://<site>/fees/stripe-fee-calculator/`                                                                                                 |
| OG/Twitter  | Same title and description; per-page 1200×630 image; absolute URL                                                 | already wired in `Layout.astro`                                                                                                              |
| URL         | Lowercase, hyphenated, ends with `-calculator/` for tools, stable forever; redirect if ever renamed               | `/fees/paypal-fee-calculator/`                                                                                                               |

Never put the year in the URL. Put it in the title only when the content is
actually reviewed that year, and update the title on each review.

## Calculator page template

Order of sections, top to bottom. Every calculator page has all of them.

1. Breadcrumb (visual links plus `BreadcrumbList`): Home › Hub › Tool.
2. H1 and subtitle.
3. One-paragraph answer: what the tool does, the sourced rate, the scope
   ("US accounts, USD, standard online card payments").
4. The calculator (form and result panel; live update; result visible on
   mobile via the sticky bar).
5. How to use it: three to five numbered steps.
6. How the number is built: the formula in words, then one worked example
   using the default inputs, exactly matching what the panel shows.
7. Reference table: five to eight input levels with the outputs (for fees:
   amount, fee, net, effective rate).
8. What changes the number: scenarios with a source each, or an explicit "not
   modeled" line. This is where the assumptions and exclusions lists live.
9. FAQ: six to ten questions in searcher wording, with sourced or scoped answers. Keep them visible; do not add `FAQPage` markup (see Structured data). Questions are `<h3>` under an `<h2>FAQ</h2>`.
10. Related calculators: siblings first, then the other hub, one sentence
    each.
11. Sources, reviewed date, last-updated date, and the operator line.

Word target: 1,200 to 2,000 for fee tools, 1,000 to 1,500 for rate tools,
800 to 1,200 for hubs. The target is coverage of the follow-up questions, not
padding; delete any sentence that does not answer something.

Writing rules: plain language, short sentences, numbers in tables, the
official name for every product ("PayPal Checkout", not "PayPal wallet"),
never a rate without its source, never "profit" for net receipts.

## Structured data

Rendered by `Layout.astro` from a `jsonLd` prop; one object per
`<script type="application/ld+json">`. Rules: describe only what is visible on
the page; no ratings, review counts, prices other than 0, or fabricated dates.

Home:

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "MathMyRate",
  "url": "https://<site>/",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://<site>/?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}
```

plus an `Organization` with `name`, `url`, `logo`, and a contact URL.

Each calculator:

```json
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Stripe Fee Calculator",
  "url": "https://<site>/fees/stripe-fee-calculator/",
  "applicationCategory": "FinanceApplication",
  "operatingSystem": "Any",
  "browserRequirements": "Requires JavaScript",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
  "description": "<the meta description>",
  "publisher": { "@type": "Organization", "name": "MathMyRate" }
}
```

plus `BreadcrumbList`.

Do not add `FAQPage` markup. Google stopped showing FAQ rich results for all
sites on May 7, 2026, and removed the FAQ structured data documentation on
June 15, 2026 ([Search Central documentation updates](https://developers.google.com/search/updates)).

The Software App rich result requires `name`, `offers.price`, and either
`aggregateRating` or `review`
([Google's SoftwareApplication documentation](https://developers.google.com/search/docs/appearance/structured-data/software-app)).
MathMyRate has no real ratings, so its `WebApplication` markup describes the
page but is not eligible for that rich result. Never add invented ratings or
reviews to become eligible.

Validate every page in Google's Rich Results test before release and after
any template change.

## Internal linking

- Header: hubs and the top tools; a full menu on mobile.
- Footer: every calculator, grouped by hub, plus information pages.
- Breadcrumbs on every page below the home page.
- Each tool: related-calculators block plus at least two in-content links
  (for example "gross up for the fee with the Stripe fee calculator").
- Each hub: links to every child with a sentence; each child links back to
  the hub in the breadcrumb.
- Comparison pages link to both underlying tools; both tools link to the
  comparison.
- Anchor text is the tool name, not "click here".
- Every new page must be linked from at least three existing pages the day it
  ships, or it will not be crawled quickly.

## Technical rules

- `site` is configured for production and the build fails without it in
  production mode. Preview builds keep `noindex` and `Disallow: /`.
- `trailingSlash: "always"`; sitemap, canonical, and links agree.
- Sitemap includes every indexable route with `lastmod`; excludes 404.
- 404 is `noindex` and returns HTTP 404 from the host.
- One H1 per page; no skipped heading levels; landmarks (`header`, `main`,
  `nav`, `footer`) present; skip link first in DOM.
- Images have alt text or are `aria-hidden` decoration; the OG image is not
  used in the page body.
- No content behind JavaScript that a crawler needs: defaults, explanations,
  tables, and FAQs are in the HTML.
- No query-string variants of a page; the optional share link uses the URL
  fragment only.

## Performance budget (mobile, throttled)

| Metric                               | Budget       | Measured 2026-09-16                     |
| ------------------------------------ | ------------ | --------------------------------------- |
| Largest Contentful Paint             | under 2.0 s  | 0.63 to 0.81 s                          |
| Cumulative Layout Shift              | under 0.05   | 0 to 0.019                              |
| Interaction to Next Paint            | under 200 ms | not measured; total blocking 0 to 25 ms |
| JavaScript per page (gzipped)        | under 60 KB  | 25 KB freelance, 48 KB fee pages        |
| CSS per page (gzipped)               | under 12 KB  | 6.7 KB                                  |
| Fonts per page                       | under 50 KB  | 47 KB, one Latin variable Inter file    |
| HTML per page (gzipped)              | under 20 KB  | 11.5 KB at most                         |
| Total first-visit download (gzipped) | under 130 KB | 113 KB at most (eBay)                   |

Why the numbers are what they are:

- **JavaScript.** Fee pages ship Effect Schema (about 23 KB), which the engine
  uses to decode inputs, and the preset registry (about 18 KB), which the
  engine needs to check every preset before it prices a fee. The earlier
  40 KB budget did not allow for either; replacing them would weaken the
  engine's checks. Pages that price no fee do not load the registry, because
  the calculators package is marked free of side effects.
- **Fonts.** One variable file covers every weight the site uses. It is not
  preloaded: on a slow connection a preload delayed first paint by about
  150 ms. Astro's Fonts API gives the system fallback fonts size-adjusted
  metrics, so text does not reflow when Inter arrives. Before this, the reflow
  gave fee pages a layout shift of 0.21 to 0.24.
- **HTML.** Measured gzipped, as it is sent. The largest page is about 60 KB
  before compression.

Check sizes on every release: build, then run `pnpm run budget` in
`apps/web`. It fails when a page is over budget, and it counts every font file
a page's `@font-face` rules name, even ones a browser would skip. Check timing
metrics in Chrome with 4x CPU slowdown and a slow 4G profile, and with
PageSpeed Insights on the heaviest page once the site has a public URL. Ad
slots have fixed reserved heights.

## E-E-A-T checklist (every calculator page)

- Operator line linking to About, which names a real person or entity and a
  contact route.
- "Sources" with direct official URLs and the reviewed date.
- "Last updated" date for the page content.
- Assumptions and exclusions visible, not collapsed.
- A corrections route (issue tracker or email) on Methodology.
- The exact-cents and official-source approach stated in one sentence near
  the result ("Calculated in whole cents from Stripe's published US pricing, reviewed 2026-09-14"). Do not write "exact": provider rounding is disclosed as an estimate.

## Keyword map for existing pages

From [keyword research](keyword-research.md) on 2026-09-16: free autocomplete
and page-one checks, without search volumes. Confirm volumes in Keyword
Planner and Search Console before large changes. Primary first, then
secondary phrases to cover in the title, headings, and FAQ. Competition: E
easier, M medium, H hard.

| Page                       | Primary                            | Secondary                                                                                             | Comp. |
| -------------------------- | ---------------------------------- | ----------------------------------------------------------------------------------------------------- | ----- |
| Stripe fee calculator      | stripe fee calculator              | stripe fees, how much does stripe charge, stripe fees per transaction, does stripe charge for payouts | H     |
| PayPal fee calculator      | paypal fee calculator              | paypal fees, how are paypal fees calculated, paypal fees for receiving money                          | M     |
| Square fee calculator      | square fees                        | square fee calculator, how much are square fees, square fees per transaction, manual entry            | M     |
| Etsy fee calculator        | etsy fee calculator                | etsy fees, etsy fees explained, etsy fees per transaction, for digital products                       | H     |
| eBay fee calculator        | ebay fee calculator                | ebay fees, how much fees ebay take, ebay fees for selling                                             | H     |
| Upwork fee calculator      | upwork fee calculator              | what fees does upwork charge, what percentage does upwork take, upwork fees for clients               | M     |
| Fiverr fee calculator      | fiverr fees                        | fiverr fee calculator, fiverr fees for sellers, fiverr fee for buyers                                 | E     |
| Kickstarter fee calculator | kickstarter fees                   | kickstarter fee calculator, how much does kickstarter charge, kickstarter processing fee              | E     |
| Indiegogo fee calculator   | indiegogo fees                     | what percentage does indiegogo take, indiegogo fee calculator                                         | E     |
| Patreon fee calculator     | patreon fees                       | patreon fees explained, patreon service fee, patreon fees for creators                                | E     |
| Ko-fi fee calculator       | ko-fi fees                         | ko-fi fee calculator, does ko-fi take fees                                                            | E     |
| Substack fee calculator    | substack fees                      | how much does substack charge, how much does substack cost                                            | E     |
| Payhip fee calculator      | payhip fees                        | how much does payhip charge, payhip fees calculator, payhip transaction fees                          | E     |
| Podia fee calculator       | podia pricing                      | how much does podia cost, podia fees                                                                  | M     |
| Whop fee calculator        | whop fees                          | whop fees calculator, whop fees vs stripe, whop processing fees, whop payout fees                     | E     |
| Skool fee calculator       | skool fees                         | how much does skool charge, how much does skool cost                                                  | E     |
| Teachable fee calculator   | teachable fees                     | teachable transaction fees, teachable processing fees                                                 | M     |
| Gumroad fee calculator     | gumroad fees                       | gumroad pricing, gumroad transaction fee, gumroad fee calculator                                      | E     |
| Lemon Squeezy fee calc.    | lemon squeezy fees                 | lemon squeezy pricing, lemon squeezy fee calculator                                                   | E     |
| KDP royalty calculator     | kdp royalty calculator             | kdp royalty rate, kdp royalties explained, kdp royalty calculator paperback                           | M     |
| Payout fee calculator      | payout fee calculator              | does stripe charge for payouts, stripe instant payout fee, whop payout fees                           | E     |
| Hourly rate calculator     | freelance hourly rate calculator   | freelance rate calculator, how to calculate freelance rate, day rate calculator                       | M     |
| Project rate calculator    | freelance project rate calculator  | project cost calculator, project quote calculator                                                     | M     |
| Retainer calculator        | retainer fee calculator            | how much to charge for a retainer, retainer fee, monthly retainer calculator                          | E     |
| Markup and margin          | markup and margin calculator       | markup vs margin, markup vs margin example                                                            | H     |
| Salary to hourly           | salary to hourly calculator        | how to convert salary to hourly, hourly to salary calculator                                          | H     |
| Early payment discount     | early payment discount calculator  | 2/10 net 30, 2/10 net 30 formula, what is an early payment discount                                   | M     |
| Rate increase              | freelance rate increase calculator | how to raise your rates, hourly rate increase calculator                                              | H     |
| 1099 vs W-2                | 1099 vs w2 calculator              | 1099 vs w2 pay difference calculator, independent contractor rate calculator                          | M     |
| Comparisons                | "X vs Y fees"                      | See the comparison table in keyword research                                                          | E–H   |

Pages to add are ranked in keyword research, section 3.

## Ads and consent readiness

Google AdSense requires content that is "high-quality, original, and attract
an audience", and its publisher policies do not allow Google-served ads on
screens with low-value content or on dead-end pages such as error pages
([eligibility](https://support.google.com/adsense/answer/9724),
[publisher policies](https://support.google.com/adsense/answer/10502938)). Its
privacy policy requirements say the policy must disclose that third-party
vendors, including Google, use cookies to serve ads based on prior visits, and
explain how to opt out ([required content](https://support.google.com/adsense/answer/1348695)).
Personalized ads in the EEA and UK have required a Google-certified consent
management platform integrated with the IAB TCF since 16 January 2024, and in
Switzerland since 31 July 2024
([consent requirements](https://support.google.com/adsense/answer/13554116)).

Do not apply to an ad network until:

- at least 20 calculator or comparison pages carry the full template;
- About names the operator and Privacy discloses hosting logs, analytics,
  and the planned ad vendors and cookies;
- a consent flow exists for EU/UK/CA visitors (Google consent mode or a CMP)
  and ads load only after consent where required;
- ad slots have fixed sizes and CLS stays under 0.05 with ads on;
- calculator inputs are never passed to any third-party script (this keeps
  the "your numbers stay yours" promise true).

Slot plan: one unit below the result panel, one after the FAQ, none inside
the form, none on 404, privacy, terms, or methodology.

## Launch checklist

- [ ] `site` set; production build shows canonical, OG URLs, sitemap, and
      `Allow: /`.
- [ ] Every page: one keyword H1, title and description per template, no
      skipped headings, structured data validates.
- [ ] Mobile menu, footer tool links, breadcrumbs, related calculators on
      every tool.
- [ ] Sticky result on mobile; no label/value collisions at 320 px.
- [ ] Input normalizer accepts `$`, `,`, spaces, trailing `.`; results hold
      during typing.
- [ ] All six tools have the eleven-section template with FAQ.
- [ ] About names the operator; Privacy is true for launch day.
- [ ] Search Console and Bing verified; sitemap submitted; cookieless
      analytics live and disclosed.
- [ ] `pnpm run budget` passes, and PageSpeed Insights mobile is within budget
      on the heaviest page (eBay).
- [ ] `pnpm run lint`, `pnpm run format:check`, `pnpm run check-types`,
      `pnpm run test`, and the browser pass recorded in
      [project status](project-status.md).

## Measurement cadence

- Weekly: Search Console impressions, clicks, and average position for the
  keyword map; index coverage errors; Core Web Vitals report.
- Monthly: re-check every official pricing source, update review dates only
  when actually reviewed, and update titles that carry a year.
- Per release: Rich Results test on changed templates, `pnpm run budget`, a
  throttled timing check on the heaviest page, and the browser pass.
