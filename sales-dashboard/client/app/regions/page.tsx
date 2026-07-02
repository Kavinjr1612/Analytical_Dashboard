'use client';

import React, { useMemo } from 'react';
import { 
  BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { ShieldCheck, MapPin, AlertTriangle, TrendingUp, TrendingDown, HelpCircle } from 'lucide-react';
import { useDashboardContext } from '../../context/DashboardContext';
import { EmptyStateWrapper } from '../../components/EmptyState';

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

export default function RegionsPage() {
  const { charts, transactionsResponse, loading, setRegionFilter } = useDashboardContext();
  const currentTransactions = transactionsResponse?.transactions || [];

  const regionData = charts?.salesByRegion || [];
  const totalRegionalSales = regionData.reduce((sum, r) => sum + r.value, 0);

  // 1. Calculate Regional Growth Velocity Index
  // Compare revenue in the first half of dates vs the second half of dates per region
  const regionalVelocity = useMemo(() => {
    if (!currentTransactions || currentTransactions.length < 4) return [];
    
    // Sort transactions by date
    const sortedTx = [...currentTransactions].sort((a,b) => a.transactionDate.localeCompare(b.transactionDate));
    const midIndex = Math.floor(sortedTx.length / 2);
    
    const firstHalf: Record<string, number> = {};
    const secondHalf: Record<string, number> = {};
    
    sortedTx.slice(0, midIndex).forEach(t => {
      firstHalf[t.region] = (firstHalf[t.region] || 0) + Number(t.amount);
    });
    sortedTx.slice(midIndex).forEach(t => {
      secondHalf[t.region] = (secondHalf[t.region] || 0) + Number(t.amount);
    });
    
    return regionData.map(r => {
      const firstVal = firstHalf[r.region] || 0;
      const secondVal = secondHalf[r.region] || 0;
      let velocityPct = 0;
      if (firstVal > 0) {
        velocityPct = ((secondVal - firstVal) / firstVal) * 100;
      }
      
      return {
        region: r.region,
        value: r.value,
        firstVal,
        secondVal,
        velocity: velocityPct,
        status: velocityPct >= 0 ? 'Accelerating' : 'Decelerating'
      };
    }).sort((a,b) => b.velocity - a.velocity);
  }, [currentTransactions, regionData]);

  // 2. Weakness Detection Feed
  const weakRegions = useMemo(() => {
    return regionalVelocity
      .filter(rv => rv.velocity < 0 || rv.value < (totalRegionalSales / (regionData.length || 1)) * 0.7)
      .map(rv => {
        let reason = '';
        if (rv.velocity < 0) {
          reason = `Negative momentum detected. Sales decelerated by ${Math.abs(rv.velocity).toFixed(1)}% period-over-period.`;
        } else {
          reason = `Underperforming regional volume. Revenue sits ${((1 - (rv.value / (totalRegionalSales / (regionData.length || 1)))) * 100).toFixed(0)}% below target average.`;
        }
        return {
          region: rv.region,
          reason,
          value: rv.value
        };
      });
  }, [regionalVelocity, totalRegionalSales, regionData.length]);

  const colorsList = ['#22D3EE', '#6366F1', '#10B981', '#F59E0B', '#F43F5E'];

  return (
    <EmptyStateWrapper>
      <div className="shell-container tab-transition max-w-[1700px] mx-auto flex flex-col gap-6">
        
        {/* Context Takeaways Callout Card */}
        <div className="p-4 rounded-xl bg-[var(--accent-glow)] border border-[var(--accent-color)]/20 flex items-start gap-3">
          <MapPin size={16} className="text-[var(--accent-color)] mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-xs font-semibold text-[var(--text-primary)]">Geographical Intelligence Takeaways</h4>
            <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed mt-1">
              This screen tracks sales metrics sorted by region. **Growth Velocity** index measures sales momentum by comparing the second half of dates to the first half. A positive percentage represents sales acceleration, while a negative percentage flags market cooling. The **Risk Weakness Feed** alerts you to operating zones that have decelerating growth or whose revenue sits at least 30% below target averages.
            </p>
          </div>
        </div>

        {/* Row 1: Regional Comparison Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
          
          {/* Left: Bar comparison (col-span-7) */}
          <div className="xl:col-span-7 fintech-card h-[360px] flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-1">
                <span>Regional Revenue Volume</span>
                <span title="Bar rankings showing total gross revenue generated in each active region."><HelpCircle size={11} className="opacity-60 cursor-help" /></span>
              </h3>
              <p className="text-[10px] text-[var(--text-secondary)] font-semibold uppercase tracking-wider">
                Sales rankings by geographical operating divisions
              </p>
            </div>
            
            <div className="flex-1 w-full min-h-0 mt-4 text-xs">
              {regionData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-[var(--text-secondary)]">No regional data</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={regionData}>
                    <XAxis dataKey="region" stroke="var(--text-secondary)" fontSize={9} />
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
                    <Bar dataKey="value" fill="var(--accent-color)" radius={[4, 4, 0, 0]} onClick={(data: any) => data && setRegionFilter(data.region)}>
                      {regionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colorsList[index % colorsList.length]} cursor="pointer" />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Right: Radar representation for variance (col-span-5) */}
          <div className="xl:col-span-5 fintech-card h-[360px] flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-1">
                <span>Geographical Distribution</span>
                <span title="Radar spreads showing variance and concentrations of territory revenue."><HelpCircle size={11} className="opacity-60 cursor-help" /></span>
              </h3>
              <p className="text-[10px] text-[var(--text-secondary)] font-semibold uppercase tracking-wider">
                Radar spread visualizing regional concentration
              </p>
            </div>

            <div className="flex-1 w-full min-h-0 mt-4 text-xs flex items-center justify-center">
              {regionData.length < 3 ? (
                <div className="text-xs text-[var(--text-secondary)] italic">Radar requires at least 3 regions.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={regionData}>
                    <PolarGrid stroke="var(--border-color)" opacity={0.1} />
                    <PolarAngleAxis dataKey="region" stroke="var(--text-secondary)" fontSize={9} />
                    <PolarRadiusAxis stroke="var(--text-secondary)" fontSize={8} />
                    <Radar name="Revenue" dataKey="value" stroke="var(--accent-color)" fill="var(--accent-color)" fillOpacity={0.08} />
                  </RadarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* Row 2: Velocity Index & Weakness Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Growth velocity index (col-span-7) */}
          <div className="lg:col-span-7 fintech-card min-h-[300px] flex flex-col justify-between">
            <div>
              <h4 className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
                Regional Growth Velocity
              </h4>
              <p className="text-[9px] text-[var(--text-secondary)] italic">Calculated Period-over-Period acceleration percentages</p>
            </div>

            <div className="flex-1 mt-4 space-y-2.5">
              {regionalVelocity.length === 0 ? (
                <div className="py-6 text-center text-xs text-[var(--text-secondary)]">No acceleration metadata</div>
              ) : (
                regionalVelocity.map((rv, index) => (
                  <div key={rv.region} className="flex justify-between items-center text-xs p-3 rounded-lg bg-[var(--bg-color)] border border-[var(--border-color)]">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[var(--accent-glow)] flex items-center justify-center text-[var(--accent-color)] font-bold text-[10px]">
                        {index + 1}
                      </span>
                      <span className="font-extrabold text-[var(--text-primary)] cursor-pointer hover:underline" onClick={() => setRegionFilter(rv.region)}>
                        {rv.region} Region
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <span className="text-[var(--text-secondary)]">{formatCurrency(rv.value)}</span>
                      <span className={`font-extrabold flex items-center gap-0.5 text-xs ${rv.velocity >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {rv.velocity >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                        {rv.velocity.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Geographical Weakness Feeds (col-span-5) */}
          <div className="lg:col-span-5 fintech-card min-h-[300px] flex flex-col justify-between">
            <div>
              <h4 className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
                Risk Weakness Feed
              </h4>
              <p className="text-[9px] text-[var(--text-secondary)] italic">Flags geographic zones below benchmarks</p>
            </div>

            <div className="flex-1 mt-4 space-y-2.5 overflow-y-auto max-h-[220px] pr-1 custom-scrollbar">
              {weakRegions.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-emerald-500 font-semibold gap-1">
                  <ShieldCheck size={14} /> All regions performing above target benchmarks.
                </div>
              ) : (
                weakRegions.map((wr, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10 hover:border-amber-500/25 transition flex gap-2">
                    <AlertTriangle className="text-amber-500 flex-shrink-0" size={14} />
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-extrabold text-[var(--text-primary)] uppercase tracking-wide">
                        {wr.region} operations alert
                      </span>
                      <p className="text-[10.5px] text-[var(--text-secondary)] leading-normal mt-0.5">
                        {wr.reason}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </EmptyStateWrapper>
  );
}
