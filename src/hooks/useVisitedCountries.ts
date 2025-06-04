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

export function useVisitedCountries() {
  const { currentUser } = useUserContext();
  const [visitedCountries, setVisitedCountries] = useState<VisitedCountry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastFetchedUserId = useRef<string | null>(null);
  const isFetchingRef = useRef(false);

  const fetchVisitedCountries = useCallback(async () => {
    // Don't fetch if user is not authenticated
    if (!currentUser?.id) {
      setVisitedCountries([]);
      setIsLoading(false);
      lastFetchedUserId.current = null;
      return;
    }

    // Prevent duplicate requests for the same user
    if (isFetchingRef.current || lastFetchedUserId.current === currentUser.id) {
      return;
    }

    try {
      isFetchingRef.current = true;
      setIsLoading(true);
      setError(null);
      
      // Get the current user's session for the auth token
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData.session?.access_token) {
        console.error('fetchVisitedCountries: No valid session available:', sessionError);
        setVisitedCountries([]);
        setIsLoading(false);
        return;
      }
      
      const accessToken = sessionData.session.access_token;
      
      // Make the API call with the auth token
      const response = await fetch('/api/visited', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          setVisitedCountries([]);
          setIsLoading(false);
          return;
        }
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
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
      lastFetchedUserId.current = currentUser.id;

    } catch (err: any) {
      console.error('Error fetching visited countries:', err);
      setError(err.message || 'Failed to fetch visited countries');
      setVisitedCountries([]);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [currentUser?.id]);

  const addCountry = useCallback(async (countryId: number, notes: string = '') => {
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
          visitDate: new Date().toISOString()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error: ${response.status}`);
      }
      
      toast.success('Country added successfully!');
      // Force refresh by clearing the cache and re-fetching
      lastFetchedUserId.current = null;
      await fetchVisitedCountries();
    } catch (err: any) {
      console.error('Error adding country:', err);
      toast.error(err.message || 'Failed to add country');
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, fetchVisitedCountries]);

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
      lastFetchedUserId.current = null;
      await fetchVisitedCountries();
    } catch (err: any) {
      console.error('Error removing country:', err);
      toast.error(err.message || 'Failed to remove country');
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, fetchVisitedCountries]);

  useEffect(() => {
    if (currentUser?.id) {
      fetchVisitedCountries();
    } else {
      setVisitedCountries([]);
      lastFetchedUserId.current = null;
    }
  }, [currentUser?.id, fetchVisitedCountries]);

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
