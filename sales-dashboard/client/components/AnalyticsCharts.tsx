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
  Legend
} from 'recharts';
import { BarChart3, TrendingUp, Compass, PieChart as PieIcon, HelpCircle } from 'lucide-react';
import { DashboardCharts } from '../types';

interface AnalyticsChartsProps {
  charts: DashboardCharts | null;
  isLoading: boolean;
  error: string | null;
}

const STATUS_COLORS: Record<string, string> = {
  Completed: '#10b981', // emerald-500
  Pending: '#f59e0b',   // amber-500
  Cancelled: '#ef4444'   // red-500
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
      maximumFractionDigits: 2
    }).format(val);
  };

  const formatNumber = (val: number) => {
    return new Intl.NumberFormat('en-US').format(val);
  };

  // Custom tooltips for charting
  const CustomCurrencyTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card-bg border border-white/10 rounded-lg p-3 shadow-xl backdrop-blur-md">
          <p className="text-xs font-semibold text-text-muted mb-1">{label}</p>
          <p className="text-sm font-bold text-white">
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
        <div className="bg-card-bg border border-white/10 rounded-lg p-3 shadow-xl backdrop-blur-md">
          <p className="text-xs font-semibold text-white mb-1" style={{ color: data.color }}>
            {data.name}
          </p>
          <p className="text-sm font-bold text-white">
            {formatNumber(data.value)} Orders ({data.percent.toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  if (!mounted) {
    return <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 min-h-[700px]"></div>;
  }

  if (error) {
    return (
      <div className="glass-panel p-8 mb-6 border-danger/30 text-center text-danger">
        <p className="font-semibold mb-1">Failed to load analytics charts</p>
        <p className="text-xs text-text-muted">{error}</p>
      </div>
    );
  }

  // Pre-process Donut Chart data
  const pieData = charts?.orderStatusDistribution.map(item => ({
    name: item.status,
    value: item.count,
    color: STATUS_COLORS[item.status] || '#9ca3af'
  })) || [];

  const totalStatusCount = pieData.reduce((sum, item) => sum + item.value, 0);
  const formattedPieData = pieData.map(item => ({
    ...item,
    percent: totalStatusCount > 0 ? (item.value / totalStatusCount) * 100 : 0
  }));

  // Skeletons
  const ChartSkeleton = () => (
    <div className="glass-panel p-6 animate-pulse flex flex-col justify-between h-[360px]">
      <div className="flex items-center justify-between mb-4">
        <div className="h-4 w-1/3 bg-white/10 rounded"></div>
        <div className="h-4 w-4 bg-white/10 rounded-full"></div>
      </div>
      <div className="flex-1 flex items-end gap-3 px-2">
        <div className="h-1/3 w-full bg-white/5 rounded-t"></div>
        <div className="h-2/3 w-full bg-white/5 rounded-t"></div>
        <div className="h-1/2 w-full bg-white/5 rounded-t"></div>
        <div className="h-3/4 w-full bg-white/5 rounded-t"></div>
        <div className="h-2/5 w-full bg-white/5 rounded-t"></div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {/* 1. Revenue Trend Line Chart */}
      <div className="glass-panel p-4 md:p-6 flex flex-col h-[380px]">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-accent-blue" />
            <h3 className="text-sm font-semibold text-white">Revenue Trend</h3>
          </div>
          <span className="text-xs text-text-muted font-medium">Over Time</span>
        </div>
        <div className="flex-1 min-h-0 w-full">
          {isTrendEmpty ? (
            <div className="h-full flex flex-col items-center justify-center text-text-muted">
              <HelpCircle size={24} className="mb-2 opacity-50" />
              <p className="text-xs">No trend data available for this range</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts?.revenueTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#9ca3af" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="#9ca3af" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={formatCurrency} 
                />
                <Tooltip content={<CustomCurrencyTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3b82f6" 
                  strokeWidth={2} 
                  fillOpacity={1} 
                  fill="url(#trendGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 2. Sales by Category Bar Chart */}
      <div className="glass-panel p-4 md:p-6 flex flex-col h-[380px]">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
          <div className="flex items-center gap-2">
            <BarChart3 size={16} className="text-accent-purple" />
            <h3 className="text-sm font-semibold text-white">Sales by Category</h3>
          </div>
          <span className="text-xs text-text-muted font-medium">Revenue</span>
        </div>
        <div className="flex-1 min-h-0 w-full">
          {isCategoryEmpty ? (
            <div className="h-full flex flex-col items-center justify-center text-text-muted">
              <HelpCircle size={24} className="mb-2 opacity-50" />
              <p className="text-xs">No category data matching search filters</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.salesByCategory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="categoryGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.2} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="category" 
                  stroke="#9ca3af" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="#9ca3af" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={formatCurrency} 
                />
                <Tooltip content={<CustomCurrencyTooltip />} />
                <Bar 
                  dataKey="value" 
                  fill="url(#categoryGradient)" 
                  radius={[4, 4, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 3. Sales by Region Bar Chart */}
      <div className="glass-panel p-4 md:p-6 flex flex-col h-[380px]">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Compass size={16} className="text-accent-cyan" />
            <h3 className="text-sm font-semibold text-white">Sales by Region</h3>
          </div>
          <span className="text-xs text-text-muted font-medium">Revenue</span>
        </div>
        <div className="flex-1 min-h-0 w-full">
          {isRegionEmpty ? (
            <div className="h-full flex flex-col items-center justify-center text-text-muted">
              <HelpCircle size={24} className="mb-2 opacity-50" />
              <p className="text-xs">No region data matching search filters</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.salesByRegion} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="regionGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.2} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="region" 
                  stroke="#9ca3af" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="#9ca3af" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={formatCurrency} 
                />
                <Tooltip content={<CustomCurrencyTooltip />} />
                <Bar 
                  dataKey="value" 
                  fill="url(#regionGradient)" 
                  radius={[4, 4, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 4. Order Status Pie/Donut Chart */}
      <div className="glass-panel p-4 md:p-6 flex flex-col h-[380px]">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
          <div className="flex items-center gap-2">
            <PieIcon size={16} className="text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">Order Status Distribution</h3>
          </div>
          <span className="text-xs text-text-muted font-medium">Orders Count</span>
        </div>
        <div className="flex-1 min-h-0 w-full flex flex-col sm:flex-row items-center justify-center gap-2">
          {isStatusEmpty ? (
            <div className="h-full flex flex-col items-center justify-center text-text-muted">
              <HelpCircle size={24} className="mb-2 opacity-50" />
              <p className="text-xs">No status distribution available</p>
            </div>
          ) : (
            <>
              <div className="flex-1 w-full h-[220px] sm:h-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip content={<CustomPieTooltip />} />
                    <Pie
                      data={formattedPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {formattedPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                {/* Center count in Donut */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xs text-text-muted uppercase font-semibold">Total Orders</span>
                  <span className="text-lg font-bold text-white mt-0.5">{formatNumber(totalStatusCount)}</span>
                </div>
              </div>
              <div className="flex flex-row sm:flex-col gap-3 justify-center sm:justify-start flex-wrap px-4">
                {formattedPieData.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs">
                    <span 
                      className="w-3 h-3 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: item.color }} 
                    />
                    <span className="text-text-muted font-medium">{item.name}:</span>
                    <span className="text-white font-bold">{formatNumber(item.value)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
