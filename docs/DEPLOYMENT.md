# Deployment and optional services

Connect main from https://github.com/himanshukr2245/domino-sky to Linux Cloudflare Workers Builds. Use Node 24 and npm 10.9.2. Build: `npm run build`. Deploy: `npx wrangler deploy`. Workers CI activates the postbuild packaging hook. Direct `npx opennextjs-cloudflare build` is also supported. Build dependencies must be installed. Never upload a Windows-built Worker.

Worker runtime server secrets: `GEMINI_API_KEY`, `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`. Optional server variable: `GEMINI_MODEL`, default `gemini-3.1-flash-lite`. Public build variable: `NEXT_PUBLIC_SITE_URL=https://domino-sky.hkr.dpdns.org`. No secret uses NEXT_PUBLIC.

Apply `supabase/migrations/0001_domino_scenarios.sql` once through the selected Domino Sky project's SQL editor or a private TLS provisioning connection. It creates the scenario table, ownership policies, save quota and private durable AI quota in a transaction. Do not commit database connection strings or passwords. Administration credentials are not runtime variables.

Verify a save from browser session A is absent in session B. A cookie capability identifies a browser session, not a signed-in user; clearing it loses access to those saves. Routes use only the publishable key. AI requests fail closed when durable quota cannot be enforced; deterministic recovery stays available.

After deployment, run `npm run check:live -- https://domino-sky.hkr.dpdns.org --expect-head`. Health configuration presence does not prove database or provider access. Configure a real demo video URL before submitting `/demo_video`; it reports unavailable until configured. Record real integration results in STATUS separately from mocked tests.
