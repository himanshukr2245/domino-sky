# Phase 2 — linked operations workspace

Started 2026-11-20. Prerequisite: Phase 1 committed at be17684, full check green. User requested a running local preview and the next phase. Local preview is http://127.0.0.1:3000/app, with hot reload and an explicitly user-authorized persistent development server.

Status: COMPLETE. Full npm run check passed: 101 unit tests, production build, dynamic-page check and 80 browser checks. Production screenshots are .hk/qa/phase2-desktop.png and phase2-mobile.png. The local preview remains running; Phase 3 is next.

## Outcome

A controller can run a disruption and move between geography, an aircraft rotation, a flight's cause chain, and its passenger/crew effects without losing the scenario. Keep the deterministic engine unchanged and make selection a shared presentation state.

## Implementation sequence

1. Add pure inspection helpers: unordered route grouping, cause-chain traversal through actual late-aircraft references, and turnaround slack accounting. Test the independent Mumbai fixture and first-leg/no-cause cases.
2. Split the cockpit into focused components for scenario controls, impact, network, timeline, flight list, flight inspector, and passenger/crew details. Keep scenario inputs separate from the last computed scenario. Reset clears the result and view filters.
3. Give the geographic view selectable routes and airports, a clear focus summary, an equivalent airport selector, selected-route flight choices, and consistent scheduled/delayed/selected legends. Airport focus changes the view rather than silently editing the closure. Distinguish the selected route from the closed airport.
4. Add a real aircraft timeline with one shared time extent, separate scheduled/projected tracks, selected-leg emphasis, and duty-risk labels. Default to affected rotations after a disruption, while keeping the selected aircraft visible. Permit an all-aircraft view. Contain horizontal timeline scrolling on small screens; the document must fit the viewport.
5. Expand inspection with a clickable causal chain, turnaround slack versus inherited delay, exact scheduled/projected times, connection group available/minimum transfer time, and projected crew duty. Select a cause flight to inspect it consistently in every view.
6. Add working flight status and airport filters, text search by flight/tail/airport, explicit empty states, and meaningful scenario presets including a connection squeeze. Clear filtering must restore results without rerunning or changing the calculation.
7. Refine the cinematic composition using solid panels, a restrained geographic glow, tabular numbers, vector graphics, readable status labels, and the inherited theme tokens. Keep body text at 16 px, working labels at 14 px, and secondary metadata at 12–13 px. Respect system reduced motion and the existing Reduce effects preference. Do not add decorative continuous animation.
8. Verify selection continuity, real delay/slack numbers, airport focus, filters, keyboard route/flight access, theme contrast, reduced effects, mobile overflow, CSP, soft navigation, and the existing golden path. Run the full HK phase gate and preserve the preview server for the user.

## Interaction rules

- A scenario run is explicit. Editing controls does not replace the current result until Run disruption.
- Route selection chooses a real flight on that route, preferring a delayed flight when available. Selected flight ID drives map emphasis, timeline emphasis, and the inspector.
- Airport focus is a view filter. It is separate from the closure airport and has a visible clear action.
- Selecting a flight through any view clears conflicting filters so that the selection can be found in the flight list. The active aircraft stays visible in the timeline.
- The cause chain follows recorded late-aircraft dependencies, not every earlier leg of a tail. Turnaround slack is scheduled ground gap minus the supplied operational minimum. Absorbed delay is bounded by both slack and inbound arrival delay.
- A supplied passenger connection is successful at exact equality with its minimum. A crew roster is within its limit at exact equality. Inspection reuses these engine outcomes.
- All operational values derive from the existing result. No AI response, playback state, or invented live data is introduced in this phase.

## Scope boundary

Recovery actions, cancellation/spare validation, Gemini calls, and deployment belong to later phases. Playback is deferred to preserve reliable selection, inspection, and release time. No new packages or changes to copied HK gate scripts.

## Evidence to capture

Record actual unit/browser counts, production build and dynamic gate, desktop/mobile screenshots, browser errors, keyboard interaction, reduced effects, and final commit in STATUS/CLAIMS/DECISIONS. The local preview is not a public deployment. The in-app browser connection was unavailable; local browser handoff through Windows was blocked by the environment command policy. Use the project’s automated browser tests for verification and the direct localhost link for the user.
