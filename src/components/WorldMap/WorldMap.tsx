'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

// Client-only: the SVG is fetched and injected in the browser
const WorldMapSvg = dynamic(() => import('@/components/WorldMap/WorldMapSvg'), {
  ssr: false,
  loading: () => (
    <div className="flex aspect-[2000/880] w-full items-center justify-center rounded-xl bg-white/[0.02]">
      <Loader2 className="h-8 w-8 animate-spin text-teal-300/60" />
    </div>
  ),
});

export interface MapVisit {
  countryCode: string;
  color: string;
  memberName?: string | null;
}

interface WorldMapProps {
  visits: MapVisit[];
  bucketCodes?: string[];
  highlightCountryCode?: string | null;
  isLoading?: boolean;
  title?: string;
}

const TOTAL_COUNTRIES = 193;

export default function WorldMap({
  visits,
  bucketCodes,
  highlightCountryCode,
  isLoading = false,
  title,
}: WorldMapProps) {
  const countryColors = useMemo(() => {
    const colors: Record<string, string> = {};
    for (const visit of visits) {
      if (visit.countryCode && visit.countryCode !== 'XX') {
        colors[visit.countryCode] = visit.color;
      }
    }
    return colors;
  }, [visits]);

  const uniqueCount = Object.keys(countryColors).length;
  const percent = ((uniqueCount / TOTAL_COUNTRIES) * 100).toFixed(1);

  const legend = useMemo(() => {
    const seen = new Map<string, string>();
    for (const visit of visits) {
      if (!seen.has(visit.color)) {
        seen.set(visit.color, visit.memberName || 'Visited');
      }
    }
    return Array.from(seen.entries()).map(([color, name]) => ({ color, name }));
  }, [visits]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-display text-sm font-semibold text-white">
            {title ?? 'Family world map'}
          </p>
          <p className="text-sm text-slate-400">
            <span className="font-semibold text-teal-300 tabular-nums">{uniqueCount}</span>{' '}
            {uniqueCount === 1 ? 'country' : 'countries'} visited
            <span className="text-slate-500"> · {percent}% of the world</span>
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-400">
          {legend.map(({ color, name }) => (
            <span key={color} className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: color }} />
              {name}
            </span>
          ))}
          {bucketCodes && bucketCodes.length > 0 && (
            <span className="inline-flex items-center gap-1.5">
              <span
                className="h-2.5 w-2.5 rounded-sm border border-dashed"
                style={{ borderColor: '#fbbf24', backgroundColor: '#1e293b' }}
              />
              Bucket list
            </span>
          )}
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-slate-600" />
            Not visited yet
          </span>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoading ? 0.5 : 1 }}
        transition={{ duration: 0.3 }}
      >
        <WorldMapSvg
          countryColors={countryColors}
          bucketCodes={bucketCodes}
          highlightCode={highlightCountryCode}
        />
      </motion.div>

      {uniqueCount === 0 && !isLoading && (!bucketCodes || bucketCodes.length === 0) && (
        <div className="-mt-72 flex justify-center">
          <p className="rounded-full border border-white/10 bg-slate-900/80 px-4 py-2 text-sm text-slate-300 backdrop-blur-sm">
            No countries marked yet — add one above and watch it glow.
          </p>
        </div>
      )}
    </div>
  );
}
