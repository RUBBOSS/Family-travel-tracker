/**
 * Applies supabase-migration-2.sql through the project's exec_sql RPC,
 * one statement at a time (dollar-quoted bodies are kept intact).
 *
 * Usage: node scripts/apply-migration.mjs [path-to-sql]
 */
import { readFileSync } from 'node:fs';

const { createRequire } = await import('node:module');
const require = createRequire(import.meta.url);
const { createClient } = require('@supabase/supabase-js');

const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    .split('\n')
    .filter(line => line.trim() && !line.startsWith('#'))
    .map(line => {
      const idx = line.indexOf('=');
      return [line.slice(0, idx).trim(), line.slice(idx + 1).trim()];
    })
);

const sqlPath = process.argv[2] ?? new URL('../supabase-migration-2.sql', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const raw = readFileSync(sqlPath, 'utf8');

/** Split SQL into statements, respecting $$ dollar-quoted blocks. */
function splitStatements(sql) {
  const lines = sql.split('\n').filter(line => !line.trim().startsWith('--'));
  const cleaned = lines.join('\n');

  const statements = [];
  let current = '';
  let inDollar = false;

  for (let i = 0; i < cleaned.length; i++) {
    const two = cleaned.slice(i, i + 2);
    if (two === '$$') {
      inDollar = !inDollar;
      current += two;
      i++;
      continue;
    }
    if (cleaned[i] === ';' && !inDollar) {
      if (current.trim()) statements.push(current.trim() + ';');
      current = '';
      continue;
    }
    current += cleaned[i];
  }
  if (current.trim()) statements.push(current.trim() + ';');
  return statements;
}

async function main() {
  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const statements = splitStatements(raw);
  console.log(`Applying ${statements.length} statements from ${sqlPath}…`);

  let failed = 0;
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    const label = stmt.replace(/\s+/g, ' ').slice(0, 64);
    const { data, error } = await supabase.rpc('exec_sql', { sql: stmt });

    if (error) {
      failed++;
      console.error(`[${i + 1}] RPC error:`, error.message);
    } else if (data && data.success === false) {
      failed++;
      console.error(`[${i + 1}] SQL error: ${data.error} (${data.detail})\n     ${label}…`);
    } else {
      console.log(`[${i + 1}] ok  ${label}…`);
    }
  }

  if (failed > 0) {
    console.error(`\n${failed} statement(s) failed.`);
    process.exit(1);
  }
  console.log('\nMigration applied cleanly.');
}

main().catch(err => {
  console.error('Apply failed:', err);
  process.exit(1);
});
