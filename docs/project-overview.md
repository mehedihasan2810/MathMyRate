# MathMyRate project overview

Last updated: 2026-09-15

## Goal

MathMyRate is a free, advertising-ready calculator suite for freelancers and
digital-product sellers: **know what to charge and what you keep**. The product
should answer practical pricing and take-home questions with transparent
assumptions, named line items, and source-backed fee rules rather than pretend
to be a tax, accounting, or payment-provider authority.

The approved direction is the workspace
[`docs/mathmyrate-implementation-plan.md`](../../../docs/mathmyrate-implementation-plan.md).
This repository is the implementation source of truth. Its existing Astro,
Hono/oRPC, Better Auth, Drizzle/D1, and Alchemy structure is retained; it is
not to be replaced by the separate Replit starter.

## Launch tools

The launch scope has six tools:

1. Freelance hourly/day rate.
2. Freelance project rate.
3. Stripe fees.
4. PayPal fees.
5. Gumroad fees.
6. Lemon Squeezy fees.

The initial payment presets are only for explicitly documented US-account/USD
scenarios and only for the particular payment product and channel that the
source supports. Formatting another currency in a freelance tool does not
convert money or select a tax jurisdiction. Taxes are user-entered planning
assumptions, not a tax-return calculation. Unknown fees and undocumented
conditions are excluded or clearly labeled unsupported; they are not guessed.

Stripe–PayPal and Gumroad–Lemon Squeezy comparison pages were added on 2026-09-15, once the underlying engines and sourced comparison content were ready. Etsy, live FX,
account dashboards, subscriptions, saved cloud histories, AI tools,
profession-specific landing-page expansion, and automated fee ingestion are
outside launch scope.

## Planned information architecture

| Route                                           | Purpose                                                     |
| ----------------------------------------------- | ----------------------------------------------------------- |
| `/`                                             | Product promise and tool selection                          |
| `/freelance/`                                   | Freelance pricing hub                                       |
| `/freelance/hourly-rate-calculator/`            | Sustainable hourly/day-rate planning                        |
| `/freelance/project-rate-calculator/`           | Scope-based project quotation                               |
| `/freelance/retainer-calculator/`               | Monthly retainer fee, discount, and effective rates         |
| `/freelance/markup-margin-calculator/`          | Price from a markup or margin, or both from a price         |
| `/freelance/salary-to-hourly-calculator/`       | Pay converted across hours, days, weeks, months, and years  |
| `/freelance/early-payment-discount-calculator/` | Early payment discount terms and their annualized cost      |
| `/freelance/rate-increase-calculator/`          | A rate change's effect on monthly and yearly revenue        |
| `/freelance/1099-vs-w2-calculator/`             | Contractor income matching a salary after payroll tax       |
| `/fees/`                                        | Supported platform-fee hub                                  |
| `/fees/stripe-fee-calculator/`                  | Stripe gross/net calculation                                |
| `/fees/paypal-fee-calculator/`                  | Product-specific PayPal calculation                         |
| `/fees/square-fee-calculator/`                  | Square fees by plan and payment channel                     |
| `/fees/etsy-fee-calculator/`                    | Etsy transaction, processing, and listing fees              |
| `/fees/ebay-fee-calculator/`                    | eBay final value and per-order fees by category             |
| `/fees/depop-fee-calculator/`                   | Depop's processing fee on a US sale, with no selling fee    |
| `/fees/poshmark-fee-calculator/`                | Poshmark's $2.95 or 20% fee and seller earnings             |
| `/fees/mercari-fee-calculator/`                 | Mercari's 10% selling fee with buyer-paid shipping          |
| `/fees/facebook-marketplace-fee-calculator/`    | Facebook Marketplace's selling fee on shipped orders        |
| `/fees/upwork-fee-calculator/`                  | Upwork service fee on a contract and withdrawal fees        |
| `/fees/fiverr-fee-calculator/`                  | Fiverr's seller commission and withdrawal fees              |
| `/fees/kickstarter-fee-calculator/`             | Kickstarter and processing fees per pledge and per campaign |
| `/fees/patreon-fee-calculator/`                 | Patreon platform, processing, and iOS fees on a membership  |
| `/fees/ko-fi-fee-calculator/`                   | Ko-fi's service fee and Stripe processing                   |
| `/fees/substack-fee-calculator/`                | Substack's 10% fee and Stripe card and Billing fees         |
| `/fees/payhip-fee-calculator/`                  | Payhip plan fees and Stripe processing on a sale            |
| `/fees/podia-fee-calculator/`                   | Podia plan fees and Stripe processing on a sale             |
| `/fees/whop-fee-calculator/`                    | Whop's card fee and what a sale leaves you                  |
| `/fees/skool-fee-calculator/`                   | Skool Pro and Hobby transaction fees on a payment           |
| `/fees/teachable-fee-calculator/`               | Teachable plan fees and processing on a course sale         |
| `/fees/indiegogo-fee-calculator/`               | Indiegogo platform and processing fees on a campaign        |
| `/fees/kdp-royalty-calculator/`                 | Amazon KDP eBook, paperback, and hardcover royalties        |
| `/fees/gumroad-fee-calculator/`                 | Gumroad direct/Discover take-home                           |
| `/fees/lemon-squeezy-fee-calculator/`           | Order fees and separate payout estimate                     |
| `/fees/payout-fee-calculator/`                  | Payout fees on Stripe, Gumroad, Patreon, and Lemon Squeezy  |
| `/fees/stripe-vs-paypal-fees/`                  | Stripe and PayPal fees on the same sale                     |
| `/fees/gumroad-vs-lemon-squeezy-fees/`          | Gumroad and Lemon Squeezy fees on the same sale             |
| `/fees/digital-product-platform-fees/`          | Digital product platform fees compared on one sale          |
| `/fees/upwork-vs-fiverr-fees/`                  | Upwork and Fiverr freelancer fees on the same job           |
| `/fees/patreon-vs-ko-fi-fees/`                  | Patreon and Ko-fi fees on the same payment                  |
| `/fees/substack-vs-patreon-fees/`               | Substack and Patreon fees on the same payment               |
| `/fees/payhip-vs-gumroad-fees/`                 | Payhip and Gumroad fees on the same sale                    |
| `/fees/kickstarter-vs-indiegogo-fees/`          | Kickstarter and Indiegogo fees on the same pledge           |
| `/fees/creator-platform-fees/`                  | Creator platform fees and monthly cost compared             |
| `/fees/teachable-vs-podia-fees/`                | Teachable and Podia plan fees on the same course sale       |
| `/methodology/`                                 | Calculations, sourcing, rounding, review, and corrections   |
| `/about/`                                       | Truthful product/operator information                       |
| `/privacy/`                                     | Actual data collection and storage disclosures              |
| `/terms/`                                       | Estimates, exclusions, permitted use, and limitations       |
| `/changelog/`                                   | Dated record of fee rule changes and their sources          |
| `/guides/`                                      | Worked guides that hand off to calculators                  |
| `/embed/<calculator>/`                          | Noindex iframe copies of every calculator                   |
| `/404`                                          | Useful navigation for unavailable URLs                      |

