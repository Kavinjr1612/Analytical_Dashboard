'use client';

import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { BarChart3, TrendingUp, Compass, PieChart as PieIcon, HelpCircle, AlertCircle } from 'lucide-react';
import { DashboardCharts } from '../types';

interface AnalyticsChartsProps {
  charts: DashboardCharts | null;
  isLoading: boolean;
  error: string | null;
}

const GOLD_PALETTE: Record<string, string> = {
  Completed: '#C6A96B', // Primary Accent Gold
  Pending: '#A88B4A',   // Secondary Muted Gold
  Cancelled: '#7E786F'  // Muted Charcoal/Grey
};

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  charts,
  isLoading,
  error
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Formatter helpers
  const formatCurrency = (val: number) => {
    if (val >= 1e6) return `$${(val / 1e6).toFixed(1)}M`;
    if (val >= 1e3) return `$${(val / 1e3).toFixed(0)}k`;
    return `$${val}`;
  };

  const formatFullCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  };

  const formatNumber = (val: number) => {
    return new Intl.NumberFormat('en-US').format(val);
  };

  // Custom tooltips in premium dark theme
  const CustomCurrencyTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#141414] border border-[#C6A96B]/15 rounded p-3.5 shadow-2xl">
          <p className="text-[10px] font-bold text-[#7E786F] uppercase tracking-wide mb-1">{label}</p>
          <p className="text-sm font-bold text-[#F5F1E8]">
            {formatFullCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#141414] border border-[#C6A96B]/15 rounded p-3.5 shadow-2xl">
          <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: data.color }}>
            {data.name}
          </p>
          <p className="text-sm font-bold text-[#F5F1E8]">
            {formatNumber(data.value)} Orders ({data.percent.toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  // Dynamic Insight Generators
  const getTrendInsight = () => {
    if (!charts?.revenueTrend || charts.revenueTrend.length === 0) return '';
    const sorted = [...charts.revenueTrend].sort((a, b) => b.revenue - a.revenue);
    const maxPoint = sorted[0];
    const minPoint = sorted[sorted.length - 1];
    return `Spike peak: ${maxPoint.date} (${formatFullCurrency(maxPoint.revenue)}) • Lowest dip: ${minPoint.date} (${formatFullCurrency(minPoint.revenue)})`;
  };

  const getCategoryInsight = () => {
    if (!charts?.salesByCategory || charts.salesByCategory.length === 0) return '';
    const max = charts.salesByCategory[0];
    const min = charts.salesByCategory[charts.salesByCategory.length - 1];
    return `Lead category: ${max.category} (${formatFullCurrency(max.value)}) • Lowest demand: ${min.category} (${formatFullCurrency(min.value)})`;
  };

  const getRegionInsight = () => {
    if (!charts?.salesByRegion || charts.salesByRegion.length === 0) return '';
    const max = charts.salesByRegion[0];
    const min = charts.salesByRegion[charts.salesByRegion.length - 1];
    return `Peak region: ${max.region} (${formatFullCurrency(max.value)}) • Weakest market: ${min.region} (${formatFullCurrency(min.value)})`;
  };

  const getStatusInsight = () => {
    if (!charts?.orderStatusDistribution || charts.orderStatusDistribution.length === 0) return '';
    const total = charts.orderStatusDistribution.reduce((sum, item) => sum + item.count, 0);
    const completed = charts.orderStatusDistribution.find(item => item.status === 'Completed');
    const percent = completed && total > 0 ? ((completed.count / total) * 100).toFixed(1) : '0';
    return `Fulfillment rate: ${percent}% completed orders (${formatNumber(completed?.count || 0)} of ${formatNumber(total)} total)`;
  };

  if (!mounted) {
    return <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[760px]"></div>;
  }

  if (error) {
    return (
      <div className="gold-card p-8 mb-6 border-red-950 text-center text-red-400">
        <p className="font-semibold mb-1">Failed to load analytics charts</p>
        <p className="text-xs text-text-muted">{error}</p>
      </div>
    );
  }

  // Pre-process Donut Chart data
  const pieData = charts?.orderStatusDistribution.map(item => ({
    name: item.status,
    value: item.count,
    color: GOLD_PALETTE[item.status] || '#7E786F'
  })) || [];

  const totalStatusCount = pieData.reduce((sum, item) => sum + item.value, 0);
  const formattedPieData = pieData.map(item => ({
    ...item,
    percent: totalStatusCount > 0 ? (item.value / totalStatusCount) * 100 : 0
  }));

  // Skeletons
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartSkeleton />
        <ChartSkeleton />
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
    );
  }

  const isTrendEmpty = !charts?.revenueTrend || charts.revenueTrend.length === 0;
  const isCategoryEmpty = !charts?.salesByCategory || charts.salesByCategory.length === 0;
  const isRegionEmpty = !charts?.salesByRegion || charts.salesByRegion.length === 0;
  const isStatusEmpty = formattedPieData.length === 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* 1. Revenue Trend Area/Line Chart */}
      <div className="gold-card p-5 flex flex-col h-[380px] justify-between">
        <div>
          <div className="flex items-center justify-between pb-2 border-b border-white/5 mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp size={14} className="text-[#C6A96B]" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#F5F1E8]">Revenue Performance</h3>
            </div>
            <span className="text-[10px] font-bold text-[#7E786F] tracking-wide uppercase">Trend over time</span>
          </div>
          <div className="h-[250px] w-full">
            {isTrendEmpty ? (
              <div className="h-full flex flex-col items-center justify-center text-text-muted">
                <HelpCircle size={24} className="mb-2 opacity-50" />
                <p className="text-xs">No trend data available for this range</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={charts?.revenueTrend} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="trendGradientGold" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C6A96B" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#C6A96B" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(198, 169, 107, 0.03)" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#7E786F" 
                    fontSize={9} 
                    tickLine={false} 
                    axisLine={false} 
                    dy={5}
                  />
                  <YAxis 
                    stroke="#7E786F" 
                    fontSize={9} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={formatCurrency} 
                    dx={-5}
                  />
                  <Tooltip content={<CustomCurrencyTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#C6A96B" 
                    strokeWidth={2} 
                    fillOpacity={1} 
                    fill="url(#trendGradientGold)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Text Insight Footer */}
        <div className="border-t border-white/5 pt-2 mt-2 flex items-center gap-1.5 text-[10px] text-[#B8B2A8] font-semibold">
          <AlertCircle size={12} className="text-[#C6A96B] flex-shrink-0" />
          <span className="truncate">{isTrendEmpty ? 'N/A' : getTrendInsight()}</span>
        </div>
      </div>

      {/* 2. Sales by Category Bar Chart */}
      <div className="gold-card p-5 flex flex-col h-[380px] justify-between">
        <div>
          <div className="flex items-center justify-between pb-2 border-b border-white/5 mb-3">
            <div className="flex items-center gap-2">
              <BarChart3 size={14} className="text-[#C6A96B]" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#F5F1E8]">Sales by Category</h3>
            </div>
            <span className="text-[10px] font-bold text-[#7E786F] tracking-wide uppercase">Revenue splits</span>
          </div>
          <div className="h-[250px] w-full">
            {isCategoryEmpty ? (
              <div className="h-full flex flex-col items-center justify-center text-text-muted">
                <HelpCircle size={24} className="mb-2 opacity-50" />
                <p className="text-xs">No category data matching search filters</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts?.salesByCategory} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="categoryGradientGold" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C6A96B" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#C6A96B" stopOpacity={0.2} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(198, 169, 107, 0.03)" vertical={false} />
                  <XAxis 
                    dataKey="category" 
                    stroke="#7E786F" 
                    fontSize={9} 
                    tickLine={false} 
                    axisLine={false} 
                    dy={5}
                  />
                  <YAxis 
                    stroke="#7E786F" 
                    fontSize={9} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={formatCurrency} 
                    dx={-5}
                  />
                  <Tooltip content={<CustomCurrencyTooltip />} />
                  <Bar 
                    dataKey="value" 
                    fill="url(#categoryGradientGold)" 
                    radius={[2, 2, 0, 0]} 
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Text Insight Footer */}
        <div className="border-t border-white/5 pt-2 mt-2 flex items-center gap-1.5 text-[10px] text-[#B8B2A8] font-semibold">
          <AlertCircle size={12} className="text-[#C6A96B] flex-shrink-0" />
          <span className="truncate">{isCategoryEmpty ? 'N/A' : getCategoryInsight()}</span>
        </div>
      </div>

      {/* 3. Sales by Region Bar Chart */}
      <div className="gold-card p-5 flex flex-col h-[380px] justify-between">
        <div>
          <div className="flex items-center justify-between pb-2 border-b border-white/5 mb-3">
            <div className="flex items-center gap-2">
              <Compass size={14} className="text-[#C6A96B]" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#F5F1E8]">Sales by Region</h3>
            </div>
            <span className="text-[10px] font-bold text-[#7E786F] tracking-wide uppercase">Revenue splits</span>
          </div>
          <div className="h-[250px] w-full">
            {isRegionEmpty ? (
              <div className="h-full flex flex-col items-center justify-center text-text-muted">
                <HelpCircle size={24} className="mb-2 opacity-50" />
                <p className="text-xs">No region data matching search filters</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts?.salesByRegion} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="regionGradientGold" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#A88B4A" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#A88B4A" stopOpacity={0.2} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(198, 169, 107, 0.03)" vertical={false} />
                  <XAxis 
                    dataKey="region" 
                    stroke="#7E786F" 
                    fontSize={9} 
                    tickLine={false} 
                    axisLine={false} 
                    dy={5}
                  />
                  <YAxis 
                    stroke="#7E786F" 
                    fontSize={9} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={formatCurrency} 
                    dx={-5}
                  />
                  <Tooltip content={<CustomCurrencyTooltip />} />
                  <Bar 
                    dataKey="value" 
                    fill="url(#regionGradientGold)" 
                    radius={[2, 2, 0, 0]} 
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Text Insight Footer */}
        <div className="border-t border-white/5 pt-2 mt-2 flex items-center gap-1.5 text-[10px] text-[#B8B2A8] font-semibold">
          <AlertCircle size={12} className="text-[#C6A96B] flex-shrink-0" />
          <span className="truncate">{isRegionEmpty ? 'N/A' : getRegionInsight()}</span>
        </div>
      </div>

      {/* 4. Order Status Pie/Donut Chart */}
      <div className="gold-card p-5 flex flex-col h-[380px] justify-between">
        <div>
          <div className="flex items-center justify-between pb-2 border-b border-white/5 mb-3">
            <div className="flex items-center gap-2">
              <PieIcon size={14} className="text-[#C6A96B]" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#F5F1E8]">Order Status Distribution</h3>
            </div>
            <span className="text-[10px] font-bold text-[#7E786F] tracking-wide uppercase">Order counts</span>
          </div>
          <div className="h-[250px] w-full flex flex-col sm:flex-row items-center justify-center gap-2">
            {isStatusEmpty ? (
              <div className="h-full flex flex-col items-center justify-center text-text-muted">
                <HelpCircle size={24} className="mb-2 opacity-50" />
                <p className="text-xs">No status distribution available</p>
              </div>
            ) : (
              <>
                <div className="flex-1 w-full h-[180px] sm:h-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip content={<CustomPieTooltip />} />
                      <Pie
                        data={formattedPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={75}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {formattedPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center metrics counts */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[8px] text-[#7E786F] uppercase font-bold tracking-wider">Orders</span>
                    <span className="text-base font-extrabold text-[#F5F1E8] mt-0.5">{formatNumber(totalStatusCount)}</span>
                  </div>
                </div>

                {/* Donut Legend */}
                <div className="flex flex-row sm:flex-col gap-2.5 justify-center sm:justify-start flex-wrap px-2">
                  {formattedPieData.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-[10px] font-bold">
                      <span 
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
                        style={{ backgroundColor: item.color }} 
                      />
                      <span className="text-[#B8B2A8]">{item.name}:</span>
                      <span className="text-[#F5F1E8]">{formatNumber(item.value)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Text Insight Footer */}
        <div className="border-t border-white/5 pt-2 mt-2 flex items-center gap-1.5 text-[10px] text-[#B8B2A8] font-semibold">
          <AlertCircle size={12} className="text-[#C6A96B] flex-shrink-0" />
          <span className="truncate">{isStatusEmpty ? 'N/A' : getStatusInsight()}</span>
        </div>
      </div>
    </div>
  );
};
