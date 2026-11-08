/**
 * Generates public/world.svg from world-atlas TopoJSON + world-countries data.
 *
 * The original world.svg was missing ~27 major countries (US, CA, FR, JP, AU…),
 * so visits there could never be highlighted. This script rebuilds a complete
 * map: one <path> per country with id="{ISO2}" and name="{Country}".
 *
 * Uses d3-geo (projection) and topojson-client (decoding) — both project deps.
 * Re-run only when you want to regenerate the map: node scripts/generate-world-svg.mjs
 */
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const { createRequire } = await import('node:module');
const require = createRequire(import.meta.url);
const { feature } = require('topojson-client');
const { geoNaturalEarth1, geoPath } = require('d3-geo');

const WIDTH = 2000;
const HEIGHT = 880;

const TOPO_URL = 'https://unpkg.com/world-atlas@2/countries-110m.json';
const COUNTRIES_URL = 'https://cdn.jsdelivr.net/npm/world-countries@5/countries.json';

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} -> HTTP ${res.status}`);
  return res.json();
}

async function main() {
  console.log('Downloading topology…');
  const topo = await fetchJson(TOPO_URL);
  console.log('Downloading country metadata…');
  const countries = await fetchJson(COUNTRIES_URL);

  // numeric ISO 3166-1 (ccn3) -> alpha-2 (cca2)
  const numericToAlpha2 = new Map(
    countries.filter(c => c.ccn3).map(c => [c.ccn3, c.cca2])
  );
  const alpha2ToName = new Map(countries.map(c => [c.cca2, c.name.common]));

  const geo = feature(topo, topo.objects.countries);
  const projection = geoNaturalEarth1().fitExtent(
    [[10, 10], [WIDTH - 10, HEIGHT - 10]],
    geo
  );
  const path = geoPath(projection);

  const paths = [];
  let skipped = 0;
  for (const f of geo.features) {
    const alpha2 = numericToAlpha2.get(String(f.id));
    if (!alpha2) { skipped++; continue; }
    // Antarctica: nobody logs it and it dominates the canvas — drop it.
    if (alpha2 === 'AQ') { skipped++; continue; }

    const d = path(f);
    if (!d) { skipped++; continue; }
    const name = alpha2ToName.get(alpha2) ?? alpha2;
    paths.push(`<path d="${d}" id="${alpha2}" name="${name}"/>`);
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="${WIDTH}" height="${HEIGHT}">
${paths.join('\n')}
</svg>
`;

  const out = fileURLToPath(new URL('../public/world.svg', import.meta.url));
  await writeFile(out, svg, 'utf8');
  console.log(`Wrote ${out} with ${paths.length} countries (${skipped} skipped).`);
}

main().catch(err => {
  console.error('Generation failed:', err);
  process.exit(1);
});
