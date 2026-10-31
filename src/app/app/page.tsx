'use client';

import { useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import Confetti from 'react-confetti';
import { useWindowSize } from 'usehooks-ts';
import { Globe2, LogOut, Plus, Share2 } from 'lucide-react';
import WorldMap, { MapVisit } from '@/components/WorldMap/WorldMap';
import FamilyMemberTabs from '@/components/FamilyMemberTabs';
import CountrySearch from '@/components/CountrySearch';
import StatsOverview from '@/components/StatsOverview';
import CountryTable from '@/components/CountryTable';
import BucketListPanel from '@/components/BucketListPanel';
import AddFamilyMemberDialog from '@/components/AddFamilyMemberDialog';
import AuthForm from '@/components/AuthForm';
import { AuroraBackground } from '@/components/AuroraBackground';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useLanguage } from '@/context/LanguageContext';
import { useUserContext } from '@/context/UserContext';
import { useVisitedCountries, FamilyScope } from '@/hooks/useVisitedCountries';
import { useBucketList } from '@/hooks/useBucketList';
import { useFamilyMembers } from '@/hooks/useFamilyMembers';
import { useStats } from '@/hooks/useStats';
import { supabase } from '@/utils/supabaseClient';
import { fadeUp, staggerContainer } from '@/lib/motion';
import { BucketListItem } from '@/hooks/useBucketList';

