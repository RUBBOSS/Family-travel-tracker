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

## 3. Whop activation (license gate)
The gate code is already in the app and dormant. To activate:
1. Create your product on Whop (whop.com/dashboard) with pricing variants.
2. In Whop → Settings → API, generate a **server API key**.
3. Set these env vars (Vercel + local `.env.local`):
   ```
   WHOP_API_KEY=whop_...
   WHOP_PRODUCT_ID=prod_...
   NEXT_PUBLIC_WHOP_CHECKOUT_FAMILY=https://whop.com/checkout/<family-plan>
   NEXT_PUBLIC_WHOP_CHECKOUT_PRO=https://whop.com/checkout/<pro-plan>
   NEXT_PUBLIC_WHOP_CHECKOUT_AGENCY=https://whop.com/checkout/<agency-plan>
   ```
4. Redeploy. New/unlicensed users now see the license gate at `/app`;
   buyers paste the Whop license key from their purchase confirmation.
5. **Verify against current docs** (docs.whop.com → license keys) before
   launch — the validation endpoint lives in `src/lib/whop.ts`.
6. Test the full loop with a 100%-off coupon before going live.

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
