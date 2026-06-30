'use client';

import React, { useState } from 'react';
import { useDashboardContext } from '../../context/DashboardContext';
import { MarketCharts } from '../../components/AnalyticsCharts';
import { DrilldownDrawer, DrilldownData } from '../../components/DrilldownDrawer';
import { ShieldCheck, Table, BarChart3, HelpCircle } from 'lucide-react';

export default function MarketsPage() {
  const {
    filters, charts, transactionsResponse, loading, errors,
    setCategoryFilter, setRegionFilter
  } = useDashboardContext();

  const [drilldownData, setDrilldownData] = useState<DrilldownData | null>(null);
  const currentTransactions = transactionsResponse?.transactions || [];

  const categoryData = charts?.salesByCategory || [];
  const regionData = charts?.salesByRegion || [];
  const totalSalesVal = categoryData.reduce((s, c) => s + c.value, 0);

  // Herfindahl-Hirschman Index (HHI) calculation
  // HHI = sum of squared market shares (as percentages)
  // Highly concentrated: HHI > 2500, Moderate: 1500-2500, Diversified: < 1500
  const getHHI = () => {
    if (categoryData.length === 0 || totalSalesVal === 0) return { val: 0, status: 'N/A', color: 'text-[#64748b]' };
    let sumSquares = 0;
    categoryData.forEach(c => {
      const share = (c.value / totalSalesVal) * 100;
      sumSquares += share * share;
    });
    const hhi = Math.round(sumSquares);
    let status = 'DIVERSIFIED';
    let color = 'text-emerald-500';
    if (hhi > 2500) {
      status = 'CONCENTRATED';
      color = 'text-[#f59e0b]';
    } else if (hhi > 1500) {
      status = 'MODERATE';
      color = 'text-[#3b82f6]';
    }
    return { val: hhi, status, color };
  };

  const hhi = getHHI();

  return (
    <div className="dashboard-content flex-1 flex flex-col tab-transition">
      {/* ═══════════════════════════════════════════
          ZONE 3: MARKET DOMINANCE (Split Layout)
          ═══════════════════════════════════════════ */}
      <section id="zone-markets" className="dashboard-zone flex-1 flex flex-col justify-center min-h-[calc(100vh-140px)]" style={{ paddingTop: '20px', paddingBottom: '20px' }}>
        <div className="zone-inner shell-container flex-1 flex flex-col justify-between gap-5">
          
          {/* Split Column Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch flex-1">
            {/* Left Column (62%): Category Bars + Region Bars + Share Pie */}
            <div className="xl:col-span-8 flex flex-col justify-center">
              <MarketCharts
                charts={charts}
                transactions={currentTransactions}
                isLoading={loading.charts}
                error={errors.charts}
                onCategoryClick={setCategoryFilter}
                onRegionClick={setRegionFilter}
                onDrilldown={setDrilldownData}
                activeCategory={filters.category || ''}
                activeRegion={filters.region || ''}
              />
            </div>

            {/* Right Column (38%): Share Matrices & HHI Index */}
            <div className="xl:col-span-4 flex flex-col gap-4 justify-between">
              {/* Market Share Concentration (HHI) */}
              <div className="gold-card p-4.5 bg-[#121b2e] h-[110px] flex flex-col justify-between">
                <div className="flex justify-between items-center text-[9px] font-bold text-[#64748b] uppercase tracking-wider">
                  <span>Market Concentration (HHI Index)</span>
                  <BarChart3 size={12} className="text-[#3b82f6]" />
                </div>
                <div className="flex items-baseline gap-2.5 mt-2">
                  <span className="text-xl font-extrabold text-[#f8fafc] tracking-tight">{hhi.val}</span>
                  <span className={`text-[9px] font-extrabold uppercase tracking-wider ${hhi.color}`}>
                    {hhi.status}
                  </span>
                </div>
                <span className="text-[9px] text-[#64748b] mt-1">Calculates portfolio revenue diversification</span>
              </div>

              {/* Category Contribution Table */}
              <div className="gold-card p-4.5 bg-[#121b2e] flex-1 flex flex-col justify-between min-h-[280px]">
                <div>
                  <div className="flex items-center gap-2 pb-2.5 border-b border-white/5 mb-3">
                    <Table size={13} className="text-[#3b82f6]" />
                    <span className="text-[10px] font-bold text-[#64748b] tracking-wider uppercase">Category Dominance shares</span>
                  </div>
                  <div className="space-y-2">
                    {loading.charts ? (
                      <div className="animate-pulse space-y-2">
                        <div className="h-6 bg-white/5 rounded"></div>
                        <div className="h-6 bg-white/5 rounded"></div>
                      </div>
                    ) : categoryData.length === 0 ? (
                      <div className="text-center text-xs text-[#64748b] py-8">No categories available</div>
                    ) : (
                      categoryData.slice(0, 4).map((c, idx) => {
                        const pct = totalSalesVal > 0 ? (c.value / totalSalesVal) * 100 : 0;
                        return (
                          <div key={idx} className="flex justify-between items-center text-[10px] p-2 rounded bg-[#0b0f19] border border-white/2">
                            <span className="text-[#f8fafc] font-bold">{c.category}</span>
                            <div className="flex items-center gap-3">
                              <span className="text-[#64748b]">{pct.toFixed(1)}% share</span>
                              <span className="text-[#3b82f6] font-extrabold">${c.value.toLocaleString()}</span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
                <div className="text-[9px] text-[#64748b] pt-2 border-t border-white/5 mt-3 flex items-center justify-between">
                  <span>Sector velocity tracking online</span>
                  <span className="text-emerald-500 font-bold flex items-center gap-0.5"><ShieldCheck size={11} /> SECURE</span>
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
