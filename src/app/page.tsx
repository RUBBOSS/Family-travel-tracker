'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { MapPin, User, Plus, LogOut } from 'lucide-react';
import WorldMap from '@/components/WorldMap/WorldMap';
import FamilyMemberTabs from '@/components/FamilyMemberTabs';
import CountrySearch from '@/components/CountrySearch';
import StatsOverview from '@/components/StatsOverview';
import CountryTable from '@/components/CountryTable';
import AddFamilyMemberDialog from '@/components/AddFamilyMemberDialog';
import AuthForm from '@/components/AuthForm';
import { SchemaSetupGuide } from '@/components/SchemaSetupGuide';
import { useUserContext } from '@/context/UserContext';
import { useVisitedCountries } from '@/hooks/useVisitedCountries';
import { useFamilyMembers } from '@/hooks/useFamilyMembers';
import { useStats } from '@/hooks/useStats';
import { supabase } from '@/utils/supabaseClient';
import { FamilyMember } from '@/db/schema-unified';

export default function Home() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFamilyMemberId, setSelectedFamilyMemberId] = useState<number | null>(null);
  const { currentUser, isLoading } = useUserContext();
  const { visitedCountries, visitedCountryCodes, addCountry, removeCountry, isLoading: visitedCountriesLoading } = useVisitedCountries(selectedFamilyMemberId);
  const { familyMembers, addFamilyMember, deleteFamilyMember, loading: familyMembersLoading, isDeleting, fetchFamilyMembers } = useFamilyMembers();
  const { stats, isLoading: statsLoading, error: statsError, refreshStats } = useStats();  const handleCountrySelect = async (countryId: number, notes?: string, visitDate?: string) => {
    try {
      await addCountry(countryId, notes || '', selectedFamilyMemberId, visitDate);
      // Refresh stats after adding a country
      await refreshStats();
    } catch (error) {
      console.error('Failed to add country:', error);
    }
  };

  const handleCountryRemove = async (countryId: number) => {
    try {
      await removeCountry(countryId);
      // Refresh stats after removing a country
      await refreshStats();
    } catch (error) {
      console.error('Failed to remove country:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      window.location.reload();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };  const handleMemberAdded = () => {
    // Refresh the family members data to show the new member immediately
    fetchFamilyMembers();
    // Also refresh stats to update the family member count
    refreshStats();
  };

  const handleMemberDeleted = async (id: number) => {
    try {
      await deleteFamilyMember(id);
      // Refresh stats after successful deletion
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

  if (isLoading) return null;
  if (!currentUser) {
    return <AuthForm />;
  }

  return (
    <main className="min-h-screen">
      {/* Header */}      <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 md:py-6">
            <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
              <motion.div 
                className="text-2xl sm:text-3xl flex-shrink-0"
                initial={{ rotate: -15 }}
                animate={{ rotate: 15 }}
                transition={{ repeat: Infinity, repeatType: 'reverse', duration: 2 }}
              >
                🌍
              </motion.div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white truncate">
                  <span className="hidden sm:inline">Family Travel Tracker</span>
                  <span className="sm:hidden">Travel Tracker</span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 hidden sm:block">Discover the world together</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
              {currentUser && (
                <>
                  <div className="text-right hidden md:block">
                    <p className="text-sm text-slate-400">Current traveler</p>
                    <p className="font-semibold" style={{ color: currentUser.avatar_color }}>{currentUser.username}</p>
                  </div>
                  <div 
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-lg flex-shrink-0" 
                    style={{ backgroundColor: currentUser.avatar_color }}
                    title={currentUser.username}
                  >
                    {currentUser.username.charAt(0).toUpperCase()}
                  </div>                  <button 
                    onClick={() => {
                      // Import the clearAuth function dynamically to ensure it's available
                      import('@/utils/clearAuth').then(module => {
                        module.clearAuthState();
                      });
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white py-1.5 px-2 sm:py-2 sm:px-4 rounded-md flex items-center gap-1 sm:gap-2 transition-colors text-sm sm:text-base"
                    aria-label="Logout"
                  >
                    <LogOut size={14} className="sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>{/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Schema Setup Guide - only shows when DB setup issues are detected */}
        <SchemaSetupGuide />        {/* Stats Overview */}
        <StatsOverview 
          stats={stats} 
          isLoading={statsLoading} 
          error={statsError}
          selectedFamilyMemberId={selectedFamilyMemberId}
          familyMembers={familyMembers}
          selectedMemberVisitedCount={visitedCountries.length}
          currentUser={currentUser}
        />
        
        {/* Family Member Selection */}
        <section className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">Family Members</h2>            <button 
              className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => setIsDialogOpen(true)}
              disabled={familyMembersLoading || isLoading || !currentUser}
            >
              <Plus size={16} />
              <span>
                {familyMembersLoading ? 'Loading...' : 
                 isLoading ? 'Authenticating...' :
                 !currentUser ? 'Sign in required' : 'Add Member'}
              </span>
            </button></div>          <FamilyMemberTabs 
            familyMembers={familyMembers} 
            loading={familyMembersLoading || isDeleting}
            selectedMemberId={selectedFamilyMemberId}
            onDeleteMember={handleMemberDeleted}
            onMemberSelect={setSelectedFamilyMemberId}
          />
        </section>        {/* Country Search */}        
        <section className="relative z-10 bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">Add a Country</h2>
            {selectedFamilyMemberId ? (
              <div className="text-sm text-slate-300">
                Adding for: <span className="font-medium text-blue-400">
                    {familyMembers.find((m: FamilyMember) => m.id === selectedFamilyMemberId)?.name}
                </span>
              </div>
            ) : (
              <div className="text-sm text-slate-300">
                Adding for: <span className="font-medium text-blue-400">
                  {currentUser?.username} (You)
                </span>
              </div>
            )}
          </div>
          <CountrySearch onCountryAdd={handleCountrySelect} />
        </section>
          {/* Interactive World Map */}
        <section className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <h2 className="text-xl font-semibold mb-4 text-white">World Map</h2>          <WorldMap 
            selectedFamilyMemberId={selectedFamilyMemberId}
            familyMembers={familyMembers}
            visitedCountryCodes={visitedCountryCodes}
            isLoading={visitedCountriesLoading}
          />
        </section>
          {/* Country Table */}
        <section className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <h2 className="text-xl font-semibold mb-4 text-white">Visited Countries</h2>          <CountryTable
            countries={tableCountries}
            onRemoveCountry={(countryId) => handleCountryRemove(parseInt(countryId))}
          />
        </section>
      </div>
        {/* Add Family Member Dialog */}      <AddFamilyMemberDialog 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)}
        onMemberAdded={handleMemberAdded}
        addFamilyMember={addFamilyMember}
      />
    </main>
  );
}
