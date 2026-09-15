# Honest review: UX, SEO, and ad-revenue readiness

Review date: **2026-09-15**. Reviewed at commit `b06b53b` on `main`.

This is an outside-in review of MathMyRate against its stated goal: a free
calculator site (a niche alternative to calculator.net) that earns enough
search traffic to monetize with ads. It covers what was verified, not what the
plan says should exist. The prioritized fixes are in
[the improvement plan](improvement-plan.md) and the standing rules are in
[the SEO playbook](seo-playbook.md).

## How this review was done

- Read every page, layout, script, style, and the calculator package.
- Built the production output (`pnpm run build:web`) and inspected the emitted
  HTML: titles, descriptions, headings, word counts, internal links, structured
  data, robots, sitemap, and asset sizes.
- Walked the running site in a browser at desktop and 375 px widths: home
  search, all six calculators, hub pages, 404, keyboard focus order, transfer
  between hourly and project tools, copy, invalid and transient inputs.
- Compared against calculator.net and the pages that currently rank for
  "stripe fee calculator", "paypal fee calculator", and "freelance hourly
  rate calculator".

## Verdict

The engineering is better than most calculator sites: exact integer money
math, sourced fee rules with review dates, static HTML with real defaults
before JavaScript, no tracking, accessible labels, working keyboard and
reduced-motion behavior, clean visual design, and zero console errors.

The product is not yet competitive for search traffic. The site has six thin
pages in a market where the ranking pages have 1,800 to 3,500 words, fee
tables, FAQs, and dozens of related tools. The H1s carry no keywords, there is
no structured data, no mobile navigation, no cross-links between calculators,
and the fee tools cover one US scenario each while every ranking competitor
covers international, card versus wallet, invoices, and monthly volume. On a
phone the result sits a full screen below the inputs. Nothing here is hard to
fix, but as it stands the site would rank for its brand name and little else.

Ads are not viable on the current pages: content depth is below what AdSense
reviewers accept, and the privacy and about pages promise "no ads, no cookies,
no tracking", which stops being true the moment an ad tag loads.

## Scorecard

| Area                              | Score | Why                                                                                                  |
| --------------------------------- | ----- | ---------------------------------------------------------------------------------------------------- |
| Calculation correctness and trust | 9/10  | Exact cents, sourced presets, refuses unsupported cases, review dates shown                          |
| Visual design                     | 8/10  | Calm, distinctive, consistent; result panel reads well                                               |
| Desktop calculator UX             | 6/10  | Live recalculation works, but strict input parsing and blanking results on transient input hurt      |
| Mobile UX                         | 4/10  | No navigation menu, result below the fold, label/value collision on the summary rows                 |
| Accessibility                     | 7/10  | Labels, errors, skip link, focus rings present; some double announcements and noisy label names      |
| Performance                       | 7/10  | Static HTML and ~27 KB gzipped JS, but the Effect runtime is most of that JS for simple arithmetic   |
| On-page SEO                       | 3/10  | Keyword-free H1s, short descriptions, no structured data, no breadcrumbs, single language, thin text |
| Content depth                     | 2/10  | 219 to 698 words per calculator page versus 1,800 to 3,500 on ranking pages; no FAQ, no fee tables   |
| Internal linking and architecture | 3/10  | Fee pages do not link each other; footer has no tool links; only 13 to 17 internal links per page    |
| Search-intent coverage            | 3/10  | Six tools, one US scenario each; no volume mode, no international, no comparisons                    |
| Indexing plumbing                 | 6/10  | Canonical, robots, sitemap, OG are wired but inert until `site` is set; no build guard               |
| Ads and monetization readiness    | 2/10  | Thin content, policy pages contradict ads, no consent flow, no reserved ad slots                     |

## What is genuinely good (keep it)

- **Money is right.** Bigint cents and basis points, half-up rounding per
  component, and brute-force inverse tests. This is a real differentiator worth stating on the page, without claiming more precision than the providers document.
