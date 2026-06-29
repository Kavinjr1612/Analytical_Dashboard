'use client';

import React, { useState, useCallback } from 'react';
import { LayoutDashboard, RefreshCw } from 'lucide-react';
import { useDashboard } from '../hooks/useDashboard';
import { FilterBar } from '../components/FilterBar';
import { SummaryCards } from '../components/SummaryCards';
import { AnalyticsCharts } from '../components/AnalyticsCharts';
import { TopPerformersPanel } from '../components/TopPerformersPanel';
import { TransactionsTable } from '../components/TransactionsTable';
import { DrilldownDrawer, DrilldownData } from '../components/DrilldownDrawer';
import { ErrorBoundary } from '../components/ErrorBoundary';

export default function Home() {
  const {
    filters, searchVal, setSearchVal,
    pagination, sorting, setSorting,
    summary, charts, transactionsResponse,
    loading, errors,
    setCategoryFilter, setRegionFilter, setStatusFilter,
    setDateRangeFilter, resetFilters,
    setPage, setLimit, handleExport, refetchAll
  } = useDashboard();

  // Drilldown drawer state
  const [drilldownData, setDrilldownData] = useState<DrilldownData | null>(null);

  const handleDrilldown = useCallback((data: DrilldownData) => {
    setDrilldownData(data);
  }, []);

  const closeDrilldown = useCallback(() => {
    setDrilldownData(null);
  }, []);

  // Chart click handlers that trigger backend filters
  const handleCategoryClick = useCallback((category: string) => {
    setCategoryFilter(category);
    // Smooth scroll to category chart area
    setTimeout(() => {
      document.getElementById('section-category-region')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }, [setCategoryFilter]);

  const handleRegionClick = useCallback((region: string) => {
    setRegionFilter(region);
    setTimeout(() => {
      document.getElementById('section-category-region')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }, [setRegionFilter]);

  const handleStatusClick = useCallback((status: string) => {
    setStatusFilter(status);
    // Scroll to transactions after status filter is applied
    setTimeout(() => {
      document.getElementById('section-transactions')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }, [setStatusFilter]);

  const handleDateFocus = useCallback((month: string) => {
    // Month-level granularity: YYYY-MM
    const dateParts = month.split('-');
    if (dateParts.length >= 2) {
      const year = parseInt(dateParts[0]);
      const monthNum = parseInt(dateParts[1]);
      const startDate = `${year}-${String(monthNum).padStart(2, '0')}-01`;
      const lastDay = new Date(year, monthNum, 0).getDate();
      const endDate = `${year}-${String(monthNum).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
      setDateRangeFilter(startDate, endDate);
    }
  }, [setDateRangeFilter]);

  const currentTransactions = transactionsResponse?.transactions || [];

  return (
    <ErrorBoundary>
      <div className="flex-1 flex flex-col min-h-screen bg-[#0A0A0A]">
        {/* Navigation Bar */}
        <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0A0A0A]/85 backdrop-blur-md">
          <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#C6A96B]/10 border border-[#C6A96B]/20 text-[#C6A96B]">
                <LayoutDashboard size={20} />
              </div>
              <div>
                <h1 className="text-base font-bold text-[#F5F1E8] tracking-tight">Sales Analytics Dashboard</h1>
                <p className="text-[10px] text-[#7E786F] font-bold uppercase tracking-wider">Executive Intelligence System</p>
              </div>
            </div>
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

        {/* Dashboard Content */}
        <main className="flex-1 mx-auto max-w-[1400px] w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Section 0: Control Panel */}
          <FilterBar
            filters={filters}
            searchVal={searchVal}
            setSearchVal={setSearchVal}
            setCategoryFilter={setCategoryFilter}
            setRegionFilter={setRegionFilter}
            setStatusFilter={setStatusFilter}
            setDateRangeFilter={setDateRangeFilter}
            resetFilters={resetFilters}
            handleExport={handleExport}
          />

          {/* Section 1: Global KPI Intelligence Layer */}
          <section>
            <SummaryCards
              summary={summary}
              isLoading={loading.summary}
              error={errors.summary}
            />
          </section>

          {/* Section 2: Strategic Command Center + Charts */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Charts (left — dominant) */}
            <div className="lg:col-span-8">
              <AnalyticsCharts
                charts={charts}
                transactions={currentTransactions}
                isLoading={loading.charts}
                error={errors.charts}
                onCategoryClick={handleCategoryClick}
                onRegionClick={handleRegionClick}
                onStatusClick={handleStatusClick}
                onDateFocus={handleDateFocus}
                onDrilldown={handleDrilldown}
                activeCategory={filters.category || ''}
                activeRegion={filters.region || ''}
                activeStatus={filters.status || ''}
              />
            </div>

            {/* Command Center (right) */}
            <div className="lg:col-span-4">
              <TopPerformersPanel
                summary={summary}
                charts={charts}
                transactions={currentTransactions}
                isLoading={loading.summary || loading.transactions}
              />
            </div>
          </section>

          {/* Section 3: Operational Transaction Ledger */}
          <section id="section-transactions">
            <TransactionsTable
              transactions={currentTransactions}
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
              highlightCategory={filters.category || ''}
              highlightRegion={filters.region || ''}
              highlightStatus={filters.status || ''}
            />
          </section>
        </main>

        {/* Footer */}
        <footer className="py-6 border-t border-white/5 text-center mt-8 bg-[#0A0A0A]">
          <p className="text-xs text-[#7E786F]">
            Sales Analytics Dashboard &copy; {new Date().getFullYear()} Auro Studios. All rights reserved.
          </p>
        </footer>

        {/* Drilldown Side Drawer */}
        <DrilldownDrawer data={drilldownData} onClose={closeDrilldown} />
      </div>
    </ErrorBoundary>
  );
}
