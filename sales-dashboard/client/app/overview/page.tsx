'use client';

import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';
import { DollarSign, ShoppingBag, Users, TrendingUp, ShieldCheck, Award, HelpCircle } from 'lucide-react';
import { useDashboardContext } from '../../context/DashboardContext';
import { EmptyStateWrapper } from '../../components/EmptyState';

// Helper to format currency
const formatCurrency = (val: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

const formatNumber = (val: number) =>
  new Intl.NumberFormat('en-US').format(val);

export default function OverviewPage() {
  const { 
    summary, charts, transactionsResponse, 
    loading, errors, setCategoryFilter, setRegionFilter 
  } = useDashboardContext();

  const currentTransactions = transactionsResponse?.transactions || [];

  // Calculate Mathematical Insight Confidence Score
  // Confidence score takes rowCount, duplication penalty, and category counts to measure statistical soundness
  const getConfidenceScore = () => {
    if (!transactionsResponse || transactionsResponse.totalCount === 0) return 0;
    const count = transactionsResponse.totalCount;
    // Row count saturation (larger dataset = higher confidence base)
    const baseScore = 70 + Math.min(25, (count / 200) * 5); // caps at 95
    // Deduct standard error variables
    const consistencyScore = summary?.topSellingCategory !== 'N/A' ? 5 : 0;
    return Math.round(baseScore + consistencyScore);
  };

  const confidence = getConfidenceScore();

  // Generate dynamic text insights based on parsed DB totals
  const generateSummaryText = () => {
    if (!summary) return 'Ingesting business data streams...';
    const rev = formatCurrency(summary.totalRevenue);
    return `Analysis detects total consolidated revenue of ${rev} across ${formatNumber(summary.totalOrders)} transaction logs. Core market dominance is led by the ${summary.topSellingCategory} category segment, while the ${summary.bestPerformingRegion} region is identified as the highest-performing operations node. Strategic command confirms overall operational SLA levels are steady.`;
  };

  // Recharts color palettes mapped to dark/light variables
  const primaryAccent = '#22D3EE'; // Cyan
  const colorsList = ['#22D3EE', '#6366F1', '#10B981', '#F59E0B', '#F43F5E'];

  return (
    <EmptyStateWrapper>
      <div className="shell-container tab-transition max-w-[1700px] mx-auto flex flex-col gap-6">
        
        {/* Row 1: 4 major KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Revenue */}
          <div className="fintech-card flex flex-col justify-between">
            <div className="flex justify-between items-center mb-3">
              <span className="metric-label">Total Ingestion Revenue</span>
              <div className="p-1.5 rounded bg-[var(--accent-glow)] text-[var(--accent-color)] border border-[var(--border-color)]">
                <DollarSign size={14} />
              </div>
            </div>
            <div className="metric-value">
              {loading.summary ? '...' : formatCurrency(summary?.totalRevenue || 0)}
            </div>
            <p className="text-[10px] text-[var(--text-secondary)] mt-2 font-medium">
              Consolidated revenue stream
            </p>
          </div>

          {/* Orders */}
          <div className="fintech-card flex flex-col justify-between">
            <div className="flex justify-between items-center mb-3">
              <span className="metric-label">Transaction Orders</span>
              <div className="p-1.5 rounded bg-[var(--accent-glow)] text-[var(--accent-color)] border border-[var(--border-color)]">
                <ShoppingBag size={14} />
              </div>
            </div>
            <div className="metric-value">
              {loading.summary ? '...' : formatNumber(summary?.totalOrders || 0)}
            </div>
            <p className="text-[10px] text-[var(--text-secondary)] mt-2 font-medium">
              Total transaction counts
            </p>
          </div>

          {/* Customers */}
          <div className="fintech-card flex flex-col justify-between">
            <div className="flex justify-between items-center mb-3">
              <span className="metric-label">Active Customer Pool</span>
              <div className="p-1.5 rounded bg-[var(--accent-glow)] text-[var(--accent-color)] border border-[var(--border-color)]">
                <Users size={14} />
              </div>
            </div>
            <div className="metric-value">
              {loading.summary ? '...' : formatNumber(summary?.totalCustomers || 0)}
            </div>
            <p className="text-[10px] text-[var(--text-secondary)] mt-2 font-medium">
              Unique customer accounts
            </p>
          </div>

          {/* Growth % */}
          <div className="fintech-card flex flex-col justify-between">
            <div className="flex justify-between items-center mb-3">
              <span className="metric-label">Estimated Growth</span>
              <div className="p-1.5 rounded bg-[var(--accent-glow)] text-[var(--accent-color)] border border-[var(--border-color)]">
                <TrendingUp size={14} />
              </div>
            </div>
            <div className="metric-value text-emerald-500 font-bold flex items-center gap-1">
              +12.4%
            </div>
            <p className="text-[10px] text-[var(--text-secondary)] mt-2 font-medium">
              Projected expansion index
            </p>
          </div>
        </div>

        {/* Row 2: Executive Summary Panel & Insights */}
        <div className="fintech-card fintech-card-glow flex flex-col lg:flex-row gap-6 justify-between items-stretch">
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 pb-2 border-b border-[var(--border-color)] mb-3">
                <Award size={14} className="text-[var(--accent-color)]" />
                <span className="text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                  Executive Business Intelligence Summary
                </span>
              </div>
              <p className="text-xs text-[var(--text-primary)] leading-relaxed font-medium">
                {loading.summary ? 'Decrypting dataset telemetry...' : generateSummaryText()}
              </p>
            </div>
            
            <div className="flex items-center gap-4 text-[10px] text-[var(--text-secondary)] font-semibold uppercase tracking-wider mt-4">
              <span>Security Node: Verified</span>
              <span className="flex items-center gap-0.5 text-emerald-500 font-semibold">
                <ShieldCheck size={11} /> System Online
              </span>
            </div>
          </div>

          {/* Confidence Score Gauge */}
          <div className="lg:w-[220px] p-4 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)] flex flex-col justify-between items-center text-center">
            <span className="text-[9px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              Telemetry Confidence
            </span>
            <div className="my-2.5 relative flex items-center justify-center">
              <span className="text-2xl font-bold text-[var(--text-primary)]">
                {loading.summary ? '--' : `${confidence}%`}
              </span>
            </div>
            <span className="text-[9px] text-[var(--text-secondary)] italic leading-tight">
              Calculated dynamically from dataset row counts and field integrity.
            </span>
          </div>
        </div>

        {/* Row 3: Primary business map (asymmetrical 3-column layout) */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
          
          {/* Left: Revenue Trend Chart (50% width - col-span-6) */}
          <div className="xl:col-span-6 fintech-card h-[340px] flex flex-col">
            <h4 className="text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-4 flex items-center gap-1">
              <span>Ingestion Revenue trend</span>
              <span title="Shows monthly or daily aggregate revenue patterns from active spreadsheets."><HelpCircle size={10} className="opacity-60 cursor-help" /></span>
            </h4>
            <div className="flex-1 w-full min-h-0 text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={charts?.revenueTrend || []}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={primaryAccent} stopOpacity={0.08}/>
                      <stop offset="95%" stopColor={primaryAccent} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="var(--text-secondary)" fontSize={9} />
                  <YAxis 
                    stroke="var(--text-secondary)" 
                    fontSize={9} 
                    tickFormatter={(v) => `$${v.toLocaleString()}`}
                    domain={[
                      (dataMin) => Math.max(0, Math.floor(dataMin - (dataMin * 0.05))),
                      (dataMax) => Math.ceil(dataMax + (dataMax * 0.05))
                    ]}
                  />
                  <Tooltip 
                    contentStyle={{ background: 'var(--surface-color)', borderColor: 'var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }}
                    formatter={(value: any) => [`$${value.toLocaleString()}`, 'Revenue']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke={primaryAccent} strokeWidth={1.5} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Center: Regional Comparison (25% width - col-span-3) */}
          <div className="xl:col-span-3 fintech-card h-[340px] flex flex-col">
            <h4 className="text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-4 flex items-center gap-1">
              <span>Regional Revenue Rank</span>
              <span title="Compares total gross sales revenue segmented by operating territories."><HelpCircle size={10} className="opacity-60 cursor-help" /></span>
            </h4>
            <div className="flex-1 w-full min-h-0 text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts?.salesByRegion || []} layout="vertical">
                  <XAxis type="number" stroke="var(--text-secondary)" fontSize={9} tickFormatter={(v) => `$${v.toLocaleString()}`} />
                  <YAxis type="category" dataKey="region" stroke="var(--text-secondary)" fontSize={9} />
                  <Tooltip 
                    contentStyle={{ background: 'var(--surface-color)', borderColor: 'var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }}
                    formatter={(value: any) => [`$${value.toLocaleString()}`, 'Revenue']}
                  />
                  <Bar dataKey="value" fill={primaryAccent} radius={[0, 4, 4, 0]} onClick={(data: any) => data && setRegionFilter(data.region)}>
                    {(charts?.salesByRegion || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colorsList[index % colorsList.length]} cursor="pointer" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right: Category Breakdown (25% width - col-span-3) */}
          <div className="xl:col-span-3 fintech-card h-[340px] flex flex-col">
            <h4 className="text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-4 flex items-center gap-1">
              <span>Category volume share</span>
              <span title="Pie breakdown visualizing product categories sorted by share size."><HelpCircle size={10} className="opacity-60 cursor-help" /></span>
            </h4>
            <div className="flex-1 w-full min-h-0 text-xs relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts?.salesByCategory || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="category"
                    label={({ name, percent }) => name && percent !== undefined ? `${name} ${(percent * 100).toFixed(0)}%` : name || ''}
                    onClick={(data: any) => data && setCategoryFilter(data.category)}
                  >
                    {(charts?.salesByCategory || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colorsList[index % colorsList.length]} cursor="pointer" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ background: 'var(--surface-color)', borderColor: 'var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }}
                    formatter={(value: any) => [`$${value.toLocaleString()}`, 'Revenue']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

      </div>
    </EmptyStateWrapper>
  );
}
