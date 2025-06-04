'use client';

import { useState } from 'react';
import { MapPin, Calendar, Trash2 } from 'lucide-react';
import Image from 'next/image';

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

export default function CountryTable({
  countries = [],
  onRemoveCountry,
}: CountryTableProps) {
  const [sortBy, setSortBy] = useState<'name' | 'date'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const displayCountries = countries;

  const sortedCountries = [...displayCountries].sort((a, b) => {
    let aValue: string, bValue: string;

    if (sortBy === 'name') {
      aValue = a.countryName;
      bValue = b.countryName;
    } else {
      aValue = a.visitDate;
      bValue = b.visitDate;
    }

    if (sortOrder === 'asc') {
      return aValue.localeCompare(bValue);
    } else {
      return bValue.localeCompare(aValue);
    }
  });

  const handleSort = (field: 'name' | 'date') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
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
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6 backdrop-blur-sm">
      <div className="mb-6 flex items-center justify-between">
        {' '}
        <h2 className="flex items-center gap-2 text-xl font-semibold text-white">
          <MapPin className="h-5 w-5" />
          Visited Countries
        </h2>
        <div className="text-sm text-slate-400">
          {displayCountries.length} countries visited
        </div>
      </div>{' '}
      {displayCountries.length === 0 ? (
        <div className="py-8 text-center">
          <MapPin className="mx-auto mb-4 h-12 w-12 text-slate-600" />
          <p className="text-slate-400">No countries visited yet</p>
          <p className="mt-1 text-sm text-slate-500">
            Start exploring the world!
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th
                  className="cursor-pointer px-4 py-3 text-left font-medium text-slate-300 transition-colors hover:text-white"
                  onClick={() => handleSort('name')}
                >
                  Country
                  {sortBy === 'name' && (
                    <span className="ml-1">
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
                <th
                  className="cursor-pointer px-4 py-3 text-left font-medium text-slate-300 transition-colors hover:text-white"
                  onClick={() => handleSort('date')}
                >
                  Visit Date
                  {sortBy === 'date' && (
                    <span className="ml-1">
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
                <th className="px-4 py-3 text-left font-medium text-slate-300">
                  Notes
                </th>
                <th className="px-4 py-3 text-right font-medium text-slate-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedCountries.map((country) => (
                <tr
                  key={country.id}
                  className="border-b border-slate-700/50 transition-colors hover:bg-slate-700/30"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {country.flagUrl ? (
                        <Image
                          src={country.flagUrl}
                          alt={`${country.countryName} flag`}
                          width={24}
                          height={16}
                          className="h-4 w-6 rounded-sm object-cover"
                        />
                      ) : (
                        <div className="flex h-4 w-6 items-center justify-center rounded-sm bg-slate-600 text-xs text-white">
                          {country.countryCode}
                        </div>
                      )}
                      <span className="font-medium text-white">
                        {country.countryName}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Calendar className="h-4 w-4" />
                      {formatDate(country.visitDate)}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-slate-400">
                      {country.notes || '-'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => onRemoveCountry?.(country.id)}
                      className="rounded p-1 text-red-400 transition-colors hover:bg-red-400/10 hover:text-red-300"
                      title="Remove country"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