export default function TrackerPage() {
  const { t } = useLanguage();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [scope, setScope] = useState<FamilyScope>('all');
  const [highlightCode, setHighlightCode] = useState<string | null>(null);
  const [celebration, setCelebration] = useState<{ active: boolean; long: boolean }>({ active: false, long: false });
  const celebrationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { width, height } = useWindowSize();
  const { currentUser, isLoading } = useUserContext();
  const { visitedCountries, addCountry, removeCountry, isLoading: visitedCountriesLoading } = useVisitedCountries(scope);
  const { bucketItems, bucketCountryCodes, addToBucketList, removeFromBucketList } = useBucketList(scope);
  const [busyBucketId, setBusyBucketId] = useState<number | null>(null);
  const { familyMembers, addFamilyMember, deleteFamilyMember, loading: familyMembersLoading, isDeleting, fetchFamilyMembers } = useFamilyMembers();
  const { stats, isLoading: statsLoading, error: statsError, refreshStats } = useStats();

  const currentUserColor = currentUser?.avatar_color || '#14b8a6';

  // Map data: one entry per visit, colored by the member who traveled
  const visits: MapVisit[] = useMemo(() => {
    const memberColorById = new Map(familyMembers.map((m: any) => [m.id, m.avatarColor]));
    return visitedCountries.map(v => ({
      countryCode: v.countryCode,
      color: v.memberColor ?? (v.familyMemberId != null ? memberColorById.get(v.familyMemberId) ?? currentUserColor : currentUserColor),
      memberName: v.memberName ?? (v.familyMemberId == null ? t('stats.youName', { name: currentUser?.username ?? '' }) : undefined),
    }));
  }, [visitedCountries, familyMembers, currentUserColor, currentUser?.username, t]);

  const handleCountrySelect = async (countryId: number, notes?: string, visitDate?: string, countryCode?: string) => {
    try {
      await addCountry(countryId, notes || '', scope === 'all' ? null : scope, visitDate);
      await refreshStats();

      if (countryCode) {
        setHighlightCode(countryCode);
        const total = stats?.general.totalVisits ?? 0;
        const milestone = (total + 1) % 25 === 0 || total + 1 === 193;
        setCelebration({ active: true, long: milestone });
        if (celebrationTimer.current) clearTimeout(celebrationTimer.current);
        celebrationTimer.current = setTimeout(() => {
          setCelebration({ active: false, long: false });
          setHighlightCode(null);
        }, milestone ? 3500 : 1600);
      }
    } catch (error) {
      console.error('Failed to add country:', error);
    }
  };

  const handleCountryRemove = async (countryId: number) => {
    try {
      await removeCountry(countryId);
      await refreshStats();
    } catch (error) {
      console.error('Failed to remove country:', error);
    }
  };

  const handleBucketAdd = async (countryId: number, notes?: string) => {
    try {
      await addToBucketList(countryId, notes || '', scope);
    } catch (error) {
      console.error('Failed to add to bucket list:', error);
    }
  };

  const handleMarkVisited = async (item: BucketListItem) => {
    setBusyBucketId(item.id);
    try {
      await addCountry(item.countryId, item.notes, scope === 'all' ? null : scope);
      await removeFromBucketList(item.id);
      await refreshStats();
    } catch (error) {
      console.error('Failed to convert bucket list item:', error);
    } finally {
      setBusyBucketId(null);
    }
  };

  const handleBucketRemove = async (item: BucketListItem) => {
    setBusyBucketId(item.id);
    try {
      await removeFromBucketList(item.id);
    } catch (error) {
      console.error('Failed to remove bucket list item:', error);
    } finally {
      setBusyBucketId(null);
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleMemberAdded = () => {
    fetchFamilyMembers();
    refreshStats();
  };

  const handleMemberDeleted = async (id: number) => {
    try {
      await deleteFamilyMember(id);
      refreshStats();
    } catch (error) {
      console.error('Failed to delete family member:', error);
    }
  };

  const tableCountries = useMemo(() => {
    return visitedCountries.map(country => ({
      id: country.id.toString(),
      countryCode: country.countryCode,
      countryName: country.countryName,
      visitDate: country.visitDate,
      notes: country.notes || ''
    }));
  }, [visitedCountries]);

  const selectedMember = scope !== 'all' && scope !== null
    ? familyMembers.find((m: any) => m.id === scope)
    : null;
  const selectedMemberVisitedCount = scope !== 'all'
    ? visitedCountries.length
    : 0;
  const shareUrl = currentUser ? `${typeof window !== 'undefined' ? window.location.origin : ''}/u/${currentUser.username}` : '/';

  if (isLoading) return null;
  if (!currentUser) {
    return <AuthForm />;
  }

  return (
    <main className="min-h-screen">
      <AuroraBackground intensity="subtle" />

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3 md:py-4">
            <Link href="/" className="flex items-center space-x-2 sm:space-x-3 min-w-0 group">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-400/15 text-teal-300 ring-1 ring-teal-400/30 transition-colors group-hover:bg-teal-400/25">
                <Globe2 className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h1 className="truncate font-display text-base sm:text-lg font-semibold tracking-tight text-white">
                  <span className="hidden sm:inline">{t('tracker.appTitle')}</span>
                  <span className="sm:hidden">{t('tracker.appTitleShort')}</span>
                </h1>
              </div>
            </Link>
            <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
              <div className="text-right hidden md:block">
                <p className="text-xs text-slate-400">{t('common.exploringAs')}</p>
                <p className="text-sm font-semibold" style={{ color: currentUser.avatar_color }}>{currentUser.username}</p>
              </div>
              <div
                className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-slate-950"
                style={{ backgroundColor: currentUser.avatar_color }}
                title={currentUser.username}
              >
                {currentUser.username.charAt(0).toUpperCase()}
              </div>
              <LanguageSwitcher />
              <button onClick={handleSignOut} className="btn-ghost" aria-label={t('common.signOut')}>
                <LogOut size={15} />
                <span className="hidden sm:inline">{t('common.signOut')}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <motion.div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10"
        variants={staggerContainer(0.07)}
        initial="hidden"
        animate="visible"
      >
        {/* Stats Overview */}
        <motion.section variants={fadeUp}>
          <StatsOverview
            stats={stats}
            isLoading={statsLoading}
            error={statsError}
            selectedFamilyMemberId={scope === 'all' ? null : scope}
            familyMembers={familyMembers}
            selectedMemberVisitedCount={selectedMemberVisitedCount}
            currentUser={currentUser}
          />
        </motion.section>

        {/* Family Member Selection */}
        <motion.section variants={fadeUp} className="surface-card p-6">
          <div className="flex flex-wrap justify-between items-center gap-3 mb-5">
            <h2 className="section-heading">{t('members.title')}</h2>
            <button
              className="btn-primary"
              onClick={() => setIsDialogOpen(true)}
              disabled={familyMembersLoading || isLoading || !currentUser}
            >
              <Plus size={16} />
              {t('members.add')}
            </button>
          </div>
          <FamilyMemberTabs
            familyMembers={familyMembers}
            loading={familyMembersLoading || isDeleting}
            selectedMemberId={scope === 'all' ? -1 : scope}
            onDeleteMember={handleMemberDeleted}
            onMemberSelect={setScope}
            showAllChip
            allSelected={scope === 'all'}
            onSelectAll={() => setScope('all')}
          />
        </motion.section>

        {/* Country Search */}
        <motion.section variants={fadeUp} className="surface-card p-6">
          <div className="flex flex-wrap justify-between items-center gap-3 mb-5">
            <h2 className="section-heading">{t('search.title')}</h2>
            {selectedMember ? (
              <div className="text-sm text-slate-300">
                {t('search.addingFor')} <span className="font-semibold" style={{ color: selectedMember.avatarColor ?? '#5eead4' }}>{selectedMember.name}</span>
              </div>
            ) : (
              <div className="text-sm text-slate-300">
                {t('search.addingFor')} <span className="font-semibold text-teal-300">{currentUser.username}</span> ({t('common.you')})
              </div>
            )}
          </div>
          <CountrySearch
            onCountryAdd={handleCountrySelect}
            onBucketAdd={handleBucketAdd}
            bucketCountryIds={bucketItems.map(item => item.countryId)}
          />
        </motion.section>

        {/* Interactive World Map */}
        <motion.section variants={fadeUp} className="surface-card p-6">
          <div className="flex flex-wrap justify-between items-center gap-3 mb-5">
            <h2 className="section-heading">{t('map.title')}</h2>
            <a
              href={shareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
              title={t('map.publicMap')}
            >
              <Share2 size={15} />
              {t('map.publicMap')}
            </a>
          </div>
          <WorldMap
            visits={visits}
            bucketCodes={bucketCountryCodes}
            highlightCountryCode={highlightCode}
            isLoading={visitedCountriesLoading}
            title={scope === 'all'
              ? t('map.familyWorld', { name: currentUser.username })
              : scope === null
                ? t('map.personalWorld', { name: currentUser.username })
                : t('map.memberWorld', { name: selectedMember?.name ?? '' })}
          />
        </motion.section>

        {/* Bucket List */}
        <motion.section variants={fadeUp} className="surface-card p-6">
          <div className="flex flex-wrap justify-between items-center gap-3 mb-5">
            <h2 className="section-heading">{t('bucket.title')}</h2>
            {bucketItems.length > 0 && (
              <span className="text-sm text-slate-400">
                <span className="font-semibold text-amber-300 tabular-nums">{bucketItems.length}</span>{' '}
                {t('bucket.placesToGo', { n: bucketItems.length }).replace(/^\d+\s*/, '')}
              </span>
            )}
          </div>
          <BucketListPanel
            items={bucketItems}
            busyId={busyBucketId}
            onMarkVisited={handleMarkVisited}
            onRemove={handleBucketRemove}
          />
        </motion.section>

        {/* Visited Countries */}
        <motion.section variants={fadeUp} className="surface-card p-6">
          <h2 className="section-heading mb-5">{t('table.title')}</h2>
          <CountryTable
            countries={tableCountries}
            onRemoveCountry={(countryId) => handleCountryRemove(parseInt(countryId))}
          />
        </motion.section>
      </motion.div>

      {/* Add Family Member Dialog */}
      <AddFamilyMemberDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onMemberAdded={handleMemberAdded}
        addFamilyMember={addFamilyMember}
      />

      {/* Celebration confetti on new countries and milestones */}
      <AnimatePresence>
        {celebration.active && width > 0 && (
          <motion.div
            className="pointer-events-none fixed inset-0 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.4 } }}
          >
            <Confetti
              width={width}
              height={height}
              numberOfPieces={celebration.long ? 350 : 140}
              gravity={0.18}
              colors={['#2dd4bf', '#34d399', '#a78bfa', '#fbbf24', '#f472b6']}
              style={{ pointerEvents: 'none' }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
