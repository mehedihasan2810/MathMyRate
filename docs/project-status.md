# MathMyRate project status

Status date: **2026-09-14**

This page is a factual checkpoint, not a release announcement. Update it after
meaningful changes and include the commit/PR and the commands or source audit
that support each new status. Do not replace an actual result with a count
copied from a previous run.

## Executive status

**Not launched.** PR #1 and PR #2 are merged. This branch implements the Astro
shell and freelance tools. There is still no deployed-ready product, staging
validation, or production deployment. There is no hosted CI/CD; checks and
deploys are local.

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

The freelance pages use native accessible controls and browser scripts, call
the framework-independent engine, and provide labeled defaults, explanatory
content, validation/error states, reset, copy, print, and local hourly-rate
transfer. They do not require a Preact island or another framework integration.
Login, signup, and dashboard pages were removed because every tool is free.
Better Auth server, database schema, and the unused web client remain in
source. Transfer grouping/validation and reduced-motion/skip-link contrast
fixes are included in this UI work.

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

Code review confirmed the exact-money arithmetic and reverse-search bounds, but
identified an official-rule provenance gap and incomplete structured metadata.
Both were fixed before delivery: the official registry is deeply frozen and
resolved canonically, altered official-looking records are rejected, custom
rules carry explicit provenance/warnings, and rule revisions are independent
of review dates.

For every future status update, record:

1. date, branch, commit, and PR;
2. the exact command;
3. pass/fail/blocked result and meaningful counts;
4. whether the result is local, preview, staging, or production;
5. any pre-existing or infrastructure failure that prevents interpretation.

## Remaining gates

1. Review the verified math package and keep provider metadata/fixtures aligned.
2. Add the four provider calculators only for sourced, supported scenarios.
3. Complete methodology, worked examples, SEO, privacy, terms, and release
   checks with truthful source dates.
4. Resolve Cloudflare account/access state, inventory resources read-only,
   validate a separately named staging stage, and review resource diffs before
   any production approval.
