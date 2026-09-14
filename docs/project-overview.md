# MathMyRate project overview

Last updated: 2026-09-14

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

Phase two may add Stripe–PayPal and Gumroad–Lemon Squeezy comparisons after the
underlying engines and substantive comparison content are ready. Etsy, live FX,
account dashboards, subscriptions, saved cloud histories, AI tools,
profession-specific landing-page expansion, and automated fee ingestion are
outside launch scope.

## Planned information architecture

| Route                                 | Purpose                                                   |
| ------------------------------------- | --------------------------------------------------------- |
| `/`                                   | Product promise and tool selection                        |
| `/freelance/`                         | Freelance pricing hub                                     |
| `/freelance/hourly-rate-calculator/`  | Sustainable hourly/day-rate planning                      |
| `/freelance/project-rate-calculator/` | Scope-based project quotation                             |
| `/fees/`                              | Supported platform-fee hub                                |
| `/fees/stripe-fee-calculator/`        | Stripe gross/net calculation                              |
| `/fees/paypal-fee-calculator/`        | Product-specific PayPal calculation                       |
| `/fees/gumroad-fee-calculator/`       | Gumroad direct/Discover take-home                         |
| `/fees/lemon-squeezy-fee-calculator/` | Order fees and separate payout estimate                   |
| `/methodology/`                       | Calculations, sourcing, rounding, review, and corrections |
| `/about/`                             | Truthful product/operator information                     |
| `/privacy/`                           | Actual data collection and storage disclosures            |
| `/terms/`                             | Estimates, exclusions, permitted use, and limitations     |
| `/404`                                | Useful navigation for unavailable URLs                    |

The route table is the target, not a statement that these pages exist today.
The current public frontend is `/`, `/freelance/`,
`/freelance/hourly-rate-calculator/`, and
`/freelance/project-rate-calculator/`. There are no account pages.

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

The math package is being built independently of the UI. Current engine work
does not constitute six launched tools. The current Astro pages still expose
starter health/auth behavior, and the public navigation has not yet been
converted to the calculator information architecture. Preact is intentionally
deferred until the first calculator island and must be checked against the
locked Astro/Alchemy versions before it is added.
