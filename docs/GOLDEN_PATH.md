# Domino Sky golden path

Phase 1: open the home page, open the cockpit, run the default BOM 14:30–16:00 IST closure, select DS0303, inspect its inbound-aircraft cause and CR03 duty, then reset to baseline. Covered by `e2e/golden-path.spec.ts` on mobile and desktop viewports.

Additional journeys prove that edited inputs preserve the previous calculation until rerun, that the page fits the viewport, and that health readiness reports the loaded network. CSP, accessibility in both themes, soft navigation, top-loader feedback, and absence of the removed account library retain independent browser checks.

Phase 2 adds route-to-timeline-to-inspector selection; airport focus that preserves the closure; clearing filters that conflict with external selection; a search empty state; the Kolkata connection shortfall; keyboard airport selection; the full fleet timeline; reduced effects; and captured production layouts with no page errors or horizontal overflow. These are covered by e2e/operations.spec.ts.

The later-phase golden path adds recovery preview, validated apply, before/after comparison, and undo. Those actions remain outside the current implementation.
