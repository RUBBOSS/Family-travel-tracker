'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Globe2, Loader2 } from 'lucide-react';
import { AuroraBackground } from '@/components/AuroraBackground';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useLanguage } from '@/context/LanguageContext';
import { fadeUp, staggerContainer } from '@/lib/motion';

const WorldMapSvg = dynamic(() => import('@/components/WorldMap/WorldMapSvg'), {
  ssr: false,
  loading: () => (
    <div className="flex aspect-[2000/880] w-full items-center justify-center rounded-xl bg-white/[0.02]">
      <Loader2 className="h-8 w-8 animate-spin text-teal-300/60" />
    </div>
  ),
});

interface PublicMapData {
  profile: {
    username: string;
    fullName: string;
    avatarColor: string;
    agencyName?: string | null;
    agencyLogoUrl?: string | null;
    agencyColor?: string | null;
  };
  visits: Array<{
    countryCode: string;
    countryName: string;
    visitDate: string;
    memberName: string;
    memberColor: string;
    isPersonal: boolean;
  }>;
  familyMembers: Array<{ name: string; color: string }>;
}

const TOTAL_COUNTRIES = 193;

export default function PublicMapPage({ params }: { params: Promise<{ username: string }> }) {
  const { t } = useLanguage();
  const [username, setUsername] = useState<string | null>(null);
  const [data, setData] = useState<PublicMapData | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'not-found'>('loading');

  useEffect(() => {
    params.then(p => setUsername(decodeURIComponent(p.username)));
  }, [params]);

  useEffect(() => {
    if (!username) return;
    let cancelled = false;

    fetch(`/api/public/${encodeURIComponent(username)}`)
      .then(async res => {
        if (res.status === 404) throw new Error('not-found');
        if (!res.ok) throw new Error('failed');
        return res.json();
      })
      .then(json => {
        if (cancelled) return;
        setData(json);
        setState('ready');
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setState(err.message === 'not-found' ? 'not-found' : 'ready');
      });

    return () => {
      cancelled = true;
    };
  }, [username]);

  const visits = data?.visits ?? [];
  const countryColors = useMemo(() => {
    const colors: Record<string, string> = {};
    for (const visit of visits) {
      if (visit.countryCode && visit.countryCode !== 'XX') {
        colors[visit.countryCode] = visit.memberColor;
      }
    }
    return colors;
  }, [visits]);

  const uniqueCount = Object.keys(countryColors).length;
  const percent = ((uniqueCount / TOTAL_COUNTRIES) * 100).toFixed(1);

  if (state === 'loading') {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal-300/60" />
      </main>
    );
  }

  if (state === 'not-found' || !data) {
    return (
      <main className="relative flex min-h-screen flex-col items-center justify-center px-4 text-center">
        <AuroraBackground />
        <Globe2 className="h-10 w-10 text-slate-500" />
        <h1 className="mt-6 font-display text-3xl font-bold text-white">{t('share.notFoundTitle')}</h1>
        <p className="mt-2 text-slate-400">{t('share.notFoundText')}</p>
        <Link href="/" className="btn-primary mt-8">
          {t('share.notFoundCta')}
        </Link>
      </main>
    );
  }

  const { profile } = data;

  return (
    <main className="relative min-h-screen pb-16">
      <AuroraBackground />

      {/* Header */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6 sm:px-6">
        <div className="flex items-center gap-3">
          {profile.agencyLogoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.agencyLogoUrl}
              alt=""
              className="h-10 w-10 rounded-xl object-contain ring-1 ring-white/10"
            />
          ) : (
            <span
              className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-slate-950"
              style={{ backgroundColor: profile.agencyColor || profile.avatarColor }}
            >
              {profile.username.charAt(0).toUpperCase()}
            </span>
          )}
          <div>
            {profile.agencyName ? (
              <>
                <p className="font-display text-lg font-semibold leading-tight text-white">{profile.agencyName}</p>
                <p className="text-xs text-slate-400">
                  {t('share.clientOf')} @{profile.username}
                </p>
              </>
            ) : (
              <>
                <p className="font-display text-lg font-semibold leading-tight text-white">{profile.fullName || profile.username}</p>
                <p className="text-xs text-slate-400">@{profile.username}</p>
              </>
            )}
          </div>
        </div>
        <LanguageSwitcher />
        <Link href="/" className="btn-secondary">
          {t('share.makeYourOwn')}
        </Link>
      </header>

      <motion.div
        className="mx-auto max-w-6xl px-4 sm:px-6"
        variants={staggerContainer(0.09)}
        initial="hidden"
        animate="visible"
      >
        {/* Headline numbers */}
        <motion.section variants={fadeUp} className="text-center">
          <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-5xl">
            {t('share.headline', { n: uniqueCount })}
          </h1>
          <p className="mt-3 text-slate-400">
            {t('share.subtitle', { p: percent })}
            {data.familyMembers.length > 0 && t('share.withMembers', { names: data.familyMembers.map(m => m.name).join(', ') })}
          </p>
        </motion.section>

        {/* The map */}
        <motion.section variants={fadeUp} className="surface-card mt-10 p-4 sm:p-6">
          <WorldMapSvg countryColors={countryColors} />
        </motion.section>

        {/* Legend + recent trips */}
        <motion.section variants={fadeUp} className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
          <div className="surface-card p-5">
            <h2 className="section-heading mb-4 text-base">{t('share.explorers')}</h2>
            <ul className="space-y-2.5">
              {Array.from(new Map(visits.map(v => [v.memberColor, v.memberName])).entries()).map(([color, name]) => (
                <li key={color} className="flex items-center gap-3 text-sm">
                  <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: color }} />
                  <span className="text-slate-200">{name}</span>
                  <span className="ml-auto tabular-nums text-slate-400">
                    {visits.filter(v => v.memberColor === color).length}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="surface-card p-5">
            <h2 className="section-heading mb-4 text-base">{t('share.latest')}</h2>
            <ul className="space-y-2.5">
              {visits.slice(0, 5).map((visit, i) => (
                <li key={`${visit.countryCode}-${i}`} className="flex items-center gap-3 text-sm">
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-950"
                    style={{ backgroundColor: visit.memberColor }}
                  >
                    {visit.memberName}
                  </span>
                  <span className="text-slate-200">{visit.countryName}</span>
                  <span className="ml-auto tabular-nums text-xs text-slate-500">
                    {new Date(visit.visitDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </motion.section>

        {/* CTA */}
        <motion.section variants={fadeUp} className="mt-12 text-center">
          <p className="font-display text-xl font-semibold text-white">
            {t('share.finalTitle')}
          </p>
          <Link href="/" className="btn-primary mt-4">
            {t('share.finalCta')}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.section>
      </motion.div>
    </main>
  );
}
