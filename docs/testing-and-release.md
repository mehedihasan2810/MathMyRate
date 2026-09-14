# Testing and release

Last updated: 2026-09-14

This is the evidence policy for MathMyRate. A command listed here is a gate to
run, not a claim that it has already passed.

## Local baseline commands

Use Node.js 24 and the pnpm version pinned in the root `package.json`
(`pnpm@10.34.5` at this status date). From the repository root:

```sh
pnpm install --frozen-lockfile
pnpm run lint
pnpm run format:check
pnpm run check-types
pnpm run test
PUBLIC_SERVER_URL=https://api.example.invalid pnpm run build:web
```

`pnpm run ci` combines the non-mutating check, typecheck, native tests, and
frontend build when `PUBLIC_SERVER_URL` is supplied. `pnpm run check` is
read-only; use `pnpm run format` explicitly when a maintainer has approved a
formatting change. The invalid API origin is a compile-only fixture, not a
runtime fallback and not a deployable output.

Tests use Node's native `node:test` runner. The calculator package's scripts and
exports must include every supported engine and fixture before a package gate
can be called complete. Do not count an uninvoked test file as coverage.

## Math test matrix

### Freelance and project engines

- hand-derived annual revenue, hourly rate, and day rate;
- zero tax and tax approaching the upper boundary;
- zero/invalid billable capacity, weeks, hours, and blank or malformed inputs;
- fractional annual billable capacity without losing exact rate arithmetic;
- direct expenses, contingency, project administration time, and day length;
- transferred hourly rate without a duplicate tax reserve;
- fractional-cent and large supported amounts;
- monotonicity as costs, rates, or contingency increase;
- runtime type/schema guards and all documented boundaries.

### Fee engine

- each sourced provider/product/channel scenario, only in its supported market
  and currency;
- percentage/fixed components, per-transaction fixed charges, additive options,
  caps, tiers, and separately rounded components;
- tiny amounts, fractional-cent boundaries, large supported amounts, and
  unsupported/negative outcomes;
- gross-to-net recomputation after every inverse candidate;
- brute-force inverse verification: returned gross reaches target net, and one
  minor unit less is insufficient where that property is supported;
- every tier/cap/threshold transition, custom-rate precedence, and incompatible
  option state;
- provider-specific exclusions and unresolved source behavior.

Expected values must be independently derived. Inverse tests should not only
restate the implementation's formula. Use runtime schema guards so incomplete
or contradictory fee presets fail explicitly.

## Frontend and release checks

The frontend currently has no calculator UI, so calculator E2E coverage is not
possible yet. Once the first functional UI exists, the browser gate is:

1. run the production frontend build;
2. serve the resulting production preview/static output;
3. run Playwright against that preview, including direct nested-page loads;
4. record the exact command, browser result, and any skipped scenario.

This follows the [official Astro testing guidance](https://docs.astro.build/en/guides/testing/)
checked 2026-09-14. Do not report this gate as run today. It must cover real
calculator output, keyboard and narrow-screen flows, labels/errors, reset,
copy success/failure, no `NaN`/`Infinity`, navigation, and incompatible-state
reset. It must not test a mock result.

Before release, also verify:

- generated HTML contains useful explanatory content and labeled defaults
  before hydration;
- one meaningful H1, unique metadata, canonical, internal links, and the
  intended trailing-slash/404 behavior;
- preview noindex and production indexing/sitemap/robots behavior;
- structured data describes visible content without invented ratings or claims;
- no private financial inputs appear in telemetry, URLs, or logs;
- source URLs and actual provider review dates are present and current;
- legal/privacy text reflects actual collection and storage;
- the production asset build and nested routes work in the intended static
  asset hosting path.

## Current hosted-check caveat

The baseline PR #1 remains a draft. The user added the workflow on `main` and
merged it to the baseline remote. GitHub run `34838966552` failed before any
steps with the exact annotation `account locked due billing issue`; it provides
no hosted test counts. The workflow also lacks a trailing newline, which causes
the formatter check to fail. Connector workflow edits are blocked, and there
is no approved bypass or disable. Do not reinterpret this run as a code pass or
failure, and do not claim hosted CI until a later run actually executes steps.

The final main agent updates the actual current-run counts and results. Every
status entry should distinguish local checks, hosted CI, production preview,
Cloudflare staging, and production. A green local command does not certify an
account, a resource diff, or a deployment.

## PR and deployment sequence

Follow the approved order:

1. **PR 1 — baseline/build:** preserve the repository, establish non-mutating
   checks, a real frontend build, and compatibility evidence.
2. **PR 2 — math engines/fee rules:** land formulas, exact money handling,
   schema validation, sourced rules, fixtures, boundaries, and reverse tests.
3. **PR 3 — Astro shell/freelance tools:** wire real math into accessible UI.
4. **PR 4 — provider calculators:** add only sourced product scenarios and
   visible assumptions/exclusions.
5. **PR 5 — content/SEO/legal:** complete methodology, worked examples,
   canonical/indexing, privacy, terms, 404, and telemetry checks.
6. **PR 6 — Cloudflare staging/release:** resolve account access, inventory
   resources read-only, review a separately named staging diff, and validate
   asset routing, nested routes, headers, SSL, and recovery.

No production deployment is ready today. Alchemy resources, D1/KV/Workers,
auth, and server source are retained. Never destroy or migrate them merely to
make a static MVP convenient. Keep a known-good revision and a reviewed
recovery path before a separately approved production release.
