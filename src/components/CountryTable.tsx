'use client';

import { useState } from 'react';
import { MapPin, Calendar, Trash2 } from 'lucide-react';

interface VisitedCountry {
  id: string;
  countryCode: string;
  countryName: string;
  visitDate: string;
  notes?: string;
}

interface CountryTableProps {
  countries?: VisitedCountry[];
  onRemoveCountry?: (countryId: string) => void;
}

export default function CountryTable({ countries = [], onRemoveCountry }: CountryTableProps) {
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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-6">        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Visited Countries
        </h2>
        <div className="text-sm text-slate-400">
          {displayCountries.length} countries visited
        </div>
      </div>      {displayCountries.length === 0 ? (
        <div className="text-center py-8">
          <MapPin className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">No countries visited yet</p>
          <p className="text-sm text-slate-500 mt-1">Start exploring the world!</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th 
                  className="text-left py-3 px-4 text-slate-300 font-medium cursor-pointer hover:text-white transition-colors"
                  onClick={() => handleSort('name')}
                >
                  Country
                  {sortBy === 'name' && (
                    <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th 
                  className="text-left py-3 px-4 text-slate-300 font-medium cursor-pointer hover:text-white transition-colors"
                  onClick={() => handleSort('date')}
                >
                  Visit Date
                  {sortBy === 'date' && (
                    <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th className="text-left py-3 px-4 text-slate-300 font-medium">Notes</th>
                <th className="text-right py-3 px-4 text-slate-300 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedCountries.map((country) => (
                <tr key={country.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-4 bg-slate-600 rounded-sm flex items-center justify-center text-xs text-white">
                        {country.countryCode}
                      </div>
                      <span className="text-white font-medium">{country.countryName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Calendar className="w-4 h-4" />
                      {formatDate(country.visitDate)}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-slate-400">{country.notes || '-'}</span>
                  </td>                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => onRemoveCountry?.(country.id)}
                      className="text-red-400 hover:text-red-300 transition-colors p-1 rounded hover:bg-red-400/10"
                      title="Remove country"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