- **Sourcing discipline.** Every fee preset carries an official URL, a review
  date, assumptions, and exclusions, and unsupported cases throw instead of
  guessing. This is exactly the trust signal search quality raters look for.
- **Static-first rendering.** The worked example is in the HTML, so crawlers
  and no-JS users see real numbers. The `noscript` notice is honest.
- **Privacy.** No analytics, no beacons, transfer via local storage rather
  than query strings. This is a marketing asset if the ads plan preserves it
  (see the consent section of the playbook).
- **Accessibility basics.** Skip link works, focus rings are visible, errors
  are tied to fields with `aria-describedby`, required markers are announced,
  reduced motion is honored, print hides chrome.
- **Design.** The navy result panel, the eyebrow labels, and the card grid
  look like a product, not a template.

## UX findings (verified in the browser)

### Navigation

1. **No mobile navigation.** At 375 px the header shows only the logo and a
   "Calculate a rate" button. The three nav links are `hidden md:flex`. From
   the Stripe page on a phone there is no way to reach the PayPal page except
   logo, home, scroll, tap. Most calculator traffic is mobile.
2. **Fee calculators do not link each other.** The Stripe page links to the
   fees hub, the two freelance tools, and the footer legal pages. Nothing links
   to PayPal, Gumroad, or Lemon Squeezy. There is no "related calculators"
   block anywhere.
3. **Footer carries no tool links.** Only Methodology, About, Privacy, Terms.
4. **The header CTA is always "Calculate a rate" pointing at the hourly tool**,
   even on fee pages where it is irrelevant, and on the hourly page itself.
5. **Eyebrows imitate breadcrumbs but are not links.** "Platform fees / 03" is
   plain text. Real breadcrumbs (visual plus `BreadcrumbList`) would do the
   same job and count as internal links.

### Inputs

6. **Formatting characters are rejected.** Typing `$85000` or `85,000` shows
   "Use a nonnegative amount with up to 2 decimal places." Users paste values
   from invoices and spreadsheets with these characters constantly. The parser
   should strip `$`, `,`, spaces, and a trailing `.` before validating.
7. **Transient input blanks the whole result.** Typing `18.` on the way to
   `18.5` clears every result to "—", shows the red summary, and marks the
   field invalid. The result should hold the last valid value while the user
   is mid-keystroke and only turn red on blur or submit for format errors.
8. **Inconsistent units.** Contingency has a `%` suffix inside the field; tax
   and billable put `(%)` in the label; money fields have no `$` prefix at all.
9. **Defaults show `85000.00` rather than `85,000`.** Displaying grouped digits
   (and accepting them) reads better and matches how people think about money.
10. **Two ways to update.** Live recalculation plus an "Update rate" button is
    fine as a keyboard fallback, but nothing tells the user the page already
    updated, so some will click it every time.

### Results

11. **Result is below the fold on mobile.** On the hourly tool the number is
    roughly 800 px below the first field. After every edit the user scrolls
    down to read and back up to change. Use a sticky compact result bar on
    small screens, or move the primary number above the form on mobile.
12. **Label and value collide on narrow screens.** "Annual revenue
    needed$123,938.36" renders with no gap at 375 px. The row is
    `flex justify-between` without `gap` or wrapping.
13. **Copy copies one line.** "Minimum hourly rate: $103.63" loses the day
    rate, revenue, and capacity that the panel shows. Copy the breakdown.
14. **No way to share or bookmark a calculation.** This is deliberate for
    privacy, and the doc records that choice. It does cost links and repeat
    visits; an explicit opt-in "copy link" that encodes inputs in the URL
    fragment is a reasonable middle ground if the privacy page is updated.
15. **No monthly or annual view on fee tools.** Every ranking fee calculator
    lets the user enter transactions per month and shows monthly and annual
    fees plus an effective rate. That is the number a seller acts on.

### Content and trust

16. **Pages end where the calculator ends.** The hourly page has two
    sentences under "How this number is built" and then the footer. There is
    no worked example, no table of rates at different inputs, no FAQ, and no
    guidance on what a reasonable billable percentage or tax reserve is.
