'use client';

import React from 'react';
import { LayoutDashboard, RefreshCw } from 'lucide-react';
import { useDashboard } from '../hooks/useDashboard';
import { FilterBar } from '../components/FilterBar';
import { SummaryCards } from '../components/SummaryCards';
import { AnalyticsCharts } from '../components/AnalyticsCharts';
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
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Navigation Bar */}
        <header className="sticky top-0 z-50 border-b border-white/5 bg-[#090d16]/80 backdrop-blur-md">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-accent-blue/10 border border-accent-blue/20 text-accent-blue">
                <LayoutDashboard size={20} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white tracking-tight">Sales Analytics Dashboard</h1>
                <p className="text-[10px] text-text-muted font-medium uppercase tracking-wider">Enterprise Performance Insights</p>
              </div>
            </div>

            {/* Manual Sync Button */}
            <button
              onClick={refetchAll}
              className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20 bg-white/2 hover:bg-white/5 text-white transition active:scale-95 cursor-pointer"
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

          {/* 2. Key KPI Performance Statistics */}
          <SummaryCards
            summary={summary}
            isLoading={loading.summary}
            error={errors.summary}
          />

          {/* 3. Aggregated Charts visualizers */}
          <AnalyticsCharts
            charts={charts}
            isLoading={loading.charts}
            error={errors.charts}
          />

          {/* 4. Server-Side Data Transaction Table */}
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
        <footer className="py-6 border-t border-white/5 text-center mt-8">
          <p className="text-xs text-text-muted">
            Sales Analytics Dashboard &copy; {new Date().getFullYear()} Auro Studios. All rights reserved.
          </p>
        </footer>
      </div>
    </ErrorBoundary>
  );
}
