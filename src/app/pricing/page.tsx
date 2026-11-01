'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Compass } from 'lucide-react';
import { AuroraBackground } from '@/components/AuroraBackground';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useLanguage } from '@/context/LanguageContext';
import { fadeUp, staggerContainer } from '@/lib/motion';

const CONTACT_URL = process.env.NEXT_PUBLIC_CONTACT_URL || 'mailto:your@agency.com?subject=Family%20Travel%20Tracker%20license';

const INCLUDES = ['featureAgency2', 'inclSource', 'inclDeploy', 'feature1', 'feature4', 'feature5'] as const;

export default function PricingPage() {
  const { t } = useLanguage();

  return (
    <main className="relative min-h-screen overflow-x-hidden pb-20">
      <AuroraBackground />

      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-400/15 text-teal-300 ring-1 ring-teal-400/30">
            <Compass className="h-5 w-5" />
          </span>
          <span className="font-display text-base font-semibold tracking-tight text-white">
            {t('tracker.appTitle')}
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <Link href="/app" className="btn-primary">{t('common.signIn')}</Link>
        </div>
      </header>

      <motion.section
        className="mx-auto max-w-3xl px-4 pt-10 sm:px-6"
        variants={staggerContainer(0.1)}
        initial="hidden"
        animate="visible"
      >
        <motion.h1
          variants={fadeUp}
          className="text-center font-display text-4xl font-bold tracking-tight text-white sm:text-5xl"
        >
          {t('pricing.title')}
        </motion.h1>
        <motion.p variants={fadeUp} className="mx-auto mt-4 max-w-xl text-center text-slate-300">
          {t('pricing.subtitle')}
        </motion.p>

        <motion.div
          variants={fadeUp}
          className="mt-12 rounded-3xl border border-teal-400/40 bg-gradient-to-b from-teal-400/10 to-slate-900/60 p-8 shadow-[0_24px_80px_-24px_rgba(45,212,191,0.35)] sm:p-10"
        >
          <h2 className="font-display text-xl font-semibold text-white">
            {t('pricing.agencyLicenseName')}
          </h2>
          <p className="mt-4">
            <span className="font-display text-5xl font-bold text-white">$100</span>
            <span className="ml-3 text-sm text-slate-400">{t('pricing.agencyLicensePrice')}</span>
          </p>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            {t('pricing.agencyLicenseDesc')}
          </p>

          <ul className="mt-7 space-y-3">
            {INCLUDES.map(key => (
              <li key={key} className="flex items-start gap-3 text-sm text-slate-200">
                <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-teal-300" />
                {t(`pricing.${key}`)}
              </li>
            ))}
          </ul>

          <a
            href={CONTACT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary mt-9 w-full py-3 text-base"
          >
            {t('pricing.cta')}
            <ArrowRight className="h-4 w-4" />
          </a>
        </motion.div>

        <motion.p variants={fadeUp} className="mt-10 text-center text-sm text-slate-400">
          {t('landing.ctaDemo')} →{' '}
          <Link href="/app" className="font-medium text-teal-300 underline-offset-4 hover:underline">
            {t('landing.ctaOpenApp')}
          </Link>
        </motion.p>
      </motion.section>
    </main>
  );
}
