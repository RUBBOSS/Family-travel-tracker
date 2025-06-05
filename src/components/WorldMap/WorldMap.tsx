'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useUserContext } from '@/context/UserContext';
import { useVisitedCountries } from '@/hooks/useVisitedCountries';
import { useCountries } from '@/hooks/useCountries';
import { FamilyMemberWithMeta } from '@/hooks/useFamilyMembers';
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

interface WorldMapProps {
  selectedFamilyMemberId?: number | null;
  familyMembers?: FamilyMemberWithMeta[];
}

export default function WorldMap({ selectedFamilyMemberId, familyMembers = [] }: WorldMapProps) {
  const { currentUser } = useUserContext();
  const { visitedCountries, visitedCountryCodes, fetchVisitedCountries, isLoading } = useVisitedCountries(selectedFamilyMemberId);
  const { totalCount: totalCountries } = useCountries();
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const prevSelectedMemberRef = useRef<number | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Debounce family member changes to prevent rapid successive API calls
    if (currentUser && prevSelectedMemberRef.current !== selectedFamilyMemberId) {
      // Clear any existing timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      
      // Set a new timeout to delay the fetch
      debounceTimeoutRef.current = setTimeout(() => {
        prevSelectedMemberRef.current = selectedFamilyMemberId ?? null;
        fetchVisitedCountries(true);
      }, 100); // 100ms debounce
    }
    
    // Cleanup timeout on unmount
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [currentUser, selectedFamilyMemberId, fetchVisitedCountries]);

  const handleMapLoad = useCallback(() => {
    setIsMapLoaded(true);
  }, []);
  const visitedPercentage = useMemo(() => {
    if (totalCountries === 0) return '0.0';
    return ((visitedCountries.length / totalCountries) * 100).toFixed(1);
  }, [visitedCountries.length, totalCountries]);

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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">          <div>            <h3 className="text-lg font-medium text-white">
              {(() => {
                if (selectedFamilyMemberId) {
                  const selectedMember = familyMembers.find(m => m.id === selectedFamilyMemberId);
                  return selectedMember ? (
                    <>
                      <span className="font-semibold">{selectedMember.name}</span>&apos;s world map
                    </>
                  ) : (
                    'World map'
                  );
                } else if (currentUser) {
                  return (
                    <>
                      <span className="font-semibold">{currentUser.username}</span>&apos;s world map
                    </>
                  );
                } else {
                  return 'World map';
                }
              })()}
            </h3>
            <p className="text-slate-400 text-sm">
              {visitedCountries.length} countries visited ({visitedPercentage}% of the world)
            </p>
          </div>          <div className="flex items-center text-sm">
            <span className="flex items-center mr-4">
              <div className="w-4 h-4 rounded bg-slate-700 mr-2"></div>
              <span className="text-slate-400">Not visited</span>
            </span>
            <span className="flex items-center">
              <div 
                className="w-4 h-4 rounded mr-2"
                style={{ backgroundColor: (() => {
                  if (selectedFamilyMemberId) {
                    const selectedMember = familyMembers.find(m => m.id === selectedFamilyMemberId);
                    return selectedMember?.avatarColor || '#3b82f6';
                  }
                  return currentUser?.avatar_color || '#3b82f6';
                })() }}
              ></div>
              <span className="text-slate-400">Visited</span>
            </span>
          </div>
        </div>
      </div>
        <div className="relative w-full overflow-auto rounded-lg border border-slate-700">
        <div className="min-w-[900px]">        <DynamicWorldMap
          visitedCountries={visitedCountryCodes}
          userColor={(() => {
            if (selectedFamilyMemberId) {
              const selectedMember = familyMembers.find(m => m.id === selectedFamilyMemberId);
              return selectedMember?.avatarColor || '#3b82f6';
            }
            return currentUser?.avatar_color || '#3b82f6';
          })()}
          onLoad={handleMapLoad}
        />
        </div>
      </div>
      
      {!isLoading && visitedCountries.length === 0 && isMapLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">          <MapPin size={48} className="text-slate-600 mb-3" />          <p className="text-slate-400 text-center max-w-xs">
            {(() => {
              if (selectedFamilyMemberId) {
                const selectedMember = familyMembers.find(m => m.id === selectedFamilyMemberId);
                return selectedMember ? 
                  `${selectedMember.name} hasn't visited any countries yet. Add some countries to see them on the map.` :
                  `Select a family member to see their visited countries.`;
              } else if (currentUser) {
                return `${currentUser.username} hasn't visited any countries yet. Add some countries to see them on the map.`;
              } else {
                return `Select a family member to see their visited countries.`;
              }
            })()}
          </p>
        </div>
      )}
    </div>
  );
}
