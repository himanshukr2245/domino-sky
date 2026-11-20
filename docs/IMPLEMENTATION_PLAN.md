# Domino Sky — implementation plan

Created: 2026-11-20 · Mission: PromptWars 2026 · Mode: SPRINT
Owner: Himanshu Kumar · Platform: public web · Foundation: HK starter
Status: Phase 1 COMPLETE; Phase 2 next. User selected Gemini API and the existing Cloudflare setup. Execute phases in order and record evidence at each boundary.

## 1. Product decision

Build one flight-disruption operations cockpit. Its promise is: **See the cascade. Find the recovery. Prove the difference.**

The primary user is an airline operations controller answering one urgent question: “If this airport closes now, what breaks next, and which available action protects the most passengers without creating an impossible aircraft or crew schedule?”

The signature interaction is **Rewind to recover**. Choose an airport and closure window, run the disruption, select a delayed flight to expose its cause, preview a validated recovery, and compare the same scenario before and after. Preserve the disrupted result while testing a recovery; do not erase the evidence with the new answer.

This is a decision tool with a cinematic presentation. Every displayed operational number comes from the simulator. Gemini chooses and explains among verified candidates; the simulator owns all calculations and feasibility checks.

## 2. What the review established

Source brief: `4-Projects/1-Hackathons/11-Promptwars/about.md`.
Source network: `4-Projects/1-Hackathons/11-Promptwars/flight_network.json`.
Rules: `2-Plans/universal/00_START_HERE.md`, its referenced build/security/design/performance chapters, and the actual `4-Projects/0-Core/00-hk-starter/AGENTS.md`.

The supplied challenge is “Domino Sky: Flight Disruption Cascade & Recovery Simulator.” It requires airport closure, aircraft-chain propagation, missed passenger connections, crew duty problems, AI recovery recommendations, and a measurable before/after result. The brief requires every AI number to agree with application computation.

The operating day is synthetic, with all clock times in IST. The review found:

| Entity | Supplied quantity | Consequence |
|---|---:|---|
| Airports | 16 | Show the entire network without a map service dependency. |
| Scheduled flights | 70 | Compute a complete scenario locally; no streaming backend is necessary. |
| Scheduled aircraft | 16 | Each aircraft has a spatially continuous ordered rotation. |
| Spare aircraft | 2 | One at BLR, one at DEL; a spare cannot appear at BOM. |
| Crew groups | 16 | Each has a 600-minute duty limit; no reserve crew is supplied. |
| Passenger connection groups | 21 | Track group outcomes separately from flight boardings. |
| Flight passenger boardings | 10,394 | This is not a count of unique people. |
| Passenger connection counts | 659 | Do not add this to boardings and call the sum unique passengers. |

The dataset has no detected duplicate IDs, broken airport references, discontinuous tail rotations, impossible baseline connections, excess seat loads, or baseline turnaround violations. The minimum operational turnaround is 30 minutes. Per-flight `turnaround_before_min` describes the scheduled gap, which sometimes includes recoverable slack; it is not a separate hard minimum.

CR03 has only 10 minutes of baseline duty slack, CR08 has 20, and CR10 has 30. CX14 has only 5 minutes of connection slack. These make causal inspection useful, even when the overall delay initially looks small.

The supplied brief says submission closes at 13:00 IST on 20 November. It requires a public repository, a public deployed web app, and a public LinkedIn post with the organizer tags. It specifies a repository below 10 MB, one branch named `main`, and at most two submission attempts. The official event and PDF links were inaccessible during the review; these facts are from the supplied local brief. No mandatory AI provider or weighted judging rubric was supplied.

## 3. Scope: must, wow, cut

**MUST:** choose any supplied airport; valid closure window; deterministic propagation through every tail; flight departure/arrival deltas; missed connections; projected crew duty violations; realistic candidate validation; before/after metrics; server-side Gemini integration; public web deployment; responsive keyboard-accessible controls; working health endpoint; passing applicable HK gates.

**WOW, in order:** linked network and aircraft timeline; click-to-trace cause chain; a recovery comparison that preserves the disrupted schedule; restrained geographic route illumination; useful preset scenarios; a shareable scenario link and downloadable calculation receipt if time remains.

