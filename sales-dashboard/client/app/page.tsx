'use client';

import React, { useState, useCallback } from 'react';
import { LayoutDashboard, RefreshCw } from 'lucide-react';
import { useDashboard } from '../hooks/useDashboard';
import { NavigationRail } from '../components/NavigationRail';
import { FilterBar } from '../components/FilterBar';
import { SummaryCards } from '../components/SummaryCards';
import { RevenueChart, MarketCharts, FulfillmentChart } from '../components/AnalyticsCharts';
import { TopPerformersPanel } from '../components/TopPerformersPanel';
import { TransactionsTable } from '../components/TransactionsTable';
import { DrilldownDrawer, DrilldownData } from '../components/DrilldownDrawer';
import { ErrorBoundary } from '../components/ErrorBoundary';

/* ============================================
   ZONE HEADER COMPONENT
   ============================================ */

interface ZoneHeaderProps {
  label: string;
  title: string;
}

const ZoneHeader: React.FC<ZoneHeaderProps> = ({ label, title }) => (
  <div className="zone-header">
    <div className="zone-header-dot" />
    <span className="zone-header-label">{label}</span>
    <span className="zone-header-title">{title}</span>
  </div>
);

/* ============================================
   MAIN PAGE
   ============================================ */

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

  // Chart click handlers (backend-driven)
  const handleCategoryClick = useCallback((category: string) => {
    setCategoryFilter(category);
  }, [setCategoryFilter]);

  const handleRegionClick = useCallback((region: string) => {
    setRegionFilter(region);
  }, [setRegionFilter]);

  const handleStatusClick = useCallback((status: string) => {
    setStatusFilter(status);
  }, [setStatusFilter]);

  const handleDateFocus = useCallback((month: string) => {
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
      <div className="min-h-screen bg-[#0A0A0A]">
        {/* ===== HEADER ===== */}
        <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0A0A0A]/90 backdrop-blur-md h-16">
          <div className="h-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-[#C6A96B]/10 border border-[#C6A96B]/15 text-[#C6A96B]">
                <LayoutDashboard size={18} />
              </div>
              <div>
                <h1 className="text-sm font-bold text-[#F5F1E8] tracking-tight">Sales Analytics</h1>
                <p className="text-[9px] text-[#7E786F] font-bold uppercase tracking-wider">Executive Intelligence</p>
              </div>
            </div>
            <button
              onClick={refetchAll}
              className="flex items-center gap-2 text-[11px] font-semibold px-3 py-1.5 rounded border border-white/5 hover:border-white/10 bg-[#141414] hover:bg-[#1A1A1A] text-[#B8B2A8] hover:text-white transition duration-200 active:scale-95 cursor-pointer"
              title="Refresh all metrics"
            >
              <RefreshCw size={13} className={loading.summary || loading.charts || loading.transactions ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Sync</span>
            </button>
          </div>
        </header>

        {/* ===== NAVIGATION RAIL ===== */}
        <NavigationRail />

        {/* ===== DASHBOARD CONTENT ===== */}
        <div className="dashboard-content">

          {/* ═══════════════════════════════════════════
              ZONE 1: HERO COMMAND DECK (Above the fold)
              ═══════════════════════════════════════════ */}
          <section id="zone-overview" className="dashboard-zone" style={{ paddingTop: '32px', paddingBottom: '40px' }}>
            <div className="zone-inner">
              <ZoneHeader label="01" title="Executive Overview" />
              
              {/* Compact Filter Bar */}
              <div className="mb-6">
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
              </div>

              {/* KPI Cards */}
              <div className="mb-6">
                <SummaryCards
                  summary={summary}
                  isLoading={loading.summary}
                  error={errors.summary}
                />
              </div>

              {/* Command Center */}
              <TopPerformersPanel
                summary={summary}
                charts={charts}
                transactions={currentTransactions}
                isLoading={loading.summary || loading.transactions}
              />
            </div>
          </section>

          {/* ═══════════════════════════════════════════
              ZONE 2: REVENUE WAR ROOM
              ═══════════════════════════════════════════ */}
          <section id="zone-revenue" className="dashboard-zone dashboard-zone-alt">
            <div className="zone-inner">
              <ZoneHeader label="02" title="Revenue Intelligence" />
              <RevenueChart
                charts={charts}
                transactions={currentTransactions}
                isLoading={loading.charts}
                error={errors.charts}
                onDateFocus={handleDateFocus}
                onDrilldown={handleDrilldown}
              />
            </div>
          </section>

          {/* ═══════════════════════════════════════════
              ZONE 3: MARKET BREAKDOWN
              ═══════════════════════════════════════════ */}
          <section id="zone-markets" className="dashboard-zone">
            <div className="zone-inner">
              <ZoneHeader label="03" title="Market Dominance" />
              <MarketCharts
                charts={charts}
                transactions={currentTransactions}
                isLoading={loading.charts}
                error={errors.charts}
                onCategoryClick={handleCategoryClick}
                onRegionClick={handleRegionClick}
                onDrilldown={handleDrilldown}
                activeCategory={filters.category || ''}
                activeRegion={filters.region || ''}
              />
            </div>
          </section>

          {/* ═══════════════════════════════════════════
              ZONE 4: FULFILLMENT OPERATIONS
              ═══════════════════════════════════════════ */}
          <section id="zone-fulfillment" className="dashboard-zone dashboard-zone-alt">
            <div className="zone-inner">
              <ZoneHeader label="04" title="Fulfillment Operations" />
              <FulfillmentChart
                charts={charts}
                transactions={currentTransactions}
                isLoading={loading.charts}
                error={errors.charts}
                onStatusClick={handleStatusClick}
                onDrilldown={handleDrilldown}
                activeStatus={filters.status || ''}
              />
            </div>
          </section>

          {/* ═══════════════════════════════════════════
              ZONE 5: TRANSACTION INTELLIGENCE
              ═══════════════════════════════════════════ */}
          <section id="zone-transactions" className="dashboard-zone">
            <div className="zone-inner">
              <ZoneHeader label="05" title="Transaction Ledger" />
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
            </div>
          </section>

        </div>

        {/* ===== FOOTER ===== */}
        <footer className="dashboard-content py-8 border-t border-white/5 text-center bg-[#0A0A0A]">
          <p className="text-[11px] text-[#7E786F]">
            Sales Analytics Dashboard &copy; {new Date().getFullYear()} Auro Studios. All rights reserved.
          </p>
        </footer>

        {/* ===== DRILLDOWN DRAWER ===== */}
        <DrilldownDrawer data={drilldownData} onClose={closeDrilldown} />
      </div>
    </ErrorBoundary>
  );
}
