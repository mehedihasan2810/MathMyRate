# Testing and release

Last updated: 2026-09-14

This is the evidence policy for MathMyRate. A command listed here is a gate to
run; current local evidence is recorded below and is not staging or production
certification.

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

`pnpm run ci` is a local convenience that combines the non-mutating check,
typecheck, Vitest unit tests, and frontend build when `PUBLIC_SERVER_URL` is
supplied. There is no hosted CI/CD. `pnpm run check` is read-only; use
`pnpm run format` explicitly when a maintainer has approved a formatting
change. The invalid API origin is a compile-only fixture, not a runtime
fallback and not a deployable output.

Calculator engines and fee rules are unit-tested with Vitest in
`packages/calculators`. There is no Playwright or other automated browser
suite. Confirm UI behavior in the running app. Do not count an uninvoked test
file as coverage.

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

The static Astro app has a freelance landing page and hourly/day-rate and
project-rate calculators. Their native browser scripts consume the real
calculation package and show meaningful prerendered defaults before hydration.

Confirm UI behavior in the running app. There is no automated end-to-end
suite. Check real calculator output, keyboard and narrow-screen flows,
labels/errors, reset, copy, print, no `NaN`/`Infinity`, navigation, and
incompatible-state reset. Do not treat a mock result as evidence.

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

## Local verification only

There is no hosted CI/CD. Record local check results in [project status](project-status.md).
A green local command does not certify a Cloudflare account, a resource diff,
or a deployment.

## PR and deployment sequence

Follow the approved order:

1. **PR 1 — baseline/build:** merged.
2. **PR 2 — math engines/fee rules:** merged.
3. **PR 3 — Astro shell/freelance tools:** this branch.
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
