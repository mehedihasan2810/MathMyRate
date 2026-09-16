# MathMyRate project status

Status date: **2026-09-15**

This page is a factual checkpoint, not a release announcement. Update it after
meaningful changes and include the commit/PR and the commands or source audit
that support each new status. Do not replace an actual result with a count
copied from a previous run.

## Executive status

**Not launched.** PR #1 and PR #2 are merged. This branch implements the Astro
shell, the freelance tools, and all four provider fee calculators (Stripe,
PayPal, Gumroad, and Lemon Squeezy).
There is still no deployed-ready product, staging validation, or production
deployment. There is no hosted CI/CD; checks and deploys are local.

## What exists now

### Math engine track

The package remains framework-independent, and the implemented freelance Astro
pages now consume its real results:

- `packages/calculators` uses Effect Schema at decode boundaries and rejects
  non-finite and unparsed values instead of manufacturing a result.
- The freelance engine implements hourly/day-rate planning and project receipt
  targets. Monetary inputs and outputs use bigint integer cents; percentages
  use integer basis points; divisions use explicit upward cent rounding.
- Runtime schemas validate object shape, bigint money values, safe integers, and
  domain boundaries such as tax below 100%, positive work capacity, and
  contingency limits.
- The math test direction covers hand-derived values, fractional capacity,
  zero cases, contingency/rounding boundaries, monotonicity, malformed inputs,
  and boundary rejection.
- The current fee engine uses exact bigint cents and integer basis points with
  runtime schema guards. Fee validation, provider boundaries, and brute-force
  inverse checks are required evidence for fee rules; a formula that merely
  looks plausible is not enough.
- Six scoped fee presets are implemented: Stripe domestic online card, PayPal
  Checkout's PayPal payment method, Gumroad direct card before/after its monthly
  threshold, Gumroad Discover, and Lemon Squeezy domestic non-subscription no-tax
  card orders. All have source links, reviewed dates, assumptions and exclusions.
  Unsupported scenarios throw, not return fallback rates. No-tax presets reject
  positive tax input. Provider settlement rounding is explicitly an estimate.

The package export and test scripts must remain aligned whenever this branch
changes: an implementation file or a fixture is not complete until the
supported public export and the package-level test command exercise it. The
freelance UI is implemented, but this is not a provider calculator or a
deployed/shipped feature.

### Frontend

The frontend is now an Astro static site with:

- `/`
- `/freelance/`
- `/freelance/hourly-rate-calculator/`
- `/freelance/project-rate-calculator/`
- `/fees/`
- `/fees/stripe-fee-calculator/`
- `/fees/paypal-fee-calculator/`
- `/fees/gumroad-fee-calculator/`
- `/fees/lemon-squeezy-fee-calculator/`
- `/methodology/`
- `/about/`
- `/privacy/`
- `/terms/`
- a 404 page served for unknown routes

The freelance pages use native accessible controls and browser scripts, call
the framework-independent engine, and provide labeled defaults, explanatory
content, validation/error states, reset, copy, print, and local hourly-rate
transfer. They do not require a Preact island or another framework integration.
Login, signup, and dashboard pages were removed because every tool is free.
Better Auth server, database schema, and the unused web client remain in
source. Transfer grouping/validation and reduced-motion/skip-link contrast
fixes are included in this UI work.

The Stripe fee page (added 2026-09-15) uses the same native-controls approach
and is wired to the official `stripe-us-online-domestic-card` preset. It offers
a received-amount mode (`calculateFees`) and a keep-target gross-up mode
(`grossUpFees`), plus an optional caller-supplied sales-tax pass-through, and
renders the preset's assumptions, exclusions, official source link, and review
date next to the engine's estimate warning. The PayPal page (added the same
day) repeats that pattern for the official
`paypal-us-checkout-paypal-payment` preset. The Gumroad page (added
2026-09-15) adds a scenario selector for its three supported presets
(`gumroad-us-direct-card`, `gumroad-us-direct-card-high-volume`, and
`gumroad-us-discover`), shows the engine's per-component line items, renders
each scenario's assumptions and exclusions, and documents the unsupported
threshold-crossing case instead of offering it; all three presets are no-tax,
so the page has no tax input. The Lemon Squeezy page (added 2026-09-15) covers
the official `lemon-squeezy-us-card-single-no-tax` preset with the same two
modes and line-item display, documents the international, PayPal, subscription,
and payout gaps from the blocked registry records, and offers no tax input
because the baseline scenario collects none. The `/fees/` hub links to all four
fee tools; no provider calculator is marked in development anymore.

### Social preview images

Open Graph and Twitter card metadata (added 2026-09-15) follows the static
pre-made-image approach used by pingdotgg/lawn: nine 1200×630 PNGs are
generated into `apps/web/public/og/` by a satori + resvg build script
(`apps/web/scripts/generate-og-images.mjs`, `pnpm --filter web og:images`)
using the site's font (Inter via Fontsource) and palette
tokens. The eight money pages (`/`, both freelance calculators, `/fees/`, and
the four provider calculators) reference per-page images; all other pages,
including the 404, fall back to `default.png`. `Layout.astro` emits
`og:site_name/title/description/type` on every page, and
`og:url`/`og:image`/`twitter:*` with absolute URLs only once a production site
is configured, mirroring the canonical-link gate. The hourly and freelance-hub
pages also gained their missing meta descriptions.

### Logo, icons, and manifest

