# HK Starter

The pre-wired template for every new app: Next.js 16 on Cloudflare Workers (OpenNext), with the HK Universal Library's gates, security defaults and tests already in place.

- **Live proof:** https://starter.hkr.dpdns.org
- **House standard:** `2-Plans/universal/00_START_HERE.md` (HK Universal Library v3)
- **Status:** `docs/STATUS.md`

## Start a new app from this template (about 15 minutes)
1. GitHub → this repository → **Use this template** → Create a new repository (private) → clone it with GitHub Desktop.
2. In the new folder: `npm install` (also switches on the pre-commit secret scan).
3. Preview what will change, then do it:
   - `npm run hk:init -- --name "My App" --slug my-app --domain myapp.example.com --modules auth,offline --dry-run`
   - the same without `--dry-run` → answer `yes`
   - add `--brand "#0ea5e9"` to give the app its own colour (light + dark tokens, contrast-checked); hk:init also writes `docs/IDEA.md` (fill it in) and `docs/KICKOFF_PROMPT.md` (paste it to your AI)
   - `--modules`: `none` (core only) · `auth` (accounts, notes in the account) · `offline` (installable, notes on the device) · `auth,offline` (both, synced)
4. `npm run check` → commit ("chore: init my-app from hk-starter") → push.
5. Follow **First deploy** in the new README that hk:init wrote (Cloudflare Workers Builds + your domain); with `auth`, also `docs/SUPABASE_SETUP.md`.

hk:init renames the app (name, slug, domain, database prefix), removes the modules you did not choose (files, packages, tests, smoke paths), writes a fresh README / STATUS / DECISIONS, rewrites the lockfile with the deploy's npm, and deletes itself — it runs once. The `template` workflow proves all four module combinations initialise and pass `npm run check` on every push.

## Flagship Workspaces in this template
- **`/studio` — Creative Canvas Studio:** Visual card creator, tool rack, infinite drafting, letterhead exporter.
- **`/ai` — Minimal AI & Writing Stream:** Hardware VSync-locked streaming typewriter, thought scratchpad, multi-model cognitive selector.
- **`/editorial` — Editorial & Typography Immersion:** Classical reading immersion, terracotta / parchment / cyber theme, drop-caps, 1-click quote card generator.

## 5 Mandatory Laws When Building a New App from this Template
1. **App-Dedicated Homepage Law:** When branching into a new app, completely replace `src/app/page.tsx`. The homepage must be a 100% dedicated showcase of YOUR app's mission and interactive hero demo — never keep the starter template's generic marketing copy, AWS precision cards, or manifesto plates.
2. **Dedicated Working Engine Law:** Adapt `/studio` (or rename to `/workbench`, `/cockpit`) to be the dedicated functional engine for your app's specific workflow.
3. **Desktop-Responsive Viewport Law:** Never lock desktop content inside narrow column wrappers like `max-w-3xl mx-auto` or `max-w-4xl mx-auto`. Use full container width with responsive gutters (`w-full px-4 sm:px-6 lg:px-8 xl:px-12`) and responsive multi-column desktop grids (e.g. 7-column workbench + 5-column live telemetry).
4. **Commercial-Safe Typography & Pure SVG Icons:** Zero demo/restricted fonts (no anti-piracy watermarks). Pure SVG vector icons only — zero emojis in UI controls.
5. **User Simplicity & Serenity Law (LAW-13):** Complexity inside, serenity outside. Build deep heuristic or cryptographic engines under the hood; present an interface of radical simplicity and zero developer jargon. Pass the *Panicked Citizen & Grandmother 2-Second Test*.

## Cross-Platform Standard (HK Universal v3.5)
- **Web Tier:** Next.js 16 + React 19 + Tailwind CSS v4 on Cloudflare Workers (OpenNext).
- **Android Tier:** 100% Pure Kotlin + Jetpack Compose (Compose First, API 36+, Material 3).
- **Shared Brain:** Contract-First CodeGen (`npm run codegen`). Define schemas in `contracts/*.json`; automatically outputs TypeScript types in `src/types/contracts/generated.ts` and Kotlin `@Serializable` data classes.

## Daily work (this template)
1. `npm run dev` — opens http://127.0.0.1:3000.
2. `npm run codegen` — synchronizes contracts from `contracts/*.json`.
3. `npm run check:fast` after every change; `npm run check` before you push.
4. Deploy by `git push` → Cloudflare Workers Builds (build `npx opennextjs-cloudflare build`, deploy `npx wrangler deploy`). Never deploy from Windows.

## The gate ladder
| Command | When | Checks |
|---|---|---|
| `npm run codegen` | after editing `contracts/` | synchronizes TypeScript & Kotlin models |
| `npm run check:fast` | after every task | codegen + route types + `tsc`, ESLint, secrets, design tokens |
| `npm run check` | end of every phase | fast + RLS, honesty, assets, unit tests, build, dynamic rendering, end-to-end tests |
| `npm run check:release` | before a release | check + dependency audit, bundle leaks, route weight, deploy preflight, FACTS |
| `npm run check:live -- <url> --expect-head` | after every deploy | the live site runs your commit · headers, nonce CSP, health, hidden paths, smoke routes |

## Modules in this template
- **offline** — installable app, service worker (pages open with no network), notes in IndexedDB.
- **auth** — Supabase accounts (sign in, email links from your domain, account page, delete everything). Guest mode until you follow `docs/SUPABASE_SETUP.md`.
- **both** — notes saved on the device first, then synced to the account (last write wins, enforced in the database).

## Licence
© 2026 Himanshu Kumar. All rights reserved.
