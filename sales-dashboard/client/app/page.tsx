'use client';

import React from 'react';
import { useDashboardContext } from '../context/DashboardContext';
import { SummaryCards } from '../components/SummaryCards';
import { TopPerformersPanel } from '../components/TopPerformersPanel';
import { Activity, ShieldCheck, DollarSign, Award } from 'lucide-react';

export default function Home() {
  const {
    summary, charts, transactionsResponse,
    loading, errors
  } = useDashboardContext();

  const currentTransactions = transactionsResponse?.transactions || [];

  // Generate dynamic executive insights based on summary data
  const generateNarrative = () => {
    if (!summary) return 'Loading executive intelligence snapshot...';
    
    const rev = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(summary.totalRevenue);
    const aov = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(summary.averageOrderValue);
    
    return `Executive Terminal confirms total consolidated revenue at ${rev} across ${formatNumber(summary.totalOrders)} recorded orders, holding a stable Average Ticket (AOV) of ${aov}. Market dominance remains led by ${summary.topSellingCategory} under the category index, while the ${summary.bestPerformingRegion} region is established as the peak regional operations node. All SLA health thresholds reside within expected performance envelopes.`;
  };

  const formatNumber = (val: number) => new Intl.NumberFormat('en-US').format(val);

  return (
    <div className="dashboard-content flex-1 flex flex-col tab-transition">
      {/* ═══════════════════════════════════════════
          ZONE 1: SPLIT ARCHITECTURE OVERVIEW COCKPIT
          ═══════════════════════════════════════════ */}
      <section id="zone-overview" className="dashboard-zone flex-1 flex flex-col justify-center min-h-[calc(100vh-140px)]" style={{ paddingTop: '20px', paddingBottom: '20px' }}>
        <div className="zone-inner shell-container flex-1 flex flex-col justify-between gap-5">
          
          {/* Split Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch flex-1">
            {/* Left Column (58%): KPIs and Command Center */}
            <div className="lg:col-span-7 flex flex-col justify-between gap-5">
              <SummaryCards
                summary={summary}
                isLoading={loading.summary}
                error={errors.summary}
              />
              <div className="flex-1 flex flex-col justify-end">
                <TopPerformersPanel
                  summary={summary}
                  charts={charts}
                  transactions={currentTransactions}
                  isLoading={loading.summary || loading.transactions}
                />
              </div>
            </div>

            {/* Right Column (42%): Executive Summary Narrative & Quick Activity Logs */}
            <div className="lg:col-span-5 flex flex-col gap-5 justify-between">
              {/* Dynamic Narrative Card */}
              <div className="gold-card p-5 bg-[#121b2e] flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 pb-2.5 border-b border-white/5 mb-3.5">
                    <Award size={14} className="text-[#3b82f6]" />
                    <span className="text-[10px] font-bold text-[#64748b] tracking-wider uppercase">Executive Summary Narrative</span>
                  </div>
                  {loading.summary ? (
                    <div className="animate-pulse space-y-3">
                      <div className="h-3 w-full bg-white/5 rounded"></div>
                      <div className="h-3 w-full bg-white/5 rounded"></div>
                      <div className="h-3 w-2/3 bg-white/5 rounded"></div>
                    </div>
                  ) : (
                    <p className="text-xs text-[#94a3b8] leading-relaxed font-medium">
                      {generateNarrative()}
                    </p>
                  )}
                </div>
                <div className="mt-4 pt-3.5 border-t border-white/5 flex items-center justify-between text-[10px] text-[#64748b]">
                  <span>System: SECURE KERNEL</span>
                  <span className="text-emerald-500 font-bold flex items-center gap-1">
                    <ShieldCheck size={12} /> ONLINE
                  </span>
                </div>
              </div>

              {/* Real-time Order Stream Logs */}
              <div className="gold-card p-5 bg-[#121b2e] h-[210px] flex flex-col">
                <div className="flex items-center justify-between pb-2.5 border-b border-white/5 mb-3">
                  <div className="flex items-center gap-2">
                    <Activity size={14} className="text-[#06b6d4]" />
                    <span className="text-[10px] font-bold text-[#64748b] tracking-wider uppercase">Live Transaction Stream</span>
                  </div>
                  <span className="text-[8px] font-bold text-[#64748b] bg-white/5 px-1.5 py-0.5 rounded uppercase">Latest Logs</span>
                </div>
                <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                  {loading.transactions ? (
                    <div className="animate-pulse space-y-2">
                      <div className="h-8 bg-white/5 rounded"></div>
                      <div className="h-8 bg-white/5 rounded"></div>
                    </div>
                  ) : currentTransactions.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-xs text-[#64748b]">No live streams</div>
                  ) : (
                    currentTransactions.slice(0, 3).map((t, idx) => (
                      <div key={idx} className="flex justify-between items-center text-[10.5px] p-2 rounded bg-[#0b0f19] border border-white/2 hover:border-white/5 transition">
                        <div className="flex items-center gap-2">
                          <span className="text-[#f8fafc] font-bold truncate max-w-[120px]">{t.customerName}</span>
                          <span className="text-[#64748b] text-[9px] uppercase tracking-wide">({t.region})</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[#94a3b8] truncate max-w-[100px]">{t.productName}</span>
                          <span className="text-[#3b82f6] font-extrabold">${Number(t.amount).toFixed(0)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
