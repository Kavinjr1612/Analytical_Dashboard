'use client';

import React from 'react';
import { LayoutDashboard, RefreshCw } from 'lucide-react';
import { useDashboard } from '../hooks/useDashboard';
import { FilterBar } from '../components/FilterBar';
import { SummaryCards } from '../components/SummaryCards';
import { AnalyticsCharts } from '../components/AnalyticsCharts';
import { TopPerformersPanel } from '../components/TopPerformersPanel';
import { TransactionsTable } from '../components/TransactionsTable';
import { ErrorBoundary } from '../components/ErrorBoundary';

export default function Home() {
  const {
    filters,
    searchVal,
    setSearchVal,
    pagination,
    sorting,
    setSorting,
    summary,
    charts,
    transactionsResponse,
    loading,
    errors,
    setCategoryFilter,
    setRegionFilter,
    setDateRangeFilter,
    resetFilters,
    setPage,
    setLimit,
    handleExport,
    refetchAll
  } = useDashboard();

  return (
    <ErrorBoundary>
      <div className="flex-1 flex flex-col min-h-screen bg-[#0A0A0A]">
        {/* Navigation Bar */}
        <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0A0A0A]/85 backdrop-blur-md">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#C6A96B]/10 border border-[#C6A96B]/20 text-[#C6A96B]">
                <LayoutDashboard size={20} />
              </div>
              <div>
                <h1 className="text-base font-bold text-[#F5F1E8] tracking-tight">Sales Analytics Dashboard</h1>
                <p className="text-[10px] text-[#7E786F] font-bold uppercase tracking-wider">Enterprise Performance Insights</p>
              </div>
            </div>

            {/* Manual Sync Button */}
            <button
              onClick={refetchAll}
              className="flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded border border-white/5 hover:border-white/10 bg-[#141414] hover:bg-[#1A1A1A] text-[#B8B2A8] hover:text-white transition duration-200 active:scale-95 cursor-pointer"
              title="Refresh all metrics"
            >
              <RefreshCw size={14} className={loading.summary || loading.charts || loading.transactions ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Sync Data</span>
            </button>
          </div>
        </header>

        {/* Dashboard Grid */}
        <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-6">
          {/* 1. Global Filter Panel */}
          <FilterBar
            filters={filters}
            searchVal={searchVal}
            setSearchVal={setSearchVal}
            setCategoryFilter={setCategoryFilter}
            setRegionFilter={setRegionFilter}
            setDateRangeFilter={setDateRangeFilter}
            resetFilters={resetFilters}
            handleExport={handleExport}
          />

          {/* 2. Key KPI Performance Statistics (Hero Metrics) */}
          <SummaryCards
            summary={summary}
            isLoading={loading.summary}
            error={errors.summary}
          />

          {/* 3. Aggregated Charts + Side Analytics Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
            {/* Charts Visualizers (8 cols on desktop) */}
            <div className="lg:col-span-8">
              <AnalyticsCharts
                charts={charts}
                isLoading={loading.charts}
                error={errors.charts}
              />
            </div>

            {/* Top Performers Side Panel (4 cols on desktop) */}
            <div className="lg:col-span-4">
              <TopPerformersPanel
                summary={summary}
                transactions={transactionsResponse?.transactions || []}
                isLoading={loading.summary || loading.transactions}
              />
            </div>
          </div>

          {/* 4. Server-Side Data Transaction Table (Operational Ledger) */}
          <TransactionsTable
            transactions={transactionsResponse?.transactions || []}
            totalCount={transactionsResponse?.totalCount || 0}
            page={pagination.page}
            limit={pagination.limit}
            totalPages={transactionsResponse?.totalPages || 0}
            sorting={sorting}
            onSortChange={setSorting}
            onPageChange={setPage}
            onLimitChange={setLimit}
            isLoading={loading.transactions}
            error={errors.transactions}
          />
        </main>

        {/* Dashboard Footer */}
        <footer className="py-6 border-t border-white/5 text-center mt-8 bg-[#0A0A0A]">
          <p className="text-xs text-[#7E786F]">
            Sales Analytics Dashboard &copy; {new Date().getFullYear()} Auro Studios. All rights reserved.
          </p>
        </footer>
      </div>
    </ErrorBoundary>
  );
}
