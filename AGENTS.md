# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

A Turborepo monorepo of personal web apps (portfolio, games, small products) sharing a Prisma
package, a utils package, and ESLint config. The apps deliberately do **not** share a single
framework/version — each pins its own Next.js, React, and toolchain. Do not "unify" versions
across apps; the divergence is intentional (see Version divergence below).

## Toolchain

- **Package manager: pnpm 11** (via corepack), **Node 22** (`.nvmrc` = 22.20.0). The README and
  `.node-version` (=20) are stale — ignore them; use pnpm, not yarn.
- pnpm 11 reads its settings from **`pnpm-workspace.yaml`**, not `.npmrc` or a `package.json`
  `"pnpm"` field. That file is heavily commented and is the source of truth for: workspace members,
  `linkWorkspacePackages`, version `overrides`, and `allowBuilds` (build-script allow-list — a bare
  `pnpm install` fails with `ERR_PNPM_IGNORED_BUILDS` if a native dep isn't listed there).
- React is **not** pinned in overrides — each app declares its own so gantt-chart can stay on
  React 18 while the rest use 19.

## Common commands

Run from the repo root (Turborepo orchestrates across workspaces):

```bash
pnpm dev          # all apps in dev (turbo dev)
pnpm build        # build all (turbo build; depends on generate -> ^build)
pnpm lint         # turbo lint
pnpm typecheck    # turbo typecheck
pnpm format       # prettier across the repo
```

Target one app with a filter:

```bash
pnpm dev --filter=portfolio
pnpm build --filter=pokedex
turbo run lint --filter=devpulse
```

Per-app scripts differ — check the app's `package.json`. Notable: `portfolio` uses Vite
(`dev`=`vite`); `language` runs `next dev --experimental-https`; `devpulse` runs on port 3010
with `--turbo`; `rpg-game` is webpack; `visit-stat` has no `typecheck` script.

Prisma client: `pnpm generate:prisma` (root) regenerates from `packages/prisma/schema.prisma`.
`postinstall` runs it automatically unless `SKIP_PRISMA=true`.

There is **no test suite** in this repo — `pnpm test` does not exist at the root, and app `test`
scripts are placeholders. Don't claim tests pass; there are none to run.

## Git hooks (husky)

- **pre-commit**: `pnpm lint-staged` → runs turbo lint `--fix` on staged JS/TS + prettier.
- **pre-push**: `pnpm typecheck && pnpm build` (a full build gate — pushes are slow).
- Both hooks `nvm use` first because pnpm 11 needs Node ≥22.13; the ambient Node may be older.
- `.lintstagedrc.js` uses argument-less command functions on purpose: turbo ≥2.9 treats positional
  args as task names, so staged file paths must not be appended to `turbo run lint`.

## Architecture

### Workspace members

Only these are pnpm workspace packages (see `pnpm-workspace.yaml`):
`apps/devpulse`, `apps/language`, `apps/pokedex`, `apps/portfolio`, `apps/rpg-game`,
`apps/solitaire`, `apps/visit-stat`, and `packages/*`.

**Deliberately excluded** (do not add them to the workspace):

- `apps/2048`, `apps/destructurizator`, `apps/miner`, `apps/snake` — static vanilla-JS demos, no
  `package.json`; deployed separately to Netlify (manual CLI, not from repo pushes).
- `apps/business-ideas` — **no source in git or on disk**, only `.next` build artifacts. Can't be
  built or edited without restoring the source.
- `apps/gantt-chart` — a React-18 CRA app kept **standalone** (its own npm `package-lock`) so its
  transitive `@types/react` stays on 18. Adding it to the workspace pulls `@types/react` 19 from
  the shared store and breaks its typecheck (TS2786).

### Shared packages

- `@repo/prisma` — shared Prisma schema + generated client. `main` points at
  `generated/prisma-client/index.js`, so the client **must be generated** before dependents build
  (turbo's `build`/`typecheck` `dependsOn: ["generate"]` handles this). Schema uses
  `driverAdapters` preview feature: serverless apps (devpulse on Vercel Functions) use
  `@prisma/adapter-neon`; others use the bundled engine. `binaryTargets` includes
  `rhel-openssl-3.0.x` for Linux serverless.
- `@repo/utils` — TS-source package (`main` = `src/index.tsx`, consumed directly, no build step).
- `@repo/eslint-config` — wraps `@vercel/style-guide` + `eslint-config-turbo`.
- Internal deps are declared as `"@repo/foo": "*"` (not the `workspace:` protocol);
  `linkWorkspacePackages: true` in the workspace file links them locally instead of hitting the
  registry.

### Notable apps

- **portfolio** — the flagship. A **Vite SPA** (not Next.js): CSS-3D cube page transitions
  (`src/cube/`), a custom client router (`src/router/router.tsx`), all pages mounted at once
  (`src/pages/`). Uses React 19, three.js / react-three-fiber, framer-motion, GSAP, i18next.
- **devpulse** — Next.js 16 (App Router) news/feed app with AI analysis (AI SDK v5 + Google
  provider), Prisma 6, NextAuth 5 beta. Business logic lives in `app/…` + `lib/` (feed parsing,
  scoring, per-user state).
- **language**, **pokedex** — Next.js 14, Mantine UI, Prisma 5, NextAuth 4 (language).
- **visit-stat** — Next.js 15, Mantine + mantine-react-table. Run locally only.

### Version divergence (expected, not a bug)

Next.js spans 14 → 16 and React spans 18 → 19 across apps by design. Each app's `package.json`,
eslint version, and `@typescript-eslint` version are self-contained. When editing an app, match
**that app's** versions and conventions, not another app's.

## Deployment

- **Vercel**: the Next.js/Vite apps are separate Vercel projects (one per app). `.vercelignore` is
  read from the repo **root for every project's build** — it must only ignore universal artifacts
  (`node_modules`, `.next`, `.turbo`, env files). Never ignore an app's source there: doing so
  strips that project's files, `turbo run build` finds 0 packages, and the build fails.
- **Netlify**: the static game/demo apps (2048, snake, miner, destructurizator) are individual
  Netlify sites deployed manually via CLI — they are not built from repo pushes.
- gantt-chart deploys as a standalone CRA build.

## Conventions

- Commit style: Conventional Commits (`fix(pnpm): …`, `chore: …`) — matches existing history.
- Prisma env: apps read `POSTGRES_PRISMA_URL` (the datasource `url`), not `DATABASE_URL`.

## Code style (author's preferences)

These apply to **new and modified code only** — do **not** proactively refactor untouched files.
When you edit a file, bring the touched code in line; leave the rest as-is unless asked. The
existing codebase is mixed (arrow + function-declaration + vendored `export default` components),
so match the immediate file's local style first, and fall back to these defaults for new code.

- **Don't invent libraries, APIs, or behaviors** — read neighbouring code or ask. For a complex
  change, propose the approach before writing the code.
- **New components/hooks: arrow functions + named exports.** Reserve `export default` for where a
  framework requires it (Next.js `pages/`, the Vite `main.tsx` entry) or vendored files (e.g.
  `components/reactbits/*`).
- **TypeScript:** prefer `type` over `interface` (repo already leans this way); avoid `any`; avoid
  type assertions — narrow instead of casting, and never `as unknown as T` to silence a real error;
  put explicit types on exported APIs (return types, public props, hook return shapes).
- **React:** non-trivial state/effects/orchestration belong in a hook; keep component files focused
  on rendering. Side effects only inside `useEffect`, never during render.
- **Memoize only when referential stability matters** (dep arrays, `React.memo` children,
  virtualised rows) — don't blanket-wrap every callback in `useCallback`.
