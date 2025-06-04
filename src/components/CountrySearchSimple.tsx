'use client';

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

interface Country {
  id: number;
  country_code: string;
  country_name: string;
}

interface CountrySearchProps {
  onCountrySelect?: (countryId: number) => void;
}

export default function CountrySearchSimple({ onCountrySelect }: CountrySearchProps) {
  const [query, setQuery] = useState('');
  const [countries, setCountries] = useState<Country[]>([]);
  const [filteredCountries, setFilteredCountries] = useState<Country[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Fetch countries on mount
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setIsLoading(true);
        console.log('🔍 Fetching countries...');
        const response = await fetch('/api/countries');
        console.log('📡 Response status:', response.status);
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Countries fetched:', data.length);
          setCountries(data);
        } else {
          console.error('❌ Failed to fetch countries, status:', response.status);
        }
      } catch (error) {
        console.error('💥 Failed to fetch countries:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCountries();
  }, []);

  // Filter countries when query changes
  useEffect(() => {
    if (query.trim() && countries.length > 0) {
      console.log('🔎 Filtering with query:', query);
      const filtered = countries.filter(country =>
        country.country_name.toLowerCase().includes(query.toLowerCase())
      );
      console.log('🎯 Found', filtered.length, 'countries');
      setFilteredCountries(filtered);
      setShowDropdown(true);
    } else {
      setFilteredCountries([]);
      setShowDropdown(false);
    }
  }, [query, countries]);

  const handleCountrySelect = (countryId: number) => {
    console.log('🌍 Selected country ID:', countryId);
    onCountrySelect?.(countryId);
    setQuery('');
    setShowDropdown(false);
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search countries..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Debug info */}      <div className="text-xs text-slate-400 mt-1">
        Countries: {countries.length}, Query: {query}, Filtered: {filteredCountries.length}, Show: {showDropdown.toString()}
      </div>

      {/* Simple dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          <div className="px-4 py-2 text-xs text-yellow-400 border-b border-slate-600">
            {filteredCountries.length} results
          </div>
          {filteredCountries.slice(0, 10).map((country) => (
            <button
              key={country.id}
              onClick={() => handleCountrySelect(country.id)}
              className="w-full text-left px-4 py-2 text-white hover:bg-slate-700 transition-colors"
            >
              {country.country_name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
