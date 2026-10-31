# DESIGN.md — "Midnight Aurora"

## World
A premium dark expedition-log. Deep navy-night surfaces; the aurora (teal → emerald → violet) is the single expressive accent, used as atmosphere (animated background glow) and for primary actions. The map is the hero object on every screen — countries glow softly when visited.

## Palette (Tailwind tokens)
- Base: slate-950 `#020617` page, glass surfaces `slate-900/60` + `border-white/10`, 1px borders only (no border+shadow stacking).
- Aurora accents: teal `#2dd4bf`, emerald `#34d399`, violet `#a78bfa`. Primary action = teal-400.
- Text: white; secondary `slate-300` (tinted from surface hue, never gray-on-color); muted `slate-400`.
- Member colors are user data (15 preset palette) — they always outrank theme accents where a member is represented.

## Type
- Display: Outfit (600/700) for headings; Inter for body/UI. Display sizes: hero clamp(2.5rem→5rem), section 1.25–1.5rem. Body measure ≤75ch.
- Tabular numerals (`tabular-nums`) for all stats and table dates.

## Motion principles (framer-motion)
- ONE authored moment per surface: the map's staggered country fill-in on load (visited countries glow in sequence). Everything else is quiet.
- Entrances: exponential ease-out, `y: 16→0 + opacity`, staggered ≤0.06s, only on first paint — not every section identical.
- Micro-interactions: `whileHover` lift 2px + shadow on interactive cards/buttons, `whileTap` scale 0.98.
- State changes: `AnimatePresence` with layout animations for lists (member chips, table rows, dropdown).
- Celebration: confetti burst on adding a country (the payoff moment). Duration ≤2s.
- Respect `prefers-reduced-motion`: no aurora drift, no confetti, entrances become simple fades.

## Components
- Glass card: `rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur` — backdrop-blur is functional (content scrolls behind sticky header/overlays), not decorative.
- Buttons: teal-400 fill (dark text) for primary; `white/5` glass for secondary. Focus ring: 2px aurora teal, offset 2px (never `outline:none`).
- Browser chrome themed: selection color aurora teal, styled scrollbar, themed caret.
- Icons: lucide-react only, consistent 1.5–2 stroke; never emoji in UI chrome.

## Bans honored
No gradient text; no kicker/eyebrow labels; no icon-heading-text card grids as page structure; glass only where content moves beneath; shadows always offset+soft (never zero-offset halos); no section numbers.

## Surfaces
- `/` Landing (Persuade): hero = the map itself with aurora atmosphere; headline carries weight, no eyebrow label.
- `/app` Tracker (Operate): scanability first — stats row, members, add-country, map, log.
- `/u/[username]` Share (Persuade): map + numbers + one CTA.
