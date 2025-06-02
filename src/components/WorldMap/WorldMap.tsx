'use client';

import { useState, useEffect, useMemo } from 'react';
import { useUserContext } from '@/context/UserContext';
import { useVisitedCountries } from '@/hooks/useVisitedCountries';
import { motion } from 'framer-motion';
import { MapPin, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';

// Dynamically import the SVG world map to avoid SSR issues
const DynamicWorldMap = dynamic(() => import('@/components/WorldMap/WorldMapSvg'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-96 flex items-center justify-center">
      <Loader2 className="animate-spin text-slate-400" size={48} />
    </div>
  ),
});

export default function WorldMap() {
  const { currentUser } = useUserContext();
  const { visitedCountries, visitedCountryCodes, fetchVisitedCountries, isLoading } = useVisitedCountries();
  const [isMapLoaded, setIsMapLoaded] = useState(false);
    useEffect(() => {
    if (currentUser) {
      fetchVisitedCountries();
    }
  }, [currentUser, fetchVisitedCountries]);

  const visitedPercentage = useMemo(() => {
    const totalCountries = 250; // Approximate number of countries in the world
    return ((visitedCountries.length / totalCountries) * 100).toFixed(1);
  }, [visitedCountries.length]);

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center z-10 rounded-lg">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 size={48} className="text-blue-500" />
          </motion.div>
        </div>
      )}

      <div className="bg-slate-900/30 backdrop-blur-sm rounded-lg p-4 mb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>            <h3 className="text-lg font-medium text-white">
              {currentUser ? (
                <>
                  <span className="font-semibold">{currentUser.username}</span>&apos;s world map
                </>
              ) : (
                'World map'
              )}
            </h3>
            <p className="text-slate-400 text-sm">
              {visitedCountries.length} countries visited ({visitedPercentage}% of the world)
            </p>
          </div>
          <div className="flex items-center text-sm">
            <span className="flex items-center mr-4">
              <div className="w-4 h-4 rounded bg-slate-700 mr-2"></div>
              <span className="text-slate-400">Not visited</span>
            </span>
            <span className="flex items-center">
              <div className="w-4 h-4 rounded bg-blue-600 mr-2"></div>
              <span className="text-slate-400">Visited</span>
            </span>
          </div>
        </div>
      </div>
      
      <div className="relative w-full overflow-auto rounded-lg border border-slate-700">
        <div className="min-w-[900px]">        <DynamicWorldMap
          visitedCountries={visitedCountryCodes}
          userColor={currentUser?.avatar_color || '#3b82f6'}
          onLoad={() => setIsMapLoaded(true)}
        />
        </div>
      </div>
      
      {!isLoading && visitedCountries.length === 0 && isMapLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <MapPin size={48} className="text-slate-600 mb-3" />          <p className="text-slate-400 text-center max-w-xs">
            {currentUser 
              ? `${currentUser.username} hasn't visited any countries yet. Add some countries to see them on the map.` 
              : `Select a family member to see their visited countries.`}
          </p>
        </div>
      )}
    </div>
  );
}
