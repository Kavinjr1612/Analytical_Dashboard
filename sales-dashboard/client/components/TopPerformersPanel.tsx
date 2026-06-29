'use client';

import React from 'react';
import { User, Package, Compass, TrendingUp, TrendingDown, AlertTriangle, Zap, PieChart, Medal, Sparkles } from 'lucide-react';
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
  // Top Customer (highest single purchase on current page)
  const getTopCustomer = () => {
    if (!transactions || transactions.length === 0) return { name: 'N/A', detail: '--' };
    const highest = [...transactions].sort((a, b) => Number(b.amount) - Number(a.amount))[0];
    return {
      name: highest.customerName,
      detail: `$${Number(highest.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
    };
  };

  // Top Product (most frequent on current page)
  const getTopProduct = () => {
    if (!transactions || transactions.length === 0) return { name: 'N/A', detail: '--' };
    const counts: Record<string, number> = {};
    transactions.forEach(t => { counts[t.productName] = (counts[t.productName] || 0) + 1; });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return sorted[0] ? { name: sorted[0][0], detail: `${sorted[0][1]} orders` } : { name: 'N/A', detail: '--' };
  };

  // Fastest / Weakest Region from charts
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

  // Highest Cancellation Source (category with most cancelled)
  const getCancellationSource = () => {
    if (!transactions || transactions.length === 0) return { name: 'N/A', detail: '--' };
    const cancelled = transactions.filter(t => t.status === 'Cancelled');
    if (cancelled.length === 0) return { name: 'None', detail: '0 cancellations' };
    const catCounts: Record<string, number> = {};
    cancelled.forEach(t => { catCounts[t.category] = (catCounts[t.category] || 0) + 1; });
    const sorted = Object.entries(catCounts).sort((a, b) => b[1] - a[1]);
    return sorted[0] ? { name: sorted[0][0], detail: `${sorted[0][1]} cancellations` } : { name: 'None', detail: '0' };
  };

  // Transaction Velocity (avg amount per transaction on current page)
  const getVelocity = () => {
    if (!transactions || transactions.length === 0) return { name: '--', detail: '--' };
    const totalAmt = transactions.reduce((s, t) => s + Number(t.amount), 0);
    const avg = totalAmt / transactions.length;
    return { name: `$${avg.toFixed(0)}/order`, detail: `${transactions.length} txns loaded` };
  };

  // Revenue Concentration (% from top 3 customers on current page)
  const getConcentration = () => {
    if (!transactions || transactions.length === 0) return { name: '--', detail: '--' };
    const custTotals: Record<string, number> = {};
    transactions.forEach(t => { custTotals[t.customerName] = (custTotals[t.customerName] || 0) + Number(t.amount); });
    const sorted = Object.entries(custTotals).sort((a, b) => b[1] - a[1]);
    const top3Total = sorted.slice(0, 3).reduce((s, [, v]) => s + v, 0);
    const allTotal = sorted.reduce((s, [, v]) => s + v, 0);
    const pct = allTotal > 0 ? ((top3Total / allTotal) * 100).toFixed(1) : '0';
    return { name: `${pct}%`, detail: `Top 3 of ${sorted.length} customers` };
  };

  const topCustomer = getTopCustomer();
  const topProduct = getTopProduct();
  const fastestRegion = getFastestRegion();
  const weakestRegion = getWeakestRegion();
  const cancSource = getCancellationSource();
  const velocity = getVelocity();
  const concentration = getConcentration();

  const metrics = [
    { label: 'Top Customer', name: topCustomer.name, detail: topCustomer.detail, icon: <User size={14} className="text-[#C6A96B]" /> },
    { label: 'Top Product', name: topProduct.name, detail: topProduct.detail, icon: <Package size={14} className="text-[#C6A96B]" /> },
    { label: 'Strongest Region', name: fastestRegion.name, detail: fastestRegion.detail, icon: <TrendingUp size={14} className="text-[#C6A96B]" /> },
    { label: 'Weakest Region', name: weakestRegion.name, detail: weakestRegion.detail, icon: <TrendingDown size={14} className="text-[#A88B4A]" /> },
    { label: 'Cancellation Source', name: cancSource.name, detail: cancSource.detail, icon: <AlertTriangle size={14} className="text-[#A88B4A]" /> },
    { label: 'Transaction Velocity', name: velocity.name, detail: velocity.detail, icon: <Zap size={14} className="text-[#C6A96B]" /> },
    { label: 'Revenue Concentration', name: concentration.name, detail: concentration.detail, icon: <PieChart size={14} className="text-[#C6A96B]" /> },
  ];

  return (
    <div id="section-command-center" className="gold-card p-5 flex flex-col bg-[#141414] section-reveal">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4">
        <div className="flex items-center gap-2">
          <Medal size={16} className="text-[#C6A96B]" />
          <h3 className="text-sm font-semibold tracking-wider uppercase text-[#F5F1E8]">Command Center</h3>
        </div>
        <Sparkles size={14} className="text-[#A88B4A] animate-pulse" />
      </div>

      {/* Metrics */}
      <div className="flex flex-col gap-3">
        {isLoading ? (
          Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-8 h-8 rounded bg-white/5"></div>
              <div className="flex-1 space-y-1.5">
                <div className="h-2.5 w-1/3 bg-white/5 rounded"></div>
                <div className="h-4 w-3/4 bg-white/5 rounded"></div>
              </div>
            </div>
          ))
        ) : (
          metrics.map((m, i) => (
            <div key={i} className="flex items-start gap-3 p-2.5 rounded hover:bg-[#1A1A1A] border border-transparent hover:border-white/5 transition-all duration-200">
              <div className="p-1.5 rounded bg-[#111111] border border-white/5 flex-shrink-0 mt-0.5">
                {m.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] font-bold text-[#7E786F] tracking-wider uppercase mb-0.5">{m.label}</p>
                <h4 className="text-sm font-bold text-[#F5F1E8] truncate">{m.name}</h4>
                <p className="text-[11px] text-[#B8B2A8] font-medium truncate">{m.detail}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
