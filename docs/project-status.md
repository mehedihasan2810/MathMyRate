# MathMyRate project status

Status date: **2026-09-14**

This page is a factual checkpoint, not a release announcement. Update it after
meaningful changes and include the commit/PR and the commands or source audit
that support each new status. Do not replace an actual result with a count
copied from a previous run.

## Executive status

**Not launched.** PR #1 is merged. This branch implements the independent
calculation package (the math-engine track), while the web app remains the
starter shell. There is no deployed-ready product, no calculator UI, and no
calculator E2E path to test yet. There is no hosted CI/CD; checks and deploys
are local.

## What exists now

### Math engine track

The branch work is engine-only and is deliberately separate from Astro UI:

- `packages/calculators` has runtime numeric validation that rejects non-finite
  and unparsed values instead of manufacturing a result.
- The freelance engine implements hourly/day-rate planning and project receipt
  targets. Monetary inputs and outputs use bigint integer cents; percentages
  use integer basis points; divisions use explicit upward cent rounding.
- Runtime guards validate object shape, bigint money values, safe integers, and
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
supported public export and the package-level test command exercise it. Do not
describe this work as a provider calculator or a shipped feature.

### Frontend

The frontend is still the starter four-page Astro site:

- `/`
- `/login`
- `/signup`
- `/dashboard`

It has zero calculator UI and no calculator routes. No calculator E2E test is
possible yet because there is no calculator interaction to drive. The planned
Preact island integration is deferred, not installed or certified compatible.

### Infrastructure and deployment

Alchemy remains the infrastructure owner for the existing Cloudflare Workers,
D1, KV, and Images resources. No Cloudflare resource was changed for this work.
No staging or production deployment is ready or certified. Existing server,
API, Better Auth, and database source is retained; there is no React, database,
or auth migration.

## Verification record

Local checks on 2026-09-14 for `feat/calculation-engines`:

| Check                                                              | Observed result                                                                                            |
| ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| `pnpm install --frozen-lockfile`                                   | Passed from the current baseline lockfile; no new dependencies                                             |
| `pnpm run lint`                                                    | Passed                                                                                                     |
| `pnpm run check-types`                                             | Passed across the workspace; three pre-existing Astro unused-code hints                                    |
| `pnpm run test` / final scoped calculator test run                 | 35 tests passed, including all preset fixtures, exhaustive inverse comparisons, and provenance regressions |
| `PUBLIC_SERVER_URL=https://api.example.invalid pnpm run build:web` | Passed; all four existing starter HTML files emitted                                                       |
| `pnpm run format:check`                                            | Hosted workflow removed; remaining source is expected to pass locally                                      |
| `git diff --check`                                                 | Passed                                                                                                     |
| Hosted GitHub Actions                                              | Removed; verification is local only                                                                        |
| Browser calculator E2E / staging / production                      | Not run: calculator UI and deployment are later milestones                                                 |

The build uses a compile-only invalid API origin, not a working deployed API.
No production-readiness claim is made.

Code review confirmed the exact-money arithmetic and reverse-search bounds, but
identified an official-rule provenance gap and incomplete structured metadata.
Both were fixed before delivery: the official registry is deeply frozen and
resolved canonically, altered official-looking records are rejected, custom
rules carry explicit provenance/warnings, and rule revisions are independent
of review dates. Final scoped calculator tests/typecheck/lint/format passed
after those fixes; the frontend and its dependencies were unchanged.

For every future status update, record:

1. date, branch, commit, and PR;
2. the exact command;
3. pass/fail/blocked result and meaningful counts;
4. whether the result is local, preview, staging, or production;
5. any pre-existing or infrastructure failure that prevents interpretation.

## Remaining gates

1. Review the verified math package and keep provider metadata/fixtures aligned.
2. Land the Astro freelance UI around the real engine; do not use mock financial
   results.
3. Add the four provider calculators only for sourced, supported scenarios.
4. Complete methodology, worked examples, SEO, privacy, terms, and release
   checks with truthful source dates.
5. Resolve Cloudflare account/access state, inventory resources read-only,
   validate a separately named staging stage, and review resource diffs before
   any production approval.
