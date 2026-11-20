# Security boundaries

Report security issues privately to the repository owner. Do not put credentials in public issues.

- Gemini and database credentials are server runtime variables. The public repository contains a names-only .env.example. The private vault, .env.local, provisioning tools and generated output are excluded from Git.
- Write endpoints reject cross-origin requests, oversized streamed bodies and invalid schemas. The server recomputes candidates from supplied-network closure inputs; it never trusts client metric totals.
- Gemini returns only a known feasible candidate and allowed reason references. All displayed quantities come from the simulator. Provider failures retain an explicitly labeled deterministic recommendation.
- Provider requests require an atomic Supabase budget claim. Failure to enforce that quota prevents the external call.
- Saved synthetic scenarios use a random 256-bit HttpOnly, SameSite=Strict browser-session capability. Its SHA-256 hash scopes rows through RLS. This establishes session ownership, not personal identity.
- Runtime uses a publishable database credential, never a service-role or administrator key. Narrow security-definer quota functions check the capability, use an empty search_path, explicit grants and fixed SQL. Privileged migration access exists only in an ignored local provisioning tool.
- Storage is bounded per session and per day. The synthetic flight input contains no personal passenger records. Live database permission proof is claimed only when recorded in STATUS.

Actual verification and remaining limitations are recorded in docs/STATUS.md.
