'use client';

import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceDot, Legend
} from 'recharts';
import { TrendingUp, BarChart3, Compass, PieChart as PieIcon, HelpCircle, AlertCircle, ShieldCheck, Clock, XCircle, Activity, Heart } from 'lucide-react';
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
  Cancelled: '#6B665E',
};

const CustomCurrencyTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0F0F0F] border border-[#C6A96B]/15 rounded-lg p-3 shadow-2xl">
        <p className="text-[10px] font-bold text-[#6B665E] uppercase tracking-wide mb-1">{label}</p>
        {payload.map((item: any, idx: number) => (
          <p key={idx} className="text-xs font-bold text-[#EAE5DA] flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color || '#C6A96B' }} />
            {item.name}: {typeof item.value === 'number' && item.name.includes('AOV') ? formatFullCurrency(item.value) : formatFullCurrency(item.value)}
          </p>
        ))}
        <p className="text-[9px] text-[#6B665E] mt-2">Click to drill down</p>
      </div>
    );
  }
  return null;
};

const ChartSkeleton = ({ height = 'min-h-[400px]' }: { height?: string }) => (
  <div className={`gold-card chart-spacious animate-pulse flex flex-col justify-between ${height}`}>
    <div className="flex justify-between items-center mb-6">
      <div className="h-3 w-1/3 bg-white/5 rounded"></div>
      <div className="h-4 w-4 bg-white/5 rounded-full"></div>
    </div>
    <div className="flex-1 flex items-end gap-4 px-3">
      <div className="h-1/4 w-full bg-white/5 rounded-t"></div>
      <div className="h-2/3 w-full bg-white/5 rounded-t"></div>
      <div className="h-1/2 w-full bg-white/5 rounded-t"></div>
      <div className="h-3/4 w-full bg-white/5 rounded-t"></div>
    </div>
    <div className="h-3 w-3/4 bg-white/5 rounded mt-6"></div>
  </div>
);

