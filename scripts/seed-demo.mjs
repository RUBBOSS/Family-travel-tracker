/**
 * Seeds the demo account with family members, visited countries (and bucket
 * list entries when the migration has been run).
 *
 * Usage:  node scripts/seed-demo.mjs
 * Requires .env.local with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.
 */
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { createClient } = require('@supabase/supabase-js');

// --- load env from .env.local ---
const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    .split('\n')
    .filter(line => line.trim() && !line.startsWith('#'))
    .map(line => {
      const idx = line.indexOf('=');
      return [line.slice(0, idx).trim(), line.slice(idx + 1).trim()];
    })
);

const DEMO_EMAIL = 'demo@traveltracker.demo';
const DEMO_PASSWORD = 'DemoTravel2026!';

const FAMILY = [
  { name: 'Emma', avatarColor: '#FF6B6B' },
  { name: 'Jack', avatarColor: '#4ECDC4' },
  { name: 'Sophie', avatarColor: '#A78BFA' },
];

// [country_code, memberIndex|null personal, date, note]
const VISITS = [
  ['FR', 0, '2019-06-14', 'Honeymoon in Paris — croissants every morning'],
  ['IT', 0, '2019-06-21', 'Amalfi coast boat trip'],
  ['ES', 1, '2018-04-02', 'Barcelona food tour'],
  ['PT', 1, '2021-09-10', null],
  ['GR', 0, '2022-07-01', 'Santorini sunset'],
  ['JP', 1, '2023-03-28', 'Cherry blossoms in Kyoto'],
  ['TH', 2, '2024-01-15', 'Elephant sanctuary in Chiang Mai'],
  ['US', null, '2017-08-05', 'Road trip: LA to San Francisco'],
  ['CA', 1, '2019-12-20', 'Skiing in Banff'],
  ['MX', 0, '2020-02-11', 'Cenotes near Tulum'],
  ['BR', 1, '2022-11-03', 'Rio during carnival'],
  ['AR', null, '2023-01-19', 'Patagonia hike'],
  ['AU', 2, '2024-07-08', 'Great Barrier Reef snorkeling'],
  ['NZ', 1, '2024-07-22', 'Hobbiton!'],
  ['IS', 0, '2021-02-14', 'Northern lights on Valentine\u2019s day'],
  ['NO', 0, '2023-06-30', 'Fjord cruise'],
  ['GB', 2, '2022-04-16', 'Harry Potter studio tour'],
  ['CH', 1, '2023-12-28', 'New Year in the Alps'],
  ['MA', 0, '2024-03-09', 'Marrakech souks'],
  ['EG', 1, '2024-10-01', 'Pyramids at sunrise'],
  ['ZA', null, '2025-02-12', 'Safari in Kruger'],
  ['IN', 2, '2025-04-05', 'Taj Mahal with grandma'],
  ['ID', 0, '2025-08-17', 'Ubud rice terraces'],
  ['TR', 1, '2025-09-26', 'Hot air balloon in Cappadocia'],
  ['AE', null, '2026-01-08', 'Desert safari'],
  ['IE', 2, '2026-02-20', 'Cliffs of Moher'],
  ['HR', 0, '2026-05-11', 'Island hopping in Croatia'],
];

// Bucket list (only seeded if the migration table exists)
const BUCKET = [
  ['PE', 'Machu Picchu before the crowds'],
  ['MV', 'Overwater bungalow'],
  ['KE', 'Great migration safari'],
  ['NP', 'Base camp trek'],
  ['CL', 'Atacama stargazing'],
];

async function main() {
  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  const { data: signIn, error: signInError } = await supabase.auth.signInWithPassword({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
  });
  if (signInError) throw signInError;
  const token = signIn.session.access_token;
  const authed = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false },
  });

  console.log('Signed in as', signIn.user.id);

  // Ensure the user_profiles row exists (the signup trigger may not have run)
  const { error: profileError } = await authed
    .from('user_profiles')
    .upsert({
      id: signIn.user.id,
      username: 'demo_explorer',
      full_name: 'Demo Explorer',
      avatar_color: '#14b8a6',
    }, { onConflict: 'id' });
  if (profileError) console.warn('Profile upsert failed:', profileError.message);

  // Family members (idempotent: reuse if name exists)
  const { data: existingMembers } = await authed.from('family_members').select('id, name');
  const members = new Map((existingMembers || []).map(m => [m.name, m.id]));
  for (const member of FAMILY) {
    if (!members.has(member.name)) {
      const { data, error } = await authed
        .from('family_members')
        .insert({ user_id: signIn.user.id, name: member.name, avatar_color: member.avatarColor })
        .select('id, name')
        .single();
      if (error) throw error;
      members.set(data.name, data.id);
      console.log('Created member', data.name);
    }
  }

  // Countries lookup
  const { data: countries, error: countriesError } = await authed
    .from('countries')
    .select('id, country_code');
  if (countriesError) throw countriesError;
  const byCode = new Map(countries.map(c => [c.country_code, c.id]));

  // Visited countries (idempotent: skip if user already has visits)
  const { count: visitCount } = await authed
    .from('visited_countries')
    .select('id', { count: 'exact', head: true });

  if (!visitCount) {
    for (const [code, memberIdx, date, note] of VISITS) {
      const countryId = byCode.get(code);
      if (!countryId) {
        console.warn('Unknown country code', code);
        continue;
      }
      const memberId = memberIdx === null ? null : members.get(FAMILY[memberIdx].name);
      const { error } = await authed.from('visited_countries').insert({
        user_id: signIn.user.id,
        country_id: countryId,
        family_member_id: memberId,
        visit_date: date ? new Date(date).toISOString() : new Date().toISOString(),
        notes: note,
      });
      if (error) console.warn(`Skip ${code}:`, error.message);
      else console.log('Added visit', code, memberId ? `(${FAMILY[memberIdx].name})` : '(personal)');
    }
  } else {
    console.log('Visits already seeded:', visitCount);
  }

  // Bucket list — only if migration was applied
  const { error: bucketProbe } = await authed.from('bucket_list').select('id').limit(1);
  if (!bucketProbe) {
    for (const [code, note] of BUCKET) {
      const countryId = byCode.get(code);
      if (!countryId) continue;
      const { error } = await authed.from('bucket_list').insert({
        user_id: signIn.user.id,
        country_id: countryId,
        notes: note,
      });
      if (error && !error.message.includes('duplicate')) console.warn(`Bucket skip ${code}:`, error.message);
      else if (!error) console.log('Bucket list added', code);
    }
  } else {
    console.log('Bucket list table not present yet — run supabase-migration-2.sql, then re-run this script.');
  }

  console.log('Done.');
}

main().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
