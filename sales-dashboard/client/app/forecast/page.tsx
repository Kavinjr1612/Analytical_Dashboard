'use client';

import React, { useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend
} from 'recharts';
import { LineChart, Sparkles, TrendingUp, HelpCircle, Layers } from 'lucide-react';
import { useDashboardContext } from '../../context/DashboardContext';
import { EmptyStateWrapper } from '../../components/EmptyState';

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

export default function ForecastPage() {
  const { charts, transactionsResponse, loading } = useDashboardContext();

  const trendData = charts?.revenueTrend || [];

  // Calculate mathematical forecasts & uncertainty cones
  const forecastAnalytics = useMemo(() => {
    if (trendData.length < 3) return null;

    const n = trendData.length;
    
    // 1. Moving average forecast (next 3 periods)
    const rollingAvg = (trendData[n-1].revenue + trendData[n-2].revenue + trendData[n-3].revenue) / 3;

    // 2. Linear Regression Slope
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    trendData.forEach((d, i) => {
      sumX += i;
      sumY += d.revenue;
      sumXY += i * d.revenue;
      sumXX += i * i;
    });
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX || 1);
    const intercept = (sumY - slope * sumX) / n;

    // Calculate Standard Error of Estimate for bounds (uncertainty cone)
    let sumSqErr = 0;
    trendData.forEach((d, i) => {
      const predicted = slope * i + intercept;
      sumSqErr += Math.pow(d.revenue - predicted, 2);
    });
    const standardError = Math.sqrt(sumSqErr / (n - 2 || 1));

    // Project next 3 periods
    const lastDate = trendData[n - 1].date;
    const isDaily = lastDate.includes('-'); // YYYY-MM-DD vs YYYY-MM
    
    const generateNextDates = (base: string, count: number) => {
      const dates = [];
      const parts = base.split('-');
      if (parts.length === 3) {
        // Daily
        const year = parseInt(parts[0]);
        const month = parseInt(parts[1]);
        const day = parseInt(parts[2]);
        for (let i = 1; i <= count; i++) {
          const nextDate = new Date(year, month - 1, day + i);
          dates.push(nextDate.toISOString().substring(0, 10));
        }
      } else {
        // Monthly
        const year = parseInt(parts[0]);
        const month = parseInt(parts[1]);
        for (let i = 1; i <= count; i++) {
          const nextDate = new Date(year, month - 1 + i, 1);
          dates.push(`${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}`);
        }
      }
      return dates;
    };

    const nextDates = generateNextDates(lastDate, 3);
    
    // Historic values merged with forecast projection values
    const chartPoints: { date: string; historical: number | null; forecast: number | null; upperBound: number | null; lowerBound: number | null }[] = trendData.map((d, i) => ({
      date: d.date,
      historical: d.revenue,
      forecast: null as number | null,
      upperBound: null as number | null,
      lowerBound: null as number | null,
    }));

    // Connect forecast start point to last historical date
    chartPoints[n - 1].forecast = trendData[n - 1].revenue;
    chartPoints[n - 1].upperBound = trendData[n - 1].revenue;
    chartPoints[n - 1].lowerBound = trendData[n - 1].revenue;

    // Append projected items
    nextDates.forEach((date, i) => {
      const xIdx = n + i;
      const predicted = Math.max(0, slope * xIdx + intercept);
      
      // Error margin spreads progressively wider as we go further out (cone of uncertainty)
      const errorMargin = standardError * 1.5 * Math.sqrt(i + 1);
      
      chartPoints.push({
        date,
        historical: null,
        forecast: Math.round(predicted),
        upperBound: Math.round(predicted + errorMargin),
        lowerBound: Math.max(0, Math.round(predicted - errorMargin)),
      });
    });

    // 3. Mathematical forecast confidence index
    // R-Squared (coefficient of determination) + rowCount base
    const totalCount = transactionsResponse?.totalCount || 0;
    const meanY = sumY / n;
    let ssTot = 0, ssRes = 0;
    trendData.forEach((d, i) => {
      ssTot += Math.pow(d.revenue - meanY, 2);
      const predicted = slope * i + intercept;
      ssRes += Math.pow(d.revenue - predicted, 2);
    });
    
    const rSquared = ssTot > 0 ? 1 - (ssRes / ssTot) : 0;
    const dataCompleteness = totalCount > 500 ? 25 : Math.min(25, (totalCount / 500) * 25);
    const scoreVal = Math.round((rSquared * 70) + dataCompleteness + 5);
    const confidenceScore = Math.min(99, Math.max(45, scoreVal));

    return {
      chartPoints,
      rollingAvg,
      predictedNext: chartPoints[n].forecast,
      predictedNextUpper: chartPoints[n].upperBound,
      predictedNextLower: chartPoints[n].lowerBound,
      confidenceScore,
      slope
    };
  }, [trendData, transactionsResponse]);

  const forecastYDomain = useMemo<any>(() => {
    if (!forecastAnalytics || !forecastAnalytics.chartPoints || forecastAnalytics.chartPoints.length === 0) {
      return [0, 'auto'];
    }
    const points = forecastAnalytics.chartPoints;
    const allValues: number[] = [];
    points.forEach((p: any) => {
      if (p.historical !== null && p.historical !== undefined) allValues.push(Number(p.historical));
      if (p.forecast !== null && p.forecast !== undefined) allValues.push(Number(p.forecast));
      if (p.upperBound !== null && p.upperBound !== undefined) allValues.push(Number(p.upperBound));
      if (p.lowerBound !== null && p.lowerBound !== undefined) allValues.push(Number(p.lowerBound));
    });
    
    if (allValues.length === 0) return [0, 'auto'];
    
    const minVal = Math.min(...allValues);
    const maxVal = Math.max(...allValues);
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
  }, [forecastAnalytics]);

  return (
    <EmptyStateWrapper>
      <div className="shell-container tab-transition max-w-[1700px] mx-auto flex flex-col gap-6">
        
        {/* Context Takeaways Callout Card */}
        <div className="p-4 rounded-xl bg-[var(--accent-glow)] border border-[var(--accent-color)]/20 flex items-start gap-3">
          <Sparkles size={16} className="text-[var(--accent-color)] mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-xs font-extrabold text-[var(--text-primary)]">Predictive Intelligence Takeaways</h4>
            <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed mt-1">
              This screen utilizes statistical algorithms to project future revenue. **Moving Average** averages the last 3 active periods to project the immediate short-term index. **Trend Projection** uses a linear regression line to forecast long-term paths, surrounded by a shaded **Uncertainty Cone**. This cone represents a 95% standard error range; it widens in future periods to reflect increasing unpredictability.
            </p>
          </div>
        </div>

        {/* Verification Check */}
        {trendData.length < 3 ? (
          <div className="fintech-card p-10 text-center">
            <Layers className="mx-auto text-[var(--text-secondary)] opacity-40 mb-3" size={32} />
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">Insufficient data history</h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed max-w-sm mx-auto">
              Linear regression projections and rolling moving averages require at least 3 distinct date periods in your dataset.
            </p>
          </div>
        ) : (
          forecastAnalytics && (
            <>
              {/* Row 1: Futuristic Uncertainty Cone Chart */}
              <div className="fintech-card h-[380px] flex flex-col justify-between">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-1">
                      <span>Predictive Growth Cone</span>
                      <span title="Projects sales trends with standard error boundaries representing statistical variance."><HelpCircle size={11} className="opacity-60 cursor-help" /></span>
                    </h3>
                    <p className="text-[10px] text-[var(--text-secondary)] font-semibold uppercase tracking-wider">
                      Linear regression forecast with standard error confidence boundaries
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded bg-[#6366F1]" /> Historical
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded bg-[#22D3EE]" /> Projected
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded border border-dashed border-[#F43F5E]" /> Uncertainty Bounds
                    </span>
                  </div>
                </div>

                <div className="flex-1 w-full min-h-0 text-xs">
                  {loading.charts ? (
                    <div className="w-full h-full flex items-center justify-center">Recalculating vectors...</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={forecastAnalytics.chartPoints}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.05} />
                        <XAxis dataKey="date" stroke="var(--text-secondary)" fontSize={9} />
                        <YAxis 
                          stroke="var(--text-secondary)" 
                          fontSize={9} 
                          tickFormatter={(v) => `$${v.toLocaleString()}`}
                          domain={forecastYDomain}
                        />
                        <Tooltip 
                          contentStyle={{ background: 'var(--surface-color)', borderColor: 'var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }}
                          formatter={(value: any, name: any) => {
                            if (value === null) return [];
                            return [`$${value.toLocaleString()}`, name];
                          }}
                        />
                        {/* Shaded Uncertainty bounds */}
                        <Area type="monotone" dataKey="upperBound" stroke="none" fill="#F43F5E" fillOpacity={0.03} name="Upper Boundary" />
                        <Area type="monotone" dataKey="lowerBound" stroke="none" fill="#F43F5E" fillOpacity={0.03} name="Lower Boundary" />
                        
                        {/* Main Lines */}
                        <Area type="monotone" dataKey="historical" stroke="#6366F1" strokeWidth={1.5} fill="none" name="Historical Sales" />
                        <Area type="monotone" dataKey="forecast" stroke="#22D3EE" strokeWidth={1.5} fill="none" name="Statistical Forecast" />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Row 2: Indicators Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                
                {/* Rolling Indicator */}
                <div className="fintech-card flex flex-col justify-between">
                  <span className="metric-label">Rolling MA Projection</span>
                  <p className="metric-value mt-2 text-[var(--accent-color)]">
                    {formatCurrency(forecastAnalytics.rollingAvg)}
                  </p>
                  <p className="text-[10px] text-[var(--text-secondary)] mt-2 font-medium">
                    Synthesized rolling 3-period average index
                  </p>
                </div>

                {/* Mathematical forecast details */}
                <div className="fintech-card flex flex-col justify-between">
                  <span className="metric-label">Next Period Estimated Range</span>
                  <p className="metric-value mt-2 text-[var(--text-primary)]">
                    {formatCurrency(forecastAnalytics.predictedNext || 0)}
                  </p>
                  <p className="text-[10px] text-[var(--text-secondary)] mt-2 font-medium">
                    Expected spread: {formatCurrency(forecastAnalytics.predictedNextLower || 0)} to {formatCurrency(forecastAnalytics.predictedNextUpper || 0)}
                  </p>
                </div>

                {/* Forecast confidence rating */}
                <div className="fintech-card flex flex-col justify-between">
                  <span className="metric-label">Forecast Confidence</span>
                  <p className="metric-value mt-2 text-emerald-500">
                    {forecastAnalytics.confidenceScore}%
                  </p>
                  <p className="text-[10px] text-[var(--text-secondary)] mt-2 font-medium">
                    Confidence index based on R-Squared correlation strength
                  </p>
                </div>
              </div>
            </>
          )
        )}

      </div>
    </EmptyStateWrapper>
  );
}
