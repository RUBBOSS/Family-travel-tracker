'use client';

/**
 * Fixed aurora atmosphere — three drifting gradient fields behind content.
 * Purely atmospheric; sits below all interactive layers. `intensity` trades
 * opacity for busier (landing) vs quieter (tracker) scenes.
 */
export function AuroraBackground({ intensity = 'full' }: { intensity?: 'full' | 'subtle' }) {
  const base = intensity === 'full' ? 'opacity-60' : 'opacity-30';

  return (
    <div aria-hidden className={`pointer-events-none fixed inset-0 -z-10 overflow-hidden ${base}`}>
      <div
        className="aurora-layer animate-aurora-drift left-[-10%] top-[-15%] h-[55vh] w-[55vw] bg-teal-500/40"
      />
      <div
        className="aurora-layer animate-aurora-drift-slow right-[-15%] top-[10%] h-[60vh] w-[50vw] bg-violet-500/35"
      />
      <div
        className="aurora-layer animate-aurora-drift bottom-[-25%] left-[15%] h-[50vh] w-[60vw] bg-emerald-500/25"
        style={{ animationDelay: '-12s' }}
      />
      {/* Starfield texture: sparse dots keep the night-sky depth without a repeating pattern */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(1px 1px at 18% 24%, rgba(255,255,255,0.35) 50%, transparent 51%), radial-gradient(1px 1px at 64% 12%, rgba(255,255,255,0.25) 50%, transparent 51%), radial-gradient(1.5px 1.5px at 82% 38%, rgba(255,255,255,0.3) 50%, transparent 51%), radial-gradient(1px 1px at 34% 68%, rgba(255,255,255,0.2) 50%, transparent 51%), radial-gradient(1px 1px at 52% 46%, rgba(255,255,255,0.18) 50%, transparent 51%), radial-gradient(1.5px 1.5px at 8% 78%, rgba(255,255,255,0.22) 50%, transparent 51%)',
        }}
      />
    </div>
  );
}
