# Family Travel Tracker

Family Travel Tracker is a web application that lets families color in the world as they explore it. Each family member gets their own color; every visit lights up the shared world map — with dates, notes, bucket-list planning, and a public share page for the whole journey.

![Stack](https://img.shields.io/badge/Next.js-15-black) ![React](https://img.shields.io/badge/React-18-blue) ![Supabase](https://img.shields.io/badge/Supabase-Postgres-green)

## Features

- **Interactive world map** — complete 173-country SVG map; visited countries glow per family member, with staggered reveal animation and hover tooltips (flag + country).
- **Family member profiles** — each person gets a color; view one member or everyone at once.
- **Trip logging** — search any of 193 countries, add a date and a note, watch the map pulse and confetti fall. Milestones (every 25 countries) get a bigger celebration.
- **Stats dashboard** — animated count-ups, "% of the world" progress ring, family leaderboard with animated bars, and per-continent breakdown.
- **Bucket list** — star countries you dream about (dashed outline on the map), convert them to visits with one tap.
- **Shareable public map** — every user gets `/u/<username>`: an animated, multi-colored public map + stats that requires no login.
- **Landing page + live demo** — one-click demo login with pre-seeded family data.

## Technology Stack

- **Frontend:** Next.js 15 (App Router), React 18, TypeScript, Tailwind CSS, framer-motion
- **Map:** d3-geo + topojson-client (regenerable SVG), flagcdn flags
- **Backend:** Next.js API routes
- **Database/Auth:** Supabase (PostgreSQL + RLS + Auth) — runs entirely on the public anon key; row security is enforced by database policies, no service-role key needed

## Local Setup

1. Clone and install:

   ```bash
   npm install
   ```

2. Create `.env.local`:

   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

3. Set up the database — run in the Supabase SQL Editor, in order:
   - `supabase-unified.sql` (tables, RLS, seed countries, auth trigger)
   - `supabase-migration-2.sql` (bucket list table + public map RPC)

4. Start:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000).

### Demo account

When email confirmation is disabled in Supabase Auth settings, the landing page's **Try the live demo** button signs into `demo@traveltracker.demo` / `DemoTravel2026!`. Seed (or re-seed) its data with:

```bash
node scripts/seed-demo.mjs
```

### Regenerate the world map

`public/world.svg` is generated from world-atlas TopoJSON (the original shipped map was missing ~27 major countries). To rebuild it:

```bash
node scripts/generate-world-svg.mjs
```

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build / serve |
| `npm run type-check` | TypeScript check |
| `node scripts/seed-demo.mjs` | Seed the demo account |
| `node scripts/generate-world-svg.mjs` | Regenerate `public/world.svg` |

## Database Structure

- **countries** — 193 seeded countries (code, name, flag, population, capital, region)
- **user_profiles** — profile per auth user (username, full name, avatar color)
- **family_members** — per-user family members (name, avatar color)
- **visited_countries** — visits (user, country, optional family member, date, notes)
- **bucket_list** — wishlist entries (user, country, optional family member, notes)
- RLS on all tables: users manage only their own rows; `countries` is publicly readable; `get_public_map(username)` RPC exposes only safe public data for share pages.

## Deployment

Deploy to Vercel with the two `NEXT_PUBLIC_*` environment variables set. No server-side secrets required.

## Contributing

Fork the repository and submit a pull request — all contributions are welcome!
