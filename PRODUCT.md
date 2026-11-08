# PRODUCT.md

## What
Family Travel Tracker — a family logs countries they've visited and sees them color-coded on an interactive world map, per family member.

## Audience & goal
Pitched to travel companies as a demo-able product (family-travel engagement tool). Every screen must be presentable in a 2-minute sales demo: instant visual impact, seeded demo data, shareable public map links as a viral loop.

## Users
- Families (parents + kids) tracking trips together; personal visits plus per-member visits.
- Prospects arriving via the public landing page or a shared `/u/<username>` map link (logged out).

## Flows that must be flawless
1. Landing → "Try live demo" → seeded demo account (`demo@traveltracker.demo` / `DemoTravel2026!`) → rich populated tracker.
2. Tracker: pick member → add country (search, date, notes) → map animates + confetti → stats update.
3. Bucket list: plan countries → convert to visited.
4. Share: copy `/u/<username>` link → open logged out → animated multi-color map.

## Constraints
- Supabase project `yipvctqgluwqwaashbat` (user-owned). Public anon key only; RLS enforces ownership. No service-role key.
- Existing stack fixed: Next.js 15 App Router, React 18, Tailwind 3, framer-motion 10, Supabase JS.
- Migration `supabase-migration-2.sql` (bucket_list + public map RPC) must be run by the user in the SQL editor.
