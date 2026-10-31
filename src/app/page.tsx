'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Compass, Loader2, MapPin, Share2, Sparkles, Users } from 'lucide-react';
import { supabase } from '@/utils/supabaseClient';
import { AuroraBackground } from '@/components/AuroraBackground';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useLanguage } from '@/context/LanguageContext';
import { useUserContext } from '@/context/UserContext';
import { fadeUp, staggerContainer } from '@/lib/motion';

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
  const { t } = useLanguage();
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
    } catch {
      setDemoError(t('landing.demoError'));
      setDemoLoading(false);
    }
  };

  const features = [
    { icon: Users, title: t('landing.feature1Title'), text: t('landing.feature1Text') },
    { icon: MapPin, title: t('landing.feature2Title'), text: t('landing.feature2Text') },
    { icon: Share2, title: t('landing.feature3Title'), text: t('landing.feature3Text') },
  ];

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
            {t('tracker.appTitle')}
          </span>
        </div>
        <nav className="flex items-center gap-2">
          <LanguageSwitcher />
          <Link href="/app" className="btn-ghost">{t('common.signIn')}</Link>
          <button onClick={handleTryDemo} className="btn-primary" disabled={demoLoading}>
            {demoLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : t('landing.ctaDemo')}
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
          {t('landing.heroTitle')}
        </motion.h1>
        <motion.p
          variants={fadeUp}
          className="mx-auto mt-5 max-w-xl text-center text-base leading-relaxed text-slate-300 sm:text-lg"
        >
          {t('landing.heroSubtitle')}
        </motion.p>

        <motion.div variants={fadeUp} className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button onClick={handleTryDemo} className="btn-primary px-6 py-3 text-base" disabled={demoLoading}>
            {demoLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
            {t('landing.ctaDemo')}
          </button>
          <Link href="/app" className="btn-secondary px-6 py-3 text-base">
            {authLoading ? t('landing.ctaOpenApp') : currentUser ? t('landing.ctaOpenMyMap') : t('landing.ctaCreate')}
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
          </div>
        </motion.div>
      </motion.section>

      {/* What it does — inline features, not card grids */}
      <section className="mx-auto mt-24 max-w-6xl px-4 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-3">
          {features.map(({ icon: Icon, title, text }) => (
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
            <p className="text-sm text-slate-400">{t('landing.proofCountries')}</p>
          </div>
          <div>
            <p className="font-display text-3xl font-bold text-white tabular-nums">∞</p>
            <p className="text-sm text-slate-400">{t('landing.proofLegends')}</p>
          </div>
          <div>
            <p className="font-display text-3xl font-bold text-white tabular-nums">1</p>
            <p className="text-sm text-slate-400">{t('landing.proofLink')}</p>
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
          {t('landing.finalTitle')}
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
            {t('landing.finalCtaDemo')}
          </button>
          <Link href="/app" className="btn-secondary px-6 py-3 text-base">
            {t('common.signIn')}
          </Link>
        </motion.div>
      </section>

      <footer className="mx-auto mt-20 max-w-6xl px-4 text-center text-xs text-slate-600 sm:px-6">
        {t('landing.footer')}
      </footer>
    </main>
  );
}
