'use client';

import React from 'react';
import { useDashboardContext } from '../context/DashboardContext';
import { FilterBar } from '../components/FilterBar';
import { SummaryCards } from '../components/SummaryCards';
import { TopPerformersPanel } from '../components/TopPerformersPanel';

export default function Home() {
  const {
    filters, searchVal, setSearchVal,
    summary, charts, transactionsResponse,
    loading, errors,
    setCategoryFilter, setRegionFilter, setStatusFilter,
    setDateRangeFilter, resetFilters, handleExport
  } = useDashboardContext();

  const currentTransactions = transactionsResponse?.transactions || [];

  return (
    <div className="dashboard-content flex-1 flex flex-col tab-transition">
      {/* ═══════════════════════════════════════════
          ZONE 1: HERO COMMAND DECK (Above the fold overview)
          ═══════════════════════════════════════════ */}
      <section id="zone-overview" className="dashboard-zone flex-1 flex flex-col justify-center min-h-[calc(100vh-64px)]" style={{ paddingTop: '24px', paddingBottom: '32px' }}>
        <div className="zone-inner flex-1 flex flex-col justify-between gap-6">
          {/* Header */}
          <div className="zone-header">
            <div className="zone-header-dot" />
            <span className="zone-header-label">01</span>
            <span className="zone-header-title">Executive Overview</span>
          </div>
          
          {/* Compact Filter Bar */}
          <div>
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
          <div>
            <SummaryCards
              summary={summary}
              isLoading={loading.summary}
              error={errors.summary}
            />
          </div>

          {/* Command Center */}
          <div className="flex-1 flex flex-col justify-end">
            <TopPerformersPanel
              summary={summary}
              charts={charts}
              transactions={currentTransactions}
              isLoading={loading.summary || loading.transactions}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
