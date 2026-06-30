'use client';

import React, { useMemo } from 'react';
import { 
  BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Treemap, AreaChart, Area
} from 'recharts';
import { PieChart, Tag, Award, Layers } from 'lucide-react';
import { useDashboardContext } from '../../context/DashboardContext';
import { EmptyStateWrapper } from '../../components/EmptyState';

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

export default function MarketsPage() {
  const { charts, transactionsResponse, loading, setCategoryFilter } = useDashboardContext();
  const currentTransactions = transactionsResponse?.transactions || [];

  const categoryData = charts?.salesByCategory || [];
  const totalCategorySales = categoryData.reduce((sum, c) => sum + c.value, 0);

  // 1. Product Clusters: Identify top 5 selling items dynamically
  const topProducts = useMemo(() => {
    if (!currentTransactions || currentTransactions.length === 0) return [];
    const counts: Record<string, { total: number; count: number; category: string }> = {};
    currentTransactions.forEach(t => {
      if (!counts[t.productName]) {
        counts[t.productName] = { total: 0, count: 0, category: t.category };
      }
      counts[t.productName].total += Number(t.amount);
      counts[t.productName].count += 1;
    });
    return Object.entries(counts)
      .map(([name, data]) => ({
        name,
        category: data.category,
        sales: data.total,
        count: data.count
      }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);
  }, [currentTransactions]);

  // 2. Prepare Treemap Data Structure
  const treemapData = useMemo(() => {
    return categoryData.map(c => ({
      name: c.category,
      size: c.value
    }));
  }, [categoryData]);

  // Colors list
  const colorsList = ['#3b82f6', '#06b6d4', '#00F2FE', '#10b981', '#f59e0b', '#6366f1'];

  return (
    <EmptyStateWrapper>
      <div className="shell-container tab-transition max-w-[1700px] mx-auto flex flex-col gap-6">
        
        {/* Row 1: Asymmetrical top block */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
          
          {/* Dominance Heatmap (Treemap) (col-span-8) */}
          <div className="xl:col-span-8 fintech-card h-[380px] flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-[var(--text-primary)]">Market Share Treemap</h3>
              <p className="text-[10px] text-[var(--text-secondary)] font-semibold uppercase tracking-wider">
                Heatmap density representing sales sizes by sector
              </p>
            </div>
            
            <div className="flex-1 w-full min-h-0 mt-4 text-xs">
              {categoryData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-[var(--text-secondary)]">No categories ingested</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <Treemap
                    data={treemapData}
                    dataKey="size"
                    aspectRatio={4 / 3}
                    stroke="var(--surface-color)"
                    fill="var(--accent-color)"
                  >
                    <Tooltip 
                      contentStyle={{ background: 'var(--surface-color)', borderColor: 'var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }}
                      formatter={(value: any) => [`$${value.toLocaleString()}`, 'Market Size']}
                    />
                  </Treemap>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Category distribution grid (col-span-4) */}
          <div className="xl:col-span-4 fintech-card h-[380px] flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-[var(--text-primary)]">Sector Breakdown</h3>
              <p className="text-[10px] text-[var(--text-secondary)] font-semibold uppercase tracking-wider">
                Market share percentage calculations
              </p>
            </div>

            <div className="flex-1 mt-4 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
              {categoryData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-[var(--text-secondary)] text-xs">No active records</div>
              ) : (
                categoryData.map((c, index) => {
                  const pct = totalCategorySales > 0 ? (c.value / totalCategorySales) * 100 : 0;
                  return (
                    <div 
                      key={c.category} 
                      className="p-3 rounded-lg bg-[var(--bg-color)] border border-[var(--border-color)] hover:border-[var(--accent-color)]/25 transition cursor-pointer"
                      onClick={() => setCategoryFilter(c.category)}
                    >
                      <div className="flex justify-between items-center text-xs mb-1.5">
                        <span className="font-extrabold text-[var(--text-primary)] flex items-center gap-1">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colorsList[index % colorsList.length] }} />
                          {c.category}
                        </span>
                        <span className="font-extrabold text-[var(--accent-color)]">
                          {pct.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-[var(--text-secondary)]">
                        <span>Total Revenue</span>
                        <span>{formatCurrency(c.value)}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Row 2: Product performance grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Top Products clusters list (col-span-7) */}
          <div className="lg:col-span-7 fintech-card min-h-[300px] flex flex-col justify-between">
            <div>
              <h4 className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
                Top Performing Product Nodes
              </h4>
              <p className="text-[9px] text-[var(--text-secondary)] italic">Calculated correlation aggregates</p>
            </div>

            <div className="flex-1 mt-4 space-y-2">
              {topProducts.length === 0 ? (
                <div className="py-8 text-center text-xs text-[var(--text-secondary)]">No product lists</div>
              ) : (
                topProducts.map((p, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs p-2.5 rounded-lg bg-[var(--bg-color)] border border-[var(--border-color)]">
                    <div className="flex flex-col gap-0.5 truncate mr-3">
                      <span className="font-extrabold text-[var(--text-primary)] truncate max-w-[280px]">{p.name}</span>
                      <span className="text-[9px] text-[var(--text-secondary)] font-semibold uppercase tracking-wider">{p.category}</span>
                    </div>
                    <div className="flex items-center gap-4 text-[10.5px]">
                      <span className="text-[var(--text-secondary)]">{p.count} units</span>
                      <span className="text-[var(--accent-color)] font-extrabold">{formatCurrency(p.sales)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Category volume variance (col-span-5) */}
          <div className="lg:col-span-5 fintech-card min-h-[300px] flex flex-col justify-between">
            <div>
              <h4 className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
                Volume Rank Distribution
              </h4>
              <p className="text-[9px] text-[var(--text-secondary)] italic">Category performance ranking bar vectors</p>
            </div>

            <div className="flex-1 w-full min-h-0 text-xs mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData}>
                  <XAxis dataKey="category" stroke="var(--text-secondary)" fontSize={9} />
                  <YAxis stroke="var(--text-secondary)" fontSize={9} tickFormatter={(v) => `$${v.toLocaleString()}`} />
                  <Tooltip 
                    contentStyle={{ background: 'var(--surface-color)', borderColor: 'var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }}
                    formatter={(value: any) => [`$${value.toLocaleString()}`, 'Revenue']}
                  />
                  <Bar dataKey="value" fill="var(--accent-color)" radius={[4, 4, 0, 0]} onClick={(data) => data && setCategoryFilter(data.category)}>
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colorsList[index % colorsList.length]} cursor="pointer" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

      </div>
    </EmptyStateWrapper>
  );
}
