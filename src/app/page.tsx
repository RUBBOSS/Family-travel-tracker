'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Compass, Loader2, MapPin, Share2, Sparkles, Users } from 'lucide-react';
import { supabase } from '@/utils/supabaseClient';
import { AuroraBackground } from '@/components/AuroraBackground';
import { fadeUp, staggerContainer } from '@/lib/motion';
import { useUserContext } from '@/context/UserContext';

const WorldMapSvg = dynamic(() => import('@/components/WorldMap/WorldMapSvg'), {
  ssr: false,
  loading: () => (
    <div className="flex aspect-[2000/880] w-full items-center justify-center rounded-2xl bg-white/[0.02]">
      <Loader2 className="h-8 w-8 animate-spin text-teal-300/60" />
    </div>
  ),
});

const DEMO_EMAIL = 'demo@traveltracker.demo';
const DEMO_PASSWORD = 'DemoTravel2026!';

// A believable sample family map for the hero
const SAMPLE_COLORS: Record<string, string> = {
  US: '#4ECDC4', CA: '#4ECDC4', MX: '#FF6B6B', BR: '#4ECDC4', AR: '#14b8a6',
  GB: '#A78BFA', FR: '#FF6B6B', ES: '#FF6B6B', IT: '#FF6B6B', IS: '#FF6B6B',
  NO: '#FF6B6B', GR: '#FF6B6B', PT: '#14b8a6', MA: '#FF6B6B', EG: '#4ECDC4',
  ZA: '#14b8a6', JP: '#4ECDC4', TH: '#A78BFA', IN: '#A78BFA', ID: '#FF6B6B',
  AU: '#A78BFA', NZ: '#4ECDC4', TR: '#4ECDC4', AE: '#14b8a6', IE: '#A78BFA',
};

const CYCLE = ['JP', 'IS', 'PE', 'ZA', 'CA', 'NZ'];

export default function LandingPage() {
  const { currentUser, isLoading: authLoading } = useUserContext();
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoError, setDemoError] = useState<string | null>(null);
  const [pulseIndex, setPulseIndex] = useState(0);

  // The authored moment: a country quietly pulses every few seconds
  useEffect(() => {
    const id = setInterval(() => setPulseIndex(i => (i + 1) % CYCLE.length), 2400);
    return () => clearInterval(id);
  }, []);

  const handleTryDemo = async () => {
    if (demoLoading) return;
    setDemoLoading(true);
    setDemoError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
      });
      if (error) throw error;
      window.location.href = '/app';
    } catch (err: any) {
      setDemoError(err.message || 'The demo is warming up — please try again in a moment.');
      setDemoLoading(false);
    }
  };

  const primaryHref = useMemo(() => (currentUser ? '/app' : '/app'), [currentUser]);

  return (
    <main className="relative min-h-screen overflow-x-hidden pb-20">
      <AuroraBackground />

      {/* Nav */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-400/15 text-teal-300 ring-1 ring-teal-400/30">
            <Compass className="h-5 w-5" />
          </span>
          <span className="font-display text-base font-semibold tracking-tight text-white">
            Family Travel Tracker
          </span>
        </div>
        <nav className="flex items-center gap-2">
          <Link href="/app" className="btn-ghost">Sign in</Link>
          <button onClick={handleTryDemo} className="btn-primary" disabled={demoLoading}>
            {demoLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Try live demo'}
          </button>
        </nav>
      </header>

      {/* Hero */}
      <motion.section
        className="mx-auto max-w-6xl px-4 pt-10 sm:px-6 sm:pt-16"
        variants={staggerContainer(0.12)}
        initial="hidden"
        animate="visible"
      >
        <motion.h1
          variants={fadeUp}
          className="mx-auto max-w-3xl text-center font-display text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-6xl"
        >
          Every trip your family takes, on one glowing map.
        </motion.h1>
        <motion.p
          variants={fadeUp}
          className="mx-auto mt-5 max-w-xl text-center text-base leading-relaxed text-slate-300 sm:text-lg"
        >
          Color the world by explorer. Keep the dates, the notes, the stories. Plan what&apos;s
          next — and share the whole journey with a single link.
        </motion.p>

        <motion.div variants={fadeUp} className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button onClick={handleTryDemo} className="btn-primary px-6 py-3 text-base" disabled={demoLoading}>
            {demoLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
            Try the live demo
          </button>
          <Link href={primaryHref} className="btn-secondary px-6 py-3 text-base">
            {authLoading ? 'Open the app' : currentUser ? 'Open my map' : 'Create an account'}
          </Link>
        </motion.div>
        {demoError && (
          <p className="mt-3 text-center text-sm text-red-300" role="alert">{demoError}</p>
        )}

        {/* The map itself — the product is the visual */}
        <motion.div variants={fadeUp} className="surface-card mt-12 p-4 sm:p-6">
          <WorldMapSvg
            countryColors={SAMPLE_COLORS}
            highlightCode={CYCLE[pulseIndex]}
          />
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-[#FF6B6B]" /> Emma</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-[#4ECDC4]" /> Jack</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-[#A78BFA]" /> Sophie</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-[#14b8a6]" /> You</span>
          </div>
        </motion.div>
      </motion.section>

      {/* What it does — inline features, not card grids */}
      <section className="mx-auto mt-24 max-w-6xl px-4 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-3">
          {[
            {
              icon: Users,
              title: 'One map, every explorer',
              text: 'Each family member gets a color. Everyone\u2019s trips layer onto the same world — switch views in one tap, or see everything at once.',
            },
            {
              icon: MapPin,
              title: 'Stories, not just pins',
              text: 'Dates and notes live with every country, so "that night in Kyoto" stays findable years later. Wishlist future trips and turn them into memories.',
            },
            {
              icon: Share2,
              title: 'A link that says it all',
              text: 'Every family map has a public page. Grandparents, friends, travel agents — anyone with the link sees the journey. No account needed.',
            },
          ].map(({ icon: Icon, title, text }) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="flex gap-4"
            >
              <span className="mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-teal-400/12 text-teal-300 ring-1 ring-teal-400/25">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-display text-lg font-semibold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{text}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Social proof strip */}
      <section className="mx-auto mt-24 max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 text-center"
        >
          <div>
            <p className="font-display text-3xl font-bold text-white tabular-nums">193</p>
            <p className="text-sm text-slate-400">countries to claim</p>
          </div>
          <div>
            <p className="font-display text-3xl font-bold text-white tabular-nums">∞</p>
            <p className="text-sm text-slate-400">family legends preserved</p>
          </div>
          <div>
            <p className="font-display text-3xl font-bold text-white tabular-nums">1</p>
            <p className="text-sm text-slate-400">link to share it all</p>
          </div>
        </motion.div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto mt-24 max-w-3xl px-4 text-center sm:px-6">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl"
        >
          Where has your family been?
        </motion.h2>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <button onClick={handleTryDemo} className="btn-primary px-6 py-3 text-base" disabled={demoLoading}>
            {demoLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
            Explore the demo map
          </button>
          <Link href="/app" className="btn-secondary px-6 py-3 text-base">
            Sign in
          </Link>
        </motion.div>
      </section>

      <footer className="mx-auto mt-20 max-w-6xl px-4 text-center text-xs text-slate-600 sm:px-6">
        Family Travel Tracker — built for families who measure life in stamps.
      </footer>
    </main>
  );
}
