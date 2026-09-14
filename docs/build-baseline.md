# Build baseline

## Product direction

MathMyRate will provide six free tools: freelance hourly/day rate, freelance
project rate, Stripe fees, PayPal fees, Gumroad fees, and Lemon Squeezy fees.
Public pages use Astro prerendering with small interactive islands. Calculation
logic lives independently of UI in `packages/calculators`.

The calculator package currently provides only input validation and the test
harness. Financial formulas, decimal arithmetic and provider presets are later
work, not implemented calculators.

Keep the existing Hono/oRPC/Better Auth source and Alchemy infrastructure.
This baseline does not provision, remove or migrate any Cloudflare resource.

## Commands

Use Node.js 24 and the pnpm version pinned by `packageManager`.

```sh
pnpm install --frozen-lockfile
pnpm run check
pnpm run check-types
pnpm run test
PUBLIC_SERVER_URL=https://api.example.invalid pnpm run build:web
```

`pnpm run ci` combines those checks when `PUBLIC_SERVER_URL` is supplied.
`check` is now read-only; use `pnpm run format` explicitly to apply formatting.
Tests use Node's native TypeScript support without an extra test runner.

The invalid API origin is a **compile-only fixture**, not a runtime fallback.
The starter's browser-side health/auth requests will fail against that origin.
Do not publish this local compile output. Alchemy injects the real server URL
during its deployment build; standalone runtime builds must supply the actual
API origin. No auth secrets, database credentials or Cloudflare credentials
are required for these local checks.

## Rendering and compatibility

The existing pages have client-side health/auth behavior and can be prerendered.
Static HTML does not grant access to protected API data; the backend retains its
authorization responsibilities. This is not an authentication redesign.

The installed Alchemy frontend integration supports Astro static output and
selects assets-only deployment for that mode. Alchemy continues to own Workers
deployment. No second Wrangler deployment path is introduced.

Astro's generated prerender runtime imports `cookie` directly. The frontend
declares Astro-compatible `cookie` 2.x explicitly so strict pnpm installs do not
resolve an older ancestor-workspace copy (which lacks `parseCookie`). This is a
build dependency-resolution fix, not a change to authentication behavior.

Installation also reports an existing Alchemy/Hono peer mismatch:
`@alchemy.run/frontend-frameworks` requests Hono ^4.12.14 but the resolved
infrastructure dependency is 4.11.4. The standalone build passes; staging
compatibility remains a release gate rather than an assertion of this PR.

This change does not certify a Cloudflare deployment: the actual account,
resource diff, bindings and staging behavior still require validation before
release. Do not remove the existing D1/KV/server resources as a side effect of
using static frontend output.

The planned Preact island integration is deferred until the first calculator UI.
It is not installed or claimed compatible by this baseline. Check compatibility
against the locked Astro/Alchemy versions at that point.

## Initial observations

Before changes, frozen installation and workspace typechecking passed.
Astro reported three pre-existing unused-variable/import hints.
Formatting passed; lint failed on a path-based triple-slash reference and an
unnecessary empty export. Standalone `astro build` failed with
`NoAdapterInstalled` because the config selected server output without an adapter.

The baseline fixes those lint issues and makes the standalone frontend build an
actual Turbo task.

## Local checks, no hosted CI

This repository does not use GitHub Actions or other hosted CI/CD. Run lint,
types, tests, and the standalone web build locally. Deploy with the existing
Alchemy commands when a deployment is explicitly requested.

See [project status](project-status.md) for current local verification and
remaining release gates.
