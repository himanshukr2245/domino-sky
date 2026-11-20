# Domino Sky decisions

- 2026-11-20: User explicitly approved Next/eslint-config-next 16.4.6, Zod 4.6.6 and compatible security patches. OpenNext is a build dependency. No HK gate script was changed.
- 2026-11-20: Gemini 3.1 Flash Lite produced a validated live recommendation. Supabase schema and real REST session isolation were verified. The database password remains local provisioning-only.
- 2026-11-20: Removed unnecessary local Miniflare initialization: this app uses server fetch and environment values, not Worker bindings. The production adapter remains OpenNext.
- 2026-11-20: Recovery preserves original disruption; physically recomputed candidate outcomes explicitly expose cancellation costs. A 15-minute crew transfer buffer is an assumption.

- 2026-11-20 — Phase 2 completed: full npm run check passed with 101 unit tests and 80 browser checks. Desktop/mobile production screenshots were inspected. Kept the user-requested dev server running and preserved the original simulator, dataset, dependencies and gate scripts. Phase 3 is the next work boundary.

- 2026-11-20 — Phase 2 uses a single selected flight across the map, timeline, manifest and inspector. Airport focus is a separate presentation filter and cannot silently edit the closure. External selection clears conflicting filters.
- 2026-11-20 — Combined route selection chooses the flight with the largest arrival delay, then departure time and ID. The Mumbai–Ahmedabad route therefore selects DS0405 rather than DS0302 in the supplied afternoon scenario.
- 2026-11-20 — The timeline's default scope is exactly affected plus selected aircraft, including a single selected rotation at baseline. All aircraft remains an explicit option. This also reduces initial page work while preserving the complete fleet view.
- 2026-11-20 — Causal inspection follows recorded late-aircraft dependencies and shows scheduled slack, absorbed delay and required turnaround. Pure inspection helpers preserve simulator inputs/results.
- 2026-11-20 — Maps and timelines use SVG/CSS and native controls with equivalent lists/selectors. No visualization package, external map service, simulated playback or new operational assumption was added.
- 2026-11-20 — The user explicitly requested a running project; the local development server remains running at 127.0.0.1:3000. Automatic browser handoff was unavailable/blocked by environment policy; project Chromium tests verify the application independently.

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

- 2026-11-20: Reproduced Cloudflare 1101 in Linux workerd. Next 16.4 loads server/preview-props.json; adapter 1.20.8 omitted it from its manifest inlining. Added a guarded packaging compatibility patch, kept dependency pins, and added a real Worker runtime smoke. Public release c95fbfbb41c6 passed live verification.
