'use client';

import React, { useState } from 'react';
import { useDashboardContext } from '../../context/DashboardContext';
import { FulfillmentChart } from '../../components/AnalyticsCharts';
import { DrilldownDrawer, DrilldownData } from '../../components/DrilldownDrawer';
import { ShieldCheck, Clock, XCircle, Table } from 'lucide-react';

export default function FulfillmentPage() {
  const { filters, charts, transactionsResponse, loading, errors, setStatusFilter } = useDashboardContext();
  const [drilldownData, setDrilldownData] = useState<DrilldownData | null>(null);

  const currentTransactions = transactionsResponse?.transactions || [];

  const statusData = charts?.orderStatusDistribution || [];
  const totalCount = statusData.reduce((s, i) => s + i.count, 0);

  const completedCount = statusData.find(i => i.status === 'Completed')?.count || 0;
  const pendingCount = statusData.find(i => i.status === 'Pending')?.count || 0;
  const cancelledCount = statusData.find(i => i.status === 'Cancelled')?.count || 0;

  // Fulfillment Health Score (FHS) out of 100
  const getFHS = () => {
    if (totalCount === 0) return 0;
    // Completed is positive, Pending is neutral, Cancelled is negative penalty
    const score = ((completedCount + pendingCount * 0.5) / totalCount) * 100;
    return Math.round(score);
  };

  // Backlog SLA Risk (Low/Medium/High)
  const getBacklogRisk = () => {
    if (pendingCount === 0) return { text: 'NO BACKLOG', color: 'text-emerald-500' };
    if (pendingCount > 15) return { text: 'HIGH RISK', color: 'text-red-500' };
    if (pendingCount > 5) return { text: 'MODERATE RISK', color: 'text-[#f59e0b]' };
    return { text: 'LOW RISK', color: 'text-emerald-500' };
  };

  // Lost revenue due to cancellations
  const getLeakageCost = () => {
    const cancelledTxs = currentTransactions.filter(t => t.status === 'Cancelled');
    const cost = cancelledTxs.reduce((sum, t) => sum + Number(t.amount), 0);
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(cost);
  };

  const fhs = getFHS();
  const backlog = getBacklogRisk();

  return (
    <div className="dashboard-content flex-1 flex flex-col tab-transition">
      {/* ═══════════════════════════════════════════
          ZONE 4: FULFILLMENT Operations (Split Layout)
          ═══════════════════════════════════════════ */}
      <section id="zone-fulfillment" className="dashboard-zone flex-1 flex flex-col justify-center min-h-[calc(100vh-140px)]" style={{ paddingTop: '20px', paddingBottom: '20px' }}>
        <div className="zone-inner flex-1 flex flex-col justify-between gap-5">
          <div className="zone-header mb-2">
            <div className="zone-header-dot" />
            <span className="zone-header-label">04</span>
            <span className="zone-header-title">Fulfillment & Operations Room</span>
          </div>

          {/* Split Column Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch flex-1">
            {/* Left Column (62%): Pie status chart + Line backlog timeline */}
            <div className="xl:col-span-8 flex flex-col justify-center">
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

            {/* Right Column (38%): SLA Risk & Leakage Indicators */}
            <div className="xl:col-span-4 flex flex-col gap-4 justify-between">
              {/* Specialized indicators */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* FHS Health Score */}
                <div className="gold-card p-4.5 bg-[#0f172a] flex flex-col justify-between h-[105px]">
                  <div className="flex justify-between items-center text-[9px] font-bold text-[#64748b] uppercase tracking-wider">
                    <span>Operations Health Index</span>
                    <ShieldCheck size={12} className="text-[#3b82f6]" />
                  </div>
                  <span className="text-xl font-extrabold text-emerald-500 mt-2 block tracking-tight">{fhs}/100</span>
                  <span className="text-[9px] text-[#64748b] mt-1">SLA fulfillment index score</span>
                </div>

                {/* Backlog Risk */}
                <div className="gold-card p-4.5 bg-[#0f172a] flex flex-col justify-between h-[105px]">
                  <div className="flex justify-between items-center text-[9px] font-bold text-[#64748b] uppercase tracking-wider">
                    <span>SLA Backlog Risk</span>
                    <Clock size={12} className="text-[#06b6d4]" />
                  </div>
                  <span className={`text-xl font-extrabold mt-2 block tracking-tight ${backlog.color}`}>
                    {backlog.text}
                  </span>
                  <span className="text-[9px] text-[#64748b] mt-1">Risk based on pending backlog</span>
                </div>

                {/* Leakage cost */}
                <div className="gold-card p-4.5 bg-[#0f172a] flex flex-col justify-between h-[105px] sm:col-span-2">
                  <div className="flex justify-between items-center text-[9px] font-bold text-[#64748b] uppercase tracking-wider">
                    <span>Cancellation Cost Leakage</span>
                    <XCircle size={12} className="text-red-500" />
                  </div>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-xl font-extrabold text-[#f8fafc] tracking-tight">{getLeakageCost()}</span>
                    <span className="text-[8px] font-bold text-red-500/80 uppercase tracking-wide">Leakage detected</span>
                  </div>
                  <span className="text-[9px] text-[#64748b] mt-1">Lost revenue from cancelled transactions</span>
                </div>
              </div>

              {/* SLA guidelines / root causes */}
              <div className="gold-card p-5 bg-[#0f172a] flex-1 flex flex-col justify-between min-h-[180px]">
                <div>
                  <div className="flex items-center gap-2 pb-2.5 border-b border-white/5 mb-3">
                    <Table size={13} className="text-[#3b82f6]" />
                    <span className="text-[10px] font-bold text-[#64748b] tracking-wider uppercase">Fulfillment SLA Guide</span>
                  </div>
                  <div className="space-y-2 text-[11px] text-[#94a3b8] leading-relaxed">
                    <p>• **Completed Status:** Orders verified, payments processed, and shipped to node.</p>
                    <p>• **Pending Status:** Orders awaiting invoice verification or dispatch clearance.</p>
                    <p>• **Cancelled Status:** Orders aborted by payment gateways or user cancellation requests.</p>
                  </div>
                </div>
                <div className="text-[9px] text-[#64748b] pt-2 border-t border-white/5 mt-3 flex items-center justify-between">
                  <span>Backlog tracker online</span>
                  <span className="text-emerald-500 font-bold flex items-center gap-0.5"><ShieldCheck size={11} /> MONITORING</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Drilldown side drawer */}
      <DrilldownDrawer data={drilldownData} onClose={() => setDrilldownData(null)} />
    </div>
  );
}
