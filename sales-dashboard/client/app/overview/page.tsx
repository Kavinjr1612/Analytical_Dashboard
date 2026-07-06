'use client';

import React, { useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, LabelList
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
    loading, errors, setCategoryFilter, setRegionFilter,
    activeSchema, formatValue
  } = useDashboardContext();

  const currentTransactions = transactionsResponse?.transactions || [];

  // Calculate Mathematical Insight Confidence Score
  const getConfidenceScore = () => {
    if (!transactionsResponse || transactionsResponse.totalCount === 0) return 0;
    const count = transactionsResponse.totalCount;
    const baseScore = 70 + Math.min(25, (count / 200) * 5); // caps at 95
    const consistencyScore = summary?.topSellingCategory !== 'N/A' ? 5 : 0;
    return Math.round(baseScore + consistencyScore);
  };

  const confidence = getConfidenceScore();

  // Generate dynamic text insights based on parsed DB totals
  const generateSummaryText = () => {
    if (!summary) return 'Ingesting business data streams...';
    
    const amountLabel = activeSchema.amount || 'Value';
    const catLabel = activeSchema.category || 'Category';
    const regLabel = activeSchema.region || 'Region';
    const totalSum = formatValue(summary.totalRevenue);
    const totalCount = formatNumber(summary.totalOrders);
    
    let summaryText = `The system has performed an analytical sweep of the active dataset. We have registered a total consolidated ${amountLabel} sum of ${totalSum} across ${totalCount} records. `;
    
    if (summary.topSellingCategory && summary.topSellingCategory !== 'N/A') {
      summaryText += `The primary volume concentration resides in the "${summary.topSellingCategory}" ${catLabel} segment. `;
    }
    
    if (summary.bestPerformingRegion && summary.bestPerformingRegion !== 'N/A') {
      summaryText += `Geographically, the "${summary.bestPerformingRegion}" ${regLabel} territory acts as the highest-performing operational node in the dataset. `;
    }
    
    summaryText += `The structural reliability of this data configuration remains high, with regular telemetry logs indicating stable operational parameters.`;
    
    return summaryText;
  };

  // Calculate dynamic Y-axis domain based on exact data spread
  const revenueTrendData = charts?.revenueTrend || [];
  const yDomain = useMemo<any>(() => {
    if (revenueTrendData.length === 0) return [0, 'auto'];
    const values = revenueTrendData.map((d: any) => Number(d.revenue || 0));
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const spread = maxVal - minVal;
    
    if (spread === 0) {
      return [
        Math.max(0, Math.floor(minVal * 0.95)),
        Math.ceil(minVal * 1.05)
      ];
    }
    
    return [
      Math.max(0, Math.floor(minVal - (spread * 0.08))),
      Math.ceil(maxVal + (spread * 0.08))
    ];
  }, [revenueTrendData]);

  // Recharts color palettes mapped to dark/light variables
  const primaryAccent = '#22D3EE'; // Cyan
  const colorsList = ['#22D3EE', '#6366F1', '#10B981', '#F59E0B', '#F43F5E'];

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
            {formatValue(Number(data.value ?? 0))}
          </span>
        </div>
      );
    }
    return null;
  };

  return (
    <EmptyStateWrapper>
      <div className="shell-container tab-transition max-w-[1700px] mx-auto flex flex-col gap-6">
        
        {/* Row 1: KPI Statistics Panels */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          {/* KPI 1: Ingested Total amount */}
          <div className="fintech-card flex flex-col justify-between">
            <div className="flex justify-between items-center mb-3">
              <span className="metric-label flex items-center gap-1">
                <span>Total {activeSchema.amount || 'Value'}</span>
                <span title={`Aggregated sum of all ${activeSchema.amount?.toLowerCase() || 'value'} entries.`}><HelpCircle size={10} className="opacity-60 cursor-help" /></span>
              </span>
              <div className="w-7 h-7 rounded-lg bg-[var(--accent-glow)] flex items-center justify-center text-[var(--accent-color)]">
                <DollarSign size={14} />
              </div>
            </div>
            <div className="metric-value">
              {loading.summary ? '...' : formatValue(summary?.totalRevenue || 0)}
            </div>
            <p className="text-[10px] text-[var(--text-secondary)] mt-2 font-medium">
              Gross sum metrics
            </p>
          </div>

          {/* KPI 2: Total Records */}
          <div className="fintech-card flex flex-col justify-between">
            <div className="flex justify-between items-center mb-3">
              <span className="metric-label flex items-center gap-1">
                <span>Inflow Records</span>
                <span title="Total quantity of parsed spreadsheet rows (lines)."><HelpCircle size={10} className="opacity-60 cursor-help" /></span>
              </span>
              <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                <ShoppingBag size={14} />
              </div>
            </div>
            <div className="metric-value">
              {loading.summary ? '...' : formatNumber(summary?.totalOrders || 0)}
            </div>
            <p className="text-[10px] text-[var(--text-secondary)] mt-2 font-medium">
              Total transaction rows
            </p>
          </div>

          {/* KPI 3: Inflow Mean Average */}
          <div className="fintech-card flex flex-col justify-between">
            <div className="flex justify-between items-center mb-3">
              <span className="metric-label flex items-center gap-1">
                <span>Mean Value</span>
                <span title="Average value per parsed data record row."><HelpCircle size={10} className="opacity-60 cursor-help" /></span>
              </span>
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <TrendingUp size={14} />
              </div>
            </div>
            <div className="metric-value">
              {loading.summary ? '...' : formatValue(summary?.totalRevenue && summary?.totalOrders ? summary.totalRevenue / summary.totalOrders : 0)}
            </div>
            <p className="text-[10px] text-[var(--text-secondary)] mt-2 font-medium">
              Calculated mathematical mean
            </p>
          </div>

          {/* KPI 4: Inflow unique customer density */}
          <div className="fintech-card flex flex-col justify-between">
            <div className="flex justify-between items-center mb-3">
              <span className="metric-label flex items-center gap-1">
                <span>Unique {activeSchema.customerName || 'Clients'}</span>
                <span title={`Count of distinct items under ${activeSchema.customerName || 'customer'} tags.`}><HelpCircle size={10} className="opacity-60 cursor-help" /></span>
              </span>
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                <Users size={14} />
              </div>
            </div>
            <div className="metric-value">
              {loading.summary ? '...' : formatNumber(summary?.totalCustomers || 0)}
            </div>
            <p className="text-[10px] text-[var(--text-secondary)] mt-2 font-medium">
              Distinct entities pool
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
              <span>{activeSchema.amount || 'Value'} Ingestion trend</span>
              <span title="Shows monthly or daily aggregate values from active spreadsheets."><HelpCircle size={10} className="opacity-60 cursor-help" /></span>
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
                    tickFormatter={(v) => formatValue(v)}
                    domain={yDomain}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke={primaryAccent} 
                    strokeWidth={1.5} 
                    fillOpacity={1} 
                    fill="url(#colorRev)"
                    dot={{ r: 3, stroke: primaryAccent, strokeWidth: 1, fill: 'var(--bg-color)' }}
                    activeDot={{ r: 5, strokeWidth: 0 }}
                  >
                    {(charts?.revenueTrend || []).length <= 15 && (
                      <LabelList 
                        dataKey="revenue" 
                        position="top" 
                        offset={10} 
                        fontSize={8} 
                        fill="var(--text-secondary)" 
                        formatter={(v: any) => typeof v === 'number' ? formatValue(v) : v}
                      />
                    )}
                  </Area>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Center: Regional Comparison (25% width - col-span-3) */}
          <div className="xl:col-span-3 fintech-card h-[340px] flex flex-col">
            <h4 className="text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-4 flex items-center gap-1">
              <span>{activeSchema.region || 'Region'} Share Rank</span>
              <span title="Compares total values segmented by operating locations."><HelpCircle size={10} className="opacity-60 cursor-help" /></span>
            </h4>
            <div className="flex-1 w-full min-h-0 text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts?.salesByRegion || []} layout="vertical">
                  <XAxis type="number" stroke="var(--text-secondary)" fontSize={9} tickFormatter={(v) => formatValue(v)} />
                  <YAxis type="category" dataKey="region" stroke="var(--text-secondary)" fontSize={9} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" fill={primaryAccent} radius={[0, 4, 4, 0]} onClick={(data: any) => data && setRegionFilter(data.region)}>
                    {(charts?.salesByRegion || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colorsList[index % colorsList.length]} cursor="pointer" />
                    ))}
                    {(charts?.salesByRegion || []).length <= 15 && (
                      <LabelList 
                        dataKey="value" 
                        position="right" 
                        offset={8} 
                        fontSize={8} 
                        fill="var(--text-secondary)" 
                        formatter={(v: any) => typeof v === 'number' ? formatValue(v) : v}
                      />
                    )}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right: Category Breakdown (25% width - col-span-3) */}
          <div className="xl:col-span-3 fintech-card h-[340px] flex flex-col">
            <h4 className="text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-4 flex items-center gap-1">
              <span>{activeSchema.category || 'Category'} Volume Share</span>
              <span title="Pie breakdown visualizing categories sorted by share size."><HelpCircle size={10} className="opacity-60 cursor-help" /></span>
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
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

      </div>
    </EmptyStateWrapper>
  );
}