17. **Freelance pages have no reviewed date or author.** Fee pages show
    "Reviewed 2026-09-14"; the freelance and hub pages show nothing.
18. **About page names no operator.** "A calculator, not an oracle" is a nice
    line, but there is no person, company, or contact. Search quality
    guidelines and AdSense reviewers both look for this.
19. **Privacy says "no ads"; About says "no ads".** Both will be false after
    monetization and must change first, not after.

### Accessibility details

20. `aria-live="polite"` is on the entire result `aside`, so each keystroke
    re-announces every row and button. Scope it to the primary number and a
    short status line.
21. The error summary and each field error are both `role="alert"`, so one
    mistake is announced twice.
22. Inputs are wrapped in their `<label>` together with the help text, so the
    accessible name of "Desired annual take-home" includes the full help
    sentence, which is then announced again via `aria-describedby`.

## SEO findings (verified in the build output)

### Indexing plumbing

- `site` is not set in `astro.config.mjs`, so every page ships
  `<meta name="robots" content="noindex, nofollow">`, no canonical, no
  `og:url`, no `og:image`, and `robots.txt` is `Disallow: /`. The sitemap
  route is not emitted at all. This is correct for preview builds and a silent
  disaster if it reaches production. There is no build-time guard.
- The sitemap has no `lastmod`, and `trailingSlash` is Astro's default
  `ignore`, so `/fees` and `/fees/` both resolve in dev while production
  hosting will redirect one of them. Set `trailingSlash: "always"` so dev,
  sitemap, and canonical agree.

### On-page

- **H1s do not contain the query.** "Build a rate with room to work.",
  "Know the fee before you quote.", "Gumroad's cut, worked out in cents.",
  "PayPal's fee, out in the open." A searcher and a crawler both expect
  "Stripe Fee Calculator" in the H1. Keep the taglines as subtitles.
