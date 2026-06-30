'use client';

import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceDot,
} from 'recharts';
import { TrendingUp, BarChart3, Compass, PieChart as PieIcon, HelpCircle, AlertCircle, ShieldCheck, Clock, XCircle } from 'lucide-react';
import { DashboardCharts, Transaction } from '../types';
import { DrilldownData } from './DrilldownDrawer';

/* ============================================
   SHARED TYPES & UTILITIES
   ============================================ */

interface ChartInteractionProps {
  charts: DashboardCharts | null;
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  onDrilldown: (data: DrilldownData) => void;
}

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

const CustomCurrencyTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#141414] border border-[#C6A96B]/15 rounded-lg p-4 shadow-2xl">
        <p className="text-[10px] font-bold text-[#7E786F] uppercase tracking-wide mb-1">{label}</p>
        <p className="text-sm font-bold text-[#F5F1E8]">{formatFullCurrency(payload[0].value)}</p>
        <p className="text-[10px] text-[#B8B2A8] mt-1.5">Click to focus this period</p>
      </div>
    );
  }
  return null;
};

const ChartSkeleton = ({ height = 'h-[400px]' }: { height?: string }) => (
  <div className={`gold-card chart-spacious animate-pulse flex flex-col justify-between ${height}`}>
    <div className="flex items-center justify-between mb-6">
      <div className="h-3 w-1/3 bg-white/5 rounded"></div>
      <div className="h-4 w-4 bg-white/5 rounded-full"></div>
    </div>
    <div className="flex-1 flex items-end gap-4 px-3">
      <div className="h-1/4 w-full bg-white/5 rounded-t"></div>
      <div className="h-2/3 w-full bg-white/5 rounded-t"></div>
      <div className="h-1/2 w-full bg-white/5 rounded-t"></div>
      <div className="h-3/4 w-full bg-white/5 rounded-t"></div>
      <div className="h-1/3 w-full bg-white/5 rounded-t"></div>
    </div>
    <div className="h-3 w-3/4 bg-white/5 rounded mt-6"></div>
  </div>
);

/* ============================================
   1. REVENUE CHART (Zone 2 — War Room)
   ============================================ */

interface RevenueChartProps extends ChartInteractionProps {
  onDateFocus: (month: string) => void;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({
  charts, transactions, isLoading, error, onDateFocus, onDrilldown
}) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return <div className="chart-spacious-tall"></div>;

  if (error) {
    return (
      <div className="gold-card chart-spacious chart-spacious-tall border-red-950 text-center text-red-400 flex items-center justify-center">
        <div>
          <p className="font-semibold mb-1">Failed to load revenue data</p>
          <p className="text-xs text-[#7E786F]">{error}</p>
        </div>
      </div>
    );
  }

  if (isLoading) return <ChartSkeleton height="chart-spacious-tall" />;

  const trendData = charts?.revenueTrend || [];
  const isEmpty = trendData.length === 0;

  const peakPoint = trendData.length > 0
    ? trendData.reduce((max, p) => p.revenue > max.revenue ? p : max, trendData[0])
    : null;

  const dipPoint = trendData.length > 0
    ? trendData.reduce((min, p) => p.revenue < min.revenue ? p : min, trendData[0])
    : null;

  const getTrendInsight = () => {
    if (trendData.length === 0) return '';
    const sorted = [...trendData].sort((a, b) => b.revenue - a.revenue);
    return `Peak: ${sorted[0].date} (${formatFullCurrency(sorted[0].revenue)}) · Dip: ${sorted[sorted.length - 1].date} (${formatFullCurrency(sorted[sorted.length - 1].revenue)})`;
  };

  const handleClick = (data: any) => {
    if (!data || !data.activePayload) return;
    const point = data.activePayload[0]?.payload;
    if (point) {
      onDateFocus(point.date);
      const matchedTxs = transactions.filter(t => {
        const txMonth = t.transactionDate.substring(0, 7);
        return txMonth === point.date || t.transactionDate.startsWith(point.date);
      });
      const totalRev = trendData.reduce((s, p) => s + p.revenue, 0);
      onDrilldown({ type: 'trend', label: point.date, value: point.revenue, total: totalRev, transactions: matchedTxs });
    }
  };

