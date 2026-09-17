# SEO playbook

Last updated: 2026-09-15. Standing rules for every public page. The one-off
findings that produced these rules are in
[the honest review](honest-review-2026-09-15.md); the ordered work is in
[the improvement plan](improvement-plan.md).

The strategy in one sentence: every calculator page is a keyword, every fee
scenario is a sub-keyword, and the site's edge is exact math with official
sources and review dates, said plainly on every page.

## Metadata templates

Primary keyword = the phrase people type, in this order of preference:
"{provider} fee calculator", "{thing} calculator", "{a} vs {b} fees".

| Element     | Rule                                                                                                | Example                                                                                                                                      |
| ----------- | --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `<title>`   | Primary keyword first, then the sourced rate or year, then the brand; 50 to 60 characters           | `Stripe Fee Calculator (2.9% + 30¢) \| MathMyRate`                                                                                           |
| H1          | Exactly the primary keyword, title case, one per page                                               | `Stripe Fee Calculator`                                                                                                                      |
| Subtitle    | The former tagline as a `<p>` under the H1                                                          | `Know the fee before you quote.`                                                                                                             |
| Description | 140 to 160 characters: what it does, the rate, the differentiator                                   | `Estimate Stripe's 2.9% + 30¢ US card fee, what you keep from a sale, and what to charge to net a target, using Stripe's published pricing.` |
| Canonical   | Absolute, trailing slash, from `Astro.site`; never a query string                                   | `https://<site>/fees/stripe-fee-calculator/`                                                                                                 |
| OG/Twitter  | Same title and description; per-page 1200×630 image; absolute URL                                   | already wired in `Layout.astro`                                                                                                              |
| URL         | Lowercase, hyphenated, ends with `-calculator/` for tools, stable forever; redirect if ever renamed | `/fees/paypal-fee-calculator/`                                                                                                               |

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

Volumes are not recorded here; check them in Search Console and Keyword
Planner before prioritizing. Primary first, then secondary phrases to cover
in headings and FAQ.

| Page                    | Primary                           | Secondary                                                                                                                |
| ----------------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Stripe fee calculator   | stripe fee calculator             | stripe fees, stripe processing fee, how much does stripe charge, stripe fee 2.9 + 30, stripe international fee           |
| PayPal fee calculator   | paypal fee calculator             | paypal fees, paypal goods and services fee, paypal invoice fee, paypal international fee, paypal fee for receiving money |
| Gumroad fee calculator  | gumroad fee calculator            | gumroad fees, gumroad discover fee, gumroad 10%, gumroad payout                                                          |
| Lemon Squeezy fee calc. | lemon squeezy fee calculator      | lemon squeezy fees, lemon squeezy pricing, lemon squeezy vs gumroad, merchant of record fees                             |
| Hourly rate calculator  | freelance hourly rate calculator  | freelance rate calculator, contractor hourly rate calculator, how much to charge per hour freelance, day rate calculator |
| Project rate calculator | project rate calculator           | freelance project quote calculator, fixed price quote calculator, project cost estimate with contingency                 |
| Fees hub                | payment processing fee calculator | platform fee calculator, digital product fees compared                                                                   |
| Freelance hub           | freelance pricing calculator      | freelance rate tools, what to charge as a freelancer                                                                     |

Comparison pages to add: "stripe vs paypal fees", "gumroad vs lemon
squeezy", "cheapest platform to sell digital products".

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
