'use client';

import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { AlertTriangle, ShieldAlert, Sparkles, XCircle, Clock } from 'lucide-react';
import { useDashboardContext } from '../../context/DashboardContext';
import { EmptyStateWrapper } from '../../components/EmptyState';

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

export default function RiskPage() {
  const { charts, transactionsResponse, loading } = useDashboardContext();
  const currentTransactions = transactionsResponse?.transactions || [];

  const statusData = charts?.orderStatusDistribution || [];
  const totalCount = statusData.reduce((sum, item) => sum + item.count, 0);

  const completedCount = statusData.find(i => i.status === 'Completed')?.count || 0;
  const pendingCount = statusData.find(i => i.status === 'Pending')?.count || 0;
  const cancelledCount = statusData.find(i => i.status === 'Cancelled')?.count || 0;

  // 1. Calculations
  const calculations = useMemo(() => {
    // Total cost of cancellations (Revenue Leakage)
    const cancelledTx = currentTransactions.filter(t => t.status === 'Cancelled');
    const leakage = cancelledTx.reduce((sum, t) => sum + Number(t.amount), 0);

    // Operational pressure: percentage of pending + cancelled logs
    const pressurePct = totalCount > 0 ? ((pendingCount + cancelledCount) / totalCount) * 100 : 0;

    // Risk score out of 100
    // Higher cancelled and pending counts increase the risk score
    const baseRisk = totalCount > 0 ? ((cancelledCount * 1.5 + pendingCount * 0.8) / totalCount) * 100 : 0;
    const finalRisk = Math.min(100, Math.round(baseRisk));

    let riskLevel = 'LOW';
    let riskColor = 'text-emerald-500';
    if (finalRisk > 30) {
      riskLevel = 'HIGH PRESSURE';
      riskColor = 'text-red-500';
    } else if (finalRisk > 12) {
      riskLevel = 'MODERATE';
      riskColor = 'text-amber-500';
    }

    return {
      leakage,
      pressurePct,
      finalRisk,
      riskLevel,
      riskColor,
      cancelledTx
    };
  }, [currentTransactions, totalCount, pendingCount, cancelledCount]);

  // 2. Cancellation by category details
  const cancellationByCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    calculations.cancelledTx.forEach(t => {
      counts[t.category] = (counts[t.category] || 0) + Number(t.amount);
    });
    return Object.entries(counts).map(([cat, val]) => ({
      category: cat,
      revenue: val
    })).sort((a,b) => b.revenue - a.revenue);
  }, [calculations.cancelledTx]);

  // Status Pie chart data
  const pieData = useMemo(() => {
    return [
      { name: 'Completed', value: completedCount, color: '#10b981' },
      { name: 'Pending', value: pendingCount, color: '#f59e0b' },
      { name: 'Cancelled', value: cancelledCount, color: '#ef4444' }
    ].filter(item => item.value > 0);
  }, [completedCount, pendingCount, cancelledCount]);

  return (
    <EmptyStateWrapper>
      <div className="shell-container tab-transition max-w-[1700px] mx-auto flex flex-col gap-6">
        
        {/* Row 1: Warning visual headers / risk scores */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Risk Level gauge */}
          <div className="fintech-card flex flex-col justify-between border-red-500/10">
            <div className="flex justify-between items-center mb-3">
              <span className="metric-label">System Risk Index</span>
              <ShieldAlert className="text-red-500" size={16} />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="metric-value">{calculations.finalRisk}%</span>
              <span className={`text-[10px] font-extrabold uppercase ${calculations.riskColor}`}>
                {calculations.riskLevel}
              </span>
            </div>
            <p className="text-[10px] text-[var(--text-secondary)] mt-2 font-semibold">
              Consolidated transaction risk index
            </p>
          </div>

          {/* Revenue leakage */}
          <div className="fintech-card flex flex-col justify-between border-red-500/10">
            <div className="flex justify-between items-center mb-3">
              <span className="metric-label">Revenue Leakage</span>
              <XCircle className="text-red-500" size={16} />
            </div>
            <div className="metric-value text-red-500">
              {formatCurrency(calculations.leakage)}
            </div>
            <p className="text-[10px] text-[var(--text-secondary)] mt-2 font-semibold">
              Lost value from cancelled orders
            </p>
          </div>

          {/* Pending pressure */}
          <div className="fintech-card flex flex-col justify-between border-amber-500/10">
            <div className="flex justify-between items-center mb-3">
              <span className="metric-label">Operational backlog</span>
              <Clock className="text-amber-500" size={16} />
            </div>
            <div className="metric-value text-amber-500">
              {pendingCount} Pending
            </div>
            <p className="text-[10px] text-[var(--text-secondary)] mt-2 font-semibold">
              Orders awaiting processing clearance
            </p>
          </div>
        </div>

        {/* Row 2: Failed Transaction listings & Pie chart ratios */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
          
          {/* Failed / Cancelled list table (col-span-7) */}
          <div className="xl:col-span-7 fintech-card min-h-[340px] flex flex-col justify-between border-red-500/10">
            <div>
              <h4 className="text-[10px] font-bold text-red-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                <AlertTriangle size={12} />
                Critical Leakage Log Feed
              </h4>
              <p className="text-[9px] text-[var(--text-secondary)] italic">List of cancelled transactions requiring review</p>
            </div>

            <div className="flex-1 mt-4 space-y-2 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
              {calculations.cancelledTx.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-emerald-500 font-semibold">
                  Zero cancellation leaks captured in this database.
                </div>
              ) : (
                calculations.cancelledTx.slice(0, 5).map((t, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs p-3 rounded-lg bg-red-500/5 border border-red-500/10 hover:border-red-500/20 transition">
                    <div className="flex flex-col gap-0.5 truncate mr-3">
                      <span className="font-extrabold text-[var(--text-primary)] truncate max-w-[200px]">{t.customerName}</span>
                      <span className="text-[9px] text-[var(--text-secondary)] font-semibold uppercase">{t.productName}</span>
                    </div>
                    <span className="text-red-500 font-extrabold">{formatCurrency(Number(t.amount))}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Ratios pie chart (col-span-5) */}
          <div className="xl:col-span-5 fintech-card h-[340px] flex flex-col justify-between">
            <div>
              <h4 className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
                SLA Status Ratios
              </h4>
              <p className="text-[9px] text-[var(--text-secondary)] italic">Breakdown of transaction statuses</p>
            </div>

            <div className="flex-1 w-full min-h-0 text-xs mt-4 flex items-center justify-center">
              {pieData.length === 0 ? (
                <div className="text-xs text-[var(--text-secondary)]">No status telemetry</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, value }) => `${name} (${value})`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ background: 'var(--surface-color)', borderColor: 'var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

        </div>

      </div>
    </EmptyStateWrapper>
  );
}
