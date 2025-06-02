'use client';

import { useState, useEffect } from 'react';
import { useStats } from '@/hooks/useStats';
import { motion } from 'framer-motion';

export default function StatsOverview() {
  const { stats, isLoading, error } = useStats();
  
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
  
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      <StatsCard
        title="Total Countries"
        value={general.totalCountries}
        icon="🌎"
        color="from-blue-500 to-blue-600"
        delay={0.1}
      />
      
      <StatsCard
        title="Family Members"
        value={general.totalUsers}
        icon="👨‍👩‍👧‍👦"
        color="from-green-500 to-green-600"
        delay={0.2}
      />
      
      <StatsCard
        title="Total Visits"
        value={general.totalVisits}
        icon="✈️"
        color="from-purple-500 to-purple-600"
        delay={0.3}
      />
      
      <StatsCard
        title="Top Traveler"
        value={general.topTraveler.name}
        subtitle={`${general.topTraveler.visits} countries`}
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
