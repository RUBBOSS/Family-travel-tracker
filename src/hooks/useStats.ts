import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { useUserContext } from '@/context/UserContext';

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

export function useStats() {
  const { currentUser, isLoading: userLoading } = useUserContext();
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Move fetchStats outside useEffect so it can be called manually
  const fetchStats = useCallback(async () => {
    // Don't fetch stats if user context is still loading
    if (userLoading) {
      return;
    }
    
    // Don't fetch stats if user is not authenticated
    if (!currentUser) {
      setStats(null);
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);

      // Get the current session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData?.session?.access_token) {
        console.log('No valid session for stats fetch');
        setStats(null);
        setIsLoading(false);
        return;
      }
      
      const token = sessionData.session.access_token;
      
      const response = await fetch('/api/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.log('Unauthorized stats request');
          setStats(null);
          setIsLoading(false);
          return;
        }
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setStats(data);
    } catch (err: any) {
      console.error('Stats fetch error:', err);
      setError(err.message || 'Failed to fetch stats');
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, userLoading]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);
  // Function to manually refresh stats
  const refreshStats = fetchStats;

  return { stats, isLoading, error, refreshStats };
}
