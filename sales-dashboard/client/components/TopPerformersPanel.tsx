'use client';

import React from 'react';
import { User, Package, Compass, TrendingUp, AlertTriangle, Medal, Sparkles } from 'lucide-react';
import { DashboardSummary, Transaction } from '../types';

interface TopPerformersPanelProps {
  summary: DashboardSummary | null;
  transactions: Transaction[];
  isLoading: boolean;
}

export const TopPerformersPanel: React.FC<TopPerformersPanelProps> = ({
  summary,
  transactions,
  isLoading
}) => {
  // 1. Calculate Top Customer from currently loaded transaction page (highest single purchase)
  const getTopCustomer = () => {
    if (!transactions || transactions.length === 0) return { name: 'N/A', detail: '$0.00' };
    const highestTx = [...transactions].sort((a, b) => Number(b.amount) - Number(a.amount))[0];
    if (highestTx) {
      return {
        name: highestTx.customerName,
        detail: `Ticket: $${Number(highestTx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
      };
    }
    return { name: 'N/A', detail: '$0.00' };
  };

  // 2. Calculate Top Product on current page (highest order volume)
  const getTopProduct = () => {
    if (!transactions || transactions.length === 0) return { name: 'N/A', detail: '0 orders' };
    const productCounts: Record<string, number> = {};
    transactions.forEach((tx) => {
      productCounts[tx.productName] = (productCounts[tx.productName] || 0) + 1;
    });
    const sorted = Object.entries(productCounts).sort((a, b) => b[1] - a[1]);
    if (sorted[0]) {
      return {
        name: sorted[0][0],
        detail: `${sorted[0][1]} orders page volume`
      };
    }
    return { name: 'N/A', detail: '0 orders' };
  };

  // 3. Calculate Highest Cancelled Product on current page
  const getHighestCancelled = () => {
    if (!transactions || transactions.length === 0) return { name: 'N/A', detail: '0 cancellations' };
    const cancelledCounts: Record<string, number> = {};
    const cancelledTxs = transactions.filter((tx) => tx.status === 'Cancelled');
    
    if (cancelledTxs.length === 0) return { name: 'None', detail: '0 cancellations' };
    
    cancelledTxs.forEach((tx) => {
      cancelledCounts[tx.productName] = (cancelledCounts[tx.productName] || 0) + 1;
    });
    const sorted = Object.entries(cancelledCounts).sort((a, b) => b[1] - a[1]);
    if (sorted[0]) {
      return {
        name: sorted[0][0],
        detail: `${sorted[0][1]} cancellations page volume`
      };
    }
    return { name: 'None', detail: '0 cancellations' };
  };

  const topCustomer = getTopCustomer();
  const topProduct = getTopProduct();
  const highestCancelled = getHighestCancelled();

  const performers = [
    {
      label: 'Top Customer (Current Page)',
      name: topCustomer.name,
      detail: topCustomer.detail,
      icon: <User className="text-[#C6A96B]" size={16} />,
    },
    {
      label: 'Top Product (Current Page)',
      name: topProduct.name,
      detail: topProduct.detail,
      icon: <Package className="text-[#C6A96B]" size={16} />,
    },
    {
      label: 'Best Performing Region',
      name: summary ? summary.bestPerformingRegion : 'N/A',
      detail: 'Highest total revenue share',
      icon: <Compass className="text-[#C6A96B]" size={16} />,
    },
    {
      label: 'Fastest Growing Category',
      name: summary ? summary.topSellingCategory : 'N/A',
      detail: 'Highest demand category',
      icon: <TrendingUp className="text-[#C6A96B]" size={16} />,
    },
    {
      label: 'Highest Cancelled Item',
      name: highestCancelled.name,
      detail: highestCancelled.detail,
      icon: <AlertTriangle className="text-[#A88B4A]" size={16} />,
    },
  ];

  return (
    <div className="gold-card p-5 h-full flex flex-col justify-between bg-[#141414]">
      {/* Header Info */}
      <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4">
        <div className="flex items-center gap-2">
          <Medal size={16} className="text-[#C6A96B]" />
          <h3 className="text-sm font-semibold tracking-wider uppercase text-[#F5F1E8]">Strategic Insights</h3>
        </div>
        <Sparkles size={14} className="text-[#A88B4A] animate-pulse" />
      </div>

      {/* List Performers */}
      <div className="flex-1 flex flex-col justify-center gap-4.5">
        {isLoading ? (
          // Skeletons
          Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="flex gap-3 animate-pulse">
              <div className="w-8 h-8 rounded bg-white/5"></div>
              <div className="flex-1 space-y-2">
                <div className="h-3 w-1/3 bg-white/5 rounded"></div>
                <div className="h-4 w-3/4 bg-white/5 rounded"></div>
              </div>
            </div>
          ))
        ) : (
          performers.map((perf, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3.5 p-2 rounded hover:bg-[#1A1A1A] border border-transparent hover:border-white/5 transition-all duration-200"
            >
              {/* Icon Container */}
              <div className="p-2 rounded bg-[#111111] border border-white/5 flex-shrink-0">
                {perf.icon}
              </div>

              {/* Text Info */}
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-[#7E786F] tracking-wide uppercase mb-0.5">
                  {perf.label}
                </p>
                <h4 className="text-sm font-bold text-[#F5F1E8] truncate mb-0.5">
                  {perf.name}
                </h4>
                <p className="text-xs text-[#B8B2A8] truncate font-medium">
                  {perf.detail}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
