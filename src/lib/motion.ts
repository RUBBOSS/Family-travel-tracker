'use client';

import type { Variants, Transition } from 'framer-motion';

/** Exponential ease-out — the house entrance feel. */
export const easeOutExpo: Transition = { duration: 0.7, ease: [0.16, 1, 0.3, 1] };

export const springSoft: Transition = { type: 'spring', stiffness: 260, damping: 26 };

/** Quiet entrance: rise + fade. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: easeOutExpo },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: easeOutExpo },
};

/** Stagger container — children use fadeUp/scaleIn. */
export const staggerContainer = (stagger = 0.06, delayChildren = 0): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: stagger, delayChildren } },
});

export const listItem: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: easeOutExpo },
  exit: { opacity: 0, scale: 0.96, transition: { duration: 0.18 } },
};

/** Standard hover/tap micro-interaction props. */
export const hoverLift = {
  whileHover: { y: -2, transition: { duration: 0.2 } },
  whileTap: { scale: 0.98 },
} as const;
