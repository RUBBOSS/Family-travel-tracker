'use client';

import Link from 'next/link';
import { Compass, Globe2 } from 'lucide-react';
import { AuroraBackground } from '@/components/AuroraBackground';
import { useLanguage } from '@/context/LanguageContext';

export default function NotFound() {
  const { t } = useLanguage();
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <AuroraBackground />
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-400/15 text-teal-300 ring-1 ring-teal-400/30">
        <Globe2 className="h-7 w-7" />
      </div>
      <h1 className="mt-6 font-display text-5xl font-bold tracking-tight text-white">{t('nf.title')}</h1>
      <p className="mt-3 max-w-md text-slate-400">{t('nf.text')}</p>
      <Link href="/app" className="btn-primary mt-8">
        <Compass className="h-4 w-4" />
        {t('nf.cta')}
      </Link>
    </main>
  );
}