  return (
    <div className="gold-card chart-spacious chart-spacious-tall flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-6">
          <div className="flex items-center gap-2.5">
            <TrendingUp size={16} className="text-[#C6A96B]" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#F5F1E8]">Revenue Performance</h3>
          </div>
          <span className="text-[10px] font-bold text-[#7E786F] tracking-wide uppercase">Click any point to focus period</span>
        </div>
        <div className="h-[420px] w-full">
          {isEmpty ? (
            <div className="h-full flex flex-col items-center justify-center text-[#7E786F]">
              <HelpCircle size={28} className="mb-3 opacity-40" />
              <p className="text-xs">No revenue trend data available</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 15, right: 20, left: -15, bottom: 5 }} onClick={handleClick} style={{ cursor: 'pointer' }}>
                <defs>
                  <linearGradient id="trendGoldLarge" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C6A96B" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#C6A96B" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(198,169,107,0.03)" vertical={false} />
                <XAxis dataKey="date" stroke="#7E786F" fontSize={10} tickLine={false} axisLine={false} dy={8} />
                <YAxis stroke="#7E786F" fontSize={10} tickLine={false} axisLine={false} tickFormatter={formatCurrency} dx={-8} />
                <Tooltip content={<CustomCurrencyTooltip />} />
                <Area type="monotone" dataKey="revenue" stroke="#C6A96B" strokeWidth={2.5} fillOpacity={1} fill="url(#trendGoldLarge)" />
                {peakPoint && (
                  <ReferenceDot x={peakPoint.date} y={peakPoint.revenue} r={6} fill="#C6A96B" stroke="#0A0A0A" strokeWidth={2} className="peak-dot" />
                )}
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
      <div className="border-t border-white/5 pt-3 mt-4 flex items-center gap-2 text-[11px] text-[#B8B2A8] font-semibold">
        <AlertCircle size={13} className="text-[#C6A96B] flex-shrink-0" />
        <span className="truncate">{isEmpty ? 'N/A' : getTrendInsight()}</span>
      </div>
    </div>
  );
};

/* ============================================
   2. MARKET CHARTS (Zone 3 — Category + Region)
   ============================================ */

interface MarketChartsProps extends ChartInteractionProps {
  onCategoryClick: (category: string) => void;
  onRegionClick: (region: string) => void;
  activeCategory: string;
  activeRegion: string;
}