The brand mark (added 2026-09-15, recolored the same day with the navy/gold
theme) is a navy rounded tile with a paper percent slash and two gold dots,
drawn from the same palette tokens as the site. It
ships as `public/favicon.svg` (hand-edited) plus generated assets:
`favicon.ico` (16/32/48), `apple-touch-icon.png` (180, square corners for
iOS's mask), `icon-192.png`/`icon-512.png`, maskable 192/512 variants with the
mark inside the safe zone, and `manifest.webmanifest` (name, theme color
`#1f3a5f`, four icon entries). All are generated by
`apps/web/scripts/generate-icons.mjs` (`pnpm --filter web icons:generate`),
which pixel-checks each render against the palette before writing.
`Layout.astro` links the SVG and ICO favicons, the Apple touch icon, the
manifest, and a `theme-color` meta on every page; `Header.astro` places the
24px mark beside the wordmark. The favicon set is what search engines show
next to results and what browsers/tab bars and installed-app icons display.

### Theme

The site theme (2026-09-15) is a navy-and-gold palette on a light porcelain
base: `--color-ink #131f33` (navy-black text and dark panels), `--color-paper
#f4f5f7`, `--color-mist #e9edf3`, `--color-navy #1f3a5f` (primary; result
panels, primary buttons, active navigation), `--color-gold #b98d2f` (accent;
the wordmark dot and fee-hub links), `--color-line #d9dce4`. It replaced the
original cream/moss-green/terracotta palette so the site no longer resembles
the owner's other project. Error styling stays in the red family
(`#a44631` field errors and required markers; `#8f3c2d` summary text) and the
transfer-success notice stays pale green, both independent of the brand
accent. The OG cards and the full icon set are regenerated from the same
palette values. Inter remains the only font.

### Launch-blocker UX and SEO pass (2026-09-15)

The first six launch blockers in [the improvement plan](improvement-plan.md)
are implemented on branch `feat/launch-blockers-ux-seo`, based on `b06b53b`, not yet committed:

- `apps/web/src/data/tools.ts` is the single calculator registry for the
  header menu, footer, breadcrumbs, related calculators, home search, and
  sitemap.
- Every calculator H1 is its search phrase. Titles carry the preset's
  published rate, and descriptions are 137 to 150 characters.
- `PUBLIC_SITE_URL` turns on canonical links, JSON-LD, crawlable `robots.txt`,
  and a sitemap with git-based `lastmod`. `REQUIRE_SITE_URL=true` or
  `ALCHEMY_STAGE=production` fails a build without it. `trailingSlash` is
  `always`.
- An "All calculators" menu works at every width. Calculator pages have
  breadcrumbs, five related calculators, and a sticky mobile result bar.
- Inputs accept `$`, `%`, commas, spaces, and a dangling decimal point. An
  unfinished entry dims the last result instead of erasing it, and errors
  appear when the field is left or Update is pressed.

### Content, trust pages, and new fee scenarios (2026-09-15)

On branch `feat/content-trust-growth`, based on `b645576`:

- Every provider fact was re-checked against the provider's own pages on
  2026-09-15. Stripe gained international and manually entered card
  scenarios. PayPal gained standard card payments, invoices paid through
  PayPal or by card, international Checkout, and QR codes. Lemon Squeezy
  gained international card, PayPal, and subscription orders, and now accepts
  tax on the order, because its fee is calculated on the tax-inclusive total.
  Review dates moved to 2026-09-15, and revisions were bumped where a rule's
  sources, assumptions, or status changed.
- The four fee pages share `FeeCalculator.astro`, with scenario choice,
  keep-a-target mode, tax where the preset accepts it, and an optional
  sales-per-month field backed by the engine's new `repeatSale` and
  `effectiveFeeRateBps`.
- All six calculators carry long-form guides: worked examples and reference
  tables computed at build time, the provider fees the calculator does not
  add, per-scenario assumptions, visible FAQs, sources, and updated and
  reviewed dates. FAQPage markup is not emitted, because Google stopped showing
  FAQ rich results on May 7, 2026.
- New pages: `/fees/stripe-vs-paypal-fees/`, `/fees/gumroad-vs-lemon-squeezy-fees/`,
  and `/changelog/`. About, Privacy, and Terms now give a public GitHub issue
  tracker as the contact and correction route, and state that no ads run today.

### Growth calculators, guides, and embeds (2026-09-15)

On branch `feat/growth-calculators-guides`, based on `9143e2d`:

- Three freelance calculators: the retainer, markup and margin, and salary
  to hourly calculators. They use the new `packages/calculators/src/pricing.ts`
  (`analyzePrice`, `priceFromMarkup`, `priceFromMargin`, `convertPay`, and
  `calculateRetainer`). Prices and retainer fees round up to the cent;
  percentages and pay figures round half away from zero.
- Two fee calculators, from official pages read on 2026-09-15. Square has
  eight scenarios across Free, Plus, and Premium; invoices paid by ACH are a
  blocked preset, because of their minimum and cap. Etsy has two scenarios;
  Offsite Ads are a blocked preset, because of their $100 cap. A fee component
  can now use the base `gross-excluding-tax`, for Etsy's transaction fee, and
  `grossUpFees` subtracts that share of the tax from its inverse. Shopify
  Payments was not built: its official pricing pages show no card rate.
- `/fees/` and `/freelance/` have registry-driven summary tables and content.
  `/guides/` has three guides with `Article` JSON-LD, and calculator pages
  list the guides that name them.
- Each fee calculator has a noindex `/embed/<calculator>/` copy. Fee pages
  show a copyable embed snippet when `PUBLIC_SITE_URL` is set.
- Related calculators are capped at six, with at least one from the other
  hub. The menu panel scrolls on short screens. Percentage fields accept
  digit grouping and values above 100% where a calculator allows them.

### Marketplace fees, embeds, and more guides (2026-09-15)

On branch `feat/marketplace-fees-embeds`, based on `df44ae1`:

- eBay has seven scenarios: most categories above and at or below $10, Books,
  Movies & TV, and Music, trading cards, comics, and coins, Guitars & Basses,
  international buyers, and Basic Store or above. A preset can now carry
  `grossRangeCents`; `calculateFees` and `grossUpFees` throw
  `GrossOutOfRangeError` outside it, and the page names the covered range.
  Sales above a category's rate threshold are a blocked preset.
- Upwork and Fiverr use `ServiceFeeCalculator.astro`, configured in
  `apps/web/src/data/service-fee-calculators.ts`, with the engine's new
  `calculateServiceFee` and `earningsForTarget`. Upwork's fee is entered from
  the contract (0% to 15%), with Direct Contract (5%, or 0% with Freelancer
  Plus) and Enterprise (typically 10%) options. Fiverr's is a fixed 20%. Each
  lists only withdrawal fees its pages state consistently.
- `/fees/digital-product-platform-fees/` compares Lemon Squeezy, Gumroad,
  Etsy, Stripe, and PayPal on one sale. Two guides were added: Stripe fees
  explained and Gumroad's $20,000 threshold.
- The five freelance calculators moved into components, and every calculator
  has a noindex embed page. Shopify Payments is still not built, because its
  official pages publish no card rate.

### Creator platform fees and KDP royalties (2026-09-16)

On branch `feat/creator-platform-fees`, based on `b043b00`:

- Kickstarter: pledges of $10 or more (5% plus 3% + $0.30) and under $10 (5%
  plus 5% + $0.08), with campaign totals from the pledge count. Pledge Manager
  payments are a blocked preset. `grossRangeCents` can now set only a minimum
  or only a maximum.
- Patreon: the standard 10% plan by payment method, currency conversion, iOS
  in-app purchases, and the legacy Pro plan's $3 threshold. Results match
  Patreon's own $10 web and $14.50 iOS examples.
- Ko-fi: its 5% fee or no fee, with Stripe's published US card rate for
  payments through Stripe, and Ko-fi's fee alone for PayPal.
- KDP: `packages/calculators/src/kdp.ts` computes Amazon.com eBook royalties
  (70% after delivery costs, or 35%) and print royalties from KDP's printing
  cost tables, refusing page counts and inks the tables do not price.
- Upwork vs Fiverr: a comparison of freelancer fees on one job, with the
  freelancer's Upwork rate as an input.
- The fee calculator's volume field takes per-calculator wording, so
  Kickstarter totals a campaign and Patreon totals members.

### Substack, Payhip, and creator guides (2026-09-16)

On branch `feat/creator-guides-more-platforms`, based on `49a749d`:

- Substack: web subscription payments with Substack's 10%, Stripe's 2.9% +
  $0.30 card fee, and Stripe's 0.7% Billing fee, for a US card or a card from
  outside the US paying in USD. One older Substack page still lists a 0.5%
  Billing fee; Substack's cost page says that rate ended June 30, 2025, and
  Stripe's Billing pricing page lists 0.7%. Substack's $150 annual example
  ($130.35) matches once the Billing fee is added. iOS in-app purchases and
  local-currency prices are not estimated.
- Payhip: one-time sales by US card through Stripe on the Free Forever (5%),
  Plus (2%), and Pro (0%) plans, with the monthly plan price excluded and the
  plan break-even sales computed on the page. Subscriptions, PayPal, and
  Square are not estimated.
- Buy Me a Coffee was researched and not built, because its pages do not say
  how its extra processing fees combine or what amount its 5% is charged on.
- `/fees/patreon-vs-ko-fi-fees/` compares the two platforms on one payment;
  two guides cover KDP royalties and pricing Kickstarter rewards for fees; the
  methodology page explains embedding and citing.
- KDP: a list price outside the range for the chosen royalty option or format
  is now a field error, not a warning beside a royalty KDP would not pay.
- The fee calculator and the comparisons say when fees are at least as large
  as the payment.

### Freelance invoice tools and more comparisons (2026-09-16)

On branch `feat/creator-comparisons-freelance-tools`, based on `0e45b05`:

- Early Payment Discount calculator: `calculateEarlyPaymentDiscount` gives the
  discount (rounded half up), the early payment, the days saved, and the
  simple annualized cost d ÷ (1 − d) × 365 ÷ days, refusing a discount period
  that does not end before the net due date.
- Rate Increase calculator: `raiseRateByPercent` (new rate rounded up) and
  `changeRateTo` give monthly and yearly revenue change, the share of billable
  hours that could be lost for the same revenue (rounded down), and the hours
  needed at the new rate (rounded up).
- `/fees/substack-vs-patreon-fees/` and `/fees/payhip-vs-gumroad-fees/` reuse
  the sourced presets; Payhip joins `/fees/digital-product-platform-fees/`.
- About, Methodology, Privacy, and Terms have descriptive titles.

### Contractor versus employee rates (2026-09-16)

On branch `feat/contractor-rate-more-platforms`, based on the comparisons
branch:

- `packages/calculators/src/payroll.ts` holds one year of published US payroll
  figures with their IRS and SSA sources: the 2026 Social Security wage base of
  $184,500, 6.2% Social Security and 1.45% Medicare for the employee and again
  for the employer, self-employment tax of 15.3% (12.4% and 2.9%) on 92.35% of
  net earnings once that share reaches $400, and the 0.9% Additional Medicare
  Tax above $200,000, $250,000, and $125,000 by filing status.
- `compareContractorWithEmployee` finds the least contractor net earnings whose
  after-tax amount matches a salary's after-tax amount plus the value of
  employer benefits, then adds business expenses for the income to invoice and
  divides by billable hours for an hourly rate.
- Income tax, the deduction for half of the self-employment tax, unemployment
  insurance, and workers' compensation are out of scope, and the page says so.
- Hours fields now accept thousands separators; "1,840" was rejected before,
  which left the new calculator showing no result until a user removed it.

### Podia, Whop, Indiegogo, and crowdfunding comparison (2026-09-16)

On branch `feat/podia-whop-indiegogo`, based on the contractor-rate branch:

- Podia: the Mover plan's 5% transaction fee and the Shaker and Earthquaker
  plans' no-fee case, each with Stripe's published 2.9% + $0.30 US card rate,
  which Podia also quotes as the processor's fee. Plan prices are excluded and
  the page computes the sales level where Shaker beats Mover.
- Whop: its standard 2.7% + $0.30 per successful card transaction and the 1.5%
  it adds for international cards. The optional 0.8%, 0.5%, and 2% add-ons,
  Discover marketplace sales, and payment methods whose rates two Whop pages
  state differently are out of scope.
- Indiegogo: a 5% platform fee plus 3% + $0.20 processing on a project that
  reaches its goal, matching Indiegogo's own $10,000 over 100 transactions
  example ($500, $320, $9,180). A project that misses its goal pays nothing.
- `/fees/kickstarter-vs-indiegogo-fees/` compares both platforms, including
  Kickstarter's under-$10 pledge rate.
- Comparison rows whose scenario does not cover the amount now show a dash and
  name the covered amounts, in both the rendered table and the live script,
  instead of failing the whole table with a wrong message. `describeRange` moved
  to `apps/web/src/scripts/fee-range.ts` and is shared.

Local checks on 2026-09-16 for these platforms (browser work on the preview
build at `:4321`, in Chrome 153 over the DevTools protocol, plus iOS Safari on
the iPhone 17 simulator through Argent):

| Check                                                      | Observed result                                                             |
| ---------------------------------------------------------- | --------------------------------------------------------------------------- |
| `pnpm run lint`                                            | Passed with 0 findings                                                      |
| `pnpm run format:check`                                    | Passed                                                                      |
| `pnpm run check-types`                                     | Passed: 7 of 7 tasks; `astro check` 0 errors                                |
| `pnpm run test`                                            | Passed: 132 calculator tests and 110 web tests                              |
| Guard build (`REQUIRE_SITE_URL=true`, no site)             | Failed as intended                                                          |
| Site build (`PUBLIC_SITE_URL=https://calculators.example`) | Passed; 77 pages; SEO audit 0 problems; 50 sitemap URLs with no embed pages |
| Preview build                                              | Passed; 77 pages                                                            |

Official sources were read again on 2026-09-16 before building: Podia's pricing
page (monthly prices through the in-app browser, since they render client-side)
and its transaction fee, payments, payouts, refunds, and sales tax articles;
Whop's pricing page and its fees and taxes docs; Indiegogo's fees page through
the in-app browser and its help center fee article.

Browser evidence (each value checked against an independent calculation):

- Podia: $100 keeps $91.80 on Mover and $96.80 with no Podia fee; $25 keeps
  $22.72 and $23.97; keeping $50 charges $51.80. The page's crossovers read
  $1,000 a month billed monthly and $840 billed yearly.
- Whop: $100 keeps $97.00, $25 keeps $24.02, and an international card keeps
  $23.64. A $0.20 sale shows the fees-exceed-payment message.
- Indiegogo: $50 pays $4.20 and receives $45.80; 200 contributions of $50 pay
  $840.00 and receive $9,160.00, and the page reproduces Indiegogo's own
  $9,180 example.
- Kickstarter vs Indiegogo: at $100 Kickstarter pays $8.30 and Indiegogo
  $8.20, and the under-$10 row shows a dash with "Kickstarter micropledge
  covers up to $9.99."; at $5 the main Kickstarter row shows a dash and the
  micropledge row wins at $0.58 against $0.60; at $9.99 Indiegogo is cheaper.
  In iOS Safari the table scrolls inside its box and the note reads in full.
- Regression: the Patreon vs Ko-fi comparison and the Kickstarter calculator's
  range message are unchanged, and no console errors appeared.

### Creator platform hub, Skool, and Teachable (2026-09-16)

On branch `feat/creator-platform-hub`, based on the Podia branch:

- `/fees/creator-platform-fees/` prices the same fan payment across Whop,
  Ko-fi, Podia, Skool, Teachable, Patreon, and Substack, and adds a monthly
  table that counts each platform's plan price alongside its per-payment fees,
  so Ko-fi Gold, Podia's paid plans, Skool Pro, and Teachable's plans are
  compared on what a month actually costs.
- Skool: its transaction fee is the whole charge, because Skool processes
  payments itself and a creator cannot connect their own Stripe account. Pro
  charges 2.9% + 30¢ up to $899 and 3.9% + 30¢ from $900 to Skool's $100,000
  limit; Hobby charges 10% + 30¢. Skool's own $999 example paying out $959.74
  is a test fixture. Charges between $899 and $900 sit outside both bands and
  are refused rather than guessed.
- Teachable: one-time sales and subscription payments by US card through
  Teachable Payments on the Standard bundle, with the Starter plan's 7.5% fee,
  no plan fee on Builder and Growth, 2.9% + $0.30 processing, and 0.7% more on
  recurring transactions. International cards are excluded because Teachable's
  pricing page (3.9% + 30¢) and its fee article (4.4% + $0.30) disagree.
- The fees hub's small-sale table shows a dash where a default scenario does
  not cover the amount, which Skool's up-to-$899 band needs.

Local checks on 2026-09-16 (browser work on the preview build at `:4321`, in
Chrome 153 over the DevTools protocol, plus iOS Safari on the iPhone 17
simulator through Argent):

| Check                                                      | Observed result                                                                      |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `pnpm run lint`                                            | Passed with 0 findings                                                               |
| `pnpm run format:check`                                    | Passed                                                                               |
| `pnpm run check-types`                                     | Passed: 7 of 7 tasks; `astro check` 0 errors                                         |
| `pnpm run test`                                            | Passed: 140 calculator tests (including Skool's published example) and 110 web tests |
| Guard build (`REQUIRE_SITE_URL=true`, no site)             | Failed as intended                                                                   |
| Site build (`PUBLIC_SITE_URL=https://calculators.example`) | Passed; 82 pages; SEO audit 0 problems; 53 sitemap URLs with no embed pages          |
| Preview build                                              | Passed; 82 pages                                                                     |

Official sources were read again on 2026-09-16 before building: Skool's pricing
page (monthly and the yearly toggle through the in-app browser) and its
subscriptions FAQ; Teachable's pricing page and its transaction fees and
bundles article; Ko-fi's Gold article, to confirm the $12 monthly price the hub
quotes.

Browser evidence (each value checked against an independent calculation):

- Skool: $49 pays $1.72 on Pro and $5.20 on Hobby; $899 pays $26.37; $999 on
  the upper band pays out $959.74, matching Skool's own example; $1,000 pays
  $39.30. $899.50 is refused by both Pro bands with the covered range named,
  and $100,001 is refused as above Skool's limit. Forty members at $49 on
  Hobby pay $208.00 a month.
- Teachable: a $99 sale pays $10.60 on Starter and $3.17 on a paid plan; the
  same amount as a subscription payment pays $11.29; keeping $100 needs
  $112.82. The page's plan crossovers read $666.67 a month for Teachable and
  $1,267.61 for Skool Pro.
- Creator hub: eleven options price correctly at $100 and $10, and the monthly
  table matches the oracle at 25, 100, and 500 payments, including each plan
  price. Tables scroll inside their boxes at 360 px.
- The fees hub shows a dash for Skool at $1,000, and no console errors
  appeared anywhere. In iOS Safari the Skool calculator renders with its
  scenario note and all three bands.

### Course platform comparison and hub content (2026-09-16)

Same branch, after the Skool and Teachable calculators:

- `/fees/teachable-vs-podia-fees/` compares the two course platforms on one
  sale and across a month, counting each plan's monthly price. The monthly
  table starts low enough to show the crossover: Teachable Starter is cheapest
  at two and four sales of $99 a month, Podia Mover at five, and Teachable's
  paid plan from ten.
- The freelance hub's summary table and its "how the calculators fit together"
  flow now cover the early payment discount, rate increase, and 1099 vs W-2
  calculators, which were missing from both.
- Break-evens on the comparison round up, matching the Teachable page's
  $666.67 rather than showing $666.66.

Checks on 2026-09-16: lint, `format:check`, `check-types` (7 of 7 tasks, 0
errors), and tests (140 calculator, 110 web) all passed; the guard build failed
as intended; the site build produced 83 pages with 0 SEO audit problems and 54
sitemap URLs. In Chrome every figure matched an independent calculation, the
loss message still appears at $0.05, the freelance hub lists all eight
calculators with working links, tables scroll inside their boxes at 360 px, and
no console errors appeared.

Local checks on 2026-09-16 for the 1099 vs W-2 rate calculator (branch
`feat/contractor-rate-more-platforms`; browser work on the preview build at
`:4321`, in Chrome 153 over the DevTools protocol and in iOS Safari on the
iPhone 17 simulator through Argent):

| Check                                                      | Observed result                                                                                                                                                |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm run lint`                                            | Passed with 0 findings                                                                                                                                         |
| `pnpm run format:check`                                    | Passed                                                                                                                                                         |
| `pnpm run check-types`                                     | Passed: 7 of 7 tasks; `astro check` 0 errors                                                                                                                   |
| `pnpm run test`                                            | Passed: 127 calculator tests (11 for payroll: published rates, the wage base, filing-status thresholds, the $400 floor, and matching income) and 110 web tests |
| Guard build (`REQUIRE_SITE_URL=true`, no site)             | Failed as intended                                                                                                                                             |
| Site build (`PUBLIC_SITE_URL=https://calculators.example`) | Passed; 70 pages; SEO audit 0 problems; 46 sitemap URLs with no embed pages                                                                                    |
| Preview build                                              | Passed; 70 pages                                                                                                                                               |

Browser evidence (every figure checked against an independent brute-force
search over the same published rates):

- A $100,000 salary with $12,000 of benefits and $3,000 of expenses needs
  $124,520.26 of contractor income, or $67.68 an hour over 1,840 billable
  hours; the salary leaves $92,350.00 after $7,650.00 of payroll tax, the
  contractor pays $17,170.26 of self-employment tax, and the employer spends
  $119,650.00. Without benefits or expenses an $80,000 salary needs
  $86,036.58, which is 107.55% of the salary.
- Filing status changes only the Additional Medicare Tax: at $300,000 a single
  filer's payroll tax is $16,689.00, married filing jointly $16,239.00, and
  married filing separately $17,364.00, and the page says the threshold
  assumes no other household wages.
- Errors: a zero, empty, or non-numeric salary; zero, 0.01, and 83,334
  billable hours. Each clears the results and disables copy.
- Copy, reset, the sticky bar, no sideways scrolling at 360 px, and no console
  errors. In iOS Safari the filing-status picker opens and selects, and the
  sticky bar keeps the result.
- A bug this pass found: hours fields rejected thousands separators, so the
  calculator's own default of "1,840" billable hours showed an error and no
  result until the comma was removed. Hours now accept separators like every
  other field.

### Payout fees and guides (2026-09-16)

Branch `feat/payouts-and-guides`, stacked on `feat/creator-platform-hub`:

- `/guides/1099-vs-w2-pay/` and `/guides/how-to-raise-your-rates/` hand
  readers to the 1099 vs W-2 and rate increase calculators.
- `/fees/payout-fee-calculator/` prices taking money out of a platform, from
  official pages checked on 2026-09-16:
  - Stripe: standard payouts are free; US Instant Payouts cost 1.5% with a 50¢
    minimum fee, for $0.50 to $9,999. Stripe asks for the amount to receive,
    so the fee is added on top and the result shows what leaves the balance.
  - Gumroad: instant payouts cost 3% for $1 to $10,000. Bank payouts have no
    published fee, and PayPal payouts (2%) are only for countries without bank
    deposits, so neither is estimated for US creators. A Gumroad PayPal payout
    preset added earlier on this branch was removed for that reason.
  - Patreon: $0.25 per direct deposit; PayPal at 1% with a $0.25 minimum, a
    $20 cap, and a $10 minimum payout.
  - Lemon Squeezy: free US bank payouts and $0.50 PayPal payouts, with a $50
    minimum payout.
- Minimum fees and caps are exact bands of linear presets that meet where the
  percentage reaches the limit; a web test checks that each method's bands
  chain and agree at every boundary. A flat fee on a very large payout shows
  "under 0.01%" instead of 0.00%.
- The Stripe, Gumroad, Patreon, and Lemon Squeezy fee pages link to it.

Local checks on 2026-09-16 (preview build at `:4321`; in-app browser, Chrome
153 over the DevTools protocol, and iOS Safari on the iPhone 17 simulator
through Argent):

| Check                                                      | Observed result                                                             |
| ---------------------------------------------------------- | --------------------------------------------------------------------------- |
| `pnpm run lint`                                            | Passed with 0 findings                                                      |
| `pnpm run format:check`                                    | Passed                                                                      |
| `pnpm run check-types`                                     | Passed: 7 of 7 tasks; `astro check` 0 errors                                |
| `pnpm run test`                                            | Passed: 151 calculator tests and 116 web tests                              |
| Guard build (`REQUIRE_SITE_URL=true`, no site)             | Failed as intended                                                          |
| Site build (`PUBLIC_SITE_URL=https://calculators.example`) | Passed; 87 pages; SEO audit 0 problems; 57 sitemap URLs with no embed pages |
| Preview build                                              | Passed                                                                      |

Browser evidence:

- 203 amount and method combinations matched an independent calculation of
  the fee, what reaches you, what leaves the balance, the fee share, and the
  monthly and yearly totals, including both sides of every band boundary
  ($24.49/$24.50/$25, $1,999.49/$1,999.50/$2,000, $33.33/$33.34/$33.67) and
  every minimum and maximum.
- Errors: empty, zero, negative, non-numeric, three decimals, `1e3`, amounts
  outside a method's range (the message names the range), and payouts a month
  of 0, 1.5, 1,001, and text. Each clears the results and disables copy;
  typing defers errors until the field is committed.
- Keyboard: arrow keys move through all seven methods and wrap, the amount
  label switches to "Amount to receive" for Stripe Instant Payouts, and Enter
  updates or focuses the problem field. Copy (with a real clipboard
  permission), a refused clipboard, reset, print styles, the sticky bar, no
  sideways scrolling at 360 px, and no console errors.
- The embed is 1,934 px tall at 360 px wide and 2,082 px with an error
  showing, so its suggested height is 2,100 px; it calculates inside a
  cross-origin iframe.
- iOS Safari: method taps, the decimal keypad, the sticky bar, a $33.33
  Stripe Instant Payout ($0.50 fee, $33.83 from the balance), and the
  $10,000 range error.

### Infrastructure and deployment

Alchemy remains the infrastructure owner for the existing Cloudflare Workers,
D1, KV, and Images resources. No Cloudflare resource was changed for this work.
No staging or production deployment is ready or certified. Existing server,
API, Better Auth, and database source is retained; there is no React, database,
or auth migration.

## Verification record

Local checks on 2026-09-14 after the Effect Schema / anti-slop cleanup:

| Check                                          | Observed result                                                                                                                                                                                                                  |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm install --frozen-lockfile`               | Passed; `@MathMyRate/calculators` depends on `effect@4.0.0-rc.112` from the workspace catalog                                                                                                                                    |
| `pnpm run lint`                                | Passed with 0 findings (Oxlint + anti-slop). Previous 229 findings were fixed, not suppressed.                                                                                                                                   |
| `pnpm check-types`                             | Passed: turbo check-types, including web `astro check` 0 errors, 0 warnings, 0 hints                                                                                                                                             |
| `pnpm run test` / Vitest calculator unit tests | 35 passed in `packages/calculators`                                                                                                                                                                                              |
| `pnpm build:web`                               | Passed; four static HTML pages emitted (`PUBLIC_SERVER_URL=https://api.example.invalid`)                                                                                                                                         |
| `pnpm run format:check`                        | Passed                                                                                                                                                                                                                           |
| `git diff --check`                             | Passed                                                                                                                                                                                                                           |
| Hosted GitHub Actions                          | Removed; verification is local only                                                                                                                                                                                              |
| Browser end-to-end                             | Exercised on Astro preview `:4321`: hourly defaults `$103.63`, live update, invalid/reset, transfer into project `$103.63`/`$2,801.84`, zero-time error, reset to `$3,026.25`; `/` and `/freelance/` loaded. Playwright removed. |

The build uses a compile-only invalid API origin, not a working deployed API.
The independently derived rate fixtures are `$60,000 / .75 + $12,000 =
$92,000`, yielding `$79.87` hourly, `$638.96` day, and `1,152` capacity hours;
project pricing is `$83.34 × 10 + 10% labor + $50 = $966.74`. Confirm those in
the app browser when changing UI.

Local checks on 2026-09-15 for the Stripe fee calculator:

| Check                                                              | Observed result                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm run lint`                                                    | Passed with 0 findings (Oxlint + anti-slop)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `pnpm run format:check`                                            | Passed                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `pnpm run check-types`                                             | Passed: turbo check-types, including web `astro check` 0 errors, 0 warnings, 0 hints                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `pnpm run test` / Vitest calculator unit tests                     | 35 passed in `packages/calculators`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `pnpm build:web` (`PUBLIC_SERVER_URL=https://api.example.invalid`) | Passed; six static HTML pages emitted, including `/fees/index.html` and `/fees/stripe-fee-calculator/index.html`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| Browser end-to-end                                                 | Exercised on Astro preview `:4321` via a Chromium (CDP) browser with an isolated profile: prerendered `$100.00` example shows `$3.20` fee / `$96.80` kept; typing `$250` live-updates to `$7.55` / `$242.45`; tax `8.00` shows the tax row and `$234.45` kept; keep-target mode returns `$266.01` for `$250` + `$8` tax and `$257.78` without tax (one cent less verified insufficient); zero amount and tax-greater-than-amount produce the field/summary errors and clear results; reset restores the example; copy reports success; `/fees/` hub, home grid, header, and project-page link navigate correctly. |

Independent hand-derivations used in the browser check: `$250 × .029 + $0.30 =
$7.55`; to keep `$250.00` the least gross is `$257.78` (fee `$7.78`), and
`$257.77` leaves `$249.99`; with `$8.00` tax the least gross is `$266.01` (fee
`$8.01`), and `$266.00` leaves `$249.99`.

Local checks on 2026-09-15 for the PayPal fee calculator:

| Check                                                              | Observed result                                                                                                                                                                                                                                                                                                                                                                                                     |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm run lint`                                                    | Passed with 0 findings (Oxlint + anti-slop)                                                                                                                                                                                                                                                                                                                                                                         |
| `pnpm run format:check`                                            | Passed                                                                                                                                                                                                                                                                                                                                                                                                              |
| `pnpm run check-types`                                             | Passed: turbo check-types, including web `astro check` 0 errors, 0 warnings, 0 hints                                                                                                                                                                                                                                                                                                                                |
| `pnpm run test` / Vitest calculator unit tests                     | 35 passed in `packages/calculators`                                                                                                                                                                                                                                                                                                                                                                                 |
| `pnpm build:web` (`PUBLIC_SERVER_URL=https://api.example.invalid`) | Passed; seven static HTML pages emitted, including `/fees/paypal-fee-calculator/index.html`                                                                                                                                                                                                                                                                                                                         |
| Browser end-to-end                                                 | Exercised on Astro preview `:4321` via a Chromium (CDP) browser with an isolated profile: prerendered `$100.00` example shows `$3.98` fee / `$96.02` kept; typing `$250` live-updates to `$9.22` / `$240.78`; keep-target mode returns `$259.55` for a `$250.00` target (one cent less verified insufficient); reset restores the example; copy reports success; the hub's PayPal card navigates to the calculator. |

Independent hand-derivations used in the browser check: `$250 × .0349 = $8.725
→ $8.73 half-up, + $0.49 = $9.22`; to keep `$250.00` the least gross is
`$259.55` (fee `$9.55`), and `$259.54` leaves `$249.99`.

Local checks on 2026-09-15 for the Gumroad fee calculator:

| Check                                                              | Observed result                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm run lint`                                                    | Passed with 0 findings (Oxlint + anti-slop)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `pnpm run format:check`                                            | Passed                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `pnpm run check-types`                                             | Passed: turbo check-types, including web `astro check` 0 errors, 0 warnings, 0 hints                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `pnpm run test` / Vitest calculator unit tests                     | 35 passed in `packages/calculators`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `pnpm build:web` (`PUBLIC_SERVER_URL=https://api.example.invalid`) | Passed; eight static HTML pages emitted, including `/fees/gumroad-fee-calculator/index.html`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Browser end-to-end                                                 | Exercised on Astro preview `:4321` via a Chromium (CDP) browser with an isolated profile: prerendered `$100.00` direct example shows a `$13.70` fee (`$10.50` + `$3.20` line items) and `$86.30` kept; typing `$250` live-updates to `$33.05` / `$216.95`; scenario switching re-computes the same input (post-threshold `$20.55` / `$229.45`; Discover `$75.00` / `$175.00`) and updates the supported-scenario note; keep-target mode returns `$287.94` for a `$250.00` target and `$115.73` for `$100.00` (Discover: `$357.14`); zero, empty, and malformed (`12.345`) amounts produce the field/summary errors and clear results; reset restores the example; copy reports success; the hub's Gumroad card navigates to the calculator; a 390px viewport stacks the radio groups single-column with no overflow. |

Independent hand-derivations used in the browser check: direct pre-threshold
`$250` pays 10% + $0.50 (`$25.50`) plus 2.9% + $0.30 (`$7.55`) = `$33.05`; to
keep `$250.00` the least gross is `$287.94`(fee`$37.94`), and `$287.93`leaves`$249.99`; to keep `$100.00`the least gross is`$115.73` (fee
`$15.73`), and `$115.72` leaves `$99.99`; post-threshold `$250` pays 5% +
$0.50 plus 2.9% + $0.30 = `$20.55`; Discover `$250` pays a flat 30% =
`$75.00`, and keeping `$250.00` needs `$357.14`(fee`$107.14`).

Local checks on 2026-09-15 for the Lemon Squeezy fee calculator:

| Check                                                              | Observed result                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm run lint`                                                    | Passed with 0 findings (Oxlint + anti-slop)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `pnpm run format:check`                                            | Passed                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `pnpm run check-types`                                             | Passed: turbo check-types, including web `astro check` 0 errors, 0 warnings, 0 hints                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `pnpm run test` / Vitest calculator unit tests                     | 35 passed in `packages/calculators`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `pnpm build:web` (`PUBLIC_SERVER_URL=https://api.example.invalid`) | Passed; nine static HTML pages emitted, including `/fees/lemon-squeezy-fee-calculator/index.html`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| Browser end-to-end                                                 | Exercised on Astro preview `:4321` via a Chromium (CDP) browser with an isolated profile: prerendered `$100.00` example shows a `$5.50` fee and `$94.50` kept; typing `$250` live-updates to `$13.00` / `$237.00`; keep-target mode returns `$263.68` for a `$250.00` target and `$105.79` for `$100.00` (one cent less verified insufficient); zero, empty, and malformed (`12.345`) amounts produce the field/summary errors and clear results; reset restores the example; copy reports success; the hub's Lemon Squeezy card navigates to the calculator; a 390px viewport stacks the controls single-column with no overflow. |

Independent hand-derivations used in the browser check: `$250 × .05 = $12.50 +
$0.50 = $13.00`; to keep `$250.00` the least gross is `$263.68` (fee `$13.68`),
and `$263.67` leaves `$249.99`; to keep `$100.00` the least gross is `$105.79`
(fee `$5.79`), and `$105.78` leaves `$99.99`.

Code review confirmed the exact-money arithmetic and reverse-search bounds, but
identified an official-rule provenance gap and incomplete structured metadata.
Both were fixed before delivery: the official registry is deeply frozen and
resolved canonically, altered official-looking records are rejected, custom
rules carry explicit provenance/warnings, and rule revisions are independent
of review dates.

Local checks on 2026-09-15 for the content pages, footer, and SEO plumbing
(methodology, about, privacy, terms, 404, canonical/noindex, robots.txt,
sitemap):

| Check                                          | Observed result                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm run lint`                                | Passed with 0 findings (Oxlint + anti-slop)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `pnpm run format:check`                        | Passed                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `pnpm run check-types`                         | Passed: turbo check-types 7/7, including web `astro check` 0 errors, 0 warnings, 0 hints                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `pnpm run test` / Vitest calculator unit tests | 35 passed in `packages/calculators`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `pnpm run build:web`                           | Passed; fourteen static pages emitted, including `/methodology/`, `/about/`, `/privacy/`, `/terms/`, and `404.html`. Without a configured site, every page carries `noindex, nofollow`, `robots.txt` disallows crawling, and no `sitemap.xml` is emitted; a `--site` build emits canonical links, `robots.txt` with the sitemap line, and a sitemap of the public routes.                                                                                                                                                                                                                                                                                                                                                          |
| Browser end-to-end                             | Exercised on Astro preview `:4321` via a Chromium (CDP) browser: footer (brand, tagline, four site links) renders on every page; footer navigation opened Methodology, About, Privacy, and Terms, each rendering all sections; an unknown URL serves the 404 page (HTTP 404) whose recovery cards navigate home; Tab focuses the visible skip link and Tab+Enter activates header/hero links; the hourly calculator still renders live engine results. The same pages were re-checked on an iPhone 16 simulator (390pt Safari against the same preview): every new page renders single-column with no horizontal overflow, the 404 cards stack full-width, the footer stacks with its link row intact, and a footer tap navigates. |

Local checks on 2026-09-15 for the full six-calculator edge-case sweep
(branch `main`, commit `57463dd`, no PR; run against Astro preview `:4321`,
driven through Argent):

| Check                                                                | Observed result                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Browser end-to-end, fee pages (Argent, Chromium CDP, 390×844 window) | All four fee pages were driven end to end in a 390px-wide headless Chromium window, so every check also ran at phone width. Stripe: default `$96.80` kept / `$3.20` fee; empty, zero, and malformed (`12.345`) inputs show the exact error copy, clear results to `—`, and disable copy; `$100` + `$8` tax keeps `$88.80` with a `$3.20` fee, `$96.80` net, and an `$8.00` tax row; tax above the amount errors and recovers; keep-target returns `$111.53` (fee `$3.53`, keep `$100.00`) with tax, and `$257.78` / `$266.01` for a `$250` target without/with tax; a `$1,000,000,000` target returns charge `$1,029,866,117.71` instead of an error — the engine cap (`$1tn`, `money.ts`) sits above the input cap (`$1bn`), so no valid UI input reaches the unreachable-target branch (verified correct, not a bug). PayPal: default `$96.02`/`$3.98`; same error trio; `$100` + `$8` tax keeps `$88.02` with an `$8.00` tax row; keep-target `$267.84` for `$250` + tax and `$259.55` without. Gumroad: default direct `$86.30` kept with `$10.50` + `$3.20` line items; same error trio; scenario switching updates the supported-scenario note and recomputes (Discover keep-`$100` charges `$142.86`, high-volume keep-`$100` charges `$109.44`); reset restores direct/received/`$86.30`. Lemon Squeezy: default `$94.50` kept / `$5.50` fee with one line item; same error trio; keep-target `$105.79` for `$100` and `$263.68` for `$250`; the four refused-scenario gaps render in prose; typing `75` + Enter submits and shows fee `$4.25` / keep `$70.75`. Every page's reset restores its example and copy reports `Result copied.` No `NaN`, `Infinity`, or broken labels appeared. |
| Browser end-to-end, freelance pages (prior pass)                     | Hourly and project pages passed the same edge-case sweep earlier: error copy, live updates, reset, copy, and hourly-to-project transfer with hand-verified math.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| iPhone 16 simulator (390pt Safari, same preview)                     | Gumroad renders single-column with no horizontal overflow, and tapping the Discover radio updates the note and result live (`$70.00` on the default `$100`); PayPal renders with the `$96.02` result and its tax field; Lemon Squeezy renders single-column with the `$94.50`/`$5.50` default result. Every visible number matched the engine exactly.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Outcome                                                              | Zero product bugs found across the six calculators; no code changes were required, so no new commit accompanied this sweep (this record is documentation only).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |

Local checks on 2026-09-15 for the Open Graph images and social card metadata
(working tree on `main`, no PR yet; run against Astro dev `:4399` and the
built `dist/`, driven through Argent):

| Check                                          | Observed result                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `pnpm run lint`                                | Passed with 0 findings (Oxlint + anti-slop) after `lint:fix` + `format` on the new files                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `pnpm run format:check`                        | Passed                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `pnpm run check-types`                         | Passed: turbo check-types 7/7, including web `astro check` 0 errors, 0 warnings, 0 hints                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `pnpm run test` / Vitest calculator unit tests | 35 passed in `packages/calculators`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `pnpm --filter web og:images`                  | Passed; nine 1200×630 PNGs generated into `apps/web/public/og/` (default, home, hourly-rate, project-rate, fees, stripe, paypal, gumroad, lemon-squeezy). Each PNG was pixel-decoded and checked for paper background, title text, wordmark, and the correct accent color (moss for freelance, clay for fees).                                                                                                                                                                                                           |
| `pnpm run build:web`                           | Passed; fourteen static pages emitted with `og:site_name/title/description/type` on every page. Without a configured site, `og:url`/`og:image`/`twitter:*` stay gated exactly like the canonical link; a temporary `--site` verification build emitted absolute per-page `og:image` URLs (`/og/home.png`, `/og/stripe.png`, `/og/default.png`, …), after which the config was reverted and rebuilt.                                                                                                                      |
| Browser end-to-end                             | Exercised on Astro dev `:4399` via a headless Chromium (CDP) browser with an isolated profile: home, hourly, project, PayPal, and the 404 render with no error overlay; all nine `/og/*.png` URLs return `200 image/png`; the hourly calculator recalculated `$85,000 → $103.63` to `$100,000 → $120.81` (hand-derived revenue `$144,486.31` matched); the hourly-to-project transfer prefilled `$120.81`; the PayPal page kept its `$100 → $3.98 / $96.02` engine result; the 404 page still serves its recovery cards. |

Local checks on 2026-09-15 for the home tool grid, compact page heroes, and
form-submit hardening (working tree on `main`, commit `2081c79`, no PR yet;
browser work run against Astro dev `:4399` after a dev-server restart and
against Astro preview `:4321`, driven through Argent):

| Check                                                              | Observed result                                                                                                                           |
| ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm run lint`                                                    | Passed with 0 findings (Oxlint + anti-slop); the new home script needed `lint:fix` + `format` for readable-spacing findings, re-run clean |
| `pnpm run format:check`                                            | Passed                                                                                                                                    |
| `pnpm run check-types`                                             | Passed: turbo check-types, including web `astro check` 0 errors, 0 warnings, 0 hints                                                      |
| `pnpm run test` / Vitest calculator unit tests                     | 35 passed in `packages/calculators`                                                                                                       |
| `pnpm build:web` (`PUBLIC_SERVER_URL=https://api.example.invalid`) | Passed; fourteen static pages emitted, including the rebuilt home page and regenerated `/og/home.png`                                     |
| Browser end-to-end                                                 | See below                                                                                                                                 |

Browser evidence: the home page lists all six calculators as cards with a
labeled search filter (live count, empty state with a clear-search button that
restores the grid and refocuses the field; matching tried case-insensitively
against names and keywords; 375px viewport stays single-column). Page heroes
were compacted on the home and all six calculator pages (small h1, no
description paragraph); measured heights and search width confirmed in the
browser. Submit hardening: every calculator now submits only through a plain
`type="button"` update button with a click handler, with `onsubmit="return
false"` as a guard, so a dead script can never trigger a native form
submission; explicit submits focus and scroll to the first invalid field
(`focusProblemField`), and the verified error flow shows the summary alert,
field error, cleared results, disabled copy/transfer, and `aria-invalid`.

Root-cause note for the reported "submit reloads the page": on a long-running
dev server the page scripts silently failed to execute because Vite served a
stale optimized dependency (`node_modules/.vite/deps/effect.js`) with HTTP 504
after a dependency swap, so no event handlers attached and the browser fell
back to the native form GET. The fix was `astro dev stop`, deleting
`apps/web/node_modules/.vite`, and restarting the dev server; the hardened
buttons and inline guard above now prevent the symptom even when a script
fails to load. No rebuild was needed for production output, which never
serves the dev dependency cache.

Required-field markers (added 2026-09-15, same working tree): every required
input now carries a clay-red `*` beside its label plus `aria-required="true"`
on the input (the star is `aria-hidden`, so screen readers announce required
from the attribute); the optional sales-tax fields stay unmarked and keep
their "(optional)" labels. Coverage: all seven hourly fields, all five project
fields, and the amount field on all four fee pages. Verified on Astro dev
`:4399` through Argent: served markup counts match (7/5/1/1/1/1), computed
star color is `rgb(200, 108, 78)`, the star survives the fee pages' mode
switch (the script rewrites the label text but not the marker), the keep-target
recalculation still returns `$103.30` / `$3.30` / `$100.00` for a `$100`
target, and the cleared-field error flow (summary alert, field error, focus on
the amount input, cleared results, disabled copy) still works, with reset
restoring `$96.80`.

Local checks on 2026-09-15 for the logo, icon set, and web manifest (working
tree on `main`, commit `2081c79`, no PR yet; browser work against Astro dev
`:4399`, driven through Argent):

| Check                                      | Observed result                                                                                                                                                                                     |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm --filter web icons:generate`         | Passed; pixel checks confirmed moss tile, paper slash, and clay dots on the rounded, square, and maskable renders before any file was written                                                       |
| `pnpm run lint`                            | Passed with 0 findings (Oxlint + anti-slop); the new generator script needed `lint:fix` + `format` for readable-spacing findings, re-run clean                                                      |
| `pnpm run format:check`                    | Passed                                                                                                                                                                                              |
| `pnpm run check-types`                     | Passed: turbo check-types, including web `astro check` 0 errors, 0 warnings, 0 hints                                                                                                                |
| `pnpm build:web` (`PUBLIC_SERVER_URL=…`)   | Passed; fourteen static pages with the new head links on every page                                                                                                                                 |
| Served assets on dev `:4399` (HTTP + type) | All 200: `favicon.svg` `image/svg+xml`, `favicon.ico` `image/x-icon`, `apple-touch-icon.png`/`icon-*.png` `image/png`, `manifest.webmanifest` `application/manifest+json`                           |
| Browser end-to-end                         | Home page in Chromium (CDP): header mark loads beside the wordmark (natural width 150), `theme-color` `#426455`, SVG favicon link resolves, and the manifest fetches and parses with 4 icon entries |

Local checks on 2026-09-15 for the navy/gold theme swap (working tree on
`main`, commit `2081c79`, no PR yet; browser work against Astro dev `:4399`,
driven through Argent):

| Check                                            | Observed result                                                                                                                                                                                                                                                                                                                                                                                       |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Old-palette sweep                                | `grep` for every old hex (`#23302a`, `#f5f1e7`, `#426455`, `#c86c4e`, `#e7eee6`, `#d6d7cc`, `#567465`, `#faf8f1`, `#934332`, `#fff7eb`, and the pale-green panel tints) across `src/` and `scripts/` returns 0 matches                                                                                                                                                                                |
| `pnpm --filter web icons:generate` + `og:images` | Passed; pixel checks confirmed the navy tile, paper slash, and gold dots; all nine OG cards regenerated with the new palette                                                                                                                                                                                                                                                                          |
| `pnpm run lint` / `format:check`                 | Passed with 0 findings / passed                                                                                                                                                                                                                                                                                                                                                                       |
| `pnpm run check-types`                           | Passed after repairing six calculator pages whose star spans a bulk replace had corrupted (`*/span>` missing a `<`); `astro check` 0 errors                                                                                                                                                                                                                                                           |
| `pnpm build:web` (`PUBLIC_SERVER_URL=…`)         | Passed; fourteen static pages                                                                                                                                                                                                                                                                                                                                                                         |
| Browser end-to-end (Chromium CDP on dev `:4399`) | Home: body `rgb(244,245,247)`, text `rgb(19,31,51)`, wordmark dot `rgb(185,141,47)` gold, card buttons navy, header mark loaded, 6-card search grid intact. Hourly: navy panel `rgb(31,58,95)`, pale-navy eyebrow, red star `rgb(164,70,49)`, live recalc `60000 → $75.00` and restore to `$103.63`. Stripe: navy panel, pale-navy aside text, red star, `$250 → $7.55 / $242.45`, reset to `$96.80`. |

Local checks on 2026-09-15 for the launch-blocker UX and SEO pass
(branch `feat/launch-blockers-ux-seo`, based on `b06b53b`, not yet committed, no PR; browser work on the existing `astro preview`
server at `:4321`, which serves the fresh production build, and on the `astro dev` server at `:4399` after a restart, using the in-app Chromium browser at 1024×768, 375×812, and 320×700):

| Check                                                      | Observed result                                                                                                                                                                                                                      |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `pnpm run lint`                                            | Passed with 0 findings                                                                                                                                                                                                               |
| `pnpm run format:check`                                    | Passed                                                                                                                                                                                                                               |
| `pnpm run check-types`                                     | Passed: `astro check` 0 errors, 0 warnings, 0 hints. The six earlier hints came from inline `onsubmit` and Print `onclick` attributes, which now live in bundled scripts.                                                            |
| `pnpm run test`                                            | Passed: 35 calculator tests and 59 new web tests (parsing, registry, fee labels, structured data)                                                                                                                                    |
| Preview build (`PUBLIC_SERVER_URL=…`)                      | Passed; 14 pages, all noindex, `Disallow: /`, no sitemap, no canonical, JSON-LD, or `og:url`                                                                                                                                         |
| Guard build (`REQUIRE_SITE_URL=true`, no site)             | Failed as intended with the "has no site" error                                                                                                                                                                                      |
| Site build (`PUBLIC_SITE_URL=https://calculators.example`) | Passed; one H1 and no skipped heading level per page, titles at most 60 characters, canonical on every indexable page, absolute JSON-LD URLs, 5 in-content tool links per calculator, 13 sitemap URLs all with `lastmod`, `Allow: /` |

Browser evidence on the production preview:

- Stripe, desktop: `$1,250.50` gives a $36.56 fee and $1,213.94 kept, then
  tidies to `1,250.50`. Keeping $1,250.50 charges $1,288.16, or $1,339.65
  with $50 tax; all three were checked by hand. Tax above the amount dims the
  result while typing and shows the error after leaving the field. An invalid
  amount followed by Update moves focus to the amount field, and Reset or the
  mode radio still work straight after invalid typing.
- Lemon Squeezy, desktop: $250 gives a $13.00 fee, and keeping $250 charges
  $263.68 (hand-checked). Reset returns $94.50.
- Hourly, 375 px: the sticky bar is hidden at the top, appears once the form
  is scrolled into view, and "Details" scrolls to the panel. `$120,000` gives
  $143.72 and tidies to `120,000.00`. A lone "." dims the result and disables
  copy and transfer; leaving shows "Enter an amount.". Transfer fills the
  project calculator with `103.63` and $2,801.84 and clears local storage.
- Project, 375 px: 0.33 hours dims while typing and shows the whole-minute
  error after leaving; 18.5 hours gives $3,090.94 for 22.5 hours.
- Gumroad, 320 px: Discover $30.00; after the threshold $5.50 plus $3.20;
  keeping $100 charges $109.44. No label and value collision or horizontal
  overflow there, on PayPal ($3.98), home, or hourly. The menu panel fits
  between 20 and 300 px.
- `/?q=stripe` shows one card. An unknown URL returns HTTP 404 with noindex.
- Regression found and fixed in the pass: the first version showed a deferred
  error on mouse press, which moved the button and lost the click on desktop.
- Not verified: menu activation by Enter or Space, and Enter submitting a form (the in-app browser's key presses and typed newlines do not activate even a native button; both rely on native browser behavior), a successful clipboard copy
  (permission was denied and the fallback message appeared), print preview,
  and iOS Safari's on-screen keyboard with the sticky bar.
- Dev server `:4399`, restarted: no failed resources or console errors on
  any page. Stripe desktop repeated $36.56, $1,288.16, and $1,339.65, the tax
  and invalid-amount flows, reset, and the Print listener. Hourly at 375 px
  repeated `$120,000` to $143.72, the lone-point dimming and error, and the
  transfer to $2,801.84. PayPal $3.98, Gumroad $13.70, and Lemon Squeezy $5.50
  computed on load. Every route returned 200 with a 137 to 150 character
  description, the unknown URL returned 404, and no page has an inline handler.

Local checks on 2026-09-15 for content, trust pages, and new fee scenarios
(branch `feat/content-trust-growth`, based on `b645576`; browser work on the production preview at `:4321`
and the restarted dev server at `:4399`, in-app Chromium at 1024×768 and
375×812):

| Check                                                      | Observed result                                                                                                                                                                                                                                                                                      |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm run lint`                                            | Passed with 0 findings                                                                                                                                                                                                                                                                               |
| `pnpm run format:check`                                    | Passed                                                                                                                                                                                                                                                                                               |
| `pnpm run check-types`                                     | Passed: `astro check` 0 errors, 0 warnings, 0 hints                                                                                                                                                                                                                                                  |
| `pnpm run test`                                            | Passed: 46 calculator tests, including Lemon Squeezy's two published worked examples and PayPal's international fee, and 76 web tests                                                                                                                                                                |
| Guard build (`REQUIRE_SITE_URL=true`, no site)             | Failed as intended                                                                                                                                                                                                                                                                                   |
| Site build (`PUBLIC_SITE_URL=https://calculators.example`) | Passed; 17 pages. Audit: one H1 and no skipped heading level per page, titles at most 60 characters, descriptions 135 to 160 characters, canonical links, `WebApplication` and `BreadcrumbList` on all eight calculator and comparison pages, no FAQPage markup, no inline handlers, 16 sitemap URLs |
| Preview build                                              | Passed; every page noindex, `Disallow: /`, no sitemap                                                                                                                                                                                                                                                |

Guide length on the eight calculator and comparison pages: 922 to 2,043 words.

Browser evidence:

- Stripe, desktop: domestic $3.20, international $4.70 with line items $3.20
  and $1.50, manually entered $3.70. At 250 sales a month: $800.00 in fees,
  $24,200.00 kept, $9,600.00 a year, 3.20%. International with $10 tax keeps
  $85.30, or $21,325.00 a month. Keeping $100 with that tax charges $115.38,
  and one cent less keeps $99.99 (hand-checked). Invalid and zero sales counts
  dim the result while typing, then show errors; Update moves focus to the
  field; Reset restores every field.
- Gumroad, desktop: no tax field. Discover $30.00, after the threshold $8.70,
  keeping $100 charges $109.44, and 1,000 sales a month is $9,440.00 in fees,
  8.63% of sales.
- Lemon Squeezy, 375 px: the fee page's worked example reproduced live. An
  international card order of $24.00 with $4.00 tax pays $2.06 ($1.70 plus
  $0.36) and keeps $17.94.
- PayPal, 375 px: six scenarios stack in one column, the page does not scroll
  sideways, and tables scroll inside their own box.
- Comparisons: Stripe vs PayPal prices $100 at $3.20, $3.48, $3.98, $4.70, and
  $5.48. Gumroad vs Lemon Squeezy marks Gumroad Discover lowest at $1 ($0.30)
  and Lemon Squeezy lowest at $1,250 ($63.00); $0 dims while typing and then
  shows "Enter an amount above zero."
- Every route returned 200 with its FAQs, tables, and GitHub issue links; an
  unknown URL returned 404.
- Found and fixed in the pass: whole-number range errors printed 1000000
  without digit grouping.
- The dev server again returned 504 for its prebundled `effect.js` after the
  new fee scripts triggered a dependency re-optimization; restarting it
  cleared the error. Builds are unaffected.
- Not verified: menu and form activation by Enter or Space (a limitation of
  the in-app browser), a successful clipboard copy, print preview, and iOS
  Safari's on-screen keyboard.

Local checks on 2026-09-15 for growth calculators, guides, and embeds
(branch `feat/growth-calculators-guides`, based on `9143e2d`; browser work on
the dev server at `:4399`, in-app Chromium at desktop width and 375×812):

| Check                                                      | Observed result                                                                                                                                                                                                                                                                                                               |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm run lint`                                            | Passed with 0 findings                                                                                                                                                                                                                                                                                                        |
| `pnpm run format:check`                                    | Passed                                                                                                                                                                                                                                                                                                                        |
| `pnpm run check-types`                                     | Passed: 7 of 7 tasks; `astro check` 0 errors, 0 warnings, 0 hints                                                                                                                                                                                                                                                             |
| Vitest                                                     | Passed: 71 calculator tests (Square and Etsy fixtures, tax-excluded fee bases and their gross-up, markup, margin, pay, and retainer) and 100 web tests                                                                                                                                                                        |
| Guard build (`REQUIRE_SITE_URL=true`, no site)             | Failed as intended                                                                                                                                                                                                                                                                                                            |
| Site build (`PUBLIC_SITE_URL=https://calculators.example`) | Passed; 32 pages. Audit: one H1 and no skipped heading level per page, no inline handlers, canonical links and existing OG images on every indexable page, `WebApplication` on all 13 calculator and comparison pages, `Article` on the three guides, 25 sitemap URLs with no embed pages, and noindex on the six embed pages |
| Preview build                                              | Passed; every page noindex, `Disallow: /`, no sitemap, no canonical links, no JSON-LD, and no embed snippet                                                                                                                                                                                                                   |

Titles on calculator, hub, and guide pages are 47 to 63 characters, and every
indexable page has a 120 to 160 character description. The About, Methodology,
Privacy, and Terms titles stay short. Page text: Square 2,786 words, Etsy
2,034, the three new freelance calculators 1,032 to 1,084, and the guides 499
to 643.

Browser evidence (each value hand-checked):

- Square: $100 on Square Free in person pays $2.75 and keeps $97.25. Afterpay
  on $108.00 with $8.00 tax pays $6.78 and keeps $93.22. An international card
  on the same payment pays $4.58 ($2.96 plus $1.62). Keeping $100 with an
  international card charges $104.44, and one cent less keeps $99.99. At 250
  sales a month the fees are $1,110.00, or $13,320.00 a year, 4.25% of sales.
- Etsy: a $100 order pays $9.95 ($6.50, $3.25, and $0.20). A $54.00 order
  with $4.00 tax pays $5.32 ($3.25, $1.87, and $0.20) and keeps $44.68, or
  $5.12 and $44.88 without the listing fee. Keeping $50 charges $55.74, and
  $55.73 keeps $49.99.
- Markup and margin: $40 at a 50% markup is $60.00 (33.33% margin), and at a
  50% margin $80.00 (100.00% markup). A 100% margin shows "Enter a value no
  higher than 99.99%." A $30 price on a $40 cost shows -$10.00, -25.00%, and
  -33.33% with a below-cost note. A zero cost shows the markup as Not defined.
  A 1,000.5% markup on $12.34 is $135.81. With real key presses at 375 px,
  typing `$1,250` updated the price to $1,875.00, Tab tidied the field to
  1,250.00, and typing `abc` dimmed the result, then showed the error on
  leaving the field.
- Salary to hourly: $52,000 a year is $25.00 an hour, $2,166.67 twice a
  month, and $4,333.33 a month. $25 an hour over 37.5 hours and 48 weeks is
  $45,000.00. 37.33 hours gives 1,791.84 hours and $44,796.00. 40 hours over
  one day and 53 weeks show errors, and Reset restores the yearly period.
- Retainer: the example is $1,800.00 a month, $90.00 per included hour,
  $120.00 per hour used, and $5,400.00 in total. With no hours used, the used
  rate shows a dash. 25 used hours give $72.00 and an overage note. 800 hours,
  0 months, and 0.33 hours show errors. $112.50 for 7.5 hours at 15% off is
  $717.19, $95.63 per included hour, and $8,606.28 over 12 months.
- The payment fees guide shows the naive $103.20 charge keeping $99.91, the
  correct $103.30, and $119.04 to keep $100 through Etsy with $8.00 tax.
- The freelance hub examples are $3,570.00, $855.00, $750.00, and $187,200.00.
  The fees hub lists all eight fee tools and both tables.
- The Square embed page is noindex, with no header, footer, or pinned bar. Its
  credit link opens the full page in a new tab, and $50 computes $1.45.
- At 375 px, the markup, Square, and guide pages do not scroll sideways, and
  wide tables scroll inside their own box. A real click opens the menu, which
  lists all 13 tools and ends 102 px above the bottom of the screen; Escape
  closes it. A real scroll past the title shows the pinned result bar.
- No console errors on any page visited.
- Not verified: Enter and Space activation (a limitation of the in-app
  browser), a successful clipboard copy, print preview, iOS Safari's on-screen
  keyboard, and the embed snippet inside an iframe on another site.

Local checks on 2026-09-15 for marketplace fees, embeds, and guides (branch
`feat/marketplace-fees-embeds`, based on `df44ae1`; browser work on the dev
server at `:4399` and the preview build at `:4321`):

| Check                                                      | Observed result                                                                                                                                                                                                                                                                                      |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm run lint`                                            | Passed with 0 findings                                                                                                                                                                                                                                                                               |
| `pnpm run format:check`                                    | Passed                                                                                                                                                                                                                                                                                               |
| `pnpm run check-types`                                     | Passed: 7 of 7 tasks; `astro check` 0 errors, 0 warnings, 0 hints                                                                                                                                                                                                                                    |
| Vitest                                                     | Passed: 83 calculator tests (eBay fixtures and its two published worked examples, range refusals, service fees and their inverse) and 104 web tests                                                                                                                                                  |
| Guard build (`REQUIRE_SITE_URL=true`, no site)             | Failed as intended                                                                                                                                                                                                                                                                                   |
| Site build (`PUBLIC_SITE_URL=https://calculators.example`) | Passed; 46 pages. Audit: one H1 and no skipped heading level per page, no inline handlers, canonical links and existing OG images on every indexable page, `WebApplication` on the 17 calculator and comparison pages, `Article` on the five guides, 31 sitemap URLs with none of the 14 embed pages |
| Preview build                                              | Passed; every page noindex, `Disallow: /`, no sitemap, no canonical links, no JSON-LD, and no embed snippet                                                                                                                                                                                          |

Page text: eBay 3,584 words, Upwork 1,439, Fiverr 1,373, the digital product
comparison 1,052, `/fees/` 977, `/freelance/` 822, and the new guides 484 and 590.

Browser evidence (each value hand-checked):

- eBay: $100 in most categories pays $14.00 ($13.60 and $0.40). eBay's own
  example, $424.00 with $24.00 tax, pays $58.06 and keeps $341.94. An $8.00
  order in the small-order scenario pays $1.39; in the larger-order scenario it
  shows "This scenario covers sales from $10.01 to $7,500.00." International
  $100 pays $15.65, and a Basic Store $100 sale $13.10. Keeping $1 charges
  $10.01; keeping $7,000 names the range instead of a price.
- Upwork: $1,000 at 10% leaves $900.00; a Direct Contract leaves $950.00 and
  hides the rate field; Freelancer Plus leaves $1,000.00. At 15% with Instant
  Pay, $848.00 reaches the account. 16% shows "Enter a value no higher than
  15%." $5,000 with Instant Pay warns about the $2,999 transfer limit.
  Receiving $1,000 by wire bills $1,166.67, and $1,166.66 would leave a cent
  short.
- Fiverr: a $100 order earns $80.00, or $77.00 after a Payoneer withdrawal.
  $5 warns about Payoneer's $10 minimum, $1 says the withdrawal fee is larger
  than the earnings, and $7,000 warns about the $5,000 limit. Earning $100
  prices the order at $125.00.
- The digital product comparison marks Lemon Squeezy lowest among platforms
  at $10, $25, $50, and $100, and Stripe lowest overall; at $3 Stripe is
  lowest.
- Regressions after the component move: the hourly calculator still shows
  $103.63 and the independent $79.87, $638.96, and 1,152-hour fixture; the
  project calculator $3,026.25 and $3,090.94 for 18.5 delivery hours; a $75.00
  rate transfers into a $2,077.50 quote and is removed from storage. Embedded
  copies hide the pinned bar and the project hand-off.
- Every embed page at 360 and 760 px has no horizontal overflow; suggested
  heights come from the 360 px measurements.
- Not verified: Enter and Space activation (a limitation of the in-app
  browser), a successful clipboard copy, print preview, iOS Safari's on-screen
  keyboard, and an embed on another site.

Local checks on 2026-09-16 for creator platform fees and KDP royalties
(branch `feat/creator-platform-fees`, based on `b043b00`; browser work on the
dev server at `:4399`, at desktop width and 375×812):

| Check                                                      | Observed result                                                                                                                                                                                                                                                               |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm run lint`                                            | Passed with 0 findings                                                                                                                                                                                                                                                        |
| `pnpm run format:check`                                    | Passed                                                                                                                                                                                                                                                                        |
| `pnpm run check-types`                                     | Passed: 7 of 7 tasks; `astro check` 0 errors, 0 warnings, 0 hints                                                                                                                                                                                                             |
| Vitest                                                     | Passed: 103 calculator tests (Kickstarter's threshold, Patreon's worked examples, KDP's royalty and printing cost examples) and 110 web tests                                                                                                                                 |
| Guard build (`REQUIRE_SITE_URL=true`, no site)             | Failed as intended                                                                                                                                                                                                                                                            |
| Site build (`PUBLIC_SITE_URL=https://calculators.example`) | Passed; 55 pages. Audit: one H1 and no skipped heading level per page, no inline handlers, canonical links and existing OG images on every indexable page, `WebApplication` on the new pages, titles 46 to 64 characters, and 36 sitemap URLs with none of the 18 embed pages |
| Preview build                                              | Passed; every page noindex, `Disallow: /`, no sitemap, no canonical links, no JSON-LD, and no embed snippet                                                                                                                                                                   |

Official sources were rechecked on 2026-09-15 and 2026-09-16: Kickstarter's
fees page in the in-app browser, Patreon's pricing page and Help Center
articles, Ko-fi's Help Center articles, and KDP's royalty, list price, and
printing cost pages.

Browser evidence (each value hand-checked):

- Kickstarter: $100 pays $8.30 ($5.00 and $3.30). 200 pledges of $50 pay
  $860.00 and leave $9,140.00, under "Across 200 pledges" with no yearly row.
  $5 in the micropledge scenario pays $0.58. $9 in the standard scenario shows
  "This scenario covers amounts of $10.00 or more."; $10 in the micropledge
  scenario shows "up to $9.99". Keeping $50 charges $54.67.
- Patreon: $10 pays $1.59 and keeps $8.41; 100 members keep $841.00 a month
  and pay $1,908.00 in fees a year. iOS at $14.50 keeps $8.70. Currency
  conversion on $10 pays $1.84. The Pro plan at $3 pays $0.49, and $5 names
  the $3.00 limit.
- Ko-fi: $10 pays $1.09 ($0.50 and $0.59); with no Ko-fi fee $0.59; the PayPal
  scenario $0.50. The Gold break-even reads $240 a month.
- KDP: a $4.99, 2.5 MB eBook earns $3.23 at 70% ($0.38 delivery) and $1.75 at
  35%. $15 at 70% warns about the $2.99 to $12.99 band. A 300-page black-ink
  paperback at $14.99 earns $4.39 after $4.60 printing, and 500 copies earn
  $2,195.00; at $8 it shows -$0.60 and the $9.20 minimum. A 300-page hardcover
  at $24.99 earns $5.74; groundwood is disabled for hardcovers; 109 hardcover
  pages and 70 standard-color pages name the missing table row. A 120-page
  large-trim standard-color paperback costs $5.82 to print.
- Upwork vs Fiverr: $500 at 10% leaves $450.00 on Upwork and $400.00 on
  Fiverr, and earning the full $500 needs $555.56 and $625.00. 16% shows
  "Enter a value no higher than 15%."
- At 375 px the KDP, Patreon, and comparison pages do not scroll sideways; the
  comparison table scrolls inside its box. Embed pages at 360 and 760 px have
  no horizontal overflow, and their suggested heights come from the 360 px
  measurement.
- Not verified: Enter and Space activation (a limitation of the in-app
  browser), a successful clipboard copy, print preview, iOS Safari's on-screen
  keyboard, and an embed on another site.

Local checks on 2026-09-16 for Substack, Payhip, the creator guides, and the
battle-test pass (branch `feat/creator-guides-more-platforms`, based on
`49a749d`; browser work on the preview build at `:4321`, in Chrome 153 driven
over the DevTools protocol and in iOS Safari on the iPhone 17 simulator, iOS
26.5, driven with Argent):

| Check                                                      | Observed result                                                                                                                                                                                                                            |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `pnpm run lint`                                            | Passed with 0 findings                                                                                                                                                                                                                     |
| `pnpm run format:check`                                    | Passed                                                                                                                                                                                                                                     |
| `pnpm run check-types`                                     | Passed: 7 of 7 tasks; `astro check` 0 errors, 0 warnings, 0 hints                                                                                                                                                                          |
| `pnpm run test`                                            | Passed: 109 calculator tests (including Substack's $150 example with the Billing fee added) and 110 web tests                                                                                                                              |
| Guard build (`REQUIRE_SITE_URL=true`, no site)             | Failed as intended                                                                                                                                                                                                                         |
| Site build (`PUBLIC_SITE_URL=https://calculators.example`) | Passed; 62 pages. Audit: canonical links, OG images, and `WebApplication` on the new pages, and 41 sitemap URLs with none of the 20 embed pages. The only findings are the existing short titles on About, Methodology, Privacy, and Terms |
| Preview build                                              | Passed; 62 pages                                                                                                                                                                                                                           |

Official sources were rechecked on 2026-09-16: Substack's Help Center articles
through its public Help Center API, Stripe's pricing and Billing pricing pages,
Payhip's Help Center articles, and Payhip's pricing page in the in-app browser.

Browser evidence (each value checked against an independent calculation from
the published rates):

- Substack: $100 pays $13.90 and keeps $86.10; $10 keeps $8.34, or $8.19 by
  international card; keeping $100 charges $116.09; 250 subscribers at $8 pay
  $347.50 a month. In iOS Safari, $8 by international card shows $6.49 while
  typing.
- Payhip: $25 keeps $22.72 on Free Forever, $23.47 on Plus, and $23.97 on Pro;
  keeping $50 charges $54.61, $52.89, and $51.80. The break-evens read $966.67
  and $3,500 a month.
- KDP: $13.00 and $2.98 at 70% are field errors naming the $2.99 to $12.99
  range, with the royalty shown as "—" and copy disabled; $13.00 at 35% earns
  $4.55; $0.98 at 35% names $0.99 to $200.00; a 300-page paperback at $1.00
  names the $9.20 minimum and at $250.01 the $250.00 maximum. In iOS Safari the
  error shows under the price field and the sticky bar shows "—".
- Losses: $0.01 on Stripe keeps -$0.29 and says the fees are more than the
  payment; $0.31 keeps $0.00 and says the fees take the whole payment; $0.32
  shows no message. The Patreon vs Ko-fi comparison shows its message at $0.01
  and clears it for an invalid amount.
- Keyboard in Chrome: Tab reaches the skip link first and Enter follows it;
  Enter and Space open the menu, Escape closes it and returns focus to the
  button; arrow keys change scenario radios; Enter in a field holding "abc"
  shows the field error and summary and focuses the field on six calculators.
- Clipboard in Chrome: all nine copy buttons put the result on the clipboard;
  after an invalid amount the button is disabled; with clipboard permission
  denied, the manual-copy message appears.
- Print: the Print buttons call `window.print`. Under print media the header,
  footer, related tools, sticky bar, and action buttons are hidden, results
  remain, the background is white, and nothing overflows on nine pages.
  `Page.printToPDF` hung in this environment even for a plain control page, so
  no PDF was produced.
- iOS Safari: amount fields open the decimal keypad, the focused field stays
  above the keyboard, results update while typing, and radio taps change the
  scenario note.
- Cross-origin embeds: the Stripe, Substack, Payhip, and KDP embeds at 420 px
  inside a page on `127.0.0.1:8765` calculate from typed input ($9.41, $8.34,
  $8.91, and $6.73), open the credit link in a new tab with `rel="noopener"`,
  show no sticky bar, and fit their suggested heights. This pass found and
  fixed a 32 px inner scroll: the embed body's `min-height: 100dvh` plus a
  collapsed top margin always overflowed the frame.
- At 360 px every embed's default height fits its suggested height; entering a
  sales count makes a fee embed 176 to 242 px taller, which scrolls inside the
  frame. The Substack, Payhip, and KDP pages do not scroll sideways.
- No console errors on the tested pages.

Local checks on 2026-09-16 for the early payment discount and rate increase
calculators and the Substack vs Patreon and Payhip vs Gumroad comparisons
(branch `feat/creator-comparisons-freelance-tools`, based on `0e45b05`; browser
work on the preview build at `:4321`, in Chrome 153 over the DevTools protocol
and in iOS Safari on the iPhone 17 simulator through Argent):

| Check                                                      | Observed result                                                                                                           |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `pnpm run lint`                                            | Passed with 0 findings                                                                                                    |
| `pnpm run format:check`                                    | Passed                                                                                                                    |
| `pnpm run check-types`                                     | Passed: 7 of 7 tasks; `astro check` 0 errors                                                                              |
| `pnpm run test`                                            | Passed: 116 calculator tests (2/10 net 30, rounding, refused terms, raises, cuts, and part-hour months) and 110 web tests |
| Guard build (`REQUIRE_SITE_URL=true`, no site)             | Failed as intended                                                                                                        |
| Site build (`PUBLIC_SITE_URL=https://calculators.example`) | Passed; 68 pages; SEO audit 0 problems; 45 sitemap URLs with no embed pages                                               |
| Preview build                                              | Passed; 68 pages                                                                                                          |

Browser evidence (each value checked against an independent calculation):

- Early payment discount: 2/10 net 30 on $1,000 pays $980.00 early, 20 days
  sooner, at 37.24% a year; $999.99 gives a $20.00 discount; $0.25 gives
  $0.01; $0.24 gives $0.00 with a note; 1/10 net 30 is 18.43%; 2/364 net 365
  is 744.90%; a 0-day period reads "on the invoice date". A discount period
  equal to the due date, a 0% or 100% discount, 2.555%, 0 or 366 days, "abc",
  and an empty or zero invoice are field errors with the result cleared and
  copy disabled.
- Rate increase: 10% on $80 over 100 hours gives $88.00, $800.00 a month,
  $9,600.00 a year, 9.09% (9.08 hours) that could be lost, and 90.92 hours for
  today's revenue; 7% on $75.55 gives $80.84; 10,000% is accepted and
  10,000.01% refused; 87.5 and 1,666.65 hours work, while 0, 0.01, and 1,667
  hours are errors. Comparing $72 shows -$800.00 a month and the lower-rate
  message; $80 says the rate does not change; $0 says no hours match today's
  revenue. In iOS Safari the radio switch shows the new-rate field and typing
  72 on the decimal keypad shows -$800.00.
- Comparisons: $100 costs $13.90 on Substack, $13.20 on Patreon (lowest), and
  $15.40 by international card; the page's payout break-even reads $35.72.
  Payhip Free, Plus, and Pro pay $8.20, $5.20, and $3.20 against $13.70 for a
  Gumroad direct sale and $30.00 on Discover, and 12 Plus sales at $25 cover
  its price. $0.01 and $0.10 show the loss message. Payhip joins the digital
  product comparison at $8.20.
- The About, Methodology, Privacy, and Terms titles read in full; the new
  tools appear in the menu and hubs; copy, reset, Enter, and arrow keys work;
  pages and embeds do not scroll sideways at 360 px; the two embeds calculate
  inside a page on another origin ($490.00 and $110.00) and fit their
  suggested heights; no console errors.

For every future status update, record:

1. date, branch, commit, and PR;
2. the exact command;
3. pass/fail/blocked result and meaningful counts;
4. whether the result is local, preview, staging, or production;
5. any pre-existing or infrastructure failure that prevents interpretation.

## Remaining gates

1. Review the verified math package and keep provider metadata/fixtures aligned.
2. Complete remaining release checks (staging validation, deployment, truthful
   source dates at launch). Methodology, worked examples, privacy, terms, and
   the SEO plumbing are in place; canonical URLs, JSON-LD, and the sitemap activate when `PUBLIC_SITE_URL` is set for the production build.
3. Resolve Cloudflare account/access state, inventory resources read-only,
   validate a separately named staging stage, and review resource diffs before
   any production approval.
