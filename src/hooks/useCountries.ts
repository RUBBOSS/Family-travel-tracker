import { useState, useEffect, useCallback } from 'react';

interface Country {
  id: number;
  country_code: string;
  country_name: string;
  flag_url?: string;
  population?: number;
  capital?: string;
  region?: string;
  subregion?: string;
}

export function useCountries() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCountries = useCallback(async (query?: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const url = query 
        ? `/api/countries?query=${encodeURIComponent(query)}`
        : '/api/countries';
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      setCountries(data);
    } catch (err: any) {
      console.error('Error fetching countries:', err);
      setError(err.message || 'Failed to fetch countries');
      setCountries([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch all countries on mount
  useEffect(() => {
    fetchCountries();
  }, [fetchCountries]);
  return {
    countries,
    totalCount: countries.length,
    isLoading,
    error,
    fetchCountries,
    searchCountries: (query: string) => fetchCountries(query),
  };
}
