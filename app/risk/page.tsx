'use client';

import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { AlertTriangle, ShieldAlert, Sparkles, XCircle, Clock, HelpCircle } from 'lucide-react';
import { useDashboardContext } from '../../context/DashboardContext';
import { EmptyStateWrapper } from '../../components/EmptyState';

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

export default function RiskPage() {
  const { 
    charts, transactionsResponse, loading,
    activeSchema, formatValue 
  } = useDashboardContext();
  const currentTransactions = transactionsResponse?.transactions || [];

  const statusData = charts?.orderStatusDistribution || [];
  const totalCount = statusData.reduce((sum, item) => sum + item.count, 0);

  const statusLabel = activeSchema.status || 'Status';
  const amountLabel = activeSchema.amount || 'Value';
  const customerLabel = activeSchema.customerName || 'Identifier';

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const itemName = data.payload?.category 
        || data.payload?.region 
        || data.payload?.status 
        || data.payload?.productName 
        || data.payload?.customerName
        || data.payload?.name 
        || data.name 
        || label;
        
      return (
        <div className="p-3 rounded-lg bg-[var(--surface-color)] border border-[var(--border-color)] shadow-xl flex flex-col gap-1 text-[11px] leading-tight">
          {itemName && (
            <span className="font-extrabold text-[var(--text-primary)]">
              {itemName}
            </span>
          )}
          <span className="font-semibold text-[var(--accent-color)] text-xs">
            {data.value} records
          </span>
        </div>
      );
    }
    return null;
  };

  // 1. Classify status values dynamically to avoid hardcoding Completed, Pending, Cancelled
  const parsedStatusGroups = useMemo(() => {
    let completed = 0;
    let pending = 0;
    let critical = 0;
    
    const criticalItems: { status: string; count: number }[] = [];
    const pendingItems: { status: string; count: number }[] = [];
    const completedItems: { status: string; count: number }[] = [];

    statusData.forEach(item => {
      const s = item.status.toLowerCase();
      if (s.includes('cancel') || s.includes('fail') || s.includes('error') || s.includes('abort') || s.includes('reject') || s.includes('deny') || s.includes('invalid') || s.includes('500') || s.includes('400') || s.includes('503') || s.includes('failed')) {
        critical += item.count;
        criticalItems.push(item);
      } else if (s.includes('pending') || s.includes('warning') || s.includes('warn') || s.includes('progress') || s.includes('hold') || s.includes('await') || s.includes('process')) {
        pending += item.count;
        pendingItems.push(item);
      } else {
        completed += item.count;
        completedItems.push(item);
      }
    });

    return {
      completed,
      pending,
      critical,
      criticalItems,
      pendingItems,
      completedItems
    };
  }, [statusData]);

  // 2. Calculations based on groups
  const calculations = useMemo(() => {
    const criticalStatusNames = new Set(parsedStatusGroups.criticalItems.map(i => i.status));
    const criticalTx = currentTransactions.filter(t => criticalStatusNames.has(t.status) || t.status.toLowerCase().includes('cancel') || t.status.toLowerCase().includes('fail'));
    const leakage = criticalTx.reduce((sum, t) => sum + Number(t.amount), 0);

    // Operational pressure: percentage of pending + critical logs
    const pressurePct = totalCount > 0 ? ((parsedStatusGroups.pending + parsedStatusGroups.critical) / totalCount) * 100 : 0;

    // Risk score out of 100
    const baseRisk = totalCount > 0 ? ((parsedStatusGroups.critical * 1.5 + parsedStatusGroups.pending * 0.8) / totalCount) * 100 : 0;
    const finalRisk = Math.min(100, Math.round(baseRisk));

    let riskLevel = 'LOW';
    let riskColor = 'text-emerald-500';
    if (finalRisk > 30) {
      riskLevel = 'HIGH PRESSURE';
      riskColor = 'text-rose-500';
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
      criticalTx
    };
  }, [currentTransactions, totalCount, parsedStatusGroups]);

  // Status Pie chart data
  const pieData = useMemo(() => {
    return [
      { name: 'Resolved / Success', value: parsedStatusGroups.completed, color: '#10b981' },
      { name: 'In Progress / Pending', value: parsedStatusGroups.pending, color: '#f59e0b' },
      { name: 'Critical / Failed', value: parsedStatusGroups.critical, color: '#F43F5E' }
    ].filter(item => item.value > 0);
  }, [parsedStatusGroups]);

  return (
    <EmptyStateWrapper>
      <div className="shell-container tab-transition max-w-[1700px] mx-auto flex flex-col gap-6">
        
        {/* Context Takeaways Callout Card */}
        <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/10 flex items-start gap-3">
          <ShieldAlert size={16} className="text-rose-500 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-xs font-semibold text-[var(--text-primary)]">Operations Risk Takeaways</h4>
            <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed mt-1">
              This panel aggregates data quality and {statusLabel.toLowerCase()} risks. **Value Deviation Leakage** tracks the exact amount of potential value lost due to records in failed or cancelled status states. **Operational Backlog** shows records currently in progress or warning states. The **System Risk Index** synthesizes this into an overall risk percentage: scores above 30% indicate high operational friction.
            </p>
          </div>
        </div>

        {/* Row 1: Warning visual headers / risk scores */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Risk Level gauge */}
          <div className="fintech-card flex flex-col justify-between border-rose-500/10">
            <div className="flex justify-between items-center mb-3">
              <span className="metric-label flex items-center gap-1">
                <span>System Risk Index</span>
                <span title="Calculates operational load: (Failed*1.5 + Pending*0.8) / Total * 100."><HelpCircle size={10} className="opacity-60 cursor-help" /></span>
              </span>
              <ShieldAlert className="text-rose-500" size={16} />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="metric-value">{calculations.finalRisk}%</span>
              <span className={`text-[10px] font-semibold uppercase ${calculations.riskColor}`}>
                {calculations.riskLevel}
              </span>
            </div>
            <p className="text-[10px] text-[var(--text-secondary)] mt-2 font-medium">
              Consolidated transaction risk index
            </p>
          </div>

          {/* Revenue leakage */}
          <div className="fintech-card flex flex-col justify-between border-rose-500/10">
            <div className="flex justify-between items-center mb-3">
              <span className="metric-label flex items-center gap-1">
                <span>Value Deviation Leakage</span>
                <span title="Sum of transaction amounts for items whose status is Cancelled or Failed."><HelpCircle size={10} className="opacity-60 cursor-help" /></span>
              </span>
              <XCircle className="text-rose-500" size={16} />
            </div>
            <div className="metric-value text-rose-500">
              {formatValue(calculations.leakage)}
            </div>
            <p className="text-[10px] text-[var(--text-secondary)] mt-2 font-medium">
              Lost value from failed states
            </p>
          </div>

          {/* Pending pressure */}
          <div className="fintech-card flex flex-col justify-between border-amber-500/10">
            <div className="flex justify-between items-center mb-3">
              <span className="metric-label">Operational backlog</span>
              <Clock className="text-amber-500" size={16} />
            </div>
            <div className="metric-value text-amber-500">
              {parsedStatusGroups.pending} Pending
            </div>
            <p className="text-[10px] text-[var(--text-secondary)] mt-2 font-medium">
              Records awaiting resolution clearance
            </p>
          </div>
        </div>

        {/* Row 2: Failed Transaction listings & Pie chart ratios */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
          
          {/* Failed / Cancelled list table (col-span-7) */}
          <div className="xl:col-span-7 fintech-card min-h-[340px] flex flex-col justify-between border-rose-500/10">
            <div>
              <h4 className="text-[10px] font-semibold text-rose-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                <AlertTriangle size={12} />
                Critical Deviation Log Feed
              </h4>
              <p className="text-[9px] text-[var(--text-secondary)] italic">List of failed or cancelled records requiring review</p>
            </div>

            <div className="flex-1 mt-4 space-y-2 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
              {calculations.criticalTx.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-emerald-500 font-semibold">
                  Zero critical deviation leaks captured.
                </div>
              ) : (
                calculations.criticalTx.slice(0, 5).map((t, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs p-3 rounded-lg bg-rose-500/5 border border-rose-500/10 hover:border-rose-500/20 transition">
                    <div className="flex flex-col gap-0.5 truncate mr-3">
                      <span className="font-semibold text-[var(--text-primary)] truncate max-w-[200px]">{t.customerName}</span>
                      <span className="text-[9px] text-[var(--text-secondary)] font-semibold uppercase">{t.productName}</span>
                    </div>
                    <span className="text-rose-500 font-semibold">{formatValue(Number(t.amount))}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Ratios pie chart (col-span-5) */}
          <div className="xl:col-span-5 fintech-card h-[340px] flex flex-col justify-between">
            <div>
              <h4 className="text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
                {statusLabel} Status Ratios
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
                    <Tooltip content={<CustomTooltip />} />
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
