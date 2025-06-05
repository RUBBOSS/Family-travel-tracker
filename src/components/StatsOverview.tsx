'use client';

import { motion } from 'framer-motion';
import { FamilyMemberWithMeta } from '@/hooks/useFamilyMembers';

// Define the types locally to avoid circular dependencies
type UserStats = {
  id: number;
  name: string;
  color: string;
  countriesVisited: number;
};

type CountryStats = {
  id: number;
  countryName: string;
  countryCode: string;
  visitors: number;
};

type TopTraveler = {
  userId?: number;
  name: string;
  color?: string;
  visits: number;
};

type MostVisitedCountry = {
  countryId?: number;
  countryName: string;
  countryCode?: string;
  visitors: number;
};

type Stats = {
  general: {
    totalCountries: number;
    totalUsers: number;
    totalVisits: number;
    topTraveler: TopTraveler;
    mostVisitedCountry: MostVisitedCountry;
  };
  users: UserStats[];
  topCountries: CountryStats[];
};

interface StatsOverviewProps {
  stats: Stats | null;
  isLoading: boolean;
  error: string | null;
  selectedFamilyMemberId?: number | null;
  familyMembers?: FamilyMemberWithMeta[];
  selectedMemberVisitedCount?: number;
  currentUser?: { username?: string } | null;
}

export default function StatsOverview({ 
  stats, 
  isLoading, 
  error, 
  selectedFamilyMemberId, 
  familyMembers = [],
  selectedMemberVisitedCount = 0,
  currentUser
}: StatsOverviewProps) {
  
  if (isLoading) {
    return <StatsCardSkeleton />;
  }
  
  if (error || !stats) {
    return (
      <section className="text-center py-6 bg-red-500/10 border border-red-300 rounded-lg">
        <p className="text-red-400">Failed to load statistics</p>
      </section>
    );
  }
  
  const { general } = stats;
    // Determine which stats to show based on selection
  const selectedMember = selectedFamilyMemberId 
    ? familyMembers.find(m => m.id === selectedFamilyMemberId)
    : null;
      const displayStats = {
    totalCountries: general.totalCountries,
    totalUsers: general.totalUsers,
    totalVisits: selectedMemberVisitedCount,
    topTraveler: general.topTraveler
  };
  
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      <StatsCard
        title="Total Countries"
        value={displayStats.totalCountries}
        icon="🌎"
        color="from-blue-500 to-blue-600"
        delay={0.1}
      />
      
      <StatsCard
        title="Family Members"
        value={displayStats.totalUsers}
        icon="👨‍👩‍👧‍👦"
        color="from-green-500 to-green-600"
        delay={0.2}
      />
        <StatsCard
        title={selectedMember ? `${selectedMember.name}'s Visits` : currentUser ? `${currentUser.username}'s Visits` : "Total Visits"}
        value={displayStats.totalVisits}
        icon="✈️"
        color="from-purple-500 to-purple-600"
        delay={0.3}
      />
        <StatsCard
        title="Top Traveler"
        value={displayStats.topTraveler.name}
        subtitle={`${displayStats.topTraveler.visits} countries`}
        icon="🏆"
        color="from-amber-500 to-amber-600"
        delay={0.4}
      />
    </section>
  );
}

function StatsCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  color,
  delay
}: { 
  title: string; 
  value: number | string; 
  subtitle?: string; 
  icon: string;
  color: string;
  delay: number;
}) {
  return (
    <motion.div 
      className={`bg-gradient-to-br ${color} rounded-xl p-6 text-white shadow-lg`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/80 font-medium">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
          {subtitle && (
            <p className="text-sm text-white/80 mt-1">{subtitle}</p>
          )}
        </div>
        <div className="text-4xl opacity-80">{icon}</div>
      </div>
    </motion.div>
  );
}

function StatsCardSkeleton() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      {[...Array(4)].map((_, i) => (
        <div 
          key={i} 
          className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-6 animate-pulse"
        >
          <div className="h-5 w-24 bg-slate-600 rounded mb-3"></div>
          <div className="h-8 w-16 bg-slate-600 rounded"></div>
        </div>
      ))}
    </section>
  );
}
