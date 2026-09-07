'use client';

import React from 'react';
import { Search, RotateCcw, Download, Calendar, X } from 'lucide-react';
import { FilterParams } from '../types';

interface FilterBarProps {
  filters: FilterParams;
  searchVal: string;
  setSearchVal: (val: string) => void;
  setCategoryFilter: (category: string) => void;
  setRegionFilter: (region: string) => void;
  setStatusFilter: (status: string) => void;
  setDateRangeFilter: (startDate: string, endDate: string) => void;
  resetFilters: () => void;
  handleExport: () => void;
}

const CATEGORIES = ['Electronics', 'Clothing', 'Grocery', 'Furniture', 'Beauty'];
const REGIONS = ['North', 'South', 'East', 'West'];

export const FilterBar: React.FC<FilterBarProps> = ({
  filters, searchVal, setSearchVal,
  setCategoryFilter, setRegionFilter, setStatusFilter,
  setDateRangeFilter, resetFilters, handleExport
}) => {
  const hasActiveFilters = !!(filters.category || filters.region || filters.status || filters.startDate || filters.endDate || filters.search);

  return (
    <div className="flex flex-col gap-2.5">
      {/* Main compact row */}
      <div className="filter-bar-compact flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[160px] max-w-[220px]">
          <Search className="absolute left-2.5 top-2 text-[#64748b]" size={13} />
          <input
            id="search"
            type="text"
            placeholder="Search..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="w-full rounded bg-[#080c14] border border-white/5 py-1.5 pl-8 pr-3 text-xs text-[#f8fafc] placeholder-[#64748b] outline-none focus:border-[#3b82f6]/50 transition"
          />
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-white/5 hidden sm:block" />

        {/* Category */}
        <select
          id="category"
          value={filters.category || ''}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded bg-[#080c14] border border-white/5 px-2.5 py-1.5 text-xs text-[#f8fafc] outline-none focus:border-[#3b82f6]/50 cursor-pointer min-w-[110px]"
        >
          <option value="" className="bg-[#080c14]">All Categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c} className="bg-[#080c14]">{c}</option>)}
        </select>

        {/* Region */}
        <select
          id="region"
          value={filters.region || ''}
          onChange={(e) => setRegionFilter(e.target.value)}
          className="rounded bg-[#080c14] border border-white/5 px-2.5 py-1.5 text-xs text-[#f8fafc] outline-none focus:border-[#3b82f6]/50 cursor-pointer min-w-[100px]"
        >
          <option value="" className="bg-[#080c14]">All Regions</option>
          {REGIONS.map((r) => <option key={r} value={r} className="bg-[#080c14]">{r}</option>)}
        </select>

        {/* Divider */}
        <div className="w-px h-5 bg-white/5 hidden sm:block" />

        {/* Date */}
        <div className="flex items-center gap-1.5">
          <Calendar size={12} className="text-[#64748b] flex-shrink-0" />
          <input
            type="date"
            value={filters.startDate || ''}
            onChange={(e) => setDateRangeFilter(e.target.value, filters.endDate || '')}
            className="rounded bg-[#080c14] border border-white/5 px-2 py-1 text-[11px] text-[#f8fafc] outline-none focus:border-[#3b82f6]/50 cursor-pointer w-[110px]"
          />
          <span className="text-[#64748b] text-[10px]">→</span>
          <input
            type="date"
            value={filters.endDate || ''}
            onChange={(e) => setDateRangeFilter(filters.startDate || '', e.target.value)}
            className="rounded bg-[#080c14] border border-white/5 px-2 py-1 text-[11px] text-[#f8fafc] outline-none focus:border-[#3b82f6]/50 cursor-pointer w-[110px]"
          />
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Actions */}
        <button
          onClick={resetFilters}
          className="flex items-center gap-1.5 rounded border border-white/5 hover:border-white/10 bg-[#080c14] px-2.5 py-1.5 text-[11px] font-bold text-[#64748b] hover:text-white transition cursor-pointer"
          title="Reset Filters"
        >
          <RotateCcw size={12} />
          <span className="hidden sm:inline">Reset</span>
        </button>

        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 rounded bg-[#3b82f6] hover:bg-[#2563eb] px-3.5 py-1.5 text-[11px] font-bold text-white transition active:scale-95 cursor-pointer shadow-lg shadow-black/30 animate-none"
        >
          <Download size={12} />
          Export
        </button>
      </div>

      {/* Active Filter Badges */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 px-1">
          {filters.category && (
            <button onClick={() => setCategoryFilter('')} className="active-filter-badge cursor-pointer hover:bg-[#3b82f6]/20 transition animate-none">
              Category: {filters.category} <X size={9} />
            </button>
          )}
          {filters.region && (
            <button onClick={() => setRegionFilter('')} className="active-filter-badge cursor-pointer hover:bg-[#3b82f6]/20 transition animate-none">
              Region: {filters.region} <X size={9} />
            </button>
          )}
          {filters.status && (
            <button onClick={() => setStatusFilter('')} className="active-filter-badge cursor-pointer hover:bg-[#3b82f6]/20 transition animate-none">
              Status: {filters.status} <X size={9} />
            </button>
          )}
          {(filters.startDate || filters.endDate) && (
            <button onClick={() => setDateRangeFilter('', '')} className="active-filter-badge cursor-pointer hover:bg-[#3b82f6]/20 transition animate-none">
              Date: {filters.startDate || '...'} → {filters.endDate || '...'} <X size={9} />
            </button>
          )}
          <button onClick={resetFilters} className="text-[9px] text-[#64748b] hover:text-white font-bold uppercase tracking-wider cursor-pointer transition ml-1">
            Clear All
          </button>
        </div>
      )}
    </div>
  );
};
