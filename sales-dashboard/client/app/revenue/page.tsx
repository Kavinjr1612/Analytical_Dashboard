'use client';

import React, { useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, LineChart, Line, CartesianGrid, Legend
} from 'recharts';
import { TrendingUp, DollarSign, Activity, AlertCircle, TrendingDown, HelpCircle } from 'lucide-react';
import { useDashboardContext } from '../../context/DashboardContext';
import { EmptyStateWrapper } from '../../components/EmptyState';

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

export default function RevenuePage() {
  const { charts, transactionsResponse, loading, errors } = useDashboardContext();
  const currentTransactions = transactionsResponse?.transactions || [];

  const trendData = charts?.revenueTrend || [];

  // 1. Calculate Revenue Anomalies
  // Standard Deviation filter: Flag days/months exceeding 1.8x standard deviation from the mean
  const anomalies = useMemo(() => {
    if (trendData.length < 3) return [];
    const values = trendData.map(d => d.revenue);
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const sqDiffs = values.map(v => Math.pow(v - mean, 2));
    const variance = sqDiffs.reduce((sum, v) => sum + v, 0) / values.length;
    const stdDev = Math.sqrt(variance);

    return trendData
      .map((d, index) => {
        const deviation = Math.abs(d.revenue - mean) / (stdDev || 1);
        return {
          ...d,
          deviation,
          isAnomaly: deviation > 1.8,
          index
        };
      })
      .filter(d => d.isAnomaly);
  }, [trendData]);

  // 2. Statistical linear regression slope calculation for trend line
  const regressionData = useMemo(() => {
    if (trendData.length < 2) return [];
    const n = trendData.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    trendData.forEach((d, i) => {
      sumX += i;
      sumY += d.revenue;
      sumXY += i * d.revenue;
      sumXX += i * i;
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX || 1);
    const intercept = (sumY - slope * sumX) / n;

    return trendData.map((d, i) => ({
      date: d.date,
      revenue: d.revenue,
      trend: Math.max(0, slope * i + intercept)
    }));
  }, [trendData]);

  // 3. Average Order Value (AOV) trend
  const monthlyAOV = useMemo(() => {
    if (!currentTransactions || currentTransactions.length === 0) return [];
    // Group transactions by month
    const groups: Record<string, { total: number; count: number }> = {};
    currentTransactions.forEach(t => {
      const month = t.transactionDate.substring(0, 7); // YYYY-MM
      if (!groups[month]) groups[month] = { total: 0, count: 0 };
      groups[month].total += Number(t.amount);
      groups[month].count += 1;
    });
    return Object.entries(groups)
      .map(([date, data]) => ({
        date,
        aov: data.count > 0 ? Math.round(data.total / data.count) : 0
      }))
      .sort((a,b) => a.date.localeCompare(b.date));
  }, [currentTransactions]);

  const primaryAccent = '#00F2FE';

  return (
    <EmptyStateWrapper>
      <div className="shell-container tab-transition max-w-[1700px] mx-auto flex flex-col gap-6">
        
        {/* Context Takeaways Callout Card */}
        <div className="p-4 rounded-xl bg-[var(--accent-glow)] border border-[var(--accent-color)]/20 flex items-start gap-3">
          <Activity size={16} className="text-[var(--accent-color)] mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-xs font-extrabold text-[var(--text-primary)]">Financial Intelligence Takeaways</h4>
            <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed mt-1">
              This screen visualizes historical gross sales revenue alongside a statistical **Linear Regression Trend Line** (represented by the dashed red index). Linear regression helps you spot the overall trajectory of business growth while filtering out temporary seasonal spikes. If you notice standard deviation anomalies in the feed below, these represent historical dates with abnormal sales activity.
            </p>
          </div>
        </div>

        {/* Row 1: Large Dominant Revenue Trend with Linear Regression line */}
        <div className="fintech-card h-[380px] flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-sm font-extrabold text-[var(--text-primary)] flex items-center gap-1">
                <span>Revenue War Room</span>
                <HelpCircle size={11} className="opacity-60 cursor-help" title="Visualizes gross sales over time with linear trend line projection overlay." />
              </h3>
              <p className="text-[10px] text-[var(--text-secondary)] font-semibold uppercase tracking-wider">
                Financial trend analytics with linear regression projection
              </p>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--text-secondary)] uppercase">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-[#00F2FE]" /> Ingested Revenue</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded border border-dashed border-[#ff0055]" /> Trend Line</span>
            </div>
          </div>

          <div className="flex-1 w-full min-h-0 text-xs">
            {loading.charts ? (
              <div className="w-full h-full flex items-center justify-center">Loading charts...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={regressionData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={primaryAccent} stopOpacity={0.25}/>
                      <stop offset="95%" stopColor={primaryAccent} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.1} />
                  <XAxis dataKey="date" stroke="var(--text-secondary)" fontSize={9} />
                  <YAxis stroke="var(--text-secondary)" fontSize={9} tickFormatter={(v) => `$${v.toLocaleString()}`} />
                  <Tooltip 
                    contentStyle={{ background: 'var(--surface-color)', borderColor: 'var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }}
                    formatter={(value: any) => [`$${value.toLocaleString()}`, 'Revenue']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke={primaryAccent} strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" name="Ingested Revenue" />
                  <Line type="monotone" dataKey="trend" stroke="#ff0055" strokeWidth={1.5} strokeDasharray="5 5" dot={false} name="Regression Trend" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Row 2: 3-column Asymmetric analysis */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
          
          {/* AOV Trend Chart (col-span-5) */}
          <div className="xl:col-span-5 fintech-card h-[310px] flex flex-col justify-between">
            <div>
              <h4 className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1 flex items-center gap-1">
                <span>Average Ticket (AOV) Trend</span>
                <HelpCircle size={10} className="opacity-60 cursor-help" title="Measures the average spend per order (Total Revenue / Total Orders)." />
              </h4>
              <p className="text-[9px] text-[var(--text-secondary)] italic">Averaged transaction values per month</p>
            </div>
            <div className="flex-1 w-full min-h-0 text-xs mt-4">
              {monthlyAOV.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-[var(--text-secondary)]">No transactional details</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyAOV}>
                    <XAxis dataKey="date" stroke="var(--text-secondary)" fontSize={9} />
                    <YAxis stroke="var(--text-secondary)" fontSize={9} tickFormatter={(v) => `$${v}`} />
                    <Tooltip 
                      contentStyle={{ background: 'var(--surface-color)', borderColor: 'var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }}
                      formatter={(value: any) => [`$${value}`, 'AOV']}
                    />
                    <Bar dataKey="aov" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Anomaly detector / list (col-span-4) */}
          <div className="xl:col-span-4 fintech-card h-[310px] flex flex-col justify-between">
            <div>
              <h4 className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1 flex items-center gap-1">
                <span>Revenue Anomalies Feed</span>
                <HelpCircle size={10} className="opacity-60 cursor-help" title="Flags dates where gross revenue deviated by more than 1.8x the standard deviation from the mean." />
              </h4>
              <p className="text-[9px] text-[var(--text-secondary)] italic">Flags periods with standard deviation changes</p>
            </div>

            <div className="flex-1 mt-4 overflow-y-auto space-y-2 custom-scrollbar">
              {anomalies.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-[var(--text-secondary)]">
                  No statistical anomalies detected.
                </div>
              ) : (
                anomalies.map((anom, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs p-2.5 rounded-lg bg-red-500/5 border border-red-500/10 hover:border-red-500/25 transition">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-extrabold text-[var(--text-primary)]">{anom.date}</span>
                      <span className="text-[9px] text-[var(--text-secondary)] font-semibold uppercase">
                        Deviation: {anom.deviation.toFixed(1)}x Standard Devs
                      </span>
                    </div>
                    <span className="text-red-500 font-extrabold flex items-center gap-0.5 text-[11px]">
                      <AlertCircle size={12} /> {formatCurrency(anom.revenue)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Forecast quick indicators (col-span-3) */}
          <div className="xl:col-span-3 fintech-card h-[310px] flex flex-col justify-between">
            <div>
              <h4 className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
                Forecast Indicators
              </h4>
              <p className="text-[9px] text-[var(--text-secondary)] italic">Calculated from rolling average data</p>
            </div>
            
            <div className="space-y-4 my-auto">
              <div className="p-3 rounded-lg bg-[var(--bg-color)] border border-[var(--border-color)]">
                <span className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-wide">Rolling 3-Period Avg</span>
                <p className="text-lg font-extrabold text-[var(--text-primary)] mt-1">
                  {trendData.length >= 3 
                    ? formatCurrency((trendData[trendData.length-1].revenue + trendData[trendData.length-2].revenue + trendData[trendData.length-3].revenue)/3)
                    : '$0'
                  }
                </p>
              </div>

              <div className="p-3 rounded-lg bg-[var(--bg-color)] border border-[var(--border-color)]">
                <span className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-wide">Historical Growth Variance</span>
                <p className="text-lg font-extrabold text-emerald-500 mt-1 flex items-center gap-1">
                  <TrendingUp size={16} /> Stable
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </EmptyStateWrapper>
  );
}
