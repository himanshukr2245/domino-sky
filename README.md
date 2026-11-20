# Domino Sky

See the cascade. Find the recovery. Prove the difference.

A flight disruption and recovery cockpit for PromptWars 2026, built with Next.js, TypeScript, Gemini and Supabase on the HK starter. Close an airport, follow aircraft delays, inspect missed passenger connections and crew duty, then compare a validated recovery before applying it.

[Open cockpit](https://domino-sky.hkr.dpdns.org/app) | [Verification status](docs/STATUS.md) | [Evaluation evidence](docs/EVALUATION.md)

## Try it

Run the default Mumbai closure, 14:30-16:00 IST. Select flights across the map, timeline and inspector. Preview the recommended recovery, compare its consequences, apply, then undo. Gemini reviews computed candidates when configured. Saved scenarios use a private browser session when the database is available. Explicit status messages identify unavailable services.

## Run locally

Use Node 24, npm ci, then npm run dev. Open http://127.0.0.1:3000/app. Simulation and recovery need no credentials. Put optional service values only in ignored .env.local or Cloudflare server secrets; .env.example contains names only.

## Model and safety

The deterministic engine preserves the supplied synthetic network. Fixed block times, ground holds and the supplied 30-minute aircraft turnaround constrain flights. Crew changing aircraft use an explicitly modeled 15-minute transfer buffer. Cancellation leaves aircraft and crew at their last operated location. Spares must satisfy location, availability and seats. No ferry, reserve crew, diversion, capacity queue or rebooking is invented.

Every recovery is recalculated and ranked by feasibility, canceled boardings, failed-connection passengers, passenger delay and intervention count. Best evaluated does not mean globally optimal. Boardings and connection-group passengers remain separate measures.

Gemini returns a known candidate ID and allowed reason codes through a server endpoint. Strict validation binds it to a calculated feasible plan. Displayed numbers and explanations come from engine facts. A durable quota must succeed before a provider request. Provider failure keeps an explicitly labeled deterministic recommendation.

Saved scenarios contain closure inputs and a validated plan ID. An HttpOnly browser capability is hashed before database use; row-level security isolates sessions. This is session ownership, not account authentication. Runtime code uses a publishable key, never a service-role or database password.

## Validation

npm run check:fast checks generated contracts, types, lint, secrets and toolchain. npm run check adds unit tests, production build, dynamic rendering and phone/desktop browser checks. npm run check:release adds dependency audit, lock compatibility, bundle, license and OpenNext checks. GitHub CI rehearses the actual Linux Worker build and dry run. Actual results and unverified integrations are recorded in [STATUS](docs/STATUS.md).

## Deployment

Use Linux Cloudflare Workers Builds. Build command: npm run build. Its Workers-only postbuild packages completed Next output through OpenNext --skipNextBuild. Deploy command: npx wrangler deploy. Direct npx opennextjs-cloudflare build is also supported. Never upload a Windows-built Worker. See [deployment setup](docs/DEPLOYMENT.md), [security](SECURITY.md), [plan](docs/IMPLEMENTATION_PLAN.md) and [recovery design](docs/plans/PHASE_3.md).
