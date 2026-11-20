# Domino Sky status

Updated 2026-11-20. Phases 1 and 2: COMPLETE. Next phase: 3, validated recovery and Gemini adviser. Public deployment: not verified. Gemini: not implemented. No external publication or hackathon submission has been made.

## Phase 2 implementation and verification

The user requested a running local preview and the next phase. The development server is running at http://127.0.0.1:3000/app and is intentionally left running for the user. Logs and launcher PID are under .hk/runtime/ (ignored by Git). This explicit user request authorizes the development server despite the template's default instruction not to launch servers for the human.

Implemented linked map routes and airport focus, scheduled/projected aircraft timelines, a shared selected-flight state, dependency-only cause chains, turnaround accounting, per-flight connection details, crew duty detail, flight search and status filters, clear/empty states, the Kolkata connection squeeze preset, and a refined responsive cockpit. Pure inspection helpers reuse the existing simulator; recovery and provider calls remain outside Phase 2.

- npm run check:fast passed after implementation.
- Domain simulator/inspection tests: 79 passed.
- Full unit suite: 101 passed in 5 files.
- Production build and dynamic-page gate passed.
- npm run check passed, including the fast gate, asset checks, 101 unit tests, the production build, dynamic-page gate, and all 80 browser checks. The final browser run completed with 80 passed and no failures.
- Production layouts captured at .hk/qa/phase2-desktop.png and .hk/qa/phase2-mobile.png and visually inspected. The screenshot cases reported no page errors or horizontal document overflow.
- Browser coverage includes linked route/timeline/manifest/cause selection, airport focus that preserves the closure, conflicting filter reset, empty search, the exact CX14 shortfall, keyboard controls, a one-aircraft baseline and complete fleet view, reduced effects, both themes, CSP, soft navigation and top-loader feedback.
- The initial full run had 77 passing checks and 3 failures: two route tests expected the wrong representative flight and one hydration wait timed out. The route expectation was corrected to the documented largest-delay choice, and the baseline timeline was corrected to show affected plus selected aircraft. The final full gate passed without changing timeouts, skipping tests or weakening gate scripts.
- The in-app browser has no connected session. The environment command policy blocked automatic browser-window launch, so the user was given the direct local URL. The project browser tests run in isolated Chromium for software verification.

## Implemented in Phase 1

Fresh core-only HK-based app; generated domain contracts; preserved and validated input network; deterministic airport closure and aircraft propagation; missed connection and projected crew calculations; an app-specific home and /app cockpit; geographic network preview; flight cause inspector; passenger/crew detail; light/dark appearance; model help; honest health/demo-video endpoints.

## Phase 1 verification

- Pinned dependency install succeeded with physical project node_modules.
- Domain tests: 71 passed, including the independently calculated Mumbai fixture.
- Full unit suite: 93 passed in 4 files.
- npm run check:fast: passed.
- npm run check: passed, including asset/security/token checks, the unit suite, production Next build, dynamic-page check, and 68 Playwright checks on phone/desktop viewports.
- Browser coverage includes the actual Mumbai run/inspection/reset, edited-input behavior, viewport overflow, light/dark accessibility, nonce CSP, theme switching, soft navigation, and top-loader feedback.
- Separate production visual inspection captured .hk/qa/phase1-desktop.png and phase1-mobile.png. Both showed no page errors and no horizontal page overflow. The temporary QA server was stopped.
- No release, Worker runtime, live deployment, provider request, or real-device accessibility claim has been verified. Browser viewport checks do not replace real-device testing.

The check output includes inherited token-check exemptions for the remaining template demonstrations and Next's middleware deprecation notice. Gates were not changed or weakened. Middleware remains per the pinned OpenNext template compatibility policy.

## Remaining phases

3: cancellation/spare feasibility, candidate ranking, recovery comparison/apply/undo, Gemini server integration.
4: template cleanup, release gates, Linux Worker build, public deployment and live verification, real submission links.

## Known limitations

No recovery engine or AI request yet. No airport capacity queue, diversion, ferry, reserve crew, or rebooking model. No unique traveler count. Some inherited demonstration routes/components remain pending cleanup; they are absent from primary navigation. The example.com metadata fallback is a placeholder. No live URL or performance claim has been verified. The local preview is available only on this computer; viewport checks do not establish physical phone/device or assistive-technology coverage.
