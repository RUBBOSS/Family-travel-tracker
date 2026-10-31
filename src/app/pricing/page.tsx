'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Compass } from 'lucide-react';
import { AuroraBackground } from '@/components/AuroraBackground';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useLanguage } from '@/context/LanguageContext';
import { fadeUp, staggerContainer } from '@/lib/motion';

interface Tier {
  key: 'family' | 'pro' | 'agency';
  highlighted?: boolean;
  features: string[];
}

const TIERS: Tier[] = [
  {
    key: 'family',
    features: ['feature1', 'feature2', 'feature3', 'feature4', 'feature5'],
  },
  {
    key: 'pro',
    highlighted: true,
    features: ['featurePro1', 'featurePro2', 'feature4', 'feature5', 'featurePro3'],
  },
  {
    key: 'agency',
    features: ['featureAgency1', 'featureAgency2', 'featureAgency3'],
  },
];

export default function PricingPage() {
  const { t } = useLanguage();
  const [checkoutUrls, setCheckoutUrls] = useState<{ family: string | null; pro: string | null; agency: string | null }>({
    family: null, pro: null, agency: null,
  });

  // The Whop checkout links are configured per deployment (staged: null -> 'soon')
  useEffect(() => {
    fetch('/api/license/validate')
      .then(r => r.json())
      .then(data => setCheckoutUrls(data.checkoutUrls ?? { family: null, pro: null, agency: null }))
      .catch(() => setCheckoutUrls({ family: null, pro: null, agency: null }));
  }, []);

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
        className="mx-auto max-w-6xl px-4 pt-10 sm:px-6"
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

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {TIERS.map(tier => {
            const name = t(`pricing.${tier.key}Name`);
            const price = t(`pricing.${tier.key}Price`);
            const desc = t(`pricing.${tier.key}Desc`);
            return (
              <motion.div
                key={tier.key}
                variants={fadeUp}
                whileHover={{ y: -4 }}
                transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                className={`relative flex flex-col rounded-3xl border p-7 ${
                  tier.highlighted
                    ? 'border-teal-400/40 bg-gradient-to-b from-teal-400/10 to-slate-900/60 shadow-[0_24px_80px_-24px_rgba(45,212,191,0.35)]'
                    : 'border-white/10 bg-slate-900/60'
                }`}
              >
                <h2 className="font-display text-lg font-semibold text-white">{name}</h2>
                <p className="mt-4">
                  <span className="font-display text-4xl font-bold text-white">{tier.key === 'family' ? '$29' : tier.key === 'pro' ? '$9' : '$49'}</span>
                  <span className="ml-2 text-sm text-slate-400">{price}</span>
                </p>
                <p className="mt-3 text-sm leading-relaxed text-slate-400">{desc}</p>

                <ul className="mt-6 flex-1 space-y-2.5">
                  {tier.features.map(f => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-slate-300">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-teal-300" />
                      {t(`pricing.${f}`)}
                    </li>
                  ))}
                </ul>

                {checkoutUrls[tier.key] ? (
                  <a
                    href={checkoutUrls[tier.key] as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`mt-7 w-full py-2.5 ${tier.highlighted ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    {t('pricing.cta')}
                    <ArrowRight className="h-4 w-4" />
                  </a>
                ) : (
                  <button disabled className="btn-secondary mt-7 w-full py-2.5 opacity-60">
                    {t('pricing.ctaSoon')}
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>

        <p className="mt-12 text-center text-sm text-slate-500">
          {t('landing.heroSubtitle')}
        </p>
      </motion.section>
    </main>
  );
}
