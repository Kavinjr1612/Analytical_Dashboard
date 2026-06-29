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
    <div className="gold-card p-5 mb-6 flex flex-col gap-4 bg-[#141414]">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <Filter size={16} className="text-[#C6A96B]" />
          <h2 className="text-sm font-semibold tracking-wider uppercase text-[#F5F1E8]">Control Panel</h2>
        </div>
        <button
          onClick={handleExport}
          className="w-full sm:w-auto flex items-center justify-center gap-2 rounded bg-[#C6A96B] hover:bg-[#A88B4A] px-4 py-2 text-xs font-bold text-[#0A0A0A] transition-all duration-200 active:scale-95 cursor-pointer shadow-lg shadow-black/35"
        >
          <Download size={14} />
          Export CSV
        </button>
      </div>

      {/* Spaced Filters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-end">
        {/* Search Input */}
        <div className="lg:col-span-3 flex flex-col gap-1.5">
          <label htmlFor="search" className="text-[10px] font-bold text-[#7E786F] uppercase tracking-wider">
            Search Text
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-3 text-[#7E786F]" size={14} />
            <input
              id="search"
              type="text"
              placeholder="Search customer or product..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full rounded bg-[#111111] border border-white/5 py-2.5 pl-9 pr-4 text-xs text-[#F5F1E8] placeholder-[#7E786F] outline-none focus:border-[#A88B4A] transition-all duration-200"
            />
          </div>
        </div>

        {/* Category Dropdown */}
        <div className="lg:col-span-2 flex flex-col gap-1.5">
          <label htmlFor="category" className="text-[10px] font-bold text-[#7E786F] uppercase tracking-wider">
            Category
          </label>
          <select
            id="category"
            value={filters.category || ''}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full rounded bg-[#111111] border border-white/5 p-2.5 text-xs text-[#F5F1E8] outline-none focus:border-[#A88B4A] transition cursor-pointer"
          >
            <option value="" className="bg-[#111111]">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat} className="bg-[#111111]">
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Region Dropdown */}
        <div className="lg:col-span-2 flex flex-col gap-1.5">
          <label htmlFor="region" className="text-[10px] font-bold text-[#7E786F] uppercase tracking-wider">
            Region
          </label>
          <select
            id="region"
            value={filters.region || ''}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="w-full rounded bg-[#111111] border border-white/5 p-2.5 text-xs text-[#F5F1E8] outline-none focus:border-[#A88B4A] transition cursor-pointer"
          >
            <option value="" className="bg-[#111111]">All Regions</option>
            {REGIONS.map((reg) => (
              <option key={reg} value={reg} className="bg-[#111111]">
                {reg}
              </option>
            ))}
          </select>
        </div>

        {/* Date Inputs */}
        <div className="sm:col-span-2 lg:col-span-4 flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-[#7E786F] uppercase tracking-wider flex items-center gap-1">
            <Calendar size={10} />
            Date Period
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={filters.startDate || ''}
              onChange={handleStartDateChange}
              className="rounded bg-[#111111] border border-white/5 p-2 text-xs text-[#F5F1E8] outline-none focus:border-[#A88B4A] transition cursor-pointer"
            />
            <input
              type="date"
              value={filters.endDate || ''}
              onChange={handleEndDateChange}
              className="rounded bg-[#111111] border border-white/5 p-2 text-xs text-[#F5F1E8] outline-none focus:border-[#A88B4A] transition cursor-pointer"
            />
          </div>
        </div>

        {/* Reset Trigger */}
        <div className="lg:col-span-1">
          <button
            onClick={resetFilters}
            className="w-full flex items-center justify-center gap-2 rounded border border-white/5 hover:border-white/10 bg-[#1A1A1A] py-2.5 px-3 text-xs font-bold text-[#B8B2A8] hover:text-white transition duration-200 active:scale-95 cursor-pointer"
            title="Reset Filters"
          >
            <RotateCcw size={14} />
            <span className="lg:hidden">Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
};
