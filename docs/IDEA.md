# Domino Sky mission

Kind: EVENT / SPRINT. User: airline operations controller. Job: understand the downstream effects of closing an airport, then compare a physically valid recovery.

Platform: public web, selected for desktop operational density and public judge access. Foundation: HK starter with auth and offline modules disabled. No database, personal data, or user accounts are needed.

Visual direction: midnight airspace; solid instruments, cyan selection, amber disruption, linked geography and aircraft timelines, readable operational numbers, reduced-motion support.

Approved provider: Gemini API on the server. Approved host: existing Cloudflare setup through Linux Workers Builds. No new dependencies or pinned-version upgrades.

Execution: follow docs/IMPLEMENTATION_PLAN.md in order, completing one phase and its evidence before starting the next. The user already approved proceeding; do not ask again for routine implementation choices.
