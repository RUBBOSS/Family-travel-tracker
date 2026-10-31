'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDown, ArrowUp, Calendar, MapPin, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';

interface VisitedCountry {
  id: string;
  countryCode: string;
  countryName: string;
  visitDate: string;
  notes?: string;
  flagUrl?: string;
}

interface CountryTableProps {
  countries?: VisitedCountry[];
  onRemoveCountry?: (countryId: string) => void;
}

function SortHeader({
  label,
  field,
  sortBy,
  sortOrder,
  onSort,
  className = '',
}: {
  label: string;
  field: 'name' | 'date';
  sortBy: 'name' | 'date';
  sortOrder: 'asc' | 'desc';
  onSort: (field: 'name' | 'date') => void;
  className?: string;
}) {
  const active = sortBy === field;
  const Arrow = sortOrder === 'asc' ? ArrowUp : ArrowDown;
  return (
    <th className={`px-3 py-2.5 text-left text-xs font-medium uppercase tracking-wider ${active ? 'text-teal-300' : 'text-slate-400'} ${className}`}>
      <button onClick={() => onSort(field)} className="inline-flex items-center gap-1 transition-colors hover:text-white">
        {label}
        {active && <Arrow className="h-3 w-3" aria-hidden />}
      </button>
    </th>
  );
}

export default function CountryTable({
  countries = [],
  onRemoveCountry,
}: CountryTableProps) {
  const { t } = useLanguage();
  const [sortBy, setSortBy] = useState<'name' | 'date'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const sortedCountries = [...countries].sort((a, b) => {
    const aValue = sortBy === 'name' ? a.countryName : a.visitDate;
    const bValue = sortBy === 'name' ? b.countryName : b.visitDate;
    return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
  });

  const handleSort = (field: 'name' | 'date') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (countries.length === 0) {
    return (
      <div className="flex items-center gap-4 rounded-2xl border border-dashed border-white/15 px-5 py-6">
        <MapPin className="h-8 w-8 text-slate-500" />
        <div>
          <p className="text-sm font-medium text-slate-300">{t('table.emptyTitle')}</p>
          <p className="text-sm text-slate-500">{t('table.emptyText')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[480px]">
        <thead>
          <tr className="border-b border-white/10">
            <SortHeader label={t('table.colCountry')} field="name" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} className="w-[42%]" />
            <SortHeader label={t('table.colVisited')} field="date" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
            <th className="hidden px-3 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-slate-400 sm:table-cell">
              {t('table.colNotes')}
            </th>
            <th className="px-3 py-2.5 text-right text-xs font-medium uppercase tracking-wider text-slate-400">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <AnimatePresence initial={false}>
          <tbody>
            {sortedCountries.map((country) => (
              <motion.tr
                key={country.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, x: 24, transition: { duration: 0.15 } }}
                transition={{ duration: 0.25 }}
                className="group border-b border-white/5 transition-colors last:border-0 hover:bg-white/[0.04]"
              >
                <td className="px-3 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    {country.flagUrl ? (
                      <Image
                        src={country.flagUrl}
                        alt={`${country.countryName} flag`}
                        width={24}
                        height={16}
                        className="h-4 w-6 flex-shrink-0 rounded-sm object-cover"
                      />
                    ) : (
                      <span className="flex h-4 w-6 flex-shrink-0 items-center justify-center rounded-sm bg-slate-700 text-[8px] font-bold text-slate-300">
                        {country.countryCode}
                      </span>
                    )}
                    <span className="truncate text-sm font-medium text-white">
                      {country.countryName}
                    </span>
                  </div>
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Calendar className="h-3.5 w-3.5 flex-shrink-0 text-slate-500" />
                    <span className="whitespace-nowrap text-sm tabular-nums">
                      {formatDate(country.visitDate)}
                    </span>
                  </div>
                </td>
                <td className="hidden max-w-[240px] px-3 py-3 sm:table-cell">
                  <span className="block truncate text-sm text-slate-400" title={country.notes}>
                    {country.notes || '—'}
                  </span>
                </td>
                <td className="px-3 py-3 text-right">
                  <button
                    onClick={() => onRemoveCountry?.(country.id)}
                    className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-red-500/10 hover:text-red-300 focus-visible:text-red-300"
                    aria-label={t('table.removeAria', { name: country.countryName })}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </AnimatePresence>
      </table>
    </div>
  );
}
