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

export default function Home() {  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { currentUser, isLoading } = useUserContext();
  const { visitedCountries, addCountry, removeCountry } = useVisitedCountries();  const { familyMembers, addFamilyMember, deleteFamilyMember, loading: familyMembersLoading, isDeleting, fetchFamilyMembers } = useFamilyMembers();
  const { stats, isLoading: statsLoading, error: statsError, refreshStats } = useStats();

  useEffect(() => {
    console.log('page.tsx: visitedCountries state changed:', visitedCountries);
    if (visitedCountries.length > 0) {
      console.log('page.tsx: First visited country details:', {
        id: visitedCountries[0].id,
        countryName: visitedCountries[0].countryName,
        countryCode: visitedCountries[0].countryCode,
        flagUrl: visitedCountries[0].flagUrl,
        visitDate: visitedCountries[0].visitDate,
        notes: visitedCountries[0].notes,
      });
    }
  }, [visitedCountries]);

  const handleCountrySelect = async (countryId: number) => {
    try {
      await addCountry(countryId);
    } catch (error) {
      console.error('Failed to add country:', error);
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
    console.log('page.tsx: Memoizing tableCountries from visitedCountries:', visitedCountries);
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
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <motion.div 
                className="text-3xl"
                initial={{ rotate: -15 }}
                animate={{ rotate: 15 }}
                transition={{ repeat: Infinity, repeatType: 'reverse', duration: 2 }}
              >
                🌍
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold text-white">Family Travel Tracker</h1>
                <p className="text-slate-400">Discover the world together</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {currentUser && (
                <>
                  <div className="text-right">
                    <p className="text-sm text-slate-400">Current traveler</p>
                    <p className="font-semibold" style={{ color: currentUser.avatar_color }}>{currentUser.username}</p>
                  </div>
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg" 
                    style={{ backgroundColor: currentUser.avatar_color }}
                  >
                    {currentUser.username.charAt(0).toUpperCase()}
                  </div>                  <button 
                    onClick={() => {
                      // Import the clearAuth function dynamically to ensure it's available
                      import('@/utils/clearAuth').then(module => {
                        module.clearAuthState();
                      });
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md flex items-center gap-2 transition-colors"
                    aria-label="Logout"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Schema Setup Guide - only shows when DB setup issues are detected */}
        <SchemaSetupGuide />
          {/* Stats Overview */}
        <StatsOverview stats={stats} isLoading={statsLoading} error={statsError} />
        
        {/* Family Member Selection */}
        <section className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">Family Members</h2>
            <button 
              className="btn-primary flex items-center gap-2"
              onClick={() => setIsDialogOpen(true)}
            >
              <Plus size={16} />
              <span>Add Member</span>
            </button>          </div>          <FamilyMemberTabs 
            familyMembers={familyMembers} 
            loading={familyMembersLoading || isDeleting}
            onDeleteMember={handleMemberDeleted}
          />
        </section>
          {/* Country Search */}
        <section className="relative z-10 bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <h2 className="text-xl font-semibold mb-4 text-white">Add a Country</h2>
          <CountrySearch onCountrySelect={handleCountrySelect} />
        </section>
        
        {/* Interactive World Map */}
        <section className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <h2 className="text-xl font-semibold mb-4 text-white">World Map</h2>
          <WorldMap />
        </section>
          {/* Country Table */}
        <section className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <h2 className="text-xl font-semibold mb-4 text-white">Visited Countries</h2>
          <CountryTable
            countries={tableCountries}
            onRemoveCountry={(countryId) => removeCountry(parseInt(countryId))}
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
