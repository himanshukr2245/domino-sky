# Domino Sky decisions

- 2026-11-20 — Phase 1 completed: full check passed with 93 unit tests and 68 browser checks; production visual inspection found no page errors or viewport overflow. Phase 2 is the next work boundary; no later-phase feature is claimed complete.

- 2026-11-20 — User approved the Domino Sky cockpit direction and requested a detailed plan followed by phase-by-phase implementation.
- 2026-11-20 — User selected Gemini API and the existing Cloudflare setup. Provider integration and public deployment remain later-phase work.
- 2026-11-20 — Seeded a fresh repository on main from tracked HK starter files; did not copy secrets, dependencies, or template Git history. Installed physical project dependencies with npm ci after rewriting the lock using npm 10.9.2.
- 2026-11-20 — Disabled auth/offline with the template initializer. Retained nonce CSP, dynamic rendering, telemetry, and the inherited gate ladder without editing gate scripts.
- 2026-11-20 — Domain contracts live in contracts/domino-sky.json; existing codegen emits TypeScript and Kotlin contract artifacts. No Android app is planned.
- 2026-11-20 — Adopted fixed block times and ground holding, half-open closure boundaries, no early departure, and the supplied global minimum turnaround. Scheduled turnaround gaps are slack, not additional operational minimums.
- 2026-11-20 — Passenger groups never implicitly hold flights. Projected crew duty uses actual final arrival and flags a breach without pretending dispatch is authorized.
- 2026-11-20 — Boardings and connection group counts remain separate. Hourly airport capacities remain informational until a slot policy is implemented.
- 2026-11-20 — Replaced the home and /app template demos with a functioning simulator; removed global FPS monitoring and replaced unrelated shell navigation. Advanced timeline/recovery polish remains Phase 2/3.
- 2026-11-20 — Removed personal-use font references; the app uses the existing system sans and monospace families. No map SDK or visualization dependency was added.
- 2026-11-20 — Corrected the inherited appearance control to resolve system light/dark consistently with the document. Browser checks must exercise actual switch roles and hydration rather than stale template selectors.
- 2026-11-20 — /demo_video returns an honest unconfigured response until a real HTTPS target is supplied, replacing the starter fallback.
