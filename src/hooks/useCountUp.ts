'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Animates a number from 0 (or previous value) to `target` once `active`
 * becomes true. Uses requestAnimationFrame with ease-out; honors
 * prefers-reduced-motion by snapping instantly.
 */
export function useCountUp(target: number, active: boolean, durationMs = 1200): number {
  const [value, setValue] = useState(0);
  const fromRef = useRef(0);

  useEffect(() => {
    if (!active) return;

    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValue(target);
      return;
    }

    const from = fromRef.current;
    const delta = target - from;
    if (delta === 0) return;

    let raf: number;
    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(2, -10 * t); // exponential ease-out
      setValue(from + delta * eased);
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        fromRef.current = target;
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, active, durationMs]);

  return value;
}