**CUT:** authentication, Supabase, personal data, real airline feeds, ticket purchasing, live weather, native apps, global route planning, paid map APIs, free-form AI chat, avatars, 3D globes, soundtracks, background particle engines, an admin panel, persistent accounts, and an unrequested pitch deck. Add none of these to rescue an unfinished core flow.

## 4. Visual direction: midnight airspace

Use an aviation control-room composition: deep ink canvas, solid navy instrument panels, crisp silver text, electric cyan for selection and successful recovery, amber for disruption, and rose for broken constraints. Warning meanings always have text or an icon in addition to color. Define every color and surface in the existing theme token system, with a tested light appearance as well as the primary dark presentation.

The main visual is a projected geographic network using the supplied latitude/longitude values. Routes are SVG curves; airport nodes are interactive and have an equivalent accessible list. Give the selected airport a single closure ring. Quiet routes remain dim; affected routes gain amber emphasis; a selected recovery gains cyan emphasis. No random moving aircraft or labels suggesting live air-traffic data.

Use a large, compact sans-serif title, readable sans-serif body text, and tabular monospace operational numbers. Existing system-safe fonts avoid the starter's personal-use display font. Body text starts at 16 px, working labels at 14 px, secondary metadata at 12–13 px. Icons are inline SVG. Buttons use the HK primitives, with generous touch targets and visible focus.

Use depth through composition: a subtle horizon glow behind the network, hairline panel borders, inset timeline tracks, and one focal recovery panel. Most surfaces are solid. At most one ChromaticCard receives restrained accent treatment; opaque precision cards carry the operational content. Avoid a wall of glass cards or gradients on every metric.

Motion follows state changes: route emphasis after a run, timeline movement after a comparison, and a short opacity/position transition when opening the inspector. Animate transform/opacity for a short duration. Disable optional motion for reduced effects and system reduced motion. No global FPS meter, perpetual animation loop, or unsupported speed claims.

### Desktop composition

Top bar: Domino Sky identity, “Simulation · IST,” navigation to Cockpit / About / Support / Settings, appearance controls.

Workspace header: “One closure. A network of consequences.” plus a compact scenario summary and reset action. The operational controls appear immediately, without scrolling through marketing copy.

Left command panel: airport selection, closure start, duration/end, three meaningful presets, Run disruption. Invalid windows produce an inline explanation. Changing inputs marks existing results as belonging to the previous run until rerun.

Central airspace panel: network map with selected airport, affected routes, legend, and an optional time control. Below it, aircraft rotation rows share one time axis and show scheduled versus projected legs. Select a flight in either view to update the same inspector.

Right impact panel: delayed flights, total arrival delay, passenger connection failures, crew breaches, cancellations, and delayed passenger boardings. Open a metric to inspect its contributing flights/groups. The recovery panel shows concrete available actions with feasibility and tradeoffs, then Preview / Apply / Undo.

Bottom or side inspector: selected flight's scheduled/projected times, original/current tail, previous leg, usable turnaround slack, closure constraint, passenger connections, and assigned crew duty. Show an explicit cause chain such as “BOM arrival held until reopening → 25-minute arrival delay → next departure waits for turnaround → crew duty exceeds limit.”

### Mobile composition

At 390 × 844, stack controls, impact summary, network, aircraft list, and recovery. Use horizontally scrollable timeline tracks inside their own region; never create page-level horizontal overflow. Keep the chosen scenario summary visible. Airport choice and the flight list remain fully usable without touching the map. Use a modal/drawer for detailed inspection only when it improves space, preserving focus return and Escape behavior.

### Home and routes

`/` is an app-specific introduction with a working sample disruption and a clear Open cockpit action. `/app` is the complete workbench, directly usable without onboarding. `/about` explains assumptions and provenance through progressive disclosure. `/support` gives scenario help and feedback. `/settings` retains working appearance/effects preferences. `/demo_video` remains a configurable redirect, with an honest unconfigured response until a real URL exists.

Remove or redirect starter demonstrations that otherwise expose unrelated QuoteMaker, fake AI, or template claims. Preserve soft navigation, nonce CSP, telemetry, skip link, and usable error states. The product must read as one application on every reachable route.

## 5. Deterministic simulation contract

### Time and closure

Represent all times as integer minutes from the operating day's midnight in IST. Parse HH:MM strictly; format overflow as the next day. Do not use the visitor's local timezone. Start with one airport closure whose interval is half-open `[start, end)`: arrival or departure at reopening is allowed.

