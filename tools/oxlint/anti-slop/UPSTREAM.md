# anti-slop provenance

Installed 2026-09-14 into this repository as vendored Oxlint plugins.

## Source

- Repository: https://github.com/dmmulroy/anti-slop
- Commit: [`c44ef22ca116d0ba62a3ff663a0bd13a3f3fa40b`](https://github.com/dmmulroy/anti-slop/commit/c44ef22ca116d0ba62a3ff663a0bd13a3f3fa40b)
- Commit date: 2026-09-10
- Message: Merge pull request #36 (Effect tagged-value and Match rules)
- Install path: `npx skills add dmmulroy/anti-slop --skill install-anti-slop`, then `node .agents/skills/install-anti-slop/scripts/install.mjs`

The copied files were byte-compared against `src/` at that commit. They match the production plugin sources. Upstream RuleTester files (`*.test.ts`) are not vendored; that is the skill copy script's normal behavior, not a local edit.

Nested ESLint Stylistic provenance remains in `vendor/eslint-stylistic/UPSTREAM.md`.

## Installed plugin paths

- Generic: `tools/oxlint/anti-slop/index.ts` (Oxlint name `anti-slop`)
- Effect: `tools/oxlint/anti-slop/effect/index.ts` (Oxlint name `anti-slop-effect`)

## Tooling versions

- `oxlint` `1.82.0` (pinned exact; previously `^1.81.0`, already resolved to 1.82.0)
- `@oxlint/plugins` `1.82.0` (exact, same version as `oxlint`)

## Intentional deviations

- Generic anti-slop rules are enabled at `"error"` for the whole repository.
- Effect rules are registered but enabled only under `packages/infra/**`. `effect` is a direct package-manifest dependency of `@MathMyRate/infra` only. Enabling `prefer-effect-match` repository-wide would impose Effect's `Match` API on calculators, web, and server code that do not use Effect.
- Agent skill directories and this vendored plugin are ignored by Oxlint and oxfmt so installed skills and plugin sources are not treated as application code.

## Check results (2026-09-14)

- `pnpm run check-types`: passed
- `pnpm run format:check`: passed after oxfmt on the edited root `package.json`
- `pnpm run lint`: plugin loaded; 229 diagnostics in owned source (179 `require-readable-spacing`, 50 semantic). No findings in ignored agent dirs or the vendored plugin. No `anti-slop-effect` findings in `packages/infra`. Application cleanup was not part of this install.
