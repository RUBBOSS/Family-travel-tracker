# Buyer Setup Guide — from clone to running in ~15 minutes

## 1. Prerequisites
- Node.js 18+ (https://nodejs.org)
- A free Supabase account (https://supabase.com)
- A free Vercel account (only if deploying — optional)

## 2. Install

```bash
npm install
```

## 3. Create your Supabase project
1. Go to supabase.com → **New project** (any name, any region close to you).
2. Save the database password somewhere safe.

## 4. Run the database setup (2 scripts, in order)
Open the **SQL Editor** in your Supabase dashboard and run, one at a time:
1. `supabase-unified.sql` — tables, row-level security, 193 seeded countries, auth triggers
2. `supabase-migration-2.sql` — bucket list table + public share-page function

## 5. Add your keys
Copy `.env.local.example` to `.env.local` and fill in from **Supabase → Settings → API**:
```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```
No other keys are required. (Whop keys are optional — see deploy-checklist.md.)

## 6. Run

```bash
npm run dev
```

Open http://localhost:3000 — create an account, add family members, color the world.

## 7. Optional: the demo account
The landing page's "Try live demo" button logs into a seeded account.
- In Supabase → Authentication → Providers → Email, **disable "Confirm email"** (so demo login is instant).
- Seed it: `node scripts/seed-demo.mjs`
- Credentials are defined at the top of `scripts/seed-demo.mjs` — change them before selling access.

## 8. Deploy (optional)
Push to GitHub → import the repo on Vercel → add the two env vars → deploy. See `deploy-checklist.md` for the production checklist (custom domain, backups, the free-tier pause pinger).

---

## Rebranding checklist (Agency license)
| What | Where |
|---|---|
| App name | `src/lib/i18n/en.ts` → `tracker.appTitle` (repeat in `ru.ts`, `hy.ts`) |
| Colors | `src/app/globals.css` (teal accents) + `tailwind.config.js` (`primary` scale) |
| Fonts | `src/app/layout.tsx` (`Inter`, `Outfit`, `Noto_Sans_Armenian`) |
| Logo mark | `src/components/AuroraBackground.tsx` stays; swap the Compass icon in headers |
| Demo data | `scripts/seed-demo.mjs` (family names, countries, notes) |
| Landing copy | `src/lib/i18n/en.ts` → `landing.*` |
| Favicon | `public/favicon.svg` + `public/favicon.ico` |
| Membership plan names | `src/lib/i18n/*.ts` → `pricing.*` |

## Regenerate the world map (optional)
`public/world.svg` is committed and ready. To rebuild it from live geodata:
```bash
node scripts/generate-world-svg.mjs
```

## Useful scripts
| Command | Purpose |
|---|---|
| `npm run dev` | Dev server |
| `npm run build && npm start` | Production |
| `npm run type-check` | TypeScript check |
| `node scripts/seed-demo.mjs` | Seed demo family + 28 trips + bucket list |
| `node scripts/generate-world-svg.mjs` | Regenerate the world map SVG |
