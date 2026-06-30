'use client';

import React from 'react';
import { User, Package, TrendingUp, TrendingDown, AlertTriangle, Zap, PieChart, Medal } from 'lucide-react';
import { DashboardSummary, DashboardCharts, Transaction } from '../types';

interface CommandCenterProps {
  summary: DashboardSummary | null;
  charts: DashboardCharts | null;
  transactions: Transaction[];
  isLoading: boolean;
}

export const TopPerformersPanel: React.FC<CommandCenterProps> = ({
  summary, charts, transactions, isLoading
}) => {
  const getTopCustomer = () => {
    if (!transactions || transactions.length === 0) return { name: 'N/A', detail: '--' };
    const highest = [...transactions].sort((a, b) => Number(b.amount) - Number(a.amount))[0];
    return { name: highest.customerName, detail: `$${Number(highest.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}` };
  };

  const getTopProduct = () => {
    if (!transactions || transactions.length === 0) return { name: 'N/A', detail: '--' };
    const counts: Record<string, number> = {};
    transactions.forEach(t => { counts[t.productName] = (counts[t.productName] || 0) + 1; });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return sorted[0] ? { name: sorted[0][0], detail: `${sorted[0][1]} orders` } : { name: 'N/A', detail: '--' };
  };

  const getFastestRegion = () => {
    if (!charts?.salesByRegion || charts.salesByRegion.length === 0) return { name: 'N/A', detail: '--' };
    const sorted = [...charts.salesByRegion].sort((a, b) => b.value - a.value);
    return { name: sorted[0].region, detail: `$${sorted[0].value.toLocaleString()}` };
  };

  const getWeakestRegion = () => {
    if (!charts?.salesByRegion || charts.salesByRegion.length === 0) return { name: 'N/A', detail: '--' };
    const sorted = [...charts.salesByRegion].sort((a, b) => a.value - b.value);
    return { name: sorted[0].region, detail: `$${sorted[0].value.toLocaleString()}` };
  };

  const getCancellationSource = () => {
    if (!transactions || transactions.length === 0) return { name: 'N/A', detail: '--' };
    const cancelled = transactions.filter(t => t.status === 'Cancelled');
    if (cancelled.length === 0) return { name: 'None', detail: '0' };
    const catCounts: Record<string, number> = {};
    cancelled.forEach(t => { catCounts[t.category] = (catCounts[t.category] || 0) + 1; });
    const sorted = Object.entries(catCounts).sort((a, b) => b[1] - a[1]);
    return sorted[0] ? { name: sorted[0][0], detail: `${sorted[0][1]} cancellations` } : { name: 'None', detail: '0' };
  };

  const getVelocity = () => {
    if (!transactions || transactions.length === 0) return { name: '--', detail: '--' };
    const totalAmt = transactions.reduce((s, t) => s + Number(t.amount), 0);
    const avg = totalAmt / transactions.length;
    return { name: `$${avg.toFixed(0)}/order`, detail: `${transactions.length} txns` };
  };

  const getConcentration = () => {
    if (!transactions || transactions.length === 0) return { name: '--', detail: '--' };
    const custTotals: Record<string, number> = {};
    transactions.forEach(t => { custTotals[t.customerName] = (custTotals[t.customerName] || 0) + Number(t.amount); });
    const sorted = Object.entries(custTotals).sort((a, b) => b[1] - a[1]);
    const top3Total = sorted.slice(0, 3).reduce((s, [, v]) => s + v, 0);
    const allTotal = sorted.reduce((s, [, v]) => s + v, 0);
    const pct = allTotal > 0 ? ((top3Total / allTotal) * 100).toFixed(1) : '0';
    return { name: `${pct}%`, detail: `Top 3 of ${sorted.length}` };
  };

  const metrics = [
    { label: 'Top Customer', ...getTopCustomer(), icon: <User size={13} className="text-[#C6A96B]" /> },
    { label: 'Top Product', ...getTopProduct(), icon: <Package size={13} className="text-[#C6A96B]" /> },
    { label: 'Strongest Region', ...getFastestRegion(), icon: <TrendingUp size={13} className="text-[#C6A96B]" /> },
    { label: 'Weakest Region', ...getWeakestRegion(), icon: <TrendingDown size={13} className="text-[#A88B4A]" /> },
    { label: 'Cancel Source', ...getCancellationSource(), icon: <AlertTriangle size={13} className="text-[#A88B4A]" /> },
    { label: 'Velocity', ...getVelocity(), icon: <Zap size={13} className="text-[#C6A96B]" /> },
    { label: 'Concentration', ...getConcentration(), icon: <PieChart size={13} className="text-[#C6A96B]" /> },
  ];

  return (
    <div id="section-command-center" className="gold-card p-5">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/5">
        <Medal size={14} className="text-[#C6A96B]" />
        <h3 className="text-xs font-bold tracking-wider uppercase text-[#F5F1E8]">Command Center</h3>
      </div>

      {/* Compact Grid: 4 top, 3 bottom */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {isLoading ? (
          Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="animate-pulse p-3 rounded bg-[#111111] border border-white/5">
              <div className="h-2.5 w-1/2 bg-white/5 rounded mb-2"></div>
              <div className="h-4 w-3/4 bg-white/5 rounded"></div>
            </div>
          ))
        ) : (
          metrics.map((m, i) => (
            <div key={i} className="p-3 rounded-lg bg-[#111111] border border-white/5 hover:border-white/8 transition min-w-0">
              <div className="flex items-center gap-1.5 mb-1.5">
                {m.icon}
                <span className="text-[8px] font-bold text-[#7E786F] tracking-wider uppercase truncate">{m.label}</span>
              </div>
              <p className="text-xs font-bold text-[#F5F1E8] truncate">{m.name}</p>
              <p className="text-[10px] text-[#B8B2A8] truncate mt-0.5">{m.detail}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
