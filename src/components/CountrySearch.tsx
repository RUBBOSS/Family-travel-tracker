'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { Calendar, Check, Loader2, MapPin, Search, Star, X } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface Country {
  id: number;
  country_code: string;
  country_name: string;
}

interface CountrySearchProps {
  onCountryAdd?: (countryId: number, notes?: string, visitDate?: string, countryCode?: string) => void;
  /** Star a country as "want to go" instead of logging a visit. */
  onBucketAdd?: (countryId: number, notes?: string) => void;
  /** Country ids already on the bucket list (star shows filled). */
  bucketCountryIds?: number[];
}

const flagUrl = (code: string, width: 40 | 320 = 40) =>
  `https://flagcdn.com/w${width}/${code.toLowerCase()}.png`;

export default function CountrySearch({ onCountryAdd, onBucketAdd, bucketCountryIds = [] }: CountrySearchProps) {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [notes, setNotes] = useState('');
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [filteredCountries, setFilteredCountries] = useState<Country[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [starring, setStarring] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const alreadyBucketed = selectedCountry ? bucketCountryIds.includes(selectedCountry.id) : false;

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
        setHighlightedIndex(0);
        setIsOpen(true);
      } else {
        setFilteredCountries([]);
        setIsOpen(false);
      }
    }, 200);

    return () => clearTimeout(timeoutId);
  }, [query, countries, selectedCountry]);

  // Keep the highlighted option in view
  useEffect(() => {
    const el = listRef.current?.children[highlightedIndex] as HTMLElement | undefined;
    el?.scrollIntoView({ block: 'nearest' });
  }, [highlightedIndex]);

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setIsOpen(false);
    setFilteredCountries([]);
  };

  const handleAddCountry = () => {
    if (selectedCountry) {
      onCountryAdd?.(selectedCountry.id, notes, visitDate, selectedCountry.country_code);
      setQuery('');
      setNotes('');
      setVisitDate(new Date().toISOString().split('T')[0]);
      setSelectedCountry(null);
      setFilteredCountries([]);
      inputRef.current?.focus();
    }
  };

  const handleClear = () => {
    setQuery('');
    setNotes('');
    setVisitDate(new Date().toISOString().split('T')[0]);
    setSelectedCountry(null);
    setIsOpen(false);
    setFilteredCountries([]);
  };

  const handleStar = async () => {
    if (!selectedCountry || starring) return;
    setStarring(true);
    try {
      await onBucketAdd?.(selectedCountry.id, notes);
      setQuery('');
      setNotes('');
      setVisitDate(new Date().toISOString().split('T')[0]);
      setSelectedCountry(null);
      inputRef.current?.focus();
    } finally {
      setStarring(false);
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || filteredCountries.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(i => (i + 1) % filteredCountries.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(i => (i - 1 + filteredCountries.length) % filteredCountries.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleCountrySelect(filteredCountries[highlightedIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const showActions = selectedCountry || notes.trim() || visitDate !== today;

  return (
    <div className="relative">
      <div className="space-y-4">
        {/* Country Search Input */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            ref={inputRef}
            type="text"
            id="country-search"
            name="countrySearch"
            placeholder={t('search.placeholder')}
            value={query}
            autoComplete="off"
            role="combobox"
            aria-expanded={isOpen}
            aria-controls="country-search-list"
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
            onKeyDown={handleSearchKeyDown}
            className="input-primary py-2.5 pl-10 text-base"
          />
        </div>

        {/* Selected Country Display */}
        <AnimatePresence>
          {selectedCountry && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.12 } }}
              className="flex items-center justify-between rounded-xl border border-teal-400/30 bg-teal-400/10 p-3"
            >
              <div className="flex items-center gap-3">
                <Image src={flagUrl(selectedCountry.country_code)} alt="" width={27} height={18} className="rounded-sm" />
                <span className="font-medium text-white">{selectedCountry.country_name}</span>
                <span className="text-xs uppercase tracking-wider text-slate-400">{selectedCountry.country_code}</span>
                <Check className="h-4 w-4 text-teal-300" />
              </div>
              <button
                onClick={() => {
                  setSelectedCountry(null);
                  setQuery('');
                  inputRef.current?.focus();
                }}
                className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white"
                aria-label="Clear selection"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Date + Notes row */}
        <div className="grid gap-4 sm:grid-cols-[auto_1fr]">
          <div>
            <label htmlFor="visit-date" className="mb-1.5 block text-sm font-medium text-slate-300">
              {t('search.when')}
            </label>
            <div className="relative">
              <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="date"
                id="visit-date"
                name="visitDate"
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
                max={today}
                className="input-primary pl-9 [color-scheme:dark]"
              />
            </div>
          </div>
          <div>
            <label htmlFor="visit-notes" className="mb-1.5 block text-sm font-medium text-slate-300">
              {t('search.notes')} <span className="font-normal text-slate-500">({t('search.notesOptional')})</span>
            </label>
            <input
              type="text"
              id="visit-notes"
              name="visitNotes"
              placeholder={t('search.notesPlaceholder')}
              value={notes}
              autoComplete="off"
              onChange={(e) => setNotes(e.target.value)}
              className="input-primary"
            />
          </div>
        </div>

        {/* Add/Clear Buttons */}
        <AnimatePresence>
          {showActions && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0, transition: { duration: 0.15 } }}
              className="overflow-hidden"
            >
              <div className="flex gap-2 pt-1">
                <button onClick={handleAddCountry} disabled={!selectedCountry} className="btn-primary flex-1">
                  <MapPin className="h-4 w-4" />
                  {t('search.addToMap')}
                </button>
                {onBucketAdd && (
                  <button
                    onClick={handleStar}
                    disabled={!selectedCountry || starring}
                    className="btn-secondary disabled:cursor-not-allowed"
                    title={alreadyBucketed ? t('search.wishlistedTitle') : t('search.wishlistTitle')}
                  >
                    {starring ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Star className={`h-4 w-4 ${alreadyBucketed ? 'fill-amber-300 text-amber-300' : 'text-amber-300'}`} />
                    )}
                    <span className="hidden sm:inline">{alreadyBucketed ? t('search.wishlisted') : t('search.wishlist')}</span>
                  </button>
                )}
                <button onClick={handleClear} className="btn-secondary">
                  {t('common.clear')}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Backdrop to close dropdown */}
      {isOpen && query.trim() && !selectedCountry && (
        <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} aria-hidden />
      )}

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && query.trim() && !selectedCountry && (
          <motion.div
            id="country-search-list"
            role="listbox"
            ref={listRef}
            initial={{ opacity: 0, y: -4, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.15 } }}
            exit={{ opacity: 0, y: -4, transition: { duration: 0.1 } }}
            className="absolute left-0 right-0 top-full z-40 mt-2 max-h-64 overflow-y-auto rounded-xl border border-white/10 bg-slate-900/95 shadow-[0_16px_48px_-12px_rgba(0,0,0,0.8)] backdrop-blur-md"
          >
            {isLoading ? (
              <div className="flex items-center gap-2 px-4 py-3 text-sm text-slate-400">
                <Loader2 className="h-4 w-4 animate-spin" /> {t('search.loadingCountries')}
              </div>
            ) : filteredCountries.length > 0 ? (
              filteredCountries.map((country, index) => (
                <button
                  key={country.id}
                  role="option"
                  aria-selected={index === highlightedIndex}
                  onClick={() => handleCountrySelect(country)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                    index === highlightedIndex ? 'bg-white/10' : ''
                  }`}
                >
                  <Image src={flagUrl(country.country_code)} alt="" width={24} height={16} className="rounded-sm" />
                  <span className="text-sm text-white">{country.country_name}</span>
                  <span className="text-xs uppercase tracking-wider text-slate-500">{country.country_code}</span>
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-slate-400">
                {t('search.noMatch', { q: query })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