export const MarketCharts: React.FC<MarketChartsProps> = ({
  charts, transactions, isLoading, error,
  onCategoryClick, onRegionClick, onDrilldown,
  activeCategory, activeRegion,
}) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return <div className="grid grid-cols-1 md:grid-cols-2 gap-8"><div className="chart-spacious-medium" /><div className="chart-spacious-medium" /></div>;

  if (error) {
    return (
      <div className="gold-card chart-spacious chart-spacious-medium border-red-950 text-center text-red-400 flex items-center justify-center">
        <div>
          <p className="font-semibold mb-1">Failed to load market data</p>
          <p className="text-xs text-[#7E786F]">{error}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <ChartSkeleton height="chart-spacious-medium" />
        <ChartSkeleton height="chart-spacious-medium" />
      </div>
    );
  }

  const categoryData = charts?.salesByCategory || [];
  const regionData = charts?.salesByRegion || [];

  const handleCategoryBarClick = (data: any) => {
    if (!data) return;
    const cat = data.category;
    onCategoryClick(activeCategory === cat ? '' : cat);
    const matchedTxs = transactions.filter(t => t.category === cat);
    const totalVal = categoryData.reduce((s, c) => s + c.value, 0);
    onDrilldown({ type: 'category', label: cat, value: data.value, total: totalVal, transactions: matchedTxs });
  };

  const handleRegionBarClick = (data: any) => {
    if (!data) return;
    const reg = data.region;
    onRegionClick(activeRegion === reg ? '' : reg);
    const matchedTxs = transactions.filter(t => t.region === reg);
    const totalVal = regionData.reduce((s, r) => s + r.value, 0);
    onDrilldown({ type: 'region', label: reg, value: data.value, total: totalVal, transactions: matchedTxs });
  };

  const getCategoryInsight = () => {
    if (categoryData.length === 0) return '';
    const sorted = [...categoryData].sort((a, b) => b.value - a.value);
    return `Leader: ${sorted[0].category} (${formatFullCurrency(sorted[0].value)}) · Lowest: ${sorted[sorted.length - 1].category}`;
  };

  const getRegionInsight = () => {
    if (regionData.length === 0) return '';
    const sorted = [...regionData].sort((a, b) => b.value - a.value);
    return `Strongest: ${sorted[0].region} (${formatFullCurrency(sorted[0].value)}) · Weakest: ${sorted[sorted.length - 1].region}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Category Performance */}
      <div className="gold-card chart-spacious chart-spacious-medium flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-5">
            <div className="flex items-center gap-2.5">
              <BarChart3 size={16} className="text-[#C6A96B]" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#F5F1E8]">Category Performance</h3>
            </div>
            {activeCategory && <span className="active-filter-badge">{activeCategory} ✕</span>}
          </div>
          <div className="h-[320px] w-full">
            {categoryData.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-[#7E786F]">
                <HelpCircle size={24} className="mb-2 opacity-40" /><p className="text-xs">No category data</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="catGoldZ3" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C6A96B" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#C6A96B" stopOpacity={0.2} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(198,169,107,0.03)" vertical={false} />
                  <XAxis dataKey="category" stroke="#7E786F" fontSize={10} tickLine={false} axisLine={false} dy={8} />
                  <YAxis stroke="#7E786F" fontSize={10} tickLine={false} axisLine={false} tickFormatter={formatCurrency} dx={-5} />
                  <Tooltip content={<CustomCurrencyTooltip />} />
                  <Bar dataKey="value" fill="url(#catGoldZ3)" radius={[3, 3, 0, 0]} cursor="pointer" onClick={handleCategoryBarClick} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
        <div className="border-t border-white/5 pt-3 mt-3 flex items-center gap-2 text-[11px] text-[#B8B2A8] font-semibold">
          <AlertCircle size={13} className="text-[#C6A96B] flex-shrink-0" />
          <span className="truncate">{categoryData.length === 0 ? 'N/A' : getCategoryInsight()}</span>
        </div>
      </div>

      {/* Regional Performance */}
      <div className="gold-card chart-spacious chart-spacious-medium flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-5">
            <div className="flex items-center gap-2.5">
              <Compass size={16} className="text-[#C6A96B]" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#F5F1E8]">Regional Performance</h3>
            </div>
            {activeRegion && <span className="active-filter-badge">{activeRegion} ✕</span>}
          </div>
          <div className="h-[320px] w-full">
            {regionData.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-[#7E786F]">
                <HelpCircle size={24} className="mb-2 opacity-40" /><p className="text-xs">No region data</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={regionData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="regGoldZ3" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#A88B4A" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#A88B4A" stopOpacity={0.2} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(198,169,107,0.03)" vertical={false} />
                  <XAxis dataKey="region" stroke="#7E786F" fontSize={10} tickLine={false} axisLine={false} dy={8} />
                  <YAxis stroke="#7E786F" fontSize={10} tickLine={false} axisLine={false} tickFormatter={formatCurrency} dx={-5} />
                  <Tooltip content={<CustomCurrencyTooltip />} />
                  <Bar dataKey="value" fill="url(#regGoldZ3)" radius={[3, 3, 0, 0]} cursor="pointer" onClick={handleRegionBarClick} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
        <div className="border-t border-white/5 pt-3 mt-3 flex items-center gap-2 text-[11px] text-[#B8B2A8] font-semibold">
          <AlertCircle size={13} className="text-[#C6A96B] flex-shrink-0" />
          <span className="truncate">{regionData.length === 0 ? 'N/A' : getRegionInsight()}</span>
        </div>
      </div>
    </div>
  );
};

/* ============================================
   3. FULFILLMENT CHART (Zone 4 — Operations)
   ============================================ */

interface FulfillmentChartProps extends ChartInteractionProps {
  onStatusClick: (status: string) => void;
  activeStatus: string;
}

const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div className="bg-[#141414] border border-[#C6A96B]/15 rounded-lg p-4 shadow-2xl">
        <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: d.color }}>{d.name}</p>
        <p className="text-sm font-bold text-[#F5F1E8]">{formatNumber(d.value)} Orders ({d.percent.toFixed(1)}%)</p>
        <p className="text-[10px] text-[#B8B2A8] mt-1.5">Click to filter by status</p>
      </div>
    );
  }
  return null;
};

export const FulfillmentChart: React.FC<FulfillmentChartProps> = ({
  charts, transactions, isLoading, error,
  onStatusClick, onDrilldown, activeStatus,
}) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return <div className="chart-spacious-medium"></div>;

  if (error) {
    return (
      <div className="gold-card chart-spacious border-red-950 text-center text-red-400 flex items-center justify-center min-h-[360px]">
        <div>
          <p className="font-semibold mb-1">Failed to load fulfillment data</p>
          <p className="text-xs text-[#7E786F]">{error}</p>
        </div>
      </div>
    );
  }

  if (isLoading) return <ChartSkeleton height="min-h-[360px]" />;

  const statusData = charts?.orderStatusDistribution || [];
  const pieData = statusData.map(item => ({
    name: item.status, value: item.count, color: GOLD_PALETTE[item.status] || '#7E786F',
  }));
  const totalCount = pieData.reduce((s, i) => s + i.value, 0);
  const formattedPieData = pieData.map(i => ({
    ...i, percent: totalCount > 0 ? (i.value / totalCount) * 100 : 0,
  }));

  const completedCount = statusData.find(i => i.status === 'Completed')?.count || 0;
  const pendingCount = statusData.find(i => i.status === 'Pending')?.count || 0;
  const cancelledCount = statusData.find(i => i.status === 'Cancelled')?.count || 0;
  const completionRate = totalCount > 0 ? ((completedCount / totalCount) * 100).toFixed(1) : '0';
  const pendingRate = totalCount > 0 ? ((pendingCount / totalCount) * 100).toFixed(1) : '0';
  const cancellationRate = totalCount > 0 ? ((cancelledCount / totalCount) * 100).toFixed(1) : '0';

  const handleStatusClick = (data: any) => {
    if (!data) return;
    const st = data.name;
    onStatusClick(activeStatus === st ? '' : st);
    const matchedTxs = transactions.filter(t => t.status === st);
    onDrilldown({ type: 'status', label: st, value: data.value, total: totalCount, transactions: matchedTxs });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Pie Chart */}
      <div className="gold-card chart-spacious flex flex-col justify-between min-h-[360px]">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-5">
            <div className="flex items-center gap-2.5">
              <PieIcon size={16} className="text-[#C6A96B]" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#F5F1E8]">Order Status</h3>
            </div>
            {activeStatus && <span className="active-filter-badge">{activeStatus} ✕</span>}
          </div>
          <div className="h-[220px] w-full relative">
            {formattedPieData.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-[#7E786F]">
                <HelpCircle size={24} className="mb-2 opacity-40" /><p className="text-xs">No status data</p>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip content={<CustomPieTooltip />} />
                    <Pie data={formattedPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={3} dataKey="value" cursor="pointer" onClick={handleStatusClick}>
                      {formattedPieData.map((entry, i) => (
                        <Cell key={`cell-${i}`} fill={entry.color} opacity={activeStatus && activeStatus !== entry.name ? 0.25 : 1} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[8px] text-[#7E786F] uppercase font-bold tracking-wider">Total</span>
                  <span className="text-lg font-extrabold text-[#F5F1E8] mt-0.5">{formatNumber(totalCount)}</span>
                </div>
              </>
            )}
          </div>
        </div>
        {/* Legend */}
        <div className="flex justify-center gap-5 pt-3 border-t border-white/5 mt-3">
          {formattedPieData.map((item, i) => (
            <button key={i} onClick={() => handleStatusClick(item)} className="flex items-center gap-2 text-[10px] font-bold cursor-pointer hover:opacity-80 transition">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-[#B8B2A8]">{item.name}</span>
              <span className="text-[#F5F1E8]">{formatNumber(item.value)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Fulfillment Insights Panel */}
      <div className="gold-card chart-spacious flex flex-col justify-between min-h-[360px]">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-5">
            <div className="flex items-center gap-2.5">
              <ShieldCheck size={16} className="text-[#C6A96B]" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#F5F1E8]">Fulfillment Insights</h3>
            </div>
          </div>

          <div className="flex flex-col gap-5">
            {/* Completion Rate */}
            <div className="p-4 rounded-lg bg-[#111111] border border-white/5">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-[#C6A96B]" />
                  <span className="text-[10px] font-bold text-[#7E786F] uppercase tracking-wider">Completion Rate</span>
                </div>
                <span className="text-lg font-extrabold text-[#C6A96B]">{completionRate}%</span>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-[#C6A96B] rounded-full transition-all duration-500" style={{ width: `${completionRate}%` }} />
              </div>
              <p className="text-[10px] text-[#B8B2A8] mt-2">{formatNumber(completedCount)} of {formatNumber(totalCount)} orders fulfilled</p>
            </div>

            {/* Pending Rate */}
            <div className="p-4 rounded-lg bg-[#111111] border border-white/5">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-[#A88B4A]" />
                  <span className="text-[10px] font-bold text-[#7E786F] uppercase tracking-wider">Pending Rate</span>
                </div>
                <span className="text-lg font-extrabold text-[#A88B4A]">{pendingRate}%</span>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-[#A88B4A] rounded-full transition-all duration-500" style={{ width: `${pendingRate}%` }} />
              </div>
              <p className="text-[10px] text-[#B8B2A8] mt-2">{formatNumber(pendingCount)} orders awaiting fulfillment</p>
            </div>

            {/* Cancellation Pressure */}
            <div className="p-4 rounded-lg bg-[#111111] border border-white/5">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <XCircle size={14} className="text-[#7E786F]" />
                  <span className="text-[10px] font-bold text-[#7E786F] uppercase tracking-wider">Cancellation Pressure</span>
                </div>
                <span className="text-lg font-extrabold text-[#7E786F]">{cancellationRate}%</span>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-[#7E786F] rounded-full transition-all duration-500" style={{ width: `${cancellationRate}%` }} />
              </div>
              <p className="text-[10px] text-[#B8B2A8] mt-2">{formatNumber(cancelledCount)} orders cancelled</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ============================================
   LEGACY WRAPPER (backward compatibility)
   ============================================ */

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

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = (props) => {
  return (
    <div className="space-y-8">
      <RevenueChart charts={props.charts} transactions={props.transactions} isLoading={props.isLoading} error={props.error} onDateFocus={props.onDateFocus} onDrilldown={props.onDrilldown} />
      <MarketCharts charts={props.charts} transactions={props.transactions} isLoading={props.isLoading} error={props.error} onCategoryClick={props.onCategoryClick} onRegionClick={props.onRegionClick} onDrilldown={props.onDrilldown} activeCategory={props.activeCategory} activeRegion={props.activeRegion} />
      <FulfillmentChart charts={props.charts} transactions={props.transactions} isLoading={props.isLoading} error={props.error} onStatusClick={props.onStatusClick} onDrilldown={props.onDrilldown} activeStatus={props.activeStatus} />
    </div>
  );
};
