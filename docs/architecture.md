# MathMyRate architecture

Last updated: 2026-09-14

This document separates the approved target architecture from the code that is
actually present. A target component is not evidence that it has been built.

## Boundaries

```text
Astro prerendered route/content
          |
          v
browser calculator island (future; Preact deferred)
          |
          v
framework-independent @MathMyRate/calculators
          |
          +--> validated fee/rule configuration (future provider coverage)

existing Hono/oRPC + Better Auth + Drizzle/D1 server remains separate
Alchemy owns the Cloudflare Workers/static-assets deployment boundary
```

The launch calculation path is browser-local. It does not require a login,
provider connection, runtime database, or calculator API. Explanatory content
and meaningful defaults should be in generated HTML before hydration. Do not
send user-entered financial values to analytics or automatic share URLs.

## Repository roles

- `apps/web` is the Astro presentation and content application. It currently
  contains the starter home, login, signup, and dashboard pages; calculator
  routes and islands do not exist yet.
- `packages/calculators` is framework-independent TypeScript. It owns validated
  inputs, calculation results, named totals/line items, rounding policy,
  assumptions, warnings, and unsupported conditions. UI parsing and formatting
  remain consuming-layer concerns.
- `apps/server`, `packages/api`, `packages/auth`, and `packages/db` are
  existing starter backend/auth/database source. They are retained and are not
  a requirement for public calculator keystrokes.
- `packages/infra/alchemy.run.ts` remains the infrastructure owner. It defines
  the existing D1 database, server Worker, Astro website, KV session namespace,
  and Images resource. No resource migration or deletion is part of the MVP.

## Math representation and contracts

Money is represented as bigint integer cents at the engine boundary. Rates and
percentages use integer basis points, with 10,000 basis points equal to 100%.
Calculations must avoid unreviewed binary floating-point rounding. Any
conversion to a display number happens after the exact calculation.

Runtime guards reject malformed records, wrong money types, unsafe integers,
negative/out-of-range money, invalid percentages, and zero or impossible
capacity. A calculation returns a validated result or explicit errors; it must
never silently clamp a negative receipt, coerce an unparsed field, or return a
plausible fallback.

The current freelance engine applies the annual tax gross-up once, computes
billable capacity from weeks, hours, and billable basis points, and rounds
required cents upward when division is needed. Project pricing applies
contingency to labor and adds direct expenses separately. A returned
tax-aware hourly rate must not receive a second automatic tax reserve.

The fee-engine contract follows the same exact representation and requires
runtime schema guards for provider, account market, settlement/charge currency,
payment product, channel, percentage/fixed components, fee bases,
conditional/additive behavior, caps/tiers, rounding, official source URL,
reviewed date, known effective date, exclusions, and custom-rate precedence.
For a simple linear inverse, calculate a candidate gross, round it up to cents,
recompute actual deductions, and adjust until net meets the requested target.
Transaction counts multiply fixed charges per transaction. Caps, tiers,
separately rounded components, and tax-inclusive bases need their own rules.

Validation, boundary, and brute-force inverse tests are part of the fee-engine
contract. Tests must be independently derived rather than generated from the
implementation's own answer. Provider behavior that cannot be sourced is
unsupported or disclosed as an estimate, never invented.

## Rendering and hosting

The checked-in web config selects `output: "static"`, so the target public
calculator pages are prerendered assets with small browser islands. Astro's
on-demand rendering documentation confirms that server output needs an adapter;
that is not a reason to switch this app back to server output for a calculator
keystroke.

Alchemy's `Cloudflare.Website.Astro` resource remains the deployment path.
Cloudflare Workers static-assets documentation is the reference for asset
routing behavior, nested paths, and the eventual staging smoke test. No second
Wrangler deployment path is introduced.

Official references checked **2026-09-14**:

- [Astro on-demand rendering](https://docs.astro.build/en/guides/on-demand-rendering/)
  — default/static versus adapter-backed server rendering.
- [Cloudflare Workers static assets](https://developers.cloudflare.com/workers/static-assets/)
  — Worker/static-asset routing and deployment behavior.
- [Astro testing](https://docs.astro.build/en/guides/testing/)
  — production build/preview and Playwright testing guidance.

These links are framework guidance, not a certification of this repository's
build or Cloudflare deployment. The installed declarations were checked
separately: Astro `^7.3.1` in `apps/web/package.json`, and Alchemy plus the
Alchemy Astro frontend integration at `2.0.0-beta.77`. Do not blindly apply a
guide for the latest release; re-check the lockfile and installed versions
before adding an adapter, integration, or Preact.

## UI sequencing

Preact is deferred until the first real calculator island and must be tested
against the locked Astro/Alchemy versions before installation. Use native
accessible controls unless a richer control has a demonstrated benefit. The UI
must consume the engine's real results, display assumptions/exclusions and
warnings, preserve focus during recalculation, support reset/copy/print, and
never ship mock financial results.

The current four starter routes and auth navigation are not the target public
information architecture. Replace or hide starter navigation only as part of
the reviewed Astro shell work; do not imply that the current starter dashboard
is a MathMyRate launch feature.

## Source ownership

Provider fee configurations and visible methodology must share one authoritative
source of rules. Every meaningful rule change updates its direct official source
URL and actual review/effective dates. Gemini, model output, search snippets,
aggregators, and undocumented assumptions are discovery aids at most, never
authoritative sources. See [the agent guide](../AGENTS.md) for the required
source-audit procedure.
