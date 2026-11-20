# Evaluation evidence

This maps the implementation to the supplied categories without predicting a score.

| Category | Evidence |
|---|---|
| Code Quality | JSON contracts and generated models; pure simulator and bounded recovery planner; separated UI and server modules; TypeScript and ESLint. |
| Efficiency | Bounded candidate search, memoized calculations, native SVG/CSS, indexed database access, explicit AI requests and bounded provider calls. |
| Accessibility | Labeled native controls, keyboard network/timeline selection, status text, semantic comparison table, reduced effects, light/dark axe scans, phone/desktop journeys. |
| Problem Alignment | Airport closure, aircraft cascades, missed connections, crew duty, physical spare/cancel/hold recovery, preserved before/after comparison and undo. |
| Security | Server-only keys, request/origin/size validation, model-output binding, durable quota, session-scoped RLS, secret scanning and production dependency audit. |
| Testing | Simulator, inspection, recovery, provider and request tests; browser workflows, accessibility, CSP, navigation and API rejection tests. Actual results are in STATUS. |
| Google Services | Gemini REST integration with structured candidate selection and fact-bound explanations. Live-provider evidence is recorded separately from mocked tests. |

Assumptions: fixed flight durations and ground holds; supplied 30-minute aircraft turnaround; an explicit 15-minute crew transfer buffer when changing aircraft. No reserve crew, ferry, diversion, capacity queue or rebooking is invented. Canceled boardings and failed-connection passengers stay separate. Ranking is best among evaluated candidates rather than globally optimal.

Cloudflare: build remains next build. In Workers Builds, postbuild packages the completed Next output using OpenNext --skipNextBuild. This addresses a dashboard configured with npm run build without recursively invoking the Next build.
