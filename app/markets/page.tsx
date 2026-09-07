'use client';

import React, { useMemo } from 'react';
import { 
  BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Treemap, AreaChart, Area, LabelList
} from 'recharts';
import { PieChart, Tag, Award, Layers } from 'lucide-react';
import { useDashboardContext } from '../../context/DashboardContext';
import { EmptyStateWrapper } from '../../components/EmptyState';

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

export default function MarketsPage() {
  const { 
    charts, transactionsResponse, loading, setCategoryFilter,
    activeSchema, formatValue 
  } = useDashboardContext();
  const currentTransactions = transactionsResponse?.transactions || [];

  const categoryData = charts?.salesByCategory || [];
  const totalCategorySales = categoryData.reduce((sum, c) => sum + c.value, 0);

  const amountLabel = activeSchema.amount || 'Value';
  const categoryLabel = activeSchema.category || 'Category';
  const productLabel = activeSchema.productName || 'Product';

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

  const categoryYDomain = useMemo<any>(() => {
    if (categoryData.length === 0) return [0, 'auto'];
    const values = categoryData.map((d: any) => Number(d.value || 0));
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
  }, [categoryData]);

  // Colors list
  const colorsList = ['#22D3EE', '#6366F1', '#10B981', '#F59E0B', '#F43F5E'];

  return (
    <EmptyStateWrapper>
      <div className="shell-container tab-transition max-w-[1700px] mx-auto flex flex-col gap-6">
        
        {/* Row 1: Heatmap treemap and list */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
          
          {/* Dominance Heatmap (Treemap) (col-span-8) */}
          <div className="xl:col-span-8 fintech-card h-[380px] flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">{categoryLabel} Size Treemap</h3>
              <p className="text-[10px] text-[var(--text-secondary)] font-semibold uppercase tracking-wider">
                Heatmap density representing {amountLabel} sizes by {categoryLabel}
              </p>
            </div>
            
            <div className="flex-1 w-full min-h-0 mt-4 text-xs">
              {categoryData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-[var(--text-secondary)]">No {categoryLabel.toLowerCase()}s ingested</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <Treemap
                    data={treemapData}
                    dataKey="size"
                    aspectRatio={4 / 3}
                    stroke="var(--surface-color)"
                    fill="var(--accent-color)"
                  >
                    <Tooltip content={<CustomTooltip />} />
                  </Treemap>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Category distribution grid (col-span-4) */}
          <div className="xl:col-span-4 fintech-card h-[380px] flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">{categoryLabel} Breakdown</h3>
              <p className="text-[10px] text-[var(--text-secondary)] font-semibold uppercase tracking-wider">
                Relative segment ratio calculations
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
                        <span className="font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colorsList[index % colorsList.length] }} />
                          {c.category}
                        </span>
                        <span className="font-semibold text-[var(--accent-color)]">
                          {pct.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-[var(--text-secondary)]">
                        <span>Accumulated {amountLabel}</span>
                        <span>{formatValue(c.value)}</span>
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
              <h4 className="text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
                Top Performing {productLabel} Nodes
              </h4>
              <p className="text-[9px] text-[var(--text-secondary)] italic">Calculated concentration aggregates</p>
            </div>

            <div className="flex-1 mt-4 space-y-2">
              {topProducts.length === 0 ? (
                <div className="py-8 text-center text-xs text-[var(--text-secondary)]">No active lists</div>
              ) : (
                topProducts.map((p, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs p-2.5 rounded-lg bg-[var(--bg-color)] border border-[var(--border-color)]">
                    <div className="flex flex-col gap-0.5 truncate mr-3">
                      <span className="font-semibold text-[var(--text-primary)] truncate max-w-[280px]">{p.name}</span>
                      <span className="text-[9px] text-[var(--text-secondary)] font-semibold uppercase tracking-wider">{p.category}</span>
                    </div>
                    <div className="flex items-center gap-4 text-[10.5px]">
                      <span className="text-[var(--text-secondary)]">{p.count} entries</span>
                      <span className="text-[var(--accent-color)] font-semibold">{formatValue(p.sales)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Category volume variance (col-span-5) */}
          <div className="lg:col-span-5 fintech-card min-h-[300px] flex flex-col justify-between">
            <div>
              <h4 className="text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
                Volume Rank Distribution
              </h4>
              <p className="text-[9px] text-[var(--text-secondary)] italic">{categoryLabel} performance ranking vectors</p>
            </div>

            <div className="flex-1 w-full min-h-0 text-xs mt-4">
              {categoryData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-[var(--text-secondary)]">No active rankings</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData}>
                    <XAxis dataKey="category" stroke="var(--text-secondary)" fontSize={9} />
                    <YAxis 
                      stroke="var(--text-secondary)" 
                      fontSize={9} 
                      tickFormatter={(v) => formatValue(v)}
                      domain={categoryYDomain}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" fill="var(--accent-color)" radius={[4, 4, 0, 0]} onClick={(data: any) => data && setCategoryFilter(data.category)}>
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colorsList[index % colorsList.length]} cursor="pointer" />
                      ))}
                      {categoryData.length <= 15 && (
                        <LabelList 
                          dataKey="value" 
                          position="top" 
                          offset={8} 
                          fontSize={8} 
                          fill="var(--text-secondary)" 
                          formatter={(v: any) => typeof v === 'number' ? formatValue(v) : v}
                        />
                      )}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

        </div>

      </div>
    </EmptyStateWrapper>
  );
}
