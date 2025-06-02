import { supabase } from '@/utils/supabaseClient';
import { useUserContext } from '@/context/UserContext';
import { useEffect, useState, useCallback, useMemo } from 'react';
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

  const fetchVisitedCountries = useCallback(async () => {
    // Don't fetch if user is not authenticated
    if (!currentUser) {
      setVisitedCountries([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Fetching visited countries for user:', currentUser?.id);
      
      // Get the current user's session for the auth token
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData.session?.access_token) {
        console.error('No valid session available:', sessionError);
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
          console.log('Unauthorized - user may need to re-authenticate');
          setVisitedCountries([]);
          setIsLoading(false);
          return;
        }
        console.error('API error:', response.status);
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Visited countries data:', data);
      
      // Transform the Supabase data format to our VisitedCountry format
      const formattedData = data.map((item: any) => ({
        id: item.id,
        countryName: item.countries?.country_name,
        countryCode: item.countries?.country_code,
        flagUrl: item.countries?.flag_url,
        visitDate: item.visit_date,
        notes: item.notes
      }));
      
      setVisitedCountries(formattedData);
    } catch (err: any) {
      console.error('Error fetching countries:', err);
      setError(err.message || 'Failed to fetch visited countries');
      
      // Don't show mock data - just show empty list when there's an error
      setVisitedCountries([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

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
      await fetchVisitedCountries();
    } catch (err: any) {
      console.error('Error removing country:', err);
      toast.error(err.message || 'Failed to remove country');
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, fetchVisitedCountries]);

  useEffect(() => {
    if (currentUser) {
      fetchVisitedCountries();
    } else {
      setVisitedCountries([]);
    }
  }, [currentUser, fetchVisitedCountries]);

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
