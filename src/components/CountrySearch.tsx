'use client';

import { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';

interface Country {
  id: number;
  country_code: string;
  country_name: string;
}

interface CountrySearchProps {
  onCountryAdd?: (countryId: number, notes?: string, visitDate?: string) => void;
}

export default function CountrySearch({ onCountryAdd }: CountrySearchProps) {
  const [query, setQuery] = useState('');
  const [notes, setNotes] = useState('');
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0]); // Default to today
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
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
      if (query.trim() && !selectedCountry) {
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
  }, [query, countries, selectedCountry]);  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setIsOpen(false);
    setFilteredCountries([]);
  };  const handleAddCountry = () => {
    if (selectedCountry) {
      onCountryAdd?.(selectedCountry.id, notes, visitDate);
      setQuery('');
      setNotes('');
      setVisitDate(new Date().toISOString().split('T')[0]); // Reset to today
      setSelectedCountry(null);
      setFilteredCountries([]);
    }
  };
  const handleClear = () => {
    setQuery('');
    setNotes('');
    setVisitDate(new Date().toISOString().split('T')[0]); // Reset to today
    setSelectedCountry(null);
    setIsOpen(false);
    setFilteredCountries([]);
  };

  const handleClickOutside = () => {
    setIsOpen(false);
  };  return (    <div className="relative z-[9999]">
      <div className="space-y-4">
        {/* Notes Input */}
        <div className="relative">
          <textarea
            id="visit-notes"
            name="visitNotes"
            placeholder="Add notes about your visit (optional)..."
            value={notes}
            autoComplete="off"
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>        {/* Visit Date Input */}
        <div className="relative">
          <label htmlFor="visit-date" className="block text-sm font-medium text-slate-300 mb-2">
            Visit Date
          </label>
          <input
            type="date"
            id="visit-date"
            name="visitDate"
            value={visitDate}
            onChange={(e) => setVisitDate(e.target.value)}
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white cursor-pointer hover:bg-slate-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            max={new Date().toISOString().split('T')[0]} // Prevent future dates
          />
        </div>{/* Country Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            ref={inputRef}
            type="text"
            id="country-search"
            name="countrySearch"
            placeholder="Search countries..."
            value={query}
            autoComplete="off"
            onChange={(e) => {
              setQuery(e.target.value);
              if (!e.target.value) {
                setSelectedCountry(null);
              }
            }}
            onFocus={() => {
              if (query.trim() && filteredCountries.length > 0 && !selectedCountry) {
                setIsOpen(true);
              }
            }}
            className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Selected Country Display */}
        {selectedCountry && (
          <div className="p-4 bg-green-700/20 border border-green-500/50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-green-400 text-sm">✓</span>
                <span className="font-medium text-white">{selectedCountry.country_name}</span>
                <span className="text-slate-400 text-sm">({selectedCountry.country_code})</span>
              </div>              <button
                onClick={() => {
                  setSelectedCountry(null);
                  setQuery('');
                }}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>
          </div>
        )}        {/* Add/Clear Buttons */}
        {(selectedCountry || notes.trim() || visitDate !== new Date().toISOString().split('T')[0]) && (
          <div className="flex gap-2">
            <button
              onClick={handleAddCountry}
              disabled={!selectedCountry}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              Add Country
            </button>
            <button
              onClick={handleClear}
              className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              Clear
            </button>
          </div>
        )}
      </div>      {/* Dropdown */}
      {isOpen && query.trim() && !selectedCountry && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800/95 border border-slate-600 rounded-lg shadow-2xl z-[9999] max-h-60 overflow-y-auto backdrop-blur-sm">
          {isLoading ? (
            <div className="px-4 py-2 text-slate-400">Searching...</div>
          ) : filteredCountries.length > 0 ? (
            filteredCountries.map((country) => (
              <button
                key={country.id}
                onClick={() => handleCountrySelect(country)}
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
      {isOpen && query.trim() && !selectedCountry && (
        <div
          className="fixed inset-0 z-[40]"
          onClick={handleClickOutside}
        />
      )}
    </div>
  );
}
