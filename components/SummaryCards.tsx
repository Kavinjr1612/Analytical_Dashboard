'use client';

import React from 'react';
import { DollarSign, ShoppingBag, TrendingUp, Users, ArrowUpRight } from 'lucide-react';
import { DashboardSummary } from '../types';

interface SummaryCardsProps {
  summary: DashboardSummary | null;
  isLoading: boolean;
  error: string | null;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  summary,
  isLoading,
  error
}) => {
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  const formatNumber = (val: number) =>
    new Intl.NumberFormat('en-US').format(val);

  const cardData = [
    {
      title: 'Total Revenue',
      value: summary ? formatCurrency(summary.totalRevenue) : '$0',
      icon: <DollarSign className="text-[#3b82f6]" size={18} />,
      trend: '+12.4%',
      sub: summary?.topSellingCategory ? `Top: ${summary.topSellingCategory}` : '',
    },
    {
      title: 'Total Orders',
      value: summary ? formatNumber(summary.totalOrders) : '0',
      icon: <ShoppingBag className="text-[#3b82f6]" size={18} />,
      trend: '+8.2%',
      sub: summary?.bestPerformingRegion ? `Best: ${summary.bestPerformingRegion}` : '',
    },
    {
      title: 'Average Order Value',
      value: summary ? formatCurrency(summary.averageOrderValue) : '$0',
      icon: <TrendingUp className="text-[#3b82f6]" size={18} />,
      trend: '+3.8%',
      sub: 'Per transaction average',
    },
    {
      title: 'Total Customers',
      value: summary ? formatNumber(summary.totalCustomers) : '0',
      icon: <Users className="text-[#3b82f6]" size={18} />,
      trend: '+14.6%',
      sub: 'Unique customers',
    },
  ];

  if (error) {
    return (
      <div className="gold-card p-5 text-center text-red-400 border-red-950/30">
        <p className="font-semibold text-sm mb-1">Failed to load statistics</p>
        <p className="text-xs text-[#64748b]">{error}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cardData.map((card, index) => (
        <div
          key={index}
          className="gold-card p-5 flex flex-col justify-between bg-[#0f172a]"
        >
          {isLoading ? (
            <div className="animate-pulse space-y-3 w-full">
              <div className="flex justify-between items-center">
                <div className="h-3 w-2/3 bg-white/5 rounded"></div>
                <div className="h-5 w-5 bg-white/5 rounded-full"></div>
              </div>
              <div className="h-8 w-3/4 bg-white/5 rounded"></div>
              <div className="h-3 w-1/2 bg-white/5 rounded"></div>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] font-bold text-[#64748b] tracking-wider uppercase">
                  {card.title}
                </span>
                <div className="p-1.5 rounded bg-[#1e293b] border border-white/5">
                  {card.icon}
                </div>
              </div>
              
              <div className="mb-2">
                <span className="text-2xl font-extrabold tracking-tight text-[#f8fafc] break-words">
                  {card.value}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] border-t border-white/5 pt-2 mt-1">
                <span className="text-[#64748b] font-medium truncate">
                  {card.sub}
                </span>
                <span className="text-emerald-500 flex items-center gap-0.5 font-bold flex-shrink-0">
                  <ArrowUpRight size={11} />
                  {card.trend}
                </span>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
};
