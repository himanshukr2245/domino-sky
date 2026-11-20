# Domino Sky claims

Updated 2026-11-20. This file replaces the template's product claims.

| Claim | Status | Evidence or limit |
|---|---|---|
| Uses supplied synthetic network | FACT | src/data/flight-network.json is copied from the hackathon input; 16 airports, 70 flights, 16 scheduled tails, 2 spares, 21 connection groups, 16 crew groups. |
| 10,394 flight passenger boardings; 659 summed connection passengers | FACT | Reductions of the supplied input, checked in simulation tests. Neither is a unique-person count. |
| Deterministic closure and aircraft cascade | TESTED | 71 domain tests passed on 2026-11-20, including all-airport closure invariants and a hand-calculated BOM fixture. |
| Phase 1 browser and build verification | TESTED | npm run check passed: 93 unit tests, production build, dynamic-page gate, 68 Playwright checks across 390 × 844 and 1440 × 900 viewports. Additional production screenshots had no page errors or horizontal overflow. |
| Phase 2 inspection calculations | TESTED | 79 simulator/inspection tests pass, including the original 71 simulator tests and 8 inspection tests. DS0303 absorbs 5 inbound delay minutes and inherits 20. The CCU 12:00–13:00 preset makes CX14 55 minutes short, with 20 passengers. |
| Phase 2 unit/build/browser verification | TESTED | npm run check passed: 101 unit tests in 5 files, production Next build, dynamic-page gate, and 80 Playwright checks on 390 × 844 and 1440 × 900 viewports. Production screenshots reported no page errors or horizontal overflow. This does not establish live/public or real-device performance. |
| Linked operational inspection | TESTED | e2e/operations.spec.ts verifies route/timeline/manifest/cause selection, airport focus without closure edits, filter reset, connection shortfall, keyboard control, all-aircraft scope, reduced effects and captured layouts. |
| Mumbai fixture: DS0302 +25, DS0303 +20, DS0304 +15; CR03 duty 605/600 | TESTED | simulate.test.ts, closure BOM 14:30–16:00 IST, fixed blocks, 30-minute minimum turnaround, before recovery. |
| Capacity queues, diversions, reserve crew | NOT MODELED | Airport capacity is informational in this phase. |
| AI recovery and before/after recovery | PLANNED | Later phases. No live Gemini request exists in Phase 1. |
| Public deployment | UNVERIFIED | No live public URL or Linux Worker build has been verified. |
| Performance, frame rate, optimal recovery | UNCLAIMED | No measured performance or globally optimal search claim. |