- **The home H1 is styled as a 0.71 rem eyebrow** ("All calculators, one
  page"). It is the least prominent text on the page and says nothing about
  what the site is for.
- **Heading hierarchy skips a level on the home page** (h1 then h3 cards).
- **Meta descriptions on the freelance tools are short and generic.** "Turn an
  annual take-home target into a practical floor rate." carries no rate,
  keyword, or year.
- **Titles are fine but plain.** "Stripe Fee Calculator | MathMyRate" works;
  ranking pages add the rate or year ("2.9% + 30¢", "2026") to win the click.

### Structured data

- There is no JSON-LD anywhere. At minimum every calculator page should carry
  `SoftwareApplication`/`WebApplication` (free, browser-based),
  `BreadcrumbList`, and `FAQPage` once FAQs exist; the home page should carry
  `WebSite` with `SearchAction` and `Organization`. No invented ratings.

### Content depth

| Page                         | Words on page | Ranking competitors |
| ---------------------------- | ------------- | ------------------- |
| Hourly rate calculator       | 242           | 1,800 to 3,500      |
| Project rate calculator      | 219           | 1,500 to 3,000      |
| Stripe fee calculator        | 397           | 3,000 to 3,500      |
| PayPal fee calculator        | 424           | 1,500 to 2,500      |
| Gumroad fee calculator       | 698           | 800 to 1,500        |
| Lemon Squeezy fee calculator | 634           | 800 to 1,500        |
| Home                         | 195           | n/a                 |

Word count is not the goal, but the ranking pages answer the follow-up
questions (how the fee is calculated with a worked example, a rate table by
amount, domestic versus international, how to reduce fees, refunds, taxes,
comparison with alternatives) and this site does not. The Gumroad and Lemon
Squeezy pages are the closest to competitive because their assumption and
exclusion lists are already substantive; they are also the least contested
keywords and the best near-term ranking opportunity.

### Internal linking

- 13 internal links per page, all from the header and footer chrome. No
  in-content links, no related tools, no hub link back from tool bodies.
- The freelance and fees hubs are navigational cards with a sentence each.
  Hubs should carry their own explanatory content and link to every child.

### Search-intent coverage

- Six tools. calculator.net has about 200; each calculator page is a keyword.
  The niche (freelancers and digital-product sellers) supports 30 to 60
  tools without leaving the topic.
- Every fee tool covers exactly one US/USD scenario. The official pricing
  pages already document international cards (+1.5%), currency conversion
  (+1%), Stripe Billing (+0.7%), ACH, PayPal card payments (2.99% + $0.49),
  invoices, micropayments, Gumroad PayPal sales, and Lemon Squeezy
  international, PayPal, and subscription surcharges. These are sourced
  scenarios, so adding them does not violate the official-source rule; the
  code already has `blocked` records naming them.
- No comparison pages (Stripe vs PayPal, Gumroad vs Lemon Squeezy), which are
  the highest-intent queries in the fee space.

### E-E-A-T and trust signals

- Strong: sources, review dates, exclusions, methodology page, corrections
  policy.
- Missing: operator identity, contact, visible "last updated" on every page,
  a change log for fee rule revisions, and the exact-math advantage stated in
  plain language where users can see it.

### Performance

- Production HTML pages are 4 to 14 KB; CSS 6.7 KB gzipped; per-page script
  1 to 2 KB gzipped; the shared calculator chunk is 27.7 KB gzipped, of which
  nearly everything is the Effect runtime (Schema, Cause, Fiber, Option). For
  arithmetic that fits in 200 lines this is the one obvious weight to cut,
  though it is not a ranking problem today.
- Four Inter weights load as woff2 (latin only, thanks to `unicode-range`),
  about 100 KB. Two weights and a preload for the body weight would trim the
  largest contentful paint.
- The fixed full-viewport grain overlay is cheap because the noise is a
  rasterized data URI, but it is a permanent compositor layer on every page.
  Worth measuring on a low-end Android before ads add more layers.

## Competitive comparison

| Capability                             | MathMyRate | calculator.net | Ranking fee calculators (Aspire, SaleHoo, Yotpo) |
| -------------------------------------- | ---------- | -------------- | ------------------------------------------------ |
| Exact cents, sourced rules             | Yes        | No             | No                                               |
| Tools                                  | 6          | ~200           | 5 to 30 per site                                 |
| Words per tool page                    | 219 to 698 | 2,000 to 4,000 | 1,500 to 3,500                                   |
| FAQ / fee tables                       | No         | Yes            | Yes (8 to 13 questions, rate tables)             |
| Related calculators block              | No         | Yes            | Yes                                              |
| International / conversion options     | No         | n/a            | Yes                                              |
| Monthly volume and annual totals       | No         | n/a            | Yes                                              |
| Provider comparison                    | No         | n/a            | Yes                                              |
| Structured data                        | No         | Partial        | Partial                                          |
| Mobile navigation                      | No         | Yes            | Yes                                              |
| Result visible while editing on mobile | No         | Yes (top)      | Mostly                                           |
| Author / operator identity             | No         | Yes            | Usually                                          |
| Tracking / ads                         | None       | Heavy          | Heavy                                            |

## Monetization readiness

- AdSense and similar networks reject sites for "low value content" when
  pages are mostly a tool with a paragraph. The content plan in the playbook
  is the fix and should land before applying.
- Ads require a privacy policy that discloses third-party cookies and
  vendors, and in the EU/UK a consent flow (Google's consent mode or a CMP).
  The current privacy page says the opposite. Update it in the same release
  that adds ads, not before, so it stays true at every point.
- Reserve ad slot dimensions in the layout so ads do not cause layout shift;
  a bad CLS score will cost more traffic than the ads earn.
- A cookieless analytics option (Cloudflare Web Analytics or a self-hosted
  Plausible) is compatible with the current privacy promise and is needed
  now to know which pages get traffic.

## Bottom line

Fix the mobile navigation, the H1s, the input parsing, the result placement,
and the structured data in one pass; that is a week of work and removes every
"why would anyone use this over the top result" objection. Then treat content
and tool count as the product: each new sourced scenario and each new
calculator page is a new keyword. The exact-math and sourcing story is the
brand; say it on every page.
