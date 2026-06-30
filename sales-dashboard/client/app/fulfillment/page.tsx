'use client';

import React, { useState } from 'react';
import { useDashboardContext } from '../../context/DashboardContext';
import { FulfillmentChart } from '../../components/AnalyticsCharts';
import { DrilldownDrawer, DrilldownData } from '../../components/DrilldownDrawer';

export default function FulfillmentPage() {
  const { filters, charts, transactionsResponse, loading, errors, setStatusFilter } = useDashboardContext();
  const [drilldownData, setDrilldownData] = useState<DrilldownData | null>(null);

  const currentTransactions = transactionsResponse?.transactions || [];

  return (
    <div className="dashboard-content flex-1 flex flex-col tab-transition">
      {/* ═══════════════════════════════════════════
          ZONE 4: FULFILLMENT OPERATIONS (Pie + Insights)
          ═══════════════════════════════════════════ */}
      <section id="zone-fulfillment" className="dashboard-zone dashboard-zone-alt flex-1 flex flex-col justify-center min-h-[calc(100vh-64px)]">
        <div className="zone-inner flex-1 flex flex-col justify-between">
          <div className="zone-header">
            <div className="zone-header-dot" />
            <span className="zone-header-label">04</span>
            <span className="zone-header-title">Fulfillment Operations</span>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <FulfillmentChart
              charts={charts}
              transactions={currentTransactions}
              isLoading={loading.charts}
              error={errors.charts}
              onStatusClick={setStatusFilter}
              onDrilldown={setDrilldownData}
              activeStatus={filters.status || ''}
            />
          </div>
        </div>
      </section>

      {/* Drilldown side drawer */}
      <DrilldownDrawer data={drilldownData} onClose={() => setDrilldownData(null)} />
    </div>
  );
}
