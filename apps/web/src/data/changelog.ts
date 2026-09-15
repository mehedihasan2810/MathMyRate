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
