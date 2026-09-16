/**
 * Public record of fee rule changes. Add an entry whenever a preset's rate,
 * scenario, source, or review date changes, in the same change as the preset.
 */

export interface ChangelogEntry {
  readonly date: string;
  readonly title: string;
  readonly changes: readonly string[];
  readonly sources: readonly { readonly title: string; readonly url: string }[];
}

export const changelog: readonly ChangelogEntry[] = [
  {
    date: "2026-09-16",
    title: "Skool and Teachable calculators added",
    changes: [
      "Skool: added its transaction fees, which are the whole charge because Skool processes payments itself and a creator cannot use their own Stripe account. The Pro plan charges 2.9% + 30¢ up to $899 and 3.9% + 30¢ from $900, up to Skool's $100,000 limit; the Hobby plan charges 10% + 30¢. Results match Skool's own example of a $999 price paying out $959.74. Skool's pricing page shows only 2.9% and 10%, without the 30¢ or the higher band. Charges between $899 and $900 fall outside both bands and are refused.",
      "Teachable: added one-time sales and subscription payments by US card through Teachable Payments on the Standard bundle. The Starter plan adds a 7.5% transaction fee, Builder and Growth add none, card processing is 2.9% + $0.30, and recurring transactions add 0.7%. International cards are not estimated, because Teachable's pricing page says 3.9% + 30¢ and its fee article says 4.4% + $0.30.",
      "Both platforms joined the creator platform comparison, whose monthly table counts each plan price alongside the per-payment fees.",
    ],
    sources: [
      { title: "Skool: Pricing", url: "https://www.skool.com/pricing" },
      { title: "Subscriptions FAQs", url: "https://help.skool.com/article/86-subscriptions-faq" },
      { title: "Pricing | Teachable", url: "https://teachable.com/pricing" },
      {
        title: "Understand your transaction fees and bundles | Teachable Support",
        url: "https://support.teachable.com/en/articles/15661316-understand-your-transaction-fees-and-bundles",
      },
    ],
  },
  {
    date: "2026-09-16",
    title: "Podia, Whop, and Indiegogo calculators added",
    changes: [
      "Podia: added sales on the Mover plan, which charges a 5% transaction fee, and on the Shaker and Earthquaker plans, which charge none, each with Stripe's 2.9% + $0.30 US card rate. Podia gives the processor's fee as 2.9% + $0.30 and says it can vary by location. The monthly plan prices ($49, $99, and $179, or $42, $84, and $150 billed yearly) are not taken from each sale and are not included.",
      "Whop: added its standard pricing of 2.7% + $0.30 per successful card transaction, and the 1.5% it adds for a card issued outside the US. The optional orchestration (0.8%), billing (0.5%), and tax and remittance (2%) add-ons, marketplace sales through Discover, and payment methods whose rates two Whop pages state differently are not estimated.",
      "Indiegogo: added contributions to a project that reaches its goal, at a 5% platform fee plus 3% + $0.20 payment processing. Results match Indiegogo's own example of $10,000 over 100 transactions paying $500 and $320. A project that misses its goal pays nothing. Indiegogo's help center omits the 3% in one sentence; its worked example, its fee page, and its pledge manager section all include it.",
      "Added a Kickstarter vs Indiegogo comparison. A comparison row whose scenario does not cover the amount, such as Kickstarter's under-$10 pledge rate at $100, now shows a dash and names the amounts it covers instead of failing the table.",
    ],
    sources: [
      {
        title: "Podia Pricing: Plans, Transaction Fees & Free Trial — Podia",
        url: "https://www.podia.com/pricing",
      },
      {
        title: "Understanding Podia transaction fees | Podia Help Center",
        url: "https://help.podia.com/en/articles/11371138-understanding-podia-transaction-fees",
      },
      { title: "Fees - Whop Docs", url: "https://docs.whop.com/fees" },
      { title: "Fees - Indiegogo", url: "https://www.indiegogo.com/en/info/fees" },
      { title: "Fees - Indiegogo Help Center", url: "https://help.indiegogo.com/article/596-fees" },
    ],
  },
  {
    date: "2026-09-16",
    title: "Substack and Payhip calculators added",
    changes: [
      "Substack: added paid subscription payments on the web with Substack's 10% fee, Stripe's 2.9% + $0.30 card fee, and Stripe's 0.7% Billing fee on recurring payments, plus Stripe's 1.5% fee for a card issued outside the US paying in USD. One older Substack page still lists a 0.5% Billing fee; Substack's cost page says that rate ended June 30, 2025, and Stripe's Billing pricing page lists 0.7%. iOS in-app purchases and local-currency prices are not estimated, because Substack gives Apple's fee as 15-30% and the conversion fee as 1% to 2%.",
      "Payhip: added one-time sales paid by card through Stripe on the Free Forever plan (5% fee), Plus plan (2% fee, $29 a month), and Pro plan (no fee, $99 a month), with Stripe's 2.9% + $0.30 card fee. Subscriptions, PayPal, and Square payments are not estimated, because Payhip does not say whether Stripe's Billing fee applies or publish PayPal's fixed fee.",
      "Amazon KDP: a list price outside KDP's range for the chosen royalty option or format is now an error instead of a warning beside a royalty KDP would not pay.",
    ],
    sources: [
      {
        title: "How much does Substack cost?",
        url: "https://support.substack.com/hc/en-us/articles/360037607131-How-much-does-Substack-cost",
      },
      { title: "Stripe Billing | Pricing", url: "https://stripe.com/billing/pricing" },
      { title: "Pricing - Payhip", url: "https://payhip.com/pricing" },
      {
        title: "Billing and Upgrading - Help Center",
        url: "https://help.payhip.com/article/102-billing-and-upgrading",
      },
    ],
  },
  {
    date: "2026-09-16",
    title: "Patreon, Ko-fi, and KDP calculators added",
    changes: [
      "Patreon: added membership payments on the standard 10% plan with 2.9% + $0.30 processing (3.9% + $0.30 for PayPal or Venmo from outside the US), the 2.5% currency conversion fee, iOS in-app purchases with Apple's 30% or 15% App Store fee, and the legacy 8% Pro plan with its $3-or-less micropayment rate. The web and iOS results match Patreon's own $10 and $14.50 examples. One-time purchases are not included, because Patreon's pages state their fee three different ways.",
      "Ko-fi: added Ko-fi's 5% service fee and the no-fee case (Ko-fi Gold, or one-off tips without Contributor status), with Stripe's published 2.9% + $0.30 US card rate for payments through Stripe. PayPal payments show Ko-fi's fee only, because Ko-fi does not publish PayPal's fee.",
      "Amazon KDP: added royalties for Amazon.com eBooks (70% after delivery costs of $0.15 per MB, or 35%), and paperbacks and hardcovers (50% at a list price of $9.98 or less, 60% at $9.99 or more, minus printing costs from KDP's tables). Expanded Distribution and Kindle Unlimited are not estimated.",
    ],
    sources: [
      { title: "Patreon Pricing Plans — Patreon", url: "https://www.patreon.com/pricing" },
      {
        title: "Creator fees overview",
        url: "https://support.patreon.com/hc/en-us/articles/11111747095181-Creator-fees-overview",
      },
      {
        title: "Does Ko-fi take a fee?",
        url: "https://help.ko-fi.com/hc/en-us/articles/360002506494-Does-Ko-fi-take-a-fee",
      },
      {
        title: "Digital  Book Pricing Page",
        url: "https://kdp.amazon.com/en_US/help/topic/G200634500",
      },
      {
        title: "Paperback Printing Cost",
        url: "https://kdp.amazon.com/en_US/help/topic/G201834340",
      },
    ],
  },
  {
    date: "2026-09-15",
    title: "Kickstarter fee calculator added",
    changes: [
      "Kickstarter: added collected pledges on successfully funded US projects, with Kickstarter's 5% fee plus payment processing of 3% + $0.30 for pledges of $10 or more, or 5% + $0.08 for pledges under $10. Pledge Manager payments are listed as unsupported, because Kickstarter describes their processing fee only as roughly 3-5%.",
    ],
    sources: [
      { title: "Fees: United States — Kickstarter", url: "https://www.kickstarter.com/help/fees" },
      {
        title: "What are the fees? | Kickstarter Help Center",
        url: "https://help.kickstarter.com/en-us/articles/16236674-what-are-the-fees",
      },
    ],
  },
  {
    date: "2026-09-15",
    title: "Fiverr fee calculator added",
    changes: [
      "Fiverr: added a calculator for Fiverr's 20% seller commission on orders, Gig Extras, and tips, with PayPal withdrawals (free, $1 minimum) and Payoneer Account withdrawals ($3, $10 minimum), up to $5,000 per withdrawal. Bank Transfer via Payoneer is not included, because Fiverr's pages list both $1 and $3 for it. The buyer's service fee is not estimated, because Fiverr's pages give two different small-order fees.",
    ],
    sources: [
      {
        title: "Your earnings page – Fiverr Help Center",
        url: "https://help.fiverr.com/hc/en-us/articles/9234443621137-Your-earnings-page",
      },
      {
        title: "Withdrawing your earnings & managing payout methods – Fiverr Help Center",
        url: "https://help.fiverr.com/hc/en-us/articles/360010530058-Withdrawing-your-earnings-managing-payout-methods",
      },
    ],
  },
  {
    date: "2026-09-15",
    title: "Upwork fee calculator added",
    changes: [
      "Upwork: added a calculator for the Freelancer Service Fee, which Upwork sets between 0% and 15% per contract, so the freelancer enters the rate shown for their contract. Direct Contracts use 5%, or 0% with an active Freelancer Plus membership, and Enterprise clients use Upwork's typical 10%. Withdrawal fees for US freelancers: Direct to U.S. Bank free, Instant Pay $2.00 per transfer, and U.S. dollar wire transfers $50.00. PayPal withdrawals are not included, because Upwork does not publish their fee.",
    ],
    sources: [
      {
        title: "Learn about the Freelancer Service Fee – Upwork Help",
        url: "https://support.upwork.com/hc/en-us/articles/211062538-Learn-about-the-Freelancer-Service-Fee",
      },
      {
        title: "How to get paid on Upwork – Upwork Help",
        url: "https://support.upwork.com/hc/en-us/articles/211060918-How-to-get-paid-on-Upwork",
      },
    ],
  },
  {
    date: "2026-09-15",
    title: "eBay fee calculator added",
    changes: [
      "eBay: added sales in most categories (13.6%), Books, Movies & TV, and Music (15.3%), trading cards, comics, and coins (13.25%), and Guitars & Basses (6.7%), each with the $0.40 per-order fee for orders over $10.00; most-category orders of $10.00 or less with the $0.30 fee; international sales with the 1.65% international fee; and Basic Store or higher sales in 12.7% categories. The fee applies to the total amount of the sale, including shipping and sales tax, as eBay's current help pages state.",
      "Each eBay scenario covers only the amounts its rates apply to. Orders above $7,500.00 ($2,500.00 with a Store), where eBay charges a second rate on part of the sale, are listed as unsupported.",
    ],
    sources: [
      {
        title: "Selling fees | eBay",
        url: "https://www.ebay.com/help/selling/fees-credits-invoices/selling-fees?id=4822",
      },
      {
        title: "Store selling fees | eBay",
        url: "https://www.ebay.com/help/selling/fees-credits-invoices/store-selling-fees-managed-payments-sellers?id=4809",
      },
    ],
  },
  {
    date: "2026-09-15",
    title: "Square and Etsy fee calculators added",
    changes: [
      "Square: added in-person card payments on Square Free (2.6% + 15¢), Square Plus (2.5% + 15¢), and Square Premium (2.4% + 15¢); online and invoice card payments on Square Free (3.3% + 30¢) and on Plus or Premium (2.9% + 30¢); manually entered and card-on-file payments (3.5% + 15¢); in-person payments on Square Free with a card issued outside the US (2.6% + 15¢ plus 1.5%); and Afterpay (6% + 30¢). Invoices paid by ACH bank transfer are listed as unsupported, because their $1 minimum and $10 cap are not modeled.",
      "Etsy: added US shop orders paid through Etsy Payments, with the 6.5% transaction fee on the order less sales tax, the 3% + 25¢ processing fee on the whole order, and an optional $0.20 listing fee. Orders attributed to Offsite Ads are listed as unsupported, because their $100 cap is not modeled.",
    ],
    sources: [
      {
        title: "Square Processing Fees, Plans, and Software Pricing | Square",
        url: "https://squareup.com/us/en/pricing",
      },
      {
        title: "Learn about Square fees | Square Support Center - United States",
        url: "https://squareup.com/help/us/en/article/5068-what-are-square-s-fees",
      },
      {
        title: "Fees & Payments Policy - Our House Rules | Etsy",
        url: "https://www.etsy.com/legal/fees/",
      },
      {
        title: "Etsy Payments Policy - Our House Rules | Etsy",
        url: "https://www.etsy.com/legal/etsy-payments/",
      },
    ],
  },
  {
    date: "2026-09-15",
    title: "Every fee source re-reviewed; new scenarios added",
    changes: [
      "Stripe: added international cards (2.9% + 30¢ plus 1.5%) and manually entered domestic cards (2.9% + 30¢ plus 0.5%). The domestic online card rate is unchanged. The source is now stripe.com/pricing, which the old US pricing address redirects to.",
      "PayPal: added standard credit and debit card payments (2.99% + 49¢), invoices paid with PayPal (3.49% + 49¢), invoices paid by card (2.99% + 49¢), international PayPal Checkout payments (3.49% + 49¢ plus 1.50%), and QR code payments (2.29% + 9¢). The PayPal Checkout rate is unchanged. The source is now PayPal's merchant fees page, last updated by PayPal on September 1, 2026.",
      "Gumroad: rates unchanged. The direct-sale scenarios now note that Gumroad's refund help describes card processing as part of its fee, which conflicts with its fee list; the estimate follows the fee list.",
      "Lemon Squeezy: added international card orders (5% + 50¢ plus 1.5%), PayPal orders (plus 1.5%), and subscription payments (plus 0.5%), and the calculator now accepts tax collected on the order. The results match the worked examples on Lemon Squeezy's fee and sales tax pages.",
    ],
    sources: [
      { title: "Pricing & Fees | Stripe", url: "https://stripe.com/pricing" },
      {
        title: "PayPal Merchant Fees",
        url: "https://www.paypal.com/us/business/paypal-business-fees",
      },
      {
        title: "Gumroad's fees - Gumroad Help Center",
        url: "https://gumroad.com/help/article/66-gumroads-fees.html",
      },
      {
        title: "Docs: Fees • Lemon Squeezy",
        url: "https://docs.lemonsqueezy.com/help/getting-started/fees",
      },
      {
        title: "Docs: Sales Tax and VAT • Lemon Squeezy",
        url: "https://docs.lemonsqueezy.com/help/payments/sales-tax-vat",
      },
    ],
  },
  {
    date: "2026-09-14",
    title: "First official fee rules",
    changes: [
      "Stripe: US standard online payments with a domestic card, 2.9% + 30¢.",
      "PayPal: PayPal Checkout paid with the buyer's PayPal payment method, 3.49% + 49¢.",
      "Gumroad: direct sales at 10% + 50¢ plus 2.9% + 30¢ card processing, 5% + 50¢ after $20,000 of paid sales in a calendar month, and Discover sales at a flat 30%.",
      "Lemon Squeezy: domestic card orders at 5% + 50¢, with no tax collected.",
    ],
    sources: [
      { title: "Pricing & Fees | Stripe", url: "https://stripe.com/us/pricing" },
      { title: "PayPal Merchant Fees", url: "https://www.paypal.com/webapps/mpp/merchant-fees" },
      { title: "Gumroad pricing", url: "https://gumroad.com/pricing" },
      {
        title: "Docs: Fees • Lemon Squeezy",
        url: "https://docs.lemonsqueezy.com/help/getting-started/fees",
      },
    ],
  },
];
