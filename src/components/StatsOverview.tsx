'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Award, Trophy, Users } from 'lucide-react';
import { useCountUp } from '@/hooks/useCountUp';
import { Stats } from '@/hooks/useStats';
import { UserProfile } from '@/context/UserContext';
import { fadeUp, staggerContainer } from '@/lib/motion';

interface StatsOverviewProps {
  stats: Stats | null;
  isLoading: boolean;
  error: string | null;
  selectedFamilyMemberId?: number | null;
  familyMembers?: any[];
  selectedMemberVisitedCount?: number;
  currentUser?: UserProfile | null;
}

function AnimatedNumber({ value, decimals = 0 }: { value: number; decimals?: number }) {
  return (
    <span className="tabular-nums">
      {value.toFixed(decimals)}
    </span>
  );
}

/** Progress ring showing % of the world visited. */
function WorldRing({ percent }: { percent: number }) {
  const size = 132;
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, percent));

  return (
    <div className="relative h-[132px] w-[132px]" role="img" aria-label={`${clamped.toFixed(1)} percent of the world visited`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#ringGradient)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - clamped / 100) }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
        />
        <defs>
          <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2dd4bf" />
            <stop offset="100%" stopColor="#a78bfa" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-2xl font-bold text-white">
          <AnimatedNumber value={clamped} decimals={1} />%
        </span>
        <span className="text-[11px] uppercase tracking-wider text-slate-400">of the world</span>
      </div>
    </div>
  );
}

export default function StatsOverview({
  stats,
  isLoading,
  error,
  selectedFamilyMemberId,
  familyMembers,
  selectedMemberVisitedCount = 0,
  currentUser,
}: StatsOverviewProps) {
  const [started, setStarted] = useState(false);
  useEffect(() => {
    if (!isLoading && stats) setStarted(true);
  }, [isLoading, stats]);

  const totalVisits = useCountUp(stats?.general.totalVisits ?? 0, started);
  const totalMembers = useCountUp(stats?.general.totalUsers ?? 0, started);
  const percent = stats && stats.general.totalCountries > 0
    ? (stats.general.totalVisits / stats.general.totalCountries) * 100
    : 0;

  if (isLoading) {
    return (
      <div className="surface-card p-6" aria-busy="true" aria-label="Loading stats">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
          <div className="flex-1 space-y-4">
            <div className="h-8 w-48 animate-shimmer rounded-lg" />
            <div className="h-12 w-72 animate-shimmer rounded-lg" />
          </div>
          <div className="h-[132px] w-[132px] animate-shimmer rounded-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-sm text-red-300">
        <AlertCircle className="h-5 w-5 flex-shrink-0" />
        <p>Couldn&apos;t load your stats. {error}</p>
      </div>
    );
  }

  if (!stats) return null;

  const { general, users, regions } = stats;

  // Leaderboard: personal visits + each member, sorted by count
  const memberTotal = users.reduce((sum, u) => sum + u.countriesVisited, 0);
  const personalCount = Math.max(0, general.totalVisits - memberTotal);
  const travelers = [
    ...(personalCount > 0 && currentUser ? [{
      id: 'you',
      name: `${currentUser.username} (you)`,
      color: currentUser.avatar_color || '#6366f1',
      count: personalCount,
    }] : []),
    ...users
      .filter(u => u.countriesVisited > 0)
      .map(u => ({ id: u.id, name: u.name, color: u.color, count: u.countriesVisited })),
  ].sort((a, b) => b.count - a.count);
  const maxCount = travelers[0]?.count || 1;

  const selectedMember = selectedFamilyMemberId != null
    ? familyMembers?.find((m: any) => m.id === selectedFamilyMemberId)
    : null;

  return (
    <motion.section
      variants={staggerContainer(0.08)}
      initial="hidden"
      animate="visible"
      className="surface-card p-6 sm:p-8"
    >
      <div className="flex flex-col gap-8 lg:flex-row lg:items-center">
        {/* Left: headline numbers + leaderboard */}
        <div className="flex-1 space-y-8">
          <motion.div variants={fadeUp}>
            <h2 className="font-display text-sm font-medium uppercase tracking-widest text-slate-400">
              {selectedMember ? `${selectedMember.name}'s journey` : 'Journey so far'}
            </h2>
            <p className="mt-2 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
              <AnimatedNumber value={selectedMember ? selectedMemberVisitedCount : totalVisits} />
              <span className="ml-3 text-lg font-medium text-slate-400">
                {selectedMember
                  ? `of the family's ${general.totalCountries} countries`
                  : 'countries visited'}
              </span>
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" /> {Math.round(totalMembers)} {totalMembers === 1 ? 'explorer' : 'explorers'}
              </span>
              {general.mostVisitedCountry.countryId != null && (
                <span className="inline-flex items-center gap-1.5">
                  <Trophy className="h-3.5 w-3.5 text-amber-300" />
                  {general.mostVisitedCountry.countryName}
                </span>
              )}
            </div>
          </motion.div>

          {travelers.length > 0 && (
            <motion.div variants={fadeUp} className="space-y-3">
              <h3 className="flex items-center gap-2 text-sm font-medium text-slate-300">
                <Award className="h-4 w-4 text-teal-300" /> Family leaderboard
              </h3>
              <div className="space-y-2.5">
                {travelers.map((t, i) => (
                  <div key={t.id} className="flex items-center gap-3">
                    <span className="w-28 truncate text-sm text-slate-300 sm:w-36">{t.name}</span>
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-white/5">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: t.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${(t.count / maxCount) * 100}%` }}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.4 + i * 0.1 }}
                      />
                    </div>
                    <span className="w-8 text-right text-sm font-semibold tabular-nums text-white">{t.count}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Right: ring + regions */}
        <motion.div variants={fadeUp} className="flex flex-col items-center gap-6 lg:w-64">
          <WorldRing percent={percent} />
          {regions && regions.length > 0 && (
            <div className="flex w-full flex-wrap justify-center gap-1.5 lg:justify-start">
              {regions
                .filter(r => r.visitedInRegion > 0)
                .sort((a, b) => b.visitedInRegion - a.visitedInRegion)
                .map(r => (
                  <span
                    key={r.region}
                    className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-300"
                    title={`${r.visitedInRegion} of ${r.totalInRegion} countries in ${r.region}`}
                  >
                    {r.region} <span className="font-semibold text-teal-300 tabular-nums">{r.visitedInRegion}</span>
                    <span className="text-slate-500">/{r.totalInRegion}</span>
                  </span>
                ))}
            </div>
          )}
        </motion.div>
      </div>
    </motion.section>
  );
}