Every route in the table exists as of 2026-09-15. There are no account pages.

## Product behavior

Each completed tool should provide:

- visible scope, supported scenario, and labeled example defaults;
- accessible labels, descriptions, errors, keyboard behavior, and narrow-screen
  layout;
- instant recalculation without focus loss, plus reset and copy-result feedback;
- currency-aware output, print-friendly breakdowns, assumptions, exclusions,
  official sources, review dates, and worked examples;
- gross/net modes only where the selected product supports them;
- warnings when a result is an estimate or a custom value overrides a preset;
- a relevant next step, such as transferring an hourly rate into project pricing;
- a clear JavaScript-required notice rather than showing a frozen default as a
  live answer.

Public calculations happen in the browser and should not call a Worker or
runtime database on every keystroke. No login, payment-provider connection,
runtime database, or calculator API is required for the launch calculation
flow. Cross-tool transfer is local to the browser. Do not add decorative
save, share, account, or cloud-history controls without implemented behavior.

## Financial scope and trust boundaries

The hourly/day model uses annual take-home, business expenses, an
effective user-entered tax rate, working weeks, weekly hours, billable
percentage, and hours per day. It estimates required revenue and minimum rates;
it does not determine deductions, progressive taxes, sales tax, or statutory
self-employment contributions.

The project model combines delivery and administration time, applies contingency
to labor, adds direct project expenses, and may later gross up for a supported
payment fee. An hourly rate already grossed up for annual tax must not receive a
second automatic tax reserve.

Provider rules must remain product-specific:

- Stripe starts with US standard online cards. Connect, Billing, Tax,
  disputes, and custom enterprise pricing are excluded unless separately
  implemented and sourced.
- PayPal products must use their actual selected schedule. Checkout, standard
  card payments, Goods and Services, and invoice payments are not one guessed
  universal rate.
- Gumroad distinguishes direct sales from Discover and separate processing.
  Threshold or volume behavior is shown as documented, pre/post-threshold
  estimates when a precise blended result is not sourced.
- Lemon Squeezy applies documented order-fee bases, distinguishes collected
  sales tax from seller receipts, and treats payout costs as a separate batch
  estimate rather than a per-sale fixed fee.

Results should say **net receipts before expenses and income tax**, not
“profit,” unless those expenses are part of the calculation.

## Current product boundary

The math package is implemented, and all six calculators, both comparison pages, and the trust and content pages consume its real results. Deployment remains future work: the owner will choose the production domain before a release. Preact remains intentionally deferred: the calculators use native
controls and page scripts, and a framework island must be checked against the
locked Astro/Alchemy versions before it is added.
