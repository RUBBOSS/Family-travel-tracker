'use client';

import { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';

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
  const [countries, setCountries] = useState<Country[]>([]);
  const [filteredCountries, setFilteredCountries] = useState<Country[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch countries on mount
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/countries');
        if (response.ok) {
          const data = await response.json();
          setCountries(data);
        } else {
          console.error('Failed to fetch countries, status:', response.status);
        }
      } catch (error) {
        console.error('Failed to fetch countries:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCountries();
  }, []);

  // Filter countries based on query with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        const filtered = countries.filter(country =>
          country.country_name.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredCountries(filtered);
        setIsOpen(true);
      } else {
        setFilteredCountries([]);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, countries]);

  const handleCountrySelect = (countryId: number) => {
    onCountrySelect?.(countryId);
    setQuery('');
    setIsOpen(false);
    setFilteredCountries([]);
  };

  const handleClickOutside = () => {
    setIsOpen(false);
  };
  return (
    <div className="relative z-[9999]">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
        <input
          ref={inputRef}
          type="text"
          id="country-search"
          name="countrySearch"
          placeholder="Search countries..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
          }}
          onFocus={() => {
            if (query.trim() && filteredCountries.length > 0) {
              setIsOpen(true);
            }
          }}
          className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Dropdown */}
      {isOpen && query.trim() && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800/95 border border-slate-600 rounded-lg shadow-2xl z-[9999] max-h-60 overflow-y-auto backdrop-blur-sm">
          {isLoading ? (
            <div className="px-4 py-2 text-slate-400">Searching...</div>
          ) : filteredCountries.length > 0 ? (
            filteredCountries.map((country) => (
              <button
                key={country.id}
                onClick={() => handleCountrySelect(country.id)}
                className="w-full text-left px-4 py-2 text-white hover:bg-slate-700 transition-colors duration-200 border-b border-slate-700 last:border-b-0 first:rounded-t-lg last:rounded-b-lg"
              >
                <span className="font-medium">{country.country_name}</span>
                <span className="text-slate-400 text-sm ml-2">({country.country_code})</span>
              </button>
            ))
          ) : (
            <div className="px-4 py-2 text-slate-400">No countries found</div>
          )}
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {isOpen && query.trim() && (
        <div
          className="fixed inset-0 z-[40]"
          onClick={handleClickOutside}
        />
      )}
    </div>
  );
}
