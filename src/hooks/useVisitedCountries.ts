import { supabase } from '@/utils/supabaseClient';
import { useUserContext } from '@/context/UserContext';
import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import toast from 'react-hot-toast';

type VisitedCountry = {
  id: number;
  countryName: string;
  countryCode: string;
  flagUrl: string | null;
  visitDate: string;
  notes: string | null;
};

export function useVisitedCountries(selectedFamilyMemberId: number | null = null) {
  const { currentUser } = useUserContext();
  const [visitedCountries, setVisitedCountries] = useState<VisitedCountry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastFetchedKey = useRef<string | null>(null);
  const isFetchingRef = useRef(false);
  const currentRequestRef = useRef<number>(0); // Track request sequence

  const fetchVisitedCountries = useCallback(async (forceRefresh = false) => {
    // Don't fetch if user is not authenticated
    if (!currentUser?.id) {
      setVisitedCountries([]);
      setIsLoading(false);
      lastFetchedKey.current = null;
      return;
    }

    // Create a cache key that includes both user ID and selected family member ID
    const cacheKey = `${currentUser.id}-${selectedFamilyMemberId || 'none'}`;
    
    // Prevent duplicate requests for the same user and family member combination
    // But allow forced refresh when switching family members or after prolonged inactivity
    if (isFetchingRef.current || (!forceRefresh && lastFetchedKey.current === cacheKey)) {
      return;
    }

    try {
      isFetchingRef.current = true;
      setIsLoading(true);
      setError(null);
      
      // Increment request counter and capture current request ID
      const requestId = ++currentRequestRef.current;
      
      // Get the current user's session for the auth token
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData.session?.access_token) {
        console.error('fetchVisitedCountries: No valid session available:', sessionError);
        setVisitedCountries([]);
        setIsLoading(false);
        // Clear cache on session errors to force fresh fetch on next attempt
        lastFetchedKey.current = null;
        return;
      }
      
      const accessToken = sessionData.session.access_token;
      
      // Make the API call with the auth token, including family member filter
      const url = selectedFamilyMemberId 
        ? `/api/visited?family_member_id=${selectedFamilyMemberId}`
        : '/api/visited';
        
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        // Add timeout to handle network issues after prolonged inactivity
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          // Clear cache on auth errors to force fresh fetch
          lastFetchedKey.current = null;
          setVisitedCountries([]);
          setIsLoading(false);
          return;
        }
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Check if this is still the latest request (handle race conditions)
      if (requestId !== currentRequestRef.current) {
        console.log('Discarding stale request response');
        return;
      }
      
      // Transform the API data format to our VisitedCountry format
      const formattedData = data.map((item: any) => ({
        id: item.id,
        countryName: item.countryName,
        countryCode: item.countryCode,
        flagUrl: item.flagUrl,
        visitDate: item.visitDate,
        notes: item.notes
      }));

      setVisitedCountries(formattedData);
      lastFetchedKey.current = cacheKey;

    } catch (err: any) {
      console.error('Error fetching visited countries:', err);
      setError(err.message || 'Failed to fetch visited countries');
      setVisitedCountries([]);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [currentUser?.id, selectedFamilyMemberId]); // Stable dependencies

  const addCountry = useCallback(async (countryId: number, notes: string = '', familyMemberId: number | null = null) => {
    if (!currentUser) return;

    try {
      setIsLoading(true);

      // Get the current user's session for the auth token
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      
      if (!accessToken) {
        throw new Error('Authentication error');
      }
      
      // Make the API call with the auth token
      const response = await fetch('/api/visited', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          countryId,
          notes,
          visitDate: new Date().toISOString(),
          familyMemberId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error: ${response.status}`);
      }
      
      toast.success('Country added successfully!');
      // Force refresh by clearing the cache and re-fetching
      lastFetchedKey.current = null;
      await fetchVisitedCountries(true);
    } catch (err: any) {
      console.error('Error adding country:', err);
      toast.error(err.message || 'Failed to add country');
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, fetchVisitedCountries]); // Use stable fetchVisitedCountries

  const removeCountry = useCallback(async (id: number) => {
    if (!currentUser) return;
    
    try {
      setIsLoading(true);
      
      // Get the current user's session for the auth token
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      
      if (!accessToken) {
        throw new Error('Authentication error');
      }
      
      // Make the API call with the auth token
      const response = await fetch(`/api/visited/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error: ${response.status}`);
      }
      
      toast.success('Country removed successfully!');
      // Force refresh by clearing the cache and re-fetching
      lastFetchedKey.current = null;
      await fetchVisitedCountries(true);
    } catch (err: any) {
      console.error('Error removing country:', err);
      toast.error(err.message || 'Failed to remove country');
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, fetchVisitedCountries]); // Use stable fetchVisitedCountries

  useEffect(() => {
    if (currentUser?.id) {
      // Force refresh when family member selection changes to ensure fresh data
      const refreshData = async () => {
        // Clear cache first to ensure fresh data
        lastFetchedKey.current = null;
        // Cancel any in-flight requests
        currentRequestRef.current++;
        // Wait a brief moment to ensure any pending requests are cancelled
        await new Promise(resolve => setTimeout(resolve, 50));
        await fetchVisitedCountries(true);
      };
      refreshData();
    } else {
      setVisitedCountries([]);
      lastFetchedKey.current = null;
    }
  }, [currentUser?.id, selectedFamilyMemberId, fetchVisitedCountries]);

  const visitedCountryCodes = useMemo(() => {
    return visitedCountries.map((country) => country.countryCode);
  }, [visitedCountries]);

  return {
    visitedCountries,
    visitedCountryCodes,
    isLoading,
    error,
    fetchVisitedCountries,
    addCountry,
    removeCountry,
  };
}
