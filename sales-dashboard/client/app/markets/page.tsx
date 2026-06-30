'use client';

import React, { useState } from 'react';
import { useDashboardContext } from '../../context/DashboardContext';
import { MarketCharts } from '../../components/AnalyticsCharts';
import { DrilldownDrawer, DrilldownData } from '../../components/DrilldownDrawer';

export default function MarketsPage() {
  const {
    filters, charts, transactionsResponse, loading, errors,
    setCategoryFilter, setRegionFilter
  } = useDashboardContext();

  const [drilldownData, setDrilldownData] = useState<DrilldownData | null>(null);
  const currentTransactions = transactionsResponse?.transactions || [];

  return (
    <div className="dashboard-content flex-1 flex flex-col tab-transition">
      {/* ═══════════════════════════════════════════
          ZONE 3: MARKET DOMINANCE (Side-by-side charts)
          ═══════════════════════════════════════════ */}
      <section id="zone-markets" className="dashboard-zone flex-1 flex flex-col justify-center min-h-[calc(100vh-64px)]">
        <div className="zone-inner flex-1 flex flex-col justify-between">
          <div className="zone-header">
            <div className="zone-header-dot" />
            <span className="zone-header-label">03</span>
            <span className="zone-header-title">Market Dominance</span>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <MarketCharts
              charts={charts}
              transactions={currentTransactions}
              isLoading={loading.charts}
              error={errors.charts}
              onCategoryClick={setCategoryFilter}
              onRegionClick={setRegionFilter}
              onDrilldown={setDrilldownData}
              activeCategory={filters.category || ''}
              activeRegion={filters.region || ''}
            />
          </div>
        </div>
      </section>

      {/* Drilldown side drawer */}
      <DrilldownDrawer data={drilldownData} onClose={() => setDrilldownData(null)} />
    </div>
  );
}
