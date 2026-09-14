# Provider fee sources

Checked on **2026-09-14**. This is the retrieval/review date for the linked
official pages, not a claim that any rate became effective on that date. Search
results were used only to locate pages; the findings below were checked against
the provider pages themselves. The configuration records are in
`packages/calculators/src/fee-presets.ts`.

The launch scope is deliberately narrow: US account, USD amount, and only the
payment product or transaction state named by a preset. A provider's published
rate does not establish how it rounds a percentage component at every cent
boundary. The fee engine therefore labels its nearest-cent component rounding
as an estimator assumption, not a provider guarantee.

The Gumroad and Lemon Squeezy presets currently require **no-tax orders**. This
restriction is enforced by `taxMode: "zero-only"`, not just prose. Stripe and
PayPal accept an explicitly supplied pass-through tax amount already included in
gross; the engines never calculate tax rates or infer jurisdiction. Additional
fee bases, caps, currency conversion, or tier transitions require a new modeled
rule and fixtures rather than forcing them into a linear preset.

## Rule identity and updates

Use `getFeePreset(id)` to resolve official records from the immutable registry.
The engine rejects modified official records even when an ID, source URL, and
review date are retained. Each rule declares product, channel, combination
policy, tier/cap disposition, effective date (`null` when not established),
custom-pricing policy and component rounding.

Increment the integer `revision` whenever any rule configuration changes.
`checkedOn` remains the actual source-review date, not a version identifier.
Results identify the rule as `id@revision`. Custom rules must use `custom:` IDs,
`origin: "custom"` and `checkedOn: null`; they emit an explicit custom-rate warning
and may have an empty sources array rather than inventing a citation.

## Stripe

**Official page:** [Stripe Pricing & Fees](https://stripe.com/us/pricing)

The Standard section lists **2.9% + $0.30 per successful transaction for
domestic cards**. The page also distinguishes online card pricing from
manually entered cards, international cards, currency conversion, and other
payment methods. The supported preset is limited to a US account, USD,
successful online domestic card transaction.

Example for a $100.00 gross charge: 2.9% is $2.90 and the fixed fee is $0.30,
so the estimator's displayed fee is $3.20 and the remaining receipts are
$96.80. This example is arithmetic from the published rate; the page does not
specify a universal per-component rounding rule. Connect, Billing, Tax,
disputes, refunds, payouts, and custom pricing are not silently added.

## PayPal Checkout

**Official pages:**

- [PayPal Checkout Solutions for Businesses (US)](https://www.paypal.com/us/business/accept-payments/checkout?locale.x=en_US)
- [PayPal Merchant Fees](https://www.paypal.com/webapps/mpp/merchant-fees)

PayPal's Checkout comparison table lists **PayPal: 3.49% + $0.49 fixed fee per
transaction**. The same product page separately lists Checkout card payments
at 2.99% + $0.49, so the supported preset is specifically the PayPal payment
method in the PayPal Checkout product, not a universal PayPal or card rate.
The merchant-fees page identifies the domestic commercial transaction schedule
and the USD fixed fee. International transactions and other products are not
folded into this record.

Example for a $100.00 domestic USD PayPal Checkout payment: 3.49% is $3.49,
plus $0.49, for an estimated fee of $3.98 and estimated receipts of $96.02.
PayPal's pages do not establish a universal component-rounding policy, so the
nearest-cent result is an estimator assumption.

## Gumroad

**Official pages:**

- [Gumroad pricing](https://gumroad.com/pricing)
- [Gumroad's fees](https://gumroad.com/help/article/66-gumroads-fees.html)

The Help Center says a sale through a creator's profile or direct link has a
**10% + $0.50** Gumroad fee per transaction, plus sales tax, and that this does
not include **credit-card processing of 2.9% + $0.30** or PayPal fees. A
Discover marketplace sale has a **flat 30% fee including all processing fees**.
The direct preset therefore has two components for a card sale:

- 10% + $0.50 Gumroad direct-sale fee;
- 2.9% + $0.30 credit-card processing example from Gumroad's Help Center.

The Discover preset has one 30% component and no additional processing
component. The presets are scoped to a US account and USD for the launch; the
linked Gumroad pages present these fees without a separate account-country
schedule. Gumroad sales tax, PayPal direct-sale fees, affiliates, refunds,
connected payment accounts, custom fees, and payout costs are not invented.

For a $100.00 direct card sale before the monthly volume threshold, the
arithmetic estimate is $10.00 + $0.50 + $2.90 + $0.30 = **$13.70**, leaving
$86.30 before any separately applicable fee sales tax. For a $100.00 Discover
sale, 30% is **$30.00**, leaving $70.00 before any separately applicable
taxes. These examples use the fee components and do not assert provider
rounding behavior.

### Volume threshold

The Help Center says that once paid sales in a calendar month reach
**$20,000**, new direct sales that month use **5% + $0.50** instead of
10% + $0.50; the rule resets on the first of the next month. It says Discover
stays at 30%, the $0.50 direct-sale charge remains, and a custom account fee
takes precedence. A refund can put the account below the threshold and return
new sales to the 10% rate until the threshold is crossed again.

The configuration includes a post-threshold direct-card scenario only when the
threshold has already been reached before the new sale. It does **not** invent
a blended fee for the transaction that reaches $20,000, because the calculator
does not have the provider's month-to-date state or a documented split rule.
That threshold-crossing scenario is explicitly blocked. For a $100.00 new
post-threshold direct card sale, the documented component arithmetic is
$5.00 + $0.50 + $2.90 + $0.30 = **$8.70**. This is a pre/post illustration,
not a claim that every direct sale receives the lower rate.

## Lemon Squeezy

**Official pages:**

- [Lemon Squeezy Fees](https://docs.lemonsqueezy.com/help/getting-started/fees)
- [Sales Tax and VAT](https://docs.lemonsqueezy.com/help/payments/sales-tax-vat)
- [Getting Paid](https://docs.lemonsqueezy.com/help/getting-started/getting-paid)

The fee page states that the platform fee is calculated on the **total order
value** and lists the baseline as **5% + $0.50**. It separately documents
additive fees of +1.5% for international transactions, +1.5% for PayPal
transactions, and +0.5% for subscription payments. The supported baseline is a
US-account, USD, domestic card, single non-subscription order with no tax.

The sales-tax page's worked example has a $20 product, $4 tax, and $24 order
total; the documented platform fee is described as $0.50 + 5% of total + 1.5%
international payment. Its tax-inclusive example sets a $15 customer price
including $2.50 tax and reports a $1.56 platform fee. These examples support
using the order total as the fee base, but they do not establish a universal
rounding rule for every scenario. In a future tax-aware flow, gross must be the
tax-inclusive order total and collected tax must be separately identified from
seller receipts. The current no-tax preset does not calculate or infer tax.

For a $100.00 domestic, no-tax, non-subscription card order, the baseline
arithmetic estimate is 5% ($5.00) + $0.50 = **$5.50**, leaving $94.50 before
any payout consideration.

### Payouts are excluded from order presets

Lemon Squeezy says payout fees vary by payout method, region, and settlement
currency. Its fee page lists US Stripe bank payouts as **free** and US PayPal
payouts as **$0.50 per payout**; the Getting Paid page also describes payout
scheduling and batch behavior. These are not fixed charges on each order and
are not included in the order-fee components. The configuration keeps a
blocked payout record rather than silently adding either amount to every sale.
International transactions, PayPal orders, subscriptions, marketing fees,
custom pricing, and tax calculation remain blocked or excluded in the baseline.
