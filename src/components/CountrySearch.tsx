'use client';

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useCountries } from '@/hooks/useCountries';

interface Country {
  id: number;
  country_code: string;
  country_name: string;
}

interface CountrySearchProps {
  onCountrySelect?: (countryId: number) => void;
}

export default function CountrySearch({ onCountrySelect }: CountrySearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { countries, searchCountries, isLoading } = useCountries();
  const [filteredCountries, setFilteredCountries] = useState<Country[]>([]);
  // Update filtered countries when query changes
  useEffect(() => {
    if (query.trim()) {
      const filtered = countries.filter(country =>
        country.country_name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredCountries(filtered);
    } else {
      setFilteredCountries([]);
    }
  }, [query, countries]);

  const handleCountrySelect = (countryId: number) => {
    onCountrySelect?.(countryId);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />        <input
          type="text"
          id="country-search"
          name="countrySearch"
          placeholder="Search countries..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>      {isOpen && query && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="px-4 py-2 text-slate-400">Searching...</div>
          ) : filteredCountries.length > 0 ? (
            filteredCountries.map((country) => (              <button
                key={country.id}
                onClick={() => handleCountrySelect(country.id)}
                className="w-full text-left px-4 py-2 text-white hover:bg-slate-700 transition-colors duration-200 first:rounded-t-lg last:rounded-b-lg"
              >
                {country.country_name}
              </button>
            ))
          ) : (
            <div className="px-4 py-2 text-slate-400">No countries found</div>
          )}
        </div>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