Initial policy is ground holding with fixed supplied block time. No diversions, speed-up, or in-air holding are invented. A departure cannot occur during closure at its origin, and a projected arrival cannot occur during closure at its destination. Move the flight's departure just enough to make the corresponding movement legal, then check both airports again. Record the binding constraint.

For each ordered tail rotation:

`earliest departure = max(scheduled departure, previous actual arrival + minimum turnaround)`

`actual arrival = legal actual departure + supplied block minutes`

Never depart early. The first leg starts at its origin with the supplied tail available. Sort by tail leg order, not by a mutable actual departure time. Closure processing can push times beyond the operating day; formatting and duty calculations must continue to work.

Record distinct explanations for a closure at origin, a closure at destination, and a late inbound aircraft. Keep references to the previous flight so the UI can follow the cascade. If multiple constraints bind, preserve them rather than attributing every minute to the airport closure.

### Passenger connections

Join each group to its supplied inbound and outbound flights. A group misses when `outbound actual departure - inbound actual arrival < min_connect_minutes`, or either required flight is canceled/unavailable. Equality is a successful connection. Recompute after every recovery. A connection by itself never delays a flight unless the user applies a modeled hold action.

Return group status, available connection minutes, shortfall, passenger count, and flight references. Show missed-connection passengers separately from delayed/canceled flight boardings. Do not claim unique travelers or invent rebooking capacity.

### Crew

Preserve supplied crew identity and duty start. Calculate projected duty through the final operated flight's actual arrival. Breach means strictly greater than `max_duty_mins`; exact equality is allowed. Return duty, remaining slack or excess, and affected flights.

The disruption projection may expose an infeasible roster. Label it as a crew breach; do not pretend the flight is legally dispatched. A recovery cannot silently replace crew because a spare aircraft exists. A recommended feasible plan must eliminate relevant hard violations or explicitly declare unresolved ones.

### Airport capacity

The supplied hourly capacities describe operations limits, but the brief supplies no slot-allocation rule. Phase 1 reports capacity as informational context and does not invent queue delays. Later validation may flag a chosen, documented rolling-hour operations interpretation. Do not label the simulator capacity-constrained until that policy is implemented and tested.

### Cancellation, aircraft location, and spares

Cancellation is an explicit recovery action, not a shortcut that makes delay disappear from the objective. A canceled flight carries no operated arrival/departure delay; its passenger boardings are reported as canceled. The aircraft remains at its last actual airport. A downstream flight from a different airport is unavailable until a feasible rejoin or replacement is demonstrated.

A spare has an identity, base, availability time, seats, location, and one assignment at a time. Only BLR and DEL have supplied spares. No ferry flight or reserve crew is invented. A spare may cover an eligible contiguous suffix from its actual location; validate seat capacity, available time, every turnaround, the original crew's ability to operate that suffix, and the rest of the schedule. Exchanging the aircraft does not erase its original crew's earlier delay or create a crew at a new airport.

### Result invariants

Every flight appears exactly once in the result. Operated flights keep block time and legal aircraft continuity. No flight departs early. No airport movement falls within closure. Inputs and source data stay immutable. Identical input produces identical output and stable sorting. All summary values are reductions of result rows. Broken connections and crew duty are calculated from projected times, never stale baseline times.

## 6. Recovery and Gemini

Generate a small bounded candidate set from the disrupted scenario: no action, eligible spare coverage, explicit flight holds where meaningful, and feasible cancellation/rejoin alternatives. Initially favor candidates that can be fully validated over a broad combinatorial search. If no spare can physically help, say so and present a different valid option or declare no feasible candidate found.

For each candidate, rerun the entire deterministic engine and attach a calculation receipt: scenario ID/revision, action list, validation outcomes, canceled boardings, missed-connection passengers, crew breaches, delayed boardings, total arrival delay, passenger-weighted delay, and differences from disruption.

Rank with a visible policy: feasibility first; fewer canceled passenger boardings; fewer missed connections; lower passenger-weighted arrival delay; then fewer interventions. Describe this as the best candidate among those evaluated, never a globally optimal solution. Preserve no-action comparison even when it exposes crew breaches.

