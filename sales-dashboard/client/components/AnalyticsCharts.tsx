'use client';

import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceDot,
} from 'recharts';
import { BarChart3, TrendingUp, Compass, PieChart as PieIcon, HelpCircle, AlertCircle } from 'lucide-react';
import { DashboardCharts, Transaction } from '../types';
import { DrilldownData } from './DrilldownDrawer';

interface AnalyticsChartsProps {
  charts: DashboardCharts | null;
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  onCategoryClick: (category: string) => void;
  onRegionClick: (region: string) => void;
  onStatusClick: (status: string) => void;
  onDateFocus: (month: string) => void;
  onDrilldown: (data: DrilldownData) => void;
  activeCategory: string;
  activeRegion: string;
  activeStatus: string;
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  charts, transactions, isLoading, error,
  onCategoryClick, onRegionClick, onStatusClick, onDateFocus, onDrilldown,
  activeCategory, activeRegion, activeStatus,
}) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const formatCurrency = (val: number) => {
    if (val >= 1e6) return `$${(val / 1e6).toFixed(1)}M`;
    if (val >= 1e3) return `$${(val / 1e3).toFixed(0)}k`;
    return `$${val}`;
  };

  const formatFullCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  const formatNumber = (val: number) => new Intl.NumberFormat('en-US').format(val);

  const GOLD_PALETTE: Record<string, string> = {
    Completed: '#C6A96B',
    Pending: '#A88B4A',
    Cancelled: '#7E786F',
  };

  // Custom tooltips
  const CustomCurrencyTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#141414] border border-[#C6A96B]/15 rounded p-3.5 shadow-2xl">
          <p className="text-[10px] font-bold text-[#7E786F] uppercase tracking-wide mb-1">{label}</p>
          <p className="text-sm font-bold text-[#F5F1E8]">{formatFullCurrency(payload[0].value)}</p>
          <p className="text-[10px] text-[#B8B2A8] mt-1">Click to focus this period</p>
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-[#141414] border border-[#C6A96B]/15 rounded p-3.5 shadow-2xl">
          <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: d.color }}>{d.name}</p>
          <p className="text-sm font-bold text-[#F5F1E8]">{formatNumber(d.value)} Orders ({d.percent.toFixed(1)}%)</p>
          <p className="text-[10px] text-[#B8B2A8] mt-1">Click to filter by status</p>
        </div>
      );
    }
    return null;
  };

  // Insight generators
  const getTrendInsight = () => {
    if (!charts?.revenueTrend || charts.revenueTrend.length === 0) return '';
    const sorted = [...charts.revenueTrend].sort((a, b) => b.revenue - a.revenue);
    return `Peak: ${sorted[0].date} (${formatFullCurrency(sorted[0].revenue)}) · Dip: ${sorted[sorted.length - 1].date} (${formatFullCurrency(sorted[sorted.length - 1].revenue)})`;
  };

  const getCategoryInsight = () => {
    if (!charts?.salesByCategory || charts.salesByCategory.length === 0) return '';
    const sorted = [...charts.salesByCategory].sort((a, b) => b.value - a.value);
    return `Leader: ${sorted[0].category} (${formatFullCurrency(sorted[0].value)}) · Lowest: ${sorted[sorted.length - 1].category}`;
  };

  const getRegionInsight = () => {
    if (!charts?.salesByRegion || charts.salesByRegion.length === 0) return '';
    const sorted = [...charts.salesByRegion].sort((a, b) => b.value - a.value);
    return `Strongest: ${sorted[0].region} (${formatFullCurrency(sorted[0].value)}) · Weakest: ${sorted[sorted.length - 1].region}`;
  };

  const getStatusInsight = () => {
    if (!charts?.orderStatusDistribution || charts.orderStatusDistribution.length === 0) return '';
    const total = charts.orderStatusDistribution.reduce((s, i) => s + i.count, 0);
    const completed = charts.orderStatusDistribution.find(i => i.status === 'Completed');
    const pct = completed && total > 0 ? ((completed.count / total) * 100).toFixed(1) : '0';
    return `Fulfillment: ${pct}% completed (${formatNumber(completed?.count || 0)} of ${formatNumber(total)})`;
  };

  // Peak point for revenue trend
  const peakPoint = charts?.revenueTrend && charts.revenueTrend.length > 0
    ? charts.revenueTrend.reduce((max, p) => p.revenue > max.revenue ? p : max, charts.revenueTrend[0])
    : null;

  // Handle chart clicks
  const handleTrendClick = (data: any) => {
    if (!data || !data.activePayload) return;
    const point = data.activePayload[0]?.payload;
    if (point) {
      onDateFocus(point.date);
      // Drilldown with month-level transactions
      const matchedTxs = transactions.filter(t => {
        const txMonth = t.transactionDate.substring(0, 7); // YYYY-MM
        return txMonth === point.date || t.transactionDate.startsWith(point.date);
      });
      const totalRev = charts?.revenueTrend?.reduce((s, p) => s + p.revenue, 0) || 0;
      onDrilldown({ type: 'trend', label: point.date, value: point.revenue, total: totalRev, transactions: matchedTxs });
    }
  };

  const handleCategoryBarClick = (data: any) => {
    if (!data) return;
    const cat = data.category;
    onCategoryClick(activeCategory === cat ? '' : cat);
    const matchedTxs = transactions.filter(t => t.category === cat);
    const totalVal = charts?.salesByCategory?.reduce((s, c) => s + c.value, 0) || 0;
    onDrilldown({ type: 'category', label: cat, value: data.value, total: totalVal, transactions: matchedTxs });
  };

  const handleRegionBarClick = (data: any) => {
    if (!data) return;
    const reg = data.region;
    onRegionClick(activeRegion === reg ? '' : reg);
    const matchedTxs = transactions.filter(t => t.region === reg);
    const totalVal = charts?.salesByRegion?.reduce((s, r) => s + r.value, 0) || 0;
    onDrilldown({ type: 'region', label: reg, value: data.value, total: totalVal, transactions: matchedTxs });
  };

  const handleStatusClick = (data: any) => {
    if (!data) return;
    const st = data.name;
    onStatusClick(activeStatus === st ? '' : st);
    const matchedTxs = transactions.filter(t => t.status === st);
    const totalCount = charts?.orderStatusDistribution?.reduce((s, i) => s + i.count, 0) || 0;
    onDrilldown({ type: 'status', label: st, value: data.value, total: totalCount, transactions: matchedTxs });
  };

  if (!mounted) return <div className="min-h-[760px]"></div>;

  if (error) {
    return (
      <div className="gold-card p-8 mb-6 border-red-950 text-center text-red-400">
        <p className="font-semibold mb-1">Failed to load analytics charts</p>
        <p className="text-xs text-[#7E786F]">{error}</p>
      </div>
    );
  }

  // Pre-process pie data
  const pieData = (charts?.orderStatusDistribution || []).map(item => ({
    name: item.status, value: item.count, color: GOLD_PALETTE[item.status] || '#7E786F',
  }));
  const totalStatusCount = pieData.reduce((s, i) => s + i.value, 0);
  const formattedPieData = pieData.map(i => ({
    ...i, percent: totalStatusCount > 0 ? (i.value / totalStatusCount) * 100 : 0,
  }));

  const ChartSkeleton = () => (
    <div className="gold-card p-6 animate-pulse flex flex-col justify-between h-[370px]">
      <div className="flex items-center justify-between mb-4">
        <div className="h-3 w-1/3 bg-white/5 rounded"></div>
        <div className="h-4 w-4 bg-white/5 rounded-full"></div>
      </div>
      <div className="flex-1 flex items-end gap-3 px-2">
        <div className="h-1/4 w-full bg-white/5 rounded-t"></div>
        <div className="h-2/3 w-full bg-white/5 rounded-t"></div>
        <div className="h-1/2 w-full bg-white/5 rounded-t"></div>
        <div className="h-3/4 w-full bg-white/5 rounded-t"></div>
      </div>
      <div className="h-3 w-3/4 bg-white/5 rounded mt-4"></div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <ChartSkeleton />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><ChartSkeleton /><ChartSkeleton /></div>
      </div>
    );
  }

  const isTrendEmpty = !charts?.revenueTrend || charts.revenueTrend.length === 0;
  const isCategoryEmpty = !charts?.salesByCategory || charts.salesByCategory.length === 0;
  const isRegionEmpty = !charts?.salesByRegion || charts.salesByRegion.length === 0;
  const isStatusEmpty = formattedPieData.length === 0;

  return (
    <div className="space-y-6">
      {/* 1. Revenue Trend — DOMINANT (full width) */}
      <div id="section-revenue-trend" className="gold-card p-5 flex flex-col h-[380px] justify-between section-reveal">
        <div>
          <div className="flex items-center justify-between pb-2 border-b border-white/5 mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp size={14} className="text-[#C6A96B]" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#F5F1E8]">Revenue Performance</h3>
            </div>
            <span className="text-[10px] font-bold text-[#7E786F] tracking-wide uppercase">Click any point to focus</span>
          </div>
          <div className="h-[260px] w-full">
            {isTrendEmpty ? (
              <div className="h-full flex flex-col items-center justify-center text-[#7E786F]">
                <HelpCircle size={24} className="mb-2 opacity-50" />
                <p className="text-xs">No trend data available</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={charts?.revenueTrend} margin={{ top: 10, right: 10, left: -25, bottom: 0 }} onClick={handleTrendClick} style={{ cursor: 'pointer' }}>
                  <defs>
                    <linearGradient id="trendGold" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C6A96B" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#C6A96B" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(198,169,107,0.03)" vertical={false} />
                  <XAxis dataKey="date" stroke="#7E786F" fontSize={9} tickLine={false} axisLine={false} dy={5} />
                  <YAxis stroke="#7E786F" fontSize={9} tickLine={false} axisLine={false} tickFormatter={formatCurrency} dx={-5} />
                  <Tooltip content={<CustomCurrencyTooltip />} />
                  <Area type="monotone" dataKey="revenue" stroke="#C6A96B" strokeWidth={2} fillOpacity={1} fill="url(#trendGold)" />
                  {peakPoint && (
                    <ReferenceDot x={peakPoint.date} y={peakPoint.revenue} r={5} fill="#C6A96B" stroke="#0A0A0A" strokeWidth={2} className="peak-dot" />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
        <div className="border-t border-white/5 pt-2 mt-2 flex items-center gap-1.5 text-[10px] text-[#B8B2A8] font-semibold">
          <AlertCircle size={12} className="text-[#C6A96B] flex-shrink-0" />
          <span className="truncate">{isTrendEmpty ? 'N/A' : getTrendInsight()}</span>
        </div>
      </div>

      {/* 2. Category + Region side-by-side */}
      <div id="section-category-region" className="grid grid-cols-1 md:grid-cols-2 gap-6 section-reveal">
        {/* Category */}
        <div className="gold-card p-5 flex flex-col h-[380px] justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-white/5 mb-3">
              <div className="flex items-center gap-2">
                <BarChart3 size={14} className="text-[#C6A96B]" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#F5F1E8]">Sales by Category</h3>
              </div>
              {activeCategory && <span className="active-filter-badge">{activeCategory} ✕</span>}
            </div>
            <div className="h-[250px] w-full">
              {isCategoryEmpty ? (
                <div className="h-full flex flex-col items-center justify-center text-[#7E786F]">
                  <HelpCircle size={24} className="mb-2 opacity-50" /><p className="text-xs">No category data</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts?.salesByCategory} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="catGold" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#C6A96B" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#C6A96B" stopOpacity={0.2} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(198,169,107,0.03)" vertical={false} />
                    <XAxis dataKey="category" stroke="#7E786F" fontSize={9} tickLine={false} axisLine={false} dy={5} />
                    <YAxis stroke="#7E786F" fontSize={9} tickLine={false} axisLine={false} tickFormatter={formatCurrency} dx={-5} />
                    <Tooltip content={<CustomCurrencyTooltip />} />
                    <Bar dataKey="value" fill="url(#catGold)" radius={[2,2,0,0]} cursor="pointer" onClick={handleCategoryBarClick} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
          <div className="border-t border-white/5 pt-2 mt-2 flex items-center gap-1.5 text-[10px] text-[#B8B2A8] font-semibold">
            <AlertCircle size={12} className="text-[#C6A96B] flex-shrink-0" />
            <span className="truncate">{isCategoryEmpty ? 'N/A' : getCategoryInsight()}</span>
          </div>
        </div>

        {/* Region */}
        <div className="gold-card p-5 flex flex-col h-[380px] justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-white/5 mb-3">
              <div className="flex items-center gap-2">
                <Compass size={14} className="text-[#C6A96B]" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#F5F1E8]">Sales by Region</h3>
              </div>
              {activeRegion && <span className="active-filter-badge">{activeRegion} ✕</span>}
            </div>
            <div className="h-[250px] w-full">
              {isRegionEmpty ? (
                <div className="h-full flex flex-col items-center justify-center text-[#7E786F]">
                  <HelpCircle size={24} className="mb-2 opacity-50" /><p className="text-xs">No region data</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts?.salesByRegion} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="regGold" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#A88B4A" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#A88B4A" stopOpacity={0.2} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(198,169,107,0.03)" vertical={false} />
                    <XAxis dataKey="region" stroke="#7E786F" fontSize={9} tickLine={false} axisLine={false} dy={5} />
                    <YAxis stroke="#7E786F" fontSize={9} tickLine={false} axisLine={false} tickFormatter={formatCurrency} dx={-5} />
                    <Tooltip content={<CustomCurrencyTooltip />} />
                    <Bar dataKey="value" fill="url(#regGold)" radius={[2,2,0,0]} cursor="pointer" onClick={handleRegionBarClick} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
          <div className="border-t border-white/5 pt-2 mt-2 flex items-center gap-1.5 text-[10px] text-[#B8B2A8] font-semibold">
            <AlertCircle size={12} className="text-[#C6A96B] flex-shrink-0" />
            <span className="truncate">{isRegionEmpty ? 'N/A' : getRegionInsight()}</span>
          </div>
        </div>
      </div>

      {/* 3. Order Status Distribution — positioned near transaction ledger */}
      <div id="section-status" className="gold-card p-5 flex flex-col h-[320px] justify-between section-reveal">
        <div>
          <div className="flex items-center justify-between pb-2 border-b border-white/5 mb-3">
            <div className="flex items-center gap-2">
              <PieIcon size={14} className="text-[#C6A96B]" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#F5F1E8]">Order Status Distribution</h3>
            </div>
            {activeStatus && <span className="active-filter-badge">{activeStatus} ✕</span>}
          </div>
          <div className="h-[200px] w-full flex flex-col sm:flex-row items-center justify-center gap-2">
            {isStatusEmpty ? (
              <div className="h-full flex flex-col items-center justify-center text-[#7E786F]">
                <HelpCircle size={24} className="mb-2 opacity-50" /><p className="text-xs">No status data</p>
              </div>
            ) : (
              <>
                <div className="flex-1 w-full h-[180px] sm:h-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip content={<CustomPieTooltip />} />
                      <Pie data={formattedPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={3} dataKey="value" cursor="pointer" onClick={handleStatusClick}>
                        {formattedPieData.map((entry, i) => (
                          <Cell key={`cell-${i}`} fill={entry.color} opacity={activeStatus && activeStatus !== entry.name ? 0.3 : 1} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[8px] text-[#7E786F] uppercase font-bold tracking-wider">Orders</span>
                    <span className="text-base font-extrabold text-[#F5F1E8] mt-0.5">{formatNumber(totalStatusCount)}</span>
                  </div>
                </div>
                <div className="flex flex-row sm:flex-col gap-2.5 justify-center sm:justify-start flex-wrap px-2">
                  {formattedPieData.map((item, i) => (
                    <button key={i} onClick={() => handleStatusClick(item)} className="flex items-center gap-2 text-[10px] font-bold cursor-pointer hover:opacity-80 transition">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-[#B8B2A8]">{item.name}:</span>
                      <span className="text-[#F5F1E8]">{formatNumber(item.value)}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
        <div className="border-t border-white/5 pt-2 mt-2 flex items-center gap-1.5 text-[10px] text-[#B8B2A8] font-semibold">
          <AlertCircle size={12} className="text-[#C6A96B] flex-shrink-0" />
          <span className="truncate">{isStatusEmpty ? 'N/A' : getStatusInsight()}</span>
        </div>
      </div>
    </div>
  );
};
