import { supabase } from '@/utils/supabaseClient';
import { useUserContext } from '@/context/UserContext';
import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import toast from 'react-hot-toast';
import { useLanguage } from '@/context/LanguageContext';

export type FamilyScope = number | 'all' | null;

type VisitedCountry = {
  id: number;
  countryName: string;
  countryCode: string;
  flagUrl: string | null;
  visitDate: string;
  notes: string | null;
  familyMemberId?: number | null;
  memberName?: string | null;
  memberColor?: string | null;
};

export function useVisitedCountries(selectedFamilyMemberId: FamilyScope = null) {
  const { currentUser } = useUserContext();
  const { t } = useLanguage();
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

    // Create a cache key that includes both user ID and family member scope
    const cacheKey = `${currentUser.id}-${selectedFamilyMemberId ?? 'none'}`;

    // Prevent duplicate requests for the same scope, unless forced
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
        lastFetchedKey.current = null;
        return;
      }

      const accessToken = sessionData.session.access_token;

      // Make the API call with the auth token, including the member scope
      const url = selectedFamilyMemberId !== null
        ? `/api/visited?family_member_id=${selectedFamilyMemberId}`
        : '/api/visited';

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) {
        if (response.status === 401) {
          lastFetchedKey.current = null;
          setVisitedCountries([]);
          setIsLoading(false);
          return;
        }
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      // Discard stale responses (race conditions when switching scope quickly)
      if (requestId !== currentRequestRef.current) {
        return;
      }

      setVisitedCountries(data);
      lastFetchedKey.current = cacheKey;

    } catch (err: any) {
      console.error('Error fetching visited countries:', err);
      setError(err.message || 'Failed to fetch visited countries');
      setVisitedCountries([]);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [currentUser?.id, selectedFamilyMemberId]);

  const addCountry = useCallback(async (countryId: number, notes: string = '', familyMemberId: FamilyScope = null, visitDate?: string) => {
    if (!currentUser) return;

    try {
      setIsLoading(true);

      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;

      if (!accessToken) {
        throw new Error(t('toast.sessionExpired'));
      }

      const dateToUse = visitDate ? new Date(visitDate).toISOString() : new Date().toISOString();

      const response = await fetch('/api/visited', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          countryId,
          notes,
          visitDate: dateToUse,
          familyMemberId: familyMemberId === 'all' ? null : familyMemberId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error: ${response.status}`);
      }

      toast.success(t('toast.countryAdded'));
      lastFetchedKey.current = null;
      await fetchVisitedCountries(true);
    } catch (err: any) {
      console.error('Error adding country:', err);
      toast.error(err.message || 'Failed to add country');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, fetchVisitedCountries]);

  const removeCountry = useCallback(async (id: number) => {
    if (!currentUser) return;

    try {
      setIsLoading(true);

      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;

      if (!accessToken) {
        throw new Error('Your session expired — please sign in again.');
      }

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

      toast.success(t('toast.countryRemoved'));
      lastFetchedKey.current = null;
      await fetchVisitedCountries(true);
    } catch (err: any) {
      console.error('Error removing country:', err);
      toast.error(err.message || 'Failed to remove country');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, fetchVisitedCountries]);

  useEffect(() => {
    if (currentUser?.id) {
      const refreshData = async () => {
        lastFetchedKey.current = null;
        currentRequestRef.current++;
        // Brief pause lets any in-flight request observe the bumped counter
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
