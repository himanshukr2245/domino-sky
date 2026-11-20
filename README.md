# Domino Sky

See the cascade. Find the recovery. Prove the difference.

A flight disruption simulator for PromptWars 2026, built from the HK starter. The cockpit models airport closures, aircraft delay propagation, passenger connection outcomes, and projected crew duty. Phase 2 adds linked geographic selection, scheduled/projected aircraft timelines, cause chains, turnaround accounting, search, and airport/status filters. Recovery comparison and Gemini integration are planned in Phase 3.

## Run locally

Use Node 24. Install the pinned dependencies with `npm ci`, then run `npm run dev`. Open http://127.0.0.1:3000/app. The app requires no account or API key for deterministic simulation.

Try BOM, 14:30 IST, duration 90 minutes. Inspect DS0302, DS0303, and DS0304, then crew CR03. Reset returns the complete network to baseline.

Select a route or a timeline leg to inspect the same flight across every view. Airport focus filters the view without editing the closure. The timeline starts with affected aircraft and the selected aircraft; choose All aircraft for the complete fleet. The map's View flight details link jumps to the inspector on smaller screens.

For a passenger connection example, choose the Kolkata connection squeeze preset and run it. Open the broken CX14 group's outbound flight, DS0105, and expand Passenger connections in the inspector. The actual projected transfer window explains the missed connection.

## Project records

- [Implementation plan](docs/IMPLEMENTATION_PLAN.md)
- [Current status and verification](docs/STATUS.md)
- [Phase 2 implementation details](docs/plans/PHASE_2.md)
- [Model decisions](docs/DECISIONS.md)
- [Supported claims](docs/CLAIMS.md)
- [Golden path](docs/GOLDEN_PATH.md)

## Validation

`npm run check:fast` checks generated contracts, types, lint, secrets, tokens, honesty, Git, icons, and toolchain. `npm run check` adds assets, domain/unit tests, production build, dynamic rendering, and Playwright on phone and desktop viewports. `npm run check:release` and live checks remain required before release.

## Dataset and assumptions

The supplied synthetic network is preserved in `src/data/flight-network.json`. Times are IST. The engine uses fixed block times, ground holds, and a 30-minute minimum turnaround. Airport movements at reopening are allowed. Connections and crew duty use projected times. Crew breaches describe an infeasible projection. Flight boardings and connection group passengers are separate measures. Airport slot queues, diversions, ferry flights, and reserve crew are not modeled.

## Deployment

Public deployment is not yet verified. Use a public GitHub repository with one branch, `main`, and Linux Cloudflare Workers Builds. Build command: `npx opennextjs-cloudflare build`. Deploy command in Cloudflare: `npx wrangler deploy`. Do not deploy Windows-built Worker output. Set the actual public URL through `NEXT_PUBLIC_SITE_URL`; the example.com fallback is a placeholder only.

Gemini was selected for the later server adviser; no provider API call is implemented in Phase 1. Credentials must remain server secrets. The original brief requires public repository/deployment links and a LinkedIn post; no external post or submission has been made.