User selected **Gemini API**, server-side. Verify current official Gemini API documentation and available model identifiers during its implementation phase. Read `GEMINI_API_KEY` and configurable `GEMINI_MODEL` only on the server. No new provider dependency is needed: use fetch with timeout/abort and a bounded response.

The API accepts a validated scenario/action request, recomputes candidate facts on the server, and sends Gemini only the bounded facts it needs. Ask for structured output containing selected candidate ID, reason codes, and concise explanatory text. Validate the response with the central zod/mini wrapper. Reject unknown IDs, unsupported actions, malformed output, and numeric claims that do not bind to engine facts. Render displayed metrics from engine fields rather than model prose.

If the key is missing or the provider fails, keep the simulator working and show an explicitly labeled rules-based recovery result. Do not present it as a live AI response. Add request size limits, provider timeouts, server-side quota/rate enforcement appropriate to the deployed Cloudflare environment, and an operator-configured provider spending limit. Avoid in-memory-only rate-limit claims on a serverless deployment.

Track request revision and discard stale responses when the user changes scenario or action. Apply never commits an AI string as application state; it commits a validated candidate's action list and recalculated result. Undo restores the preserved disruption.

## 7. Architecture and ownership

Create `4-Projects/1-Hackathons/12-promptwars-domino-sky` from tracked HK starter files in a fresh repository with only `main`. Preserve the original event folder, universal documents, template repository, personal writings, and master assets. Initialize the starter with auth and offline modules disabled. Do not add packages or upgrade pinned versions.

Use Next.js 16 / React 19 / TypeScript / Tailwind 4 and the inherited OpenNext adapter. Pure functions live in `src/lib/simulation/`; immutable supplied JSON lives in `src/data/flight-network.json`. Define domain entities in `contracts/domino-sky.json`, run existing codegen, and consume generated TypeScript types. The existing codegen also produces Kotlin contract artifacts; this does not imply an Android build.

Planned engine files: `time.ts`, `network.ts`, `simulate.ts`, `metrics.ts` if warranted, `recover.ts`, and focused tests. UI lives in `src/components/domino/`, split by controls, network, timeline, impact, inspector, and recovery when complexity requires it. Domain components use existing HK Button/Input/Field/card primitives; add a small accessible Select primitive rather than repeat native styling across pages.

Maintain one source of scenario state and derive results rather than synchronize multiple copies. Store airport, start, and end or duration in a shareable query only after strict validation. Heavy visualization libraries and third-party map SDKs are unnecessary for this network.

Preserve per-request nonce CSP and dynamic rendering. Remove unrelated global FPS monitoring. Public health reports release and app readiness without keys. Use the inherited error boundary and telemetry; capture simulation/recovery failures without logging prompts, credentials, or response bodies containing secrets.

User selected **existing Cloudflare hosting**. Deploy through public GitHub `main` and Cloudflare Workers Builds on Linux. Keep `build: next build`; OpenNext wraps it separately. Never deploy a Windows-built Worker. Use a Linux build to validate the actual Worker, then verify public routes and the live release against the expected commit. Until verified, documentation must say not deployed. No private Sites URL can satisfy the brief's public-link requirement.

## 8. Sequential implementation phases

### Phase 1 — trustworthy foundation and usable cockpit

Goal: a visitor can choose a closure and inspect real computed disruption, connections, and crew impact, with the supplied network preserved and tested.

Steps: create the fresh HK-based repository; initialize core-only modules; write mission/status/decisions/claims; define and generate contracts; copy the dataset; implement strict time helpers and network validation; implement closure and tail propagation; derive passenger and crew results; create an app-specific homepage and functional `/app`; adapt shell and relevant starter end-to-end tests; run the phase gates.

Visual scope: establish token palette, navigation, readable controls, impact cards, and real flight results. A first geographic preview may be included if it uses the same engine; advanced linked timeline, recovery interactions, and cinematic polish belong to later phases.

Required engine tests: zero-impact baseline; exact closure start/reopening; destination ground hold; repeated legal-movement adjustment; slack absorption; no early departure; downstream propagation; connection equality versus shortfall; crew duty equality versus excess; immutable deterministic results; invalid airport/window; correct next-day formatting; all supplied network referential checks.

