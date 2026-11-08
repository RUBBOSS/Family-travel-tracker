# Production Deploy Checklist (go-live on Whop)

Work through top to bottom. Sections 1–3 are mandatory before taking money;
the rest is hardening.

## 1. Database — never let it sleep (CRITICAL on free plan)
The Supabase free tier **pauses projects after ~1 week of API inactivity**.
A paying customer hitting a paused app is a refund + a bad review.

Pick one (both work):
- **Keep-alive ping (free):** point a free uptime monitor (UptimeRobot, etc.)
  at `https://YOUR-PROJECT.supabase.co/rest/v1/countries?select=id&limit=1`
  with header `apikey: <your anon key>`, checking every 3 days. Any 200
  counts as activity and prevents the pause. (A local scheduled ping also
  exists on the seller's machine — but a cloud monitor is always-on.)
- **Supabase Pro (~$25/mo):** no pauses, 30-day backups, real support.
  Recommended the moment you have more than a handful of paying users.

## 2. Hosting
- Push the **private** branch to a **private** GitHub repo (do NOT make it
  public if you sell source licenses).
- Vercel → import repo → add env vars (below) → deploy.
- Custom domain via Vercel → Domains.

## 3. Whop activation — ✅ ALREADY LIVE (done 2026-10-31)
- Product: **Family Travel Tracker** (`prod_pX9s2f5LQAcdj`) → https://whop.com/family-travel-tracker
- Plans: Family $29 (`plan_wFpzmzIAk893C`), Pro $9/mo (`plan_4LhNiPWZUrBCT`), Agency $49 (`plan_ee5Iu88nbRC0j`)
- `.env.local` carries WHOP_API_KEY, WHOP_PRODUCT_ID and the three checkout URLs.
- The license gate is ACTIVE: unlicensed users are gated at `/app`; the demo
  account is bypassed via NEXT_PUBLIC_WHOP_BYPASS_EMAILS.
- Validation uses the current API (retrieve membership by license key, check
  status + product) — implemented in `src/lib/whop.ts`. Verified: fake keys
  are rejected through the real Whop round-trip.
- **Remaining before go-live:** (a) add the listing media/copy on the Whop
  dashboard product page, (b) run one real purchase (or 100%-off coupon) to
  see a genuine license key validate, (c) Vercel env vars when deploying.

## 4. Env vars (Vercel → Settings → Environment Variables)
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
# optional, only when licensing is active:
WHOP_API_KEY=...
WHOP_PRODUCT_ID=...
NEXT_PUBLIC_WHOP_CHECKOUT_FAMILY=...
NEXT_PUBLIC_WHOP_CHECKOUT_PRO=...
NEXT_PUBLIC_WHOP_CHECKOUT_AGENCY=...
```

## 5. Hygiene before real users
- [ ] Change the demo account credentials (`scripts/seed-demo.mjs`) or seed
      a separate demo project — the demo is your sales tool, keep it pretty.
- [ ] Confirm Supabase Auth → Email provider settings match your flow
      (confirm-email off = instant signups; on = verification emails).
- [ ] Set Supabase → Auth → URL Configuration (Site URL) to your domain so
      confirmation/reset links point at the right host.
- [ ] `npm run build` passes locally before each deploy.
- [ ] Supabase → Database → Backups: verify schedule (free tier is minimal).

## 6. Suggested launch order
1. List the **source/template** product on Whop first (zero infra).
2. Turn on the keep-alive monitor.
3. Deploy to Vercel with a custom domain; publish the hosted tiers once the
   gate is verified end-to-end with a test purchase.

## 7. Monitoring
- Supabase → Reports: API traffic, MAU, DB size (watch the 500 MB free cap).
- Vercel → Analytics: traffic on `/`, `/pricing`, `/u/*` (share pages are
  your organic growth loop).
- UptimeRobot (or similar) on your Vercel URL — alerts before customers
  notice anything.
