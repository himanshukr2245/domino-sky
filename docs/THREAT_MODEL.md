# Domino Sky threat model

Assets: provider credentials and budget, saved synthetic scenario ownership, repository integrity, user trust in operational calculations.

Entry points: recovery and scenario APIs, telemetry, rendered HTML, model output and dependency installation.

| Threat | Control | Evidence |
|---|---|---|
| Credentials reach Git or browser | Server-only imports, ignored local configuration, no service-role runtime key, pre-commit and exact-value scanning | STATUS and SECURITY |
| Cross-origin or oversized writes | Exact origin and fetch-site check, streamed body cap, strict schema | Request and browser rejection tests |
| Client invents operational totals | Server recomputes candidates from closure inputs | Recovery API and pure engine tests |
| Model invents actions or figures | Known feasible candidate IDs and reason code allowlist; locally rendered facts | Gemini boundary tests and live provider proof |
| Other session reads saved scenarios | Random HttpOnly capability, SHA-256 ownership, RLS for each operation | Live REST isolation and forged-owner proof |
| Provider or storage abuse | Atomic database quotas, bounded payloads and timeouts, fail closed for provider spend | Migration and live quota proof |
| XSS | React escaping and one per-request nonce CSP | CSP browser suite |
| Vulnerable runtime package | User-approved security patches and production audit | STATUS |

Accepted limits: a stolen session cookie grants that session's saves; session ownership is not account authentication. Anonymous attackers can create new sessions, so a global daily quota bounds spend. Public publishable credentials cannot identify a human. Telemetry's in-memory throttle is a soft brake; no WAF configuration is claimed. Database or provider outages disable optional actions while deterministic simulation remains available. Physical airline dispatch safety and global optimization are outside this synthetic demonstration.