Hand-verified acceptance fixture: with BOM closed 14:30–16:00, tail VT-DS03 projects DS0302 to 14:50–16:00 (+25 arrival), DS0303 to 16:30–18:40 (+20), DS0304 to 19:10–21:35 (+15). CR03 projects 605 duty minutes, a 5-minute breach. This is a disruption projection before recovery, not a dispatchable plan.

Exit evidence: `npm run check:fast`, domain unit tests, production build, dynamic-page gate, and applicable Playwright checks through `npm run check`; record actual output and limitations in STATUS. If a required inherited gate fails, fix the failure without reducing its standard. A successful type check alone does not complete the phase.

### Phase 2 — cinematic linked operations workspace

Goal: the user understands where a disruption begins and how it spreads without reading a large table first.

Build geographic SVG network, linked flight selection, real aircraft rotation timeline, flight cause inspector, connection details, and crew detail. Add clear scheduled/projected legends, filters, real preset scenarios, mobile composition, and keyboard equivalents. Preserve the Phase 1 engine as the source of truth. Only add playback if it accurately filters a computed schedule and can pause.

Exit: close an airport, select a highlighted route/flight, see the matching timeline and cause, inspect affected connection/crew, and reset. Validate desktop 1440 × 900 and mobile 390 × 844, keyboard navigation, reduced effects, contrast, no page overflow, and browser console. Run the full phase gate and record real screenshots/observations where tooling supports them.

### Phase 3 — validated recovery and Gemini adviser

Goal: preview and apply a defensible action, with arithmetic that can be inspected.

Implement cancellation/location rules and eligible spare candidates first. Test physical availability and crew continuity. Compute all candidate receipts and ranking. Add before/after comparison and undo. Build the server API and provider adapter only after deterministic candidates pass. Validate structured output and stale-response protection. Test missing key, timeout, malformed model result, unknown candidate, and a valid response without exposing credentials.

Exit: a known scenario has a meaningful preview, every displayed difference recomputes, impossible spare proposals are rejected, and AI selection can never alter computed facts. Verify the live-provider path when an actual server key is available; otherwise explicitly record provider integration as unverified and keep the labeled fallback.

### Phase 4 — release, public deployment, and submission readiness

Goal: a judge can use the actual public app, and repository/deployment claims match evidence.

Remove unrelated template routes/copy/assets, verify metadata and demo-video behavior, finish help and assumption text, run security/performance/asset/lock/weight/Worker checks, and inspect dependency audit results. Push the single public main branch, use Linux Workers Builds, configure server secrets privately, verify the public release hash and golden path, and verify no sign-in is required. Check the repository size including relevant Git history against the supplied limit.

Prepare a concise submission checklist with the real public repository URL and deployment URL. Drafting or publishing a LinkedIn post is a separate user-authorized communication action; do not post automatically. Do not spend either submission attempt without user instruction. Create a pitch/demo script only if explicitly requested after the build is ready.

Exit: required release and live checks pass; exact remaining limitations are recorded; public links and final commit are real; no numerical claim is inferred from visual polish.

## 9. Time and stop rules

Treat the supplied 13:00 IST submission deadline as the controlling timebox. Review the clock at phase boundaries. Start deployment setup early enough to allow a failed Linux build to be fixed. If hosting account access is unavailable, finish the deployable repository and exact Cloudflare configuration while the access question remains pending; do not invent a public URL.

Use remaining time for MUST items before WOW items. First cuts are playback, export, share link polish, and decorative animation. Preserve network understanding, correct engine results, usable recovery comparison, and release verification. Freeze features before final verification. Do not change dependency versions during the hackathon to chase optional effects.

At each phase boundary update STATUS, DECISIONS, and CLAIMS with what exists, what passed, what failed, and what remains. Mark incomplete phases as incomplete. Work on one current phase at a time. This plan authorizes sequential implementation; avoid repeated confirmation prompts for already approved work.

## 10. Definition of a strong result

The app opens directly into a comprehensible operational task. A closure produces a reproducible cascade across actual supplied rotations. A flight explains its delay. A connection explains why it succeeds or fails. A crew shows its projected duty. A recovery has a physically possible action list and a preserved comparison. Gemini explains verified facts. The interface feels composed and cinematic while remaining fast, readable, accessible, and truthful.

The distinctive idea is not an extra dashboard tab: it is the ability to move from a beautiful network-wide view to one exact cause, then to a verified recovery, without losing the original scenario.
