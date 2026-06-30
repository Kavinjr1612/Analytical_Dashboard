'use client';

import React, { useState } from 'react';
import { useDashboardContext } from '../../context/DashboardContext';
import { RevenueChart } from '../../components/AnalyticsCharts';
import { DrilldownDrawer, DrilldownData } from '../../components/DrilldownDrawer';

export default function RevenuePage() {
  const { charts, transactionsResponse, loading, errors, setDateRangeFilter } = useDashboardContext();
  const [drilldownData, setDrilldownData] = useState<DrilldownData | null>(null);

  const currentTransactions = transactionsResponse?.transactions || [];

  const handleDateFocus = (month: string) => {
    const dateParts = month.split('-');
    if (dateParts.length >= 2) {
      const year = parseInt(dateParts[0]);
      const monthNum = parseInt(dateParts[1]);
      const startDate = `${year}-${String(monthNum).padStart(2, '0')}-01`;
      const lastDay = new Date(year, monthNum, 0).getDate();
      const endDate = `${year}-${String(monthNum).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
      setDateRangeFilter(startDate, endDate);
    }
  };

  return (
    <div className="dashboard-content flex-1 flex flex-col tab-transition">
      {/* ═══════════════════════════════════════════
          ZONE 2: REVENUE WAR ROOM (70vh area chart)
          ═══════════════════════════════════════════ */}
      <section id="zone-revenue" className="dashboard-zone dashboard-zone-alt flex-1 flex flex-col justify-center min-h-[calc(100vh-64px)]">
        <div className="zone-inner-expansive flex-1 flex flex-col justify-between">
          <div className="zone-header">
            <div className="zone-header-dot" />
            <span className="zone-header-label">02</span>
            <span className="zone-header-title">Revenue Intelligence</span>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <RevenueChart
              charts={charts}
              transactions={currentTransactions}
              isLoading={loading.charts}
              error={errors.charts}
              onDateFocus={handleDateFocus}
              onDrilldown={setDrilldownData}
            />
          </div>
        </div>
      </section>

      {/* Drilldown side drawer */}
      <DrilldownDrawer data={drilldownData} onClose={() => setDrilldownData(null)} />
    </div>
  );
}
