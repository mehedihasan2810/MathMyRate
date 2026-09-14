# MathMyRate agent guide

Last updated: 2026-09-14

Read this file and the linked project documents before changing this repository.
The approved implementation direction is in the workspace document
[`docs/mathmyrate-implementation-plan.md`](../../docs/mathmyrate-implementation-plan.md).
The plan is the product and sequencing authority; the repository documents below
record what has actually happened since the plan was written.

## Source of truth and operating rules

- The GitHub MathMyRate repository is the product source of truth. Preserve its
  `apps/*`, `packages/*`, pnpm, and Turborepo structure. Do not replace it with
  the separate Replit React/Express/Postgres starter.
- Read [the project overview](docs/project-overview.md),
  [the current status](docs/project-status.md),
  [the architecture](docs/architecture.md), and
  [the testing and release gates](docs/testing-and-release.md) before taking
  ownership of a task.
- Keep changes reviewable and ordered by the approved PR sequence. The freelance
  calculation engine is now independently tested and wired to an accessible
  Astro UI; provider calculators and deployment are still separate milestones.
- Do not edit `docs/build-baseline.md` or `docs/fee-sources.md` from routine
  product work. They are owned by separate documentation work. If either file
  is absent in a checkout, do not create it as a side effect of another task.
- Keep secrets out of source, documentation, browser bundles, and logs.
  Use the repository's Varlock schemas and managed deployment secret storage.

## Current guardrails (2026-09-14)

- Public routes are `/`, `/freelance/`, `/freelance/hourly-rate-calculator/`,
  and `/freelance/project-rate-calculator/`. Tools are free; there are no
  login, signup, or dashboard pages. The pages use labeled native controls
  and browser scripts, not a Preact island, and consume real engine results.
- There is no hosted CI/CD. Run lint, types, Vitest unit tests, and the web
  build locally. Exercise the UI in the app browser. Deploy only when
  explicitly requested.
- There is no deployed-ready product and no Cloudflare resource has been
  changed. Retain the existing Alchemy, Workers, D1, KV, Images, API, and
  Better Auth source (`packages/auth`, the server mount, and
  `apps/web/src/lib/auth-client.ts`). Do not migrate React, the database, or
  auth to make the MVP appear simpler.

## Official-source discipline

MathMyRate makes financial estimates. A model, including Gemini, is not an
official source and must never be the reason a fee, tax treatment, or product
capability is stated as fact. A model or search result may help locate a
candidate page, but an agent must:

1. Open the provider, platform, or framework's official documentation.
2. Confirm the applicable account market, product, currency, channel, fee
   basis, rounding, effective date, exclusions, and any threshold or cap.
3. Record the direct official URL, the date it was reviewed, and the known
   effective date in the authoritative source/configuration location.
4. Label an unresolved behavior unsupported or an estimate. Never fill a gap
   with a competitor's schedule, an aggregator, a guessed universal rate, or a
   plausible fallback number.

Update source links and review dates on every meaningful provider-rule change.
Do not change a review date merely because a build ran. Preserve the distinction
between US/USD launch scenarios, user-entered assumptions, and unsupported
jurisdictions or payment products.

## Safe verification

Use Node.js 24 and the pnpm version pinned by the root `packageManager` field.
Calculator unit tests use Vitest. There is no Playwright suite; exercise the UI
in the app browser. The normal local sequence is documented in
[testing and release](docs/testing-and-release.md). Never report a check,
browser test, deployment, or source audit as passed unless it was actually run
and its result recorded.

`pnpm run lint` loads the vendored anti-slop Oxlint plugins from
`tools/oxlint/anti-slop`. Do not disable those rules, weaken their severity, or
add type-laundering to make a task pass. Provenance and local deviations are in
[`tools/oxlint/anti-slop/UPSTREAM.md`](tools/oxlint/anti-slop/UPSTREAM.md).

For infrastructure, inspect first and review a diff before applying anything.
Keep preview and production stages separate. No deployment, resource creation,
resource deletion, database migration, DNS replacement, or Cloudflare change
belongs in a calculation or documentation task.
