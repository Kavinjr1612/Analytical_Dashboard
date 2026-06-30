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
          <Search className="absolute left-2.5 top-2 text-[#7E786F]" size={13} />
          <input
            id="search"
            type="text"
            placeholder="Search..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="w-full rounded bg-[#0A0A0A] border border-white/5 py-1.5 pl-8 pr-3 text-xs text-[#F5F1E8] placeholder-[#7E786F] outline-none focus:border-[#A88B4A]/50 transition"
          />
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-white/5 hidden sm:block" />

        {/* Category */}
        <select
          id="category"
          value={filters.category || ''}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded bg-[#0A0A0A] border border-white/5 px-2.5 py-1.5 text-xs text-[#F5F1E8] outline-none focus:border-[#A88B4A]/50 cursor-pointer min-w-[110px]"
        >
          <option value="" className="bg-[#0A0A0A]">All Categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c} className="bg-[#0A0A0A]">{c}</option>)}
        </select>

        {/* Region */}
        <select
          id="region"
          value={filters.region || ''}
          onChange={(e) => setRegionFilter(e.target.value)}
          className="rounded bg-[#0A0A0A] border border-white/5 px-2.5 py-1.5 text-xs text-[#F5F1E8] outline-none focus:border-[#A88B4A]/50 cursor-pointer min-w-[100px]"
        >
          <option value="" className="bg-[#0A0A0A]">All Regions</option>
          {REGIONS.map((r) => <option key={r} value={r} className="bg-[#0A0A0A]">{r}</option>)}
        </select>

        {/* Divider */}
        <div className="w-px h-5 bg-white/5 hidden sm:block" />

        {/* Date */}
        <div className="flex items-center gap-1.5">
          <Calendar size={12} className="text-[#7E786F] flex-shrink-0" />
          <input
            type="date"
            value={filters.startDate || ''}
            onChange={(e) => setDateRangeFilter(e.target.value, filters.endDate || '')}
            className="rounded bg-[#0A0A0A] border border-white/5 px-2 py-1 text-[11px] text-[#F5F1E8] outline-none focus:border-[#A88B4A]/50 cursor-pointer w-[110px]"
          />
          <span className="text-[#7E786F] text-[10px]">→</span>
          <input
            type="date"
            value={filters.endDate || ''}
            onChange={(e) => setDateRangeFilter(filters.startDate || '', e.target.value)}
            className="rounded bg-[#0A0A0A] border border-white/5 px-2 py-1 text-[11px] text-[#F5F1E8] outline-none focus:border-[#A88B4A]/50 cursor-pointer w-[110px]"
          />
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Actions */}
        <button
          onClick={resetFilters}
          className="flex items-center gap-1.5 rounded border border-white/5 hover:border-white/10 bg-[#0A0A0A] px-2.5 py-1.5 text-[11px] font-bold text-[#7E786F] hover:text-white transition cursor-pointer"
          title="Reset Filters"
        >
          <RotateCcw size={12} />
          <span className="hidden sm:inline">Reset</span>
        </button>

        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 rounded bg-[#C6A96B] hover:bg-[#A88B4A] px-3.5 py-1.5 text-[11px] font-bold text-[#0A0A0A] transition active:scale-95 cursor-pointer shadow-lg shadow-black/30"
        >
          <Download size={12} />
          Export
        </button>
      </div>

      {/* Active Filter Badges */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 px-1">
          {filters.category && (
            <button onClick={() => setCategoryFilter('')} className="active-filter-badge cursor-pointer hover:bg-[#C6A96B]/20 transition">
              Category: {filters.category} <X size={9} />
            </button>
          )}
          {filters.region && (
            <button onClick={() => setRegionFilter('')} className="active-filter-badge cursor-pointer hover:bg-[#C6A96B]/20 transition">
              Region: {filters.region} <X size={9} />
            </button>
          )}
          {filters.status && (
            <button onClick={() => setStatusFilter('')} className="active-filter-badge cursor-pointer hover:bg-[#C6A96B]/20 transition">
              Status: {filters.status} <X size={9} />
            </button>
          )}
          {(filters.startDate || filters.endDate) && (
            <button onClick={() => setDateRangeFilter('', '')} className="active-filter-badge cursor-pointer hover:bg-[#C6A96B]/20 transition">
              Date: {filters.startDate || '...'} → {filters.endDate || '...'} <X size={9} />
            </button>
          )}
          <button onClick={resetFilters} className="text-[9px] text-[#7E786F] hover:text-white font-bold uppercase tracking-wider cursor-pointer transition ml-1">
            Clear All
          </button>
        </div>
      )}
    </div>
  );
};
