# Phase 3 — validated recovery, Gemini, Supabase

Current phase. User supplied the public repository, Cloudflare URLs and the Domino Sky Supabase project. Latest explicit deadline: 13:30 IST on 2026-11-20. The quoted countdown conflicts with that time; use the explicit deadline as the conservative timebox.

## Deliverables

1. Extend the contract-first simulator for explicit cancellation, departure holds and spare-aircraft suffix assignments. Preserve no-early-departure, closure and aircraft continuity rules. A canceled leg leaves aircraft and crew where they last actually arrived; unavailable downstream legs are accounted for as canceled.
2. Preserve original crew assignments. A crew changing aircraft must arrive at the departure airport and have a 15-minute transfer buffer. This is an explicit model assumption, because the dataset supplies no crew-transfer minimum. The supplied 30-minute aircraft turnaround still applies to each physical aircraft. Spares remain limited to their actual supplied location, availability and seats; no ferry or reserve crew is invented.
3. Generate a bounded, deterministic set of candidate plans; rerun every plan; rank feasibility, canceled boardings, failed-connection passengers, passenger-weighted delay, and intervention count. Show the best evaluated candidate rather than claim global optimality. Include no action, crew-safe repair, cancellation-only repair, spare alternatives and connection holds when feasible.
4. Add preview, preserved before/after metrics, apply, undo and an inspectable action list. Clearly label cancellations and unresolved crew violations. Numeric fields of canceled flights are absent rather than presented as operated times.
5. Integrate Gemini through a server endpoint with structured output: known candidate ID and allowed reason/metric references. Render explanations and all numbers from engine facts. Reject unknown IDs, unsupported facts and malformed responses. Keep an explicitly labeled deterministic fallback. Bound input/output, abort slow requests, reject cross-origin requests, and enforce provider quota before requests. Discard stale client responses after scenario changes.
6. Connect the user-selected Supabase project for saved scenario inputs. Use server-only publishable credentials, an HttpOnly session capability, and database ownership enforcement. Do not use a service-role key in request handlers. Apply an additive migration through a one-time provisioning connection; privileged database credentials remain outside runtime app configuration and source control. Test ownership isolation and direct access denial.
7. Add documented Google service integration, threat model, setup and evaluation evidence. Do not promise an evaluator score. Keep all real credentials out of source, command arguments, logs, API responses and browser bundles. The vault is read-only. Local runtime secrets live in ignored .env.local; public .env.example contains names only.

## Files

contracts/domino-sky.json and generated models; src/lib/simulation/simulate.ts, recover.ts and tests; server modules under src/lib/server; API routes for recovery and scenarios; recovery/saved-scenario components and their cockpit integrations; supabase/migrations; CSS; e2e coverage; environment example and project records. Preserve pinned application dependencies and copied HK gate scripts. A local ignored PostgreSQL provisioning tool may be used without adding a runtime application dependency.

## Exit evidence

Meaningful tests for cancel/rejoin and unavailable suffixes; spare location, availability, seats and single occupancy; original crew continuity; hold propagation; candidate feasibility and arithmetic; Gemini response binding, failures and timeout; request validation/origin/body bounds; saved-scenario ownership; before/after/apply/undo browser flow; full HK gate; exact secret-value scans of tracked files/history and browser artifacts without printing those values. Verify the live provider and database when credentials/network access permit, and record any unverified path explicitly.

Public repository: https://github.com/himanshukr2245/domino-sky
Primary domain: https://domino-sky.hkr.dpdns.org/
Worker domain: https://domino-sky.white2devil22.workers.dev/