/* ============================================
   1. REVENUE WAR ROOM DUAL CHART (Zone 2)
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
      <div className="gold-card chart-spacious chart-spacious-tall border-red-950/20 text-center text-red-400 flex items-center justify-center">
        <div>
          <p className="font-semibold mb-1">Failed to load revenue data</p>
          <p className="text-xs text-[#6B665E]">{error}</p>
        </div>
      </div>
    );
  }

  if (isLoading) return <ChartSkeleton height="chart-spacious-tall" />;

  const trendData = charts?.revenueTrend || [];
  const isEmpty = trendData.length === 0;

  // Calculate AOV per Month dynamically from transactions for Chart 2
  const aovTrendData = trendData.map(pt => {
    const matchedTxs = transactions.filter(t => t.transactionDate.startsWith(pt.date));
    const totalAmt = matchedTxs.reduce((sum, t) => sum + Number(t.amount), 0);
    const aov = matchedTxs.length > 0 ? totalAmt / matchedTxs.length : 0;
    return {
      date: pt.date,
      revenue: pt.revenue,
      aov: Math.round(aov)
    };
  });

  const peakPoint = trendData.length > 0
    ? trendData.reduce((max, p) => p.revenue > max.revenue ? p : max, trendData[0])
    : null;

  const getTrendInsight = () => {
    if (trendData.length === 0) return '';
    const sorted = [...trendData].sort((a, b) => b.revenue - a.revenue);
    const avgMonthly = trendData.reduce((s, p) => s + p.revenue, 0) / trendData.length;
    return `Monthly Peak: ${sorted[0].date} (${formatFullCurrency(sorted[0].revenue)}) · Avg Monthly Revenue: ${formatFullCurrency(avgMonthly)} · Period Total: ${formatFullCurrency(trendData.reduce((s,p)=>s+p.revenue,0))}`;
  };

  const handleClick = (data: any) => {
    if (!data || !data.activePayload) return;
    const point = data.activePayload[0]?.payload;
    if (point) {
      onDateFocus(point.date);
      const matchedTxs = transactions.filter(t => t.transactionDate.startsWith(point.date));
      const totalRev = trendData.reduce((s, p) => s + p.revenue, 0);
      onDrilldown({ type: 'trend', label: point.date, value: point.revenue, total: totalRev, transactions: matchedTxs });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
      {/* Chart 1: Revenue Area Chart */}
      <div className="gold-card chart-spacious lg:col-span-8 flex flex-col justify-between min-h-[460px]">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-5">
            <div className="flex items-center gap-2.5">
              <TrendingUp size={15} className="text-[#C6A96B]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#EAE5DA]">Revenue Growth Trend</h3>
            </div>
            <span className="text-[9px] font-bold text-[#6B665E] tracking-wide uppercase bg-white/5 px-2 py-0.5 rounded">Click point to focus</span>
          </div>
          <div className="h-[340px] w-full">
            {isEmpty ? (
              <div className="h-full flex flex-col items-center justify-center text-[#6B665E]">
                <HelpCircle size={28} className="mb-3 opacity-40" />
                <p className="text-xs">No revenue trend data available</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 15, right: 15, left: -20, bottom: 5 }} onClick={handleClick} style={{ cursor: 'pointer' }}>
                  <defs>
                    <linearGradient id="revGoldGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C6A96B" stopOpacity={0.22} />
                      <stop offset="95%" stopColor="#C6A96B" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(198,169,107,0.02)" vertical={false} />
                  <XAxis dataKey="date" stroke="#6B665E" fontSize={10} tickLine={false} axisLine={false} dy={8} />
                  <YAxis stroke="#6B665E" fontSize={10} tickLine={false} axisLine={false} tickFormatter={formatCurrency} dx={-5} />
                  <Tooltip content={<CustomCurrencyTooltip />} />
                  <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#C6A96B" strokeWidth={2} fillOpacity={1} fill="url(#revGoldGrad)" />
                  {peakPoint && (
                    <ReferenceDot x={peakPoint.date} y={peakPoint.revenue} r={5} fill="#C6A96B" stroke="#070707" strokeWidth={2} className="peak-dot" />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
        <div className="border-t border-white/5 pt-3 mt-4 flex items-center gap-2 text-[10px] text-[#A39E93] font-semibold">
          <AlertCircle size={12} className="text-[#C6A96B] flex-shrink-0" />
          <span className="truncate">{isEmpty ? 'N/A' : getTrendInsight()}</span>
        </div>
      </div>

      {/* Chart 2: Revenue vs AOV (Comparative Bar Chart) */}
      <div className="gold-card chart-spacious lg:col-span-4 flex flex-col justify-between min-h-[460px]">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-5">
            <div className="flex items-center gap-2">
              <Activity size={14} className="text-[#A88B4A]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#EAE5DA]">Revenue vs Ticket Size (AOV)</h3>
            </div>
          </div>
          <div className="h-[340px] w-full">
            {isEmpty ? (
              <div className="h-full flex flex-col items-center justify-center text-[#6B665E]">
                <HelpCircle size={28} className="mb-3 opacity-40" />
                <p className="text-xs">No comparative data</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={aovTrendData} margin={{ top: 15, right: 10, left: -20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="barGoldGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#A88B4A" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#A88B4A" stopOpacity={0.2} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.01)" vertical={false} />
                  <XAxis dataKey="date" stroke="#6B665E" fontSize={9} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="left" stroke="#6B665E" fontSize={9} tickLine={false} axisLine={false} tickFormatter={formatCurrency} />
                  <YAxis yAxisId="right" orientation="right" stroke="#C6A96B" fontSize={9} tickLine={false} axisLine={false} tickFormatter={(v)=>`$${v}`} />
                  <Tooltip content={<CustomCurrencyTooltip />} />
                  <Legend verticalAlign="top" height={36} iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '10px', color: '#A39E93' }} />
                  <Bar yAxisId="left" dataKey="revenue" name="Total Revenue" fill="url(#barGoldGrad)" radius={[2, 2, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="aov" name="Avg Ticket (AOV)" stroke="#C6A96B" strokeWidth={2.5} dot={{ r: 3 }} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
        <div className="text-[10px] text-[#6B665E] border-t border-white/5 pt-3 mt-4">
          Shows alignment between volume spikes and transaction value sizes.
        </div>
      </div>
    </div>
  );
};

/* ============================================
   2. MARKET DOMINANCE THREE-PANEL SYSTEM (Zone 3)
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

  if (!mounted) return <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[400px]"></div>;

  if (error) {
    return (
      <div className="gold-card chart-spacious border-red-950/20 text-center text-red-400 flex items-center justify-center min-h-[400px]">
        <div>
          <p className="font-semibold mb-1">Failed to load market data</p>
          <p className="text-xs text-[#6B665E]">{error}</p>
        </div>
      </div>
    );
  }

  if (isLoading) return <ChartSkeleton height="min-h-[440px]" />;

  const categoryData = charts?.salesByCategory || [];
  const regionData = charts?.salesByRegion || [];
  const totalSalesVal = categoryData.reduce((s, c) => s + c.value, 0);

  const categoryPieData = categoryData.map(c => ({
    name: c.category,
    value: c.value,
    percent: totalSalesVal > 0 ? (c.value / totalSalesVal) * 100 : 0
  }));

  const handleCategoryBarClick = (data: any) => {
    if (!data) return;
    const cat = data.category || data.name;
    onCategoryClick(activeCategory === cat ? '' : cat);
    const matchedTxs = transactions.filter(t => t.category === cat);
    onDrilldown({ type: 'category', label: cat, value: data.value, total: totalSalesVal, transactions: matchedTxs });
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
    return `Lead Category: ${sorted[0].category} (${formatFullCurrency(sorted[0].value)})`;
  };

  const getRegionInsight = () => {
    if (regionData.length === 0) return '';
    const sorted = [...regionData].sort((a, b) => b.value - a.value);
    return `Lead Region: ${sorted[0].region} (${formatFullCurrency(sorted[0].value)})`;
  };

  const CHART_COLORS = ['#C6A96B', '#D9C18A', '#A88B4A', '#806830', '#54441E'];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
      {/* Panel 1: Category Bars */}
      <div className="gold-card chart-spacious xl:col-span-4 flex flex-col justify-between min-h-[440px]">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-5">
            <div className="flex items-center gap-2">
              <BarChart3 size={15} className="text-[#C6A96B]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#EAE5DA]">Category Volumes</h3>
            </div>
            {activeCategory && <span className="active-filter-badge">{activeCategory} ✕</span>}
          </div>
          <div className="h-[300px] w-full">
            {categoryData.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-[#6B665E]">
                <HelpCircle size={24} className="mb-2 opacity-40" /><p className="text-xs">No category data</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                  <defs>
                    <linearGradient id="catBarGoldGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C6A96B" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#C6A96B" stopOpacity={0.2} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(198,169,107,0.02)" vertical={false} />
                  <XAxis dataKey="category" stroke="#6B665E" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#6B665E" fontSize={10} tickLine={false} axisLine={false} tickFormatter={formatCurrency} />
                  <Tooltip content={<CustomCurrencyTooltip />} />
                  <Bar dataKey="value" fill="url(#catBarGoldGrad)" radius={[2, 2, 0, 0]} cursor="pointer" onClick={handleCategoryBarClick} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
        <div className="border-t border-white/5 pt-3 text-[10px] text-[#A39E93] font-semibold flex items-center gap-1.5">
          <AlertCircle size={12} className="text-[#C6A96B]" />
          <span className="truncate">{categoryData.length === 0 ? 'N/A' : getCategoryInsight()}</span>
        </div>
      </div>

      {/* Panel 2: Region Bars */}
      <div className="gold-card chart-spacious xl:col-span-4 flex flex-col justify-between min-h-[440px]">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-5">
            <div className="flex items-center gap-2">
              <Compass size={15} className="text-[#C6A96B]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#EAE5DA]">Regional Volumes</h3>
            </div>
            {activeRegion && <span className="active-filter-badge">{activeRegion} ✕</span>}
          </div>
          <div className="h-[300px] w-full">
            {regionData.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-[#6B665E]">
                <HelpCircle size={24} className="mb-2 opacity-40" /><p className="text-xs">No region data</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={regionData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                  <defs>
                    <linearGradient id="regBarGoldGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#A88B4A" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#A88B4A" stopOpacity={0.2} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(198,169,107,0.02)" vertical={false} />
                  <XAxis dataKey="region" stroke="#6B665E" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#6B665E" fontSize={10} tickLine={false} axisLine={false} tickFormatter={formatCurrency} />
                  <Tooltip content={<CustomCurrencyTooltip />} />
                  <Bar dataKey="value" fill="url(#regBarGoldGrad)" radius={[2, 2, 0, 0]} cursor="pointer" onClick={handleRegionBarClick} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
        <div className="border-t border-white/5 pt-3 text-[10px] text-[#A39E93] font-semibold flex items-center gap-1.5">
          <AlertCircle size={12} className="text-[#C6A96B]" />
          <span className="truncate">{regionData.length === 0 ? 'N/A' : getRegionInsight()}</span>
        </div>
      </div>

      {/* Panel 3: Category Share Pie Chart */}
      <div className="gold-card chart-spacious xl:col-span-4 flex flex-col justify-between min-h-[440px]">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-5">
            <div className="flex items-center gap-2">
              <PieIcon size={15} className="text-[#C6A96B]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#EAE5DA]">Market Share Distribution</h3>
            </div>
          </div>
          <div className="h-[230px] w-full relative flex items-center justify-center">
            {categoryPieData.length === 0 ? (
              <div className="text-[#6B665E] text-xs">No distribution metrics</div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip content={<CustomPieTooltip />} />
                    <Pie data={categoryPieData} cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={2} dataKey="value" nameKey="name" cursor="pointer" onClick={handleCategoryBarClick}>
                      {categoryPieData.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={CHART_COLORS[idx % CHART_COLORS.length]} opacity={activeCategory && activeCategory !== entry.name ? 0.3 : 1} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[8px] text-[#6B665E] font-bold uppercase tracking-wider">Total Sales</span>
                  <span className="text-xs font-extrabold text-[#EAE5DA] mt-0.5">{formatCurrency(totalSalesVal)}</span>
                </div>
              </>
            )}
          </div>
        </div>
        {/* Legend */}
        <div className="border-t border-white/5 pt-3 flex flex-wrap gap-2.5 justify-center">
          {categoryPieData.map((item, idx) => (
            <button key={idx} onClick={() => handleCategoryBarClick(item)} className="flex items-center gap-1.5 text-[9px] font-bold text-[#A39E93] hover:text-[#EAE5DA] transition cursor-pointer">
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }} />
              <span>{item.name}:</span>
              <span className="text-[#EAE5DA]">{item.percent.toFixed(1)}%</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ============================================
   3. FULFILLMENT Operations & SLA Charts (Zone 4)
   ============================================ */

interface FulfillmentChartProps extends ChartInteractionProps {
  onStatusClick: (status: string) => void;
  activeStatus: string;
}

export const FulfillmentChart: React.FC<FulfillmentChartProps> = ({
  charts, transactions, isLoading, error,
  onStatusClick, onDrilldown, activeStatus,
}) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[400px]"></div>;

  if (error) {
    return (
      <div className="gold-card chart-spacious border-red-950/20 text-center text-red-400 flex items-center justify-center min-h-[400px]">
        <div>
          <p className="font-semibold mb-1">Failed to load fulfillment statistics</p>
          <p className="text-xs text-[#6B665E]">{error}</p>
        </div>
      </div>
    );
  }

  if (isLoading) return <ChartSkeleton height="min-h-[400px]" />;

  const statusData = charts?.orderStatusDistribution || [];
  const pieData = statusData.map(item => ({
    name: item.status, value: item.count, color: GOLD_PALETTE[item.status] || '#7E786F',
  }));
  const totalCount = pieData.reduce((s, i) => s + i.value, 0);
  const formattedPieData = pieData.map(i => ({
    ...i, percent: totalCount > 0 ? (i.value / totalCount) * 100 : 0,
  }));

  // Build backlog timeline count (simulated count changes based on status counts in transaction period)
  // Group transactions by date to show leakage/backlog trends
  const dailyDataMap: Record<string, { date: string; pending: number; cancelled: number }> = {};
  transactions.forEach(t => {
    const day = t.transactionDate.substring(5, 10); // MM-DD
    if (!dailyDataMap[day]) {
      dailyDataMap[day] = { date: day, pending: 0, cancelled: 0 };
    }
    if (t.status === 'Pending') dailyDataMap[day].pending += 1;
    if (t.status === 'Cancelled') dailyDataMap[day].cancelled += 1;
  });
  const backlogTimeline = Object.values(dailyDataMap).sort((a,b) => a.date.localeCompare(b.date)).slice(-12);

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
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
      {/* Panel 1: Pie Status */}
      <div className="gold-card chart-spacious xl:col-span-4 flex flex-col justify-between min-h-[420px]">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-5">
            <div className="flex items-center gap-2.5">
              <PieIcon size={15} className="text-[#C6A96B]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#EAE5DA]">Order Health Status</h3>
            </div>
            {activeStatus && <span className="active-filter-badge">{activeStatus} ✕</span>}
          </div>
          <div className="h-[230px] w-full relative flex items-center justify-center">
            {formattedPieData.length === 0 ? (
              <div className="text-[#6B665E] text-xs">No status distribution data</div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip content={<CustomPieTooltip />} />
                    <Pie data={formattedPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={3} dataKey="value" cursor="pointer" onClick={handleStatusClick}>
                      {formattedPieData.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={entry.color} opacity={activeStatus && activeStatus !== entry.name ? 0.25 : 1} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[8px] text-[#6B665E] font-bold uppercase tracking-wider">Volume</span>
                  <span className="text-base font-extrabold text-[#EAE5DA] mt-0.5">{formatNumber(totalCount)}</span>
                </div>
              </>
            )}
          </div>
        </div>
        {/* Legend */}
        <div className="border-t border-white/5 pt-3 flex justify-center gap-4">
          {formattedPieData.map((item, idx) => (
            <button key={idx} onClick={() => handleStatusClick(item)} className="flex items-center gap-1.5 text-[9px] font-bold text-[#A39E93] hover:text-[#EAE5DA] transition cursor-pointer">
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
              <span>{item.name}:</span>
              <span className="text-[#EAE5DA]">{formatNumber(item.value)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Panel 2: Cancellation & Pending Backlog Timeline */}
      <div className="gold-card chart-spacious xl:col-span-4 flex flex-col justify-between min-h-[420px]">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-5">
            <div className="flex items-center gap-2">
              <Activity size={14} className="text-[#A88B4A]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#EAE5DA]">Backlog & Leakage Timeline</h3>
            </div>
          </div>
          <div className="h-[280px] w-full">
            {backlogTimeline.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-[#6B665E]">
                <HelpCircle size={24} className="mb-2 opacity-40" /><p className="text-xs">No backlog trend data</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={backlogTimeline} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.01)" vertical={false} />
                  <XAxis dataKey="date" stroke="#6B665E" fontSize={9} tickLine={false} axisLine={false} />
                  <YAxis stroke="#6B665E" fontSize={9} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Legend verticalAlign="top" height={32} iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '9px', color: '#A39E93' }} />
                  <Line type="monotone" dataKey="pending" name="Pending orders" stroke="#A88B4A" strokeWidth={2} dot={{ r: 2 }} />
                  <Line type="monotone" dataKey="cancelled" name="Cancelled orders" stroke="#6B665E" strokeWidth={1.5} dot={{ r: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
        <div className="text-[10px] text-[#6B665E] border-t border-white/5 pt-3">
          Daily snapshot tracking critical pending queue backlogs vs leakage counts.
        </div>
      </div>

      {/* Panel 3: Fulfillment Insights Card */}
      <div className="gold-card chart-spacious xl:col-span-4 flex flex-col justify-between min-h-[420px]">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-5">
            <div className="flex items-center gap-2">
              <ShieldCheck size={15} className="text-[#C6A96B]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#EAE5DA]">Operational SLA Metrics</h3>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {/* Completion Rate */}
            <div className="p-3.5 rounded-lg bg-[#111111] border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-bold text-[#6B665E] uppercase tracking-wider">Fulfillment Health</span>
                <span className="text-sm font-extrabold text-[#C6A96B]">{completionRate}%</span>
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-[#C6A96B] rounded-full" style={{ width: `${completionRate}%` }} />
              </div>
              <p className="text-[9px] text-[#A39E93] mt-2">{formatNumber(completedCount)} completed / {formatNumber(totalCount)} orders</p>
            </div>

            {/* Pending Rate */}
            <div className="p-3.5 rounded-lg bg-[#111111] border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-bold text-[#6B665E] uppercase tracking-wider">Pending Backlog SLA</span>
                <span className="text-sm font-extrabold text-[#A88B4A]">{pendingRate}%</span>
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-[#A88B4A] rounded-full" style={{ width: `${pendingRate}%` }} />
              </div>
              <p className="text-[9px] text-[#A39E93] mt-2">{formatNumber(pendingCount)} active pending log ticket backlogs</p>
            </div>

            {/* Cancellation Pressure */}
            <div className="p-3.5 rounded-lg bg-[#111111] border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-bold text-[#6B665E] uppercase tracking-wider">Cancellation Leakage</span>
                <span className="text-sm font-extrabold text-red-500/80">{cancellationRate}%</span>
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-red-500/50 rounded-full" style={{ width: `${cancellationRate}%` }} />
              </div>
              <p className="text-[9px] text-[#A39E93] mt-2">{formatNumber(cancelledCount)} orders lost to cancel pipelines</p>
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
