# Claude Code

Follow [`AGENTS.md`](./AGENTS.md). That file is the product and operating source
of truth for this repository. Also read
[the project overview](docs/project-overview.md),
[the current status](docs/project-status.md),
[the architecture](docs/architecture.md), and
[the testing and release gates](docs/testing-and-release.md) before taking
ownership of a task.

## UI verification

When a change affects UI, layout, styling, routing, client state, or rendered
data, verify the changed flow end to end in the in-app browser. If the agent
cannot use the in-app browser, use Argent (Chromium CDP) for the same
end-to-end check. Read `argent-device-interact` first (`argent-test-ui-flow`
for a one-off interact-verify loop). Do not finish UI work unverified. Details
are in [`AGENTS.md`](./AGENTS.md).

## After every change

After each batch of edits, before reporting the work complete:

1. Run `pnpm run lint` from the repository root. That one command is Oxlint
   and anti-slop together (`.oxlintrc.json` / `tools/oxlint/anti-slop`). There
   is no separate anti-slop command.
2. If there are findings, fix them. Re-run `pnpm run lint` until it is clean.
   Autofixable findings: `pnpm run lint:fix`, then `pnpm run format`, then
   `pnpm run lint` again.
3. Run `pnpm run format:check` on the same pass. Format files you touched if
   it fails.
4. Do not finish with known lint failures, suppressions, weaker rule severity,
   or type-laundering.

Do not disable anti-slop rules. Provenance and local deviations are in
[`tools/oxlint/anti-slop/UPSTREAM.md`](tools/oxlint/anti-slop/UPSTREAM.md).

## Effect

This repository uses Effect v4 (`4.0.0-rc.112`). `packages/infra` uses Effect
for config/runtime code. `packages/calculators` uses Effect Schema at decode
boundaries. Before writing Effect code, read
[`packages/infra/node_modules/effect/AGENTS.md`](packages/infra/node_modules/effect/AGENTS.md)
completely and follow the links in that file when required. Search
`packages/infra/node_modules/effect/src` for APIs the guide does not cover.
