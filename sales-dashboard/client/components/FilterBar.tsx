'use client';

import React from 'react';
import { Search, RotateCcw, Download, Calendar, Filter } from 'lucide-react';
import { FilterParams } from '../types';

interface FilterBarProps {
  filters: FilterParams;
  searchVal: string;
  setSearchVal: (val: string) => void;
  setCategoryFilter: (category: string) => void;
  setRegionFilter: (region: string) => void;
  setDateRangeFilter: (startDate: string, endDate: string) => void;
  resetFilters: () => void;
  handleExport: () => void;
}

const CATEGORIES = ['Electronics', 'Clothing', 'Grocery', 'Furniture', 'Beauty'];
const REGIONS = ['North', 'South', 'East', 'West'];

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  searchVal,
  setSearchVal,
  setCategoryFilter,
  setRegionFilter,
  setDateRangeFilter,
  resetFilters,
  handleExport
}) => {
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateRangeFilter(e.target.value, filters.endDate || '');
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateRangeFilter(filters.startDate || '', e.target.value);
  };

  return (
    <div className="glass-panel p-4 md:p-6 mb-6 flex flex-col gap-4">
      {/* Top row: Title and Export */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-accent-cyan" />
          <h2 className="text-lg font-semibold text-white">Dashboard Filters</h2>
        </div>
        <button
          onClick={handleExport}
          className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 active:scale-95 cursor-pointer shadow-lg shadow-emerald-900/10"
        >
          <Download size={16} />
          Export CSV
        </button>
      </div>

      {/* Grid: Search, Category, Region, Date Range, Reset */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-end">
        {/* Search Field */}
        <div className="lg:col-span-3 flex flex-col gap-1.5">
          <label htmlFor="search" className="text-xs font-semibold text-text-muted">
            Search Transactions
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-text-muted" size={16} />
            <input
              id="search"
              type="text"
              placeholder="Search customer or product..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full rounded-lg bg-black/40 border border-white/10 py-2 pl-10 pr-4 text-sm text-white placeholder-text-muted outline-none focus:border-accent-blue/50 transition"
            />
          </div>
        </div>

        {/* Category Selector */}
        <div className="lg:col-span-2 flex flex-col gap-1.5">
          <label htmlFor="category" className="text-xs font-semibold text-text-muted">
            Category
          </label>
          <select
            id="category"
            value={filters.category || ''}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full rounded-lg bg-black/40 border border-white/10 p-2 text-sm text-white outline-none focus:border-accent-blue/50 transition cursor-pointer"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Region Selector */}
        <div className="lg:col-span-2 flex flex-col gap-1.5">
          <label htmlFor="region" className="text-xs font-semibold text-text-muted">
            Region
          </label>
          <select
            id="region"
            value={filters.region || ''}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="w-full rounded-lg bg-black/40 border border-white/10 p-2 text-sm text-white outline-none focus:border-accent-blue/50 transition cursor-pointer"
          >
            <option value="">All Regions</option>
            {REGIONS.map((reg) => (
              <option key={reg} value={reg}>
                {reg}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range Selector */}
        <div className="sm:col-span-2 lg:col-span-4 flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-text-muted flex items-center gap-1">
            <Calendar size={12} />
            Date Range
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={filters.startDate || ''}
              onChange={handleStartDateChange}
              className="rounded-lg bg-black/40 border border-white/10 p-2 text-sm text-white outline-none focus:border-accent-blue/50 transition cursor-pointer"
            />
            <input
              type="date"
              value={filters.endDate || ''}
              onChange={handleEndDateChange}
              className="rounded-lg bg-black/40 border border-white/10 p-2 text-sm text-white outline-none focus:border-accent-blue/50 transition cursor-pointer"
            />
          </div>
        </div>

        {/* Reset Button */}
        <div className="lg:col-span-1">
          <button
            onClick={resetFilters}
            className="w-full flex items-center justify-center gap-2 rounded-lg border border-white/10 hover:border-white/20 bg-white/5 py-2 px-3 text-sm font-semibold text-white transition hover:bg-white/10 active:scale-95 cursor-pointer"
            title="Reset all filters"
          >
            <RotateCcw size={16} />
            <span className="lg:hidden">Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
};
