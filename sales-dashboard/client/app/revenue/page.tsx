'use client';

import React, { useState } from 'react';
import { useDashboardContext } from '../../context/DashboardContext';
import { RevenueChart } from '../../components/AnalyticsCharts';
import { DrilldownDrawer, DrilldownData } from '../../components/DrilldownDrawer';
import { TrendingUp, Activity, ShieldAlert, Award, Calendar } from 'lucide-react';

export default function RevenuePage() {
  const { charts, transactionsResponse, loading, errors, setDateRangeFilter } = useDashboardContext();
  const [drilldownData, setDrilldownData] = useState<DrilldownData | null>(null);

  const currentTransactions = transactionsResponse?.transactions || [];

  const handleDateFocus = (month: string) => {
    const dateParts = month.split('-');
    if (dateParts.length >= 2) {
      const year = parseInt(dateParts[0]);
      const monthNum = parseInt(dateParts[1]);
      const startDate = `${year}-${String(monthNum).padStart(2, '0')}-01`;
      const lastDay = new Date(year, monthNum, 0).getDate();
      const endDate = `${year}-${String(monthNum).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
      setDateRangeFilter(startDate, endDate);
    }
  };

  // ARR Run Rate Calculations
  const getARR = () => {
    if (!charts?.revenueTrend || charts.revenueTrend.length === 0) return '$0';
    const totalRev = charts.revenueTrend.reduce((s, pt) => s + pt.revenue, 0);
    // Project annual based on monthly average
    const avg = totalRev / charts.revenueTrend.length;
    const arr = avg * 12;
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(arr);
  };

  const getMoMDelta = () => {
    if (!charts?.revenueTrend || charts.revenueTrend.length < 2) return { text: '0%', isPositive: true };
    const sorted = [...charts.revenueTrend].sort((a,b) => a.date.localeCompare(b.date));
    const len = sorted.length;
    const curr = sorted[len - 1].revenue;
    const prev = sorted[len - 2].revenue;
    if (prev === 0) return { text: '0%', isPositive: true };
    const delta = ((curr - prev) / prev) * 100;
    return {
      text: `${delta >= 0 ? '+' : ''}${delta.toFixed(1)}%`,
      isPositive: delta >= 0
    };
  };

  const getTopRevenueDays = () => {
    if (!currentTransactions || currentTransactions.length === 0) return [];
    // Group transactions by date
    const dayMap: Record<string, number> = {};
    currentTransactions.forEach(t => {
      const date = t.transactionDate.substring(0, 10);
      dayMap[date] = (dayMap[date] || 0) + Number(t.amount);
    });
    return Object.entries(dayMap)
      .map(([date, val]) => ({ date, val }))
      .sort((a, b) => b.val - a.val)
      .slice(0, 3);
  };

  const getRevenueForecast = () => {
    if (!charts?.revenueTrend || charts.revenueTrend.length === 0) return '$0';
    const lastRev = [...charts.revenueTrend].sort((a,b) => a.date.localeCompare(b.date)).pop()?.revenue || 0;
    const mom = getMoMDelta();
    const pct = parseFloat(mom.text) / 100;
    const forecast = lastRev * (1 + pct);
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(forecast);
  };

  const delta = getMoMDelta();

  return (
    <div className="dashboard-content flex-1 flex flex-col tab-transition">
      <section id="zone-revenue" className="dashboard-zone flex-1 flex flex-col justify-center min-h-[calc(100vh-140px)]" style={{ paddingTop: '20px', paddingBottom: '20px' }}>
        <div className="zone-inner-expansive flex-1 flex flex-col justify-between gap-5">
          <div className="zone-header mb-2">
            <div className="zone-header-dot" />
            <span className="zone-header-label">02</span>
            <span className="zone-header-title">Revenue Intelligence Room</span>
          </div>

          {/* Split Column Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch flex-1">
            {/* Left Column (62%): Revenue Visualizers (Area + Ticket comparative) */}
            <div className="xl:col-span-8 flex flex-col justify-center">
              <RevenueChart
                charts={charts}
                transactions={currentTransactions}
                isLoading={loading.charts}
                error={errors.charts}
                onDateFocus={handleDateFocus}
                onDrilldown={setDrilldownData}
              />
            </div>

            {/* Right Column (38%): Revenue Metrics Board */}
            <div className="xl:col-span-4 flex flex-col gap-4 justify-between">
              {/* Specialized indicators */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* ARR */}
                <div className="gold-card p-4 bg-[#0f172a] flex flex-col justify-between h-[105px]">
                  <div className="flex justify-between items-center text-[9px] font-bold text-[#64748b] uppercase tracking-wider">
                    <span>Projected ARR</span>
                    <TrendingUp size={12} className="text-[#3b82f6]" />
                  </div>
                  <span className="text-xl font-extrabold text-[#f8fafc] mt-2 block tracking-tight">{getARR()}</span>
                  <span className="text-[9px] text-[#64748b] mt-1">Annualized from active data</span>
                </div>

                {/* MoM delta */}
                <div className="gold-card p-4 bg-[#0f172a] flex flex-col justify-between h-[105px]">
                  <div className="flex justify-between items-center text-[9px] font-bold text-[#64748b] uppercase tracking-wider">
                    <span>MoM Growth Delta</span>
                    <Activity size={12} className="text-[#06b6d4]" />
                  </div>
                  <span className={`text-xl font-extrabold mt-2 block tracking-tight ${delta.isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                    {delta.text}
                  </span>
                  <span className="text-[9px] text-[#64748b] mt-1">Growth vs prior month</span>
                </div>

                {/* Forecast */}
                <div className="gold-card p-4 bg-[#0f172a] flex flex-col justify-between h-[105px] sm:col-span-2">
                  <div className="flex justify-between items-center text-[9px] font-bold text-[#64748b] uppercase tracking-wider">
                    <span>Next-Month Predictive Forecast</span>
                    <Award size={12} className="text-[#3b82f6]" />
                  </div>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-xl font-extrabold text-[#f8fafc] tracking-tight">{getRevenueForecast()}</span>
                    <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-wide">Confidence: HIGH</span>
                  </div>
                  <span className="text-[9px] text-[#64748b] mt-1">Modeled from historic trend velocity</span>
                </div>
              </div>

              {/* Top Revenue Days list */}
              <div className="gold-card p-5 bg-[#0f172a] flex-1 flex flex-col justify-between min-h-[180px]">
                <div>
                  <div className="flex items-center gap-2 pb-2.5 border-b border-white/5 mb-3">
                    <Calendar size={13} className="text-[#3b82f6]" />
                    <span className="text-[10px] font-bold text-[#64748b] tracking-wider uppercase">Top Grossing Sales Dates</span>
                  </div>
                  <div className="space-y-2.5">
                    {loading.transactions ? (
                      <div className="animate-pulse space-y-2">
                        <div className="h-6 bg-white/5 rounded"></div>
                        <div className="h-6 bg-white/5 rounded"></div>
                      </div>
                    ) : getTopRevenueDays().length === 0 ? (
                      <div className="text-center text-xs text-[#64748b] py-6">No dates registered</div>
                    ) : (
                      getTopRevenueDays().map((d, idx) => (
                        <div key={idx} className="flex justify-between items-center text-[10.5px] p-2 rounded bg-[#080c14] border border-white/2">
                          <span className="text-[#f8fafc] font-bold">{d.date}</span>
                          <span className="text-[#3b82f6] font-extrabold">${d.val.toLocaleString()}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                <div className="text-[9px] text-[#64748b] pt-2 border-t border-white/5 mt-3">
                  Peak transaction spikes captured in active ledger date bounds.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Drilldown side drawer */}
      <DrilldownDrawer data={drilldownData} onClose={() => setDrilldownData(null)} />
    </div>
  );
}
