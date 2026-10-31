'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';

export interface WorldMapSvgProps {
  /** ISO2 code -> fill color. Countries absent from the record stay unvisited. */
  countryColors?: Record<string, string>;
  /** ISO2 codes rendered with a dashed bucket-list outline. */
  bucketCodes?: string[];
  /** ISO2 code to pulse briefly (just-added country). */
  highlightCode?: string | null;
  onLoad?: () => void;
}

const UNVISITED_FILL = '#334155';
const STROKE = '#020617';
const BUCKET_COLOR = '#fbbf24';

// The SVG text is cached for the lifetime of the tab — recolors never refetch.
let svgTextCache: string | null = null;

const regionNames =
  typeof Intl !== 'undefined' && 'DisplayNames' in Intl
    ? new Intl.DisplayNames(['en'], { type: 'region' })
    : null;

function countryName(path: SVGPathElement): string {
  return path.getAttribute('name') || regionNames?.of(path.id) || path.id;
}

const isIso2 = (id: string) => /^[A-Z]{2}$/.test(id);

/**
 * Interactive world map. The SVG is fetched once and injected; every recolor
 * is a direct attribute update, so member switches are instant. Visited
 * countries reveal with a staggered glow on first load (the page's signature
 * moment), and a freshly added country pulses.
 */
export default function WorldMapSvg({ countryColors, bucketCodes, highlightCode, onLoad }: WorldMapSvgProps) {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{
    code: string;
    name: string;
    x: number;
    y: number;
    above: boolean;
    visited: boolean;
    color: string;
  } | null>(null);
  const cleanupTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // --- Inject the SVG once ---
  useEffect(() => {
    let cancelled = false;

    const inject = async () => {
      try {
        if (!svgTextCache) {
          const res = await fetch('/world.svg');
          if (!res.ok) throw new Error(`Failed to load map (${res.status})`);
          svgTextCache = await res.text();
        }
        if (cancelled || !containerRef.current) return;

        containerRef.current.innerHTML = svgTextCache;
        const svg = containerRef.current.querySelector('svg');
        if (svg) {
          svgRef.current = svg as SVGSVGElement;
          // Base paint before the first styled frame: no transition, so the
          // reveal transition below animates from this state.
          (svg as SVGSVGElement).querySelectorAll<SVGPathElement>('path').forEach(p => {
            if (!p.id || !isIso2(p.id)) return;
            p.style.transition = 'none';
            p.style.fill = UNVISITED_FILL;
            p.style.stroke = STROKE;
            p.style.strokeWidth = '0.4';
            p.style.strokeDasharray = 'none';
            p.dataset.visited = 'false';
          });
          setReady(true);
          onLoad?.();
        }
      } catch (err: any) {
        if (!cancelled) setLoadError(err.message || 'Failed to load the map');
      }
    };

    inject();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reducedMotion = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  );

  // --- (Re)paint country styles from props ---
  useEffect(() => {
    if (!ready || !svgRef.current) return;
    const svg = svgRef.current;
    const paths = svg.querySelectorAll<SVGPathElement>('path[id]');

    const colors = countryColors ?? {};
    const buckets = new Set(bucketCodes ?? []);

    // First reveal: stagger the visited fills; afterwards clear delays so
    // hover/leave transitions stay snappy.
    const firstPaint = cleanupTimersRef.current.length === 0 && !reducedMotion;

    paths.forEach(p => {
      if (!isIso2(p.id)) return;
      const color = colors[p.id];

      if (color) {
        p.dataset.visited = 'true';
        p.style.fill = color;
        p.style.stroke = STROKE;
        p.style.strokeWidth = '0.5';
        p.style.strokeDasharray = 'none';
      } else if (buckets.has(p.id)) {
        p.dataset.visited = 'bucket';
        p.style.fill = '#1e293b';
        p.style.stroke = BUCKET_COLOR;
        p.style.strokeWidth = '1.1';
        p.style.strokeDasharray = '3 2';
      } else {
        p.dataset.visited = 'false';
        p.style.fill = UNVISITED_FILL;
        p.style.stroke = STROKE;
        p.style.strokeWidth = '0.4';
        p.style.strokeDasharray = 'none';
      }
      p.style.transition = '';
    });

    if (firstPaint) {
      // Assign increasing delays to visited paths, then clear them after the reveal
      let i = 0;
      paths.forEach(p => {
        if (p.dataset.visited === 'true') {
          p.style.transitionDelay = `${Math.min(i * 28, 1600)}ms`;
          i++;
        }
      });
      const t = setTimeout(() => {
        paths.forEach(p => {
          p.style.transitionDelay = '';
        });
      }, 2200);
      cleanupTimersRef.current.push(t);
    }

    // Pulse the just-added country
    if (highlightCode) {
      const target = svg.querySelector<SVGPathElement>(`path[id="${highlightCode}"]`);
      if (target) {
        target.classList.add('map-country-pulse');
        const t = setTimeout(() => target.classList.remove('map-country-pulse'), 2400);
        cleanupTimersRef.current.push(t);
      }
    }
  }, [ready, countryColors, bucketCodes, highlightCode, reducedMotion]);

  useEffect(() => () => {
    cleanupTimersRef.current.forEach(clearTimeout);
    cleanupTimersRef.current = [];
  }, []);

  // --- Hover tooltip via event delegation ---
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const target = (e.target as Element).closest<SVGPathElement>('path[id]');
      const container = containerRef.current;
      if (!target || !container || !isIso2(target.id)) {
        setTooltip(null);
        return;
      }

      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const visited = target.dataset.visited === 'true';
      const code = target.id;

      setTooltip(prev => {
        const name = countryName(target as SVGPathElement);
        const above = y < rect.height - 90;
        if (prev && prev.code === code && prev.above === above) return prev;
        return {
          code,
          name,
          x: Math.min(Math.max(x, 80), rect.width - 80),
          y,
          above,
          visited,
          color: visited ? countryColors?.[code] ?? BUCKET_COLOR : UNVISITED_FILL,
        };
      });
    },
    [countryColors]
  );

  const handleMouseLeave = useCallback(() => setTooltip(null), []);

  return (
    <div
      ref={containerRef}
      className="relative mx-auto aspect-[2000/880] w-full select-none [&_svg]:h-full [&_svg]:w-full"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      role="img"
      aria-label="World map of visited countries"
    >
      {loadError && (
        <div className="absolute inset-0 flex items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 text-sm text-red-300">
          {loadError}
        </div>
      )}

      <AnimatePresence>
        {tooltip && (
          <motion.div
            key={tooltip.code}
            className="pointer-events-none absolute z-30 -translate-x-1/2"
            style={{
              left: tooltip.x,
              top: tooltip.above ? tooltip.y - 54 : tooltip.y + 14,
            }}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1, transition: { duration: 0.12 } }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.1 } }}
          >
            <div className="flex items-center gap-2 whitespace-nowrap rounded-lg border border-white/10 bg-slate-900/95 px-2.5 py-1.5 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.9)] backdrop-blur-sm">
              <Image
                src={`https://flagcdn.com/w40/${tooltip.code.toLowerCase()}.png`}
                alt=""
                width={21}
                height={14}
                className="rounded-sm"
              />
              <span className="text-sm font-medium text-white">{tooltip.name}</span>
              {tooltip.visited && (
                <span
                  className="rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-950"
                  style={{ backgroundColor: tooltip.color }}
                >
                  {t('map.visited')}
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
