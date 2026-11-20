# FACTS (auto-generated — do not edit)
> Generated 2026-11-20T07:58:54.816Z from commit `2524523` by `npm run facts`.
> Quote these numbers exactly. Anything not listed here is an ASSUMPTION and must say so.

| Fact | Value |
|---|---|
| Page routes | 11 |
| API routes | 5 |
| Test files / test cases (static count) | 16 / 73 |
| Source files / lines in src | 143 / 18466 |
| Database tables (from migrations) | 2 (domino_private, domino_scenarios) |
| Total dependencies | 18 |
| HK gates passing (last recorded run) | 15/15 |
| next | 16.3.8 |
| react | 19.2.8 |
| typescript | ^5 |
| tailwindcss | ^4 |
| @opennextjs/cloudflare | 1.20.8 |
| wrangler | ^4.147.0 |
| zod | 4.6.6 |
| vitest | ^5.0.3 |
| @playwright/test | ^1.63.0 |

## Page routes
- `/`
- `/about`
- `/ai`
- `/app`
- `/design`
- `/dimension`
- `/editorial`
- `/settings`
- `/showcase`
- `/studio`
- `/support`

## API routes
- `/api/health`
- `/api/log`
- `/api/recovery`
- `/api/scenarios`
- `/demo_video`

## HK Gate Scorecard
> From `.hk/gates.json` — the last recorded result of each gate on this machine. Re-run the gates before quoting it.

| Pillar | Passed | Last run |
|---|---|---|
| BLD | 2/2 | 2026-11-20T07:41:01.551Z |
| STK | 2/2 | 2026-11-20T07:55:46.158Z |
| SEC | 5/5 | 2026-11-20T07:57:59.786Z |
| PRF | 4/4 | 2026-11-20T07:58:25.621Z |
| OPS | 1/1 | 2026-11-20T07:57:30.647Z |
| other | 1/1 | 2026-11-20T07:41:01.949Z |
| **Total** | **15/15** | 2026-11-20T07:58:25.621Z |

| Gate | Rule | Result | Problems | Warnings | Last run |
|---|---|---|---|---|---|
| check-honesty | BLD-10 | ✅ pass | 0 | 0 | 2026-11-20T07:41:01.551Z |
| check-tokens | BLD-4 | ✅ pass | 0 | 14 | 2026-11-20T07:41:01.188Z |
| check-emojis | DSN-10 | ✅ pass | 0 | 0 | 2026-11-20T07:41:01.949Z |
| check-live | OPS-4/SEC-6/SEC-12 | ✅ pass | 0 | 0 | 2026-11-20T07:57:30.647Z |
| check-chunks | PRF-1 | ✅ pass | 0 | 0 | 2026-11-20T07:55:46.765Z |
| check-weight | PRF-1 | ✅ pass | 0 | 2 | 2026-11-20T07:58:25.621Z |
| check-assets | PRF-3 | ✅ pass | 0 | 0 | 2026-11-20T07:41:03.187Z |
| check-licences | PRF-4 | ✅ pass | 0 | 0 | 2026-11-20T07:55:46.422Z |
| check-secrets | SEC-1 | ✅ pass | 0 | 0 | 2026-11-20T07:41:00.908Z |
| check-secrets (staged) | SEC-1 | ✅ pass | 0 | 0 | 2026-11-20T07:57:59.786Z |
| check-bundle | SEC-2 | ✅ pass | 0 | 0 | 2026-11-20T07:55:45.891Z |
| check-rls | SEC-4 | ✅ pass | 0 | 2 | 2026-11-20T07:41:02.409Z |
| check-dynamic | SEC-6 | ✅ pass | 0 | 0 | 2026-11-20T07:41:54.611Z |
| check-opennext | STK-3 | ✅ pass | 0 | 3 | 2026-11-20T07:55:46.158Z |
| verify-lock | STK-3 | ✅ pass | 0 | 0 | 2026-11-20T07:39:56.055Z |
