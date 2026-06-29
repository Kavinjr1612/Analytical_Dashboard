'use client';

import React from 'react';
import { DollarSign, ShoppingBag, TrendingUp, Users, Tag, MapPin, ArrowUpRight, ArrowRight } from 'lucide-react';
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

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const cardData = [
    {
      title: 'Total Revenue',
      value: summary ? formatCurrency(summary.totalRevenue) : '$0',
      icon: <DollarSign className="text-[#C6A96B]" size={18} />,
      insight: 'Click to view revenue trend',
      trend: <span className="text-emerald-500 flex items-center gap-0.5"><ArrowUpRight size={12} /> 12.4%</span>,
      scrollTarget: 'section-revenue-trend',
    },
    {
      title: 'Total Orders',
      value: summary ? formatNumber(summary.totalOrders) : '0',
      icon: <ShoppingBag className="text-[#C6A96B]" size={18} />,
      insight: 'Click to view transaction ledger',
      trend: <span className="text-emerald-500 flex items-center gap-0.5"><ArrowUpRight size={12} /> 8.2%</span>,
      scrollTarget: 'section-transactions',
    },
    {
      title: 'Average Order Value',
      value: summary ? formatCurrency(summary.averageOrderValue) : '$0',
      icon: <TrendingUp className="text-[#C6A96B]" size={18} />,
      insight: 'Click to view category breakdown',
      trend: <span className="text-emerald-500 flex items-center gap-0.5"><ArrowUpRight size={12} /> 3.8%</span>,
      scrollTarget: 'section-category-region',
    },
    {
      title: 'Total Customers',
      value: summary ? formatNumber(summary.totalCustomers) : '0',
      icon: <Users className="text-[#C6A96B]" size={18} />,
      insight: 'Click to view strategic insights',
      trend: <span className="text-emerald-500 flex items-center gap-0.5"><ArrowUpRight size={12} /> 14.6%</span>,
      scrollTarget: 'section-command-center',
    },
    {
      title: 'Top Category',
      value: summary ? summary.topSellingCategory : 'N/A',
      icon: <Tag className="text-[#C6A96B]" size={18} />,
      insight: 'Click to view category chart',
      trend: <span className="text-[#B8B2A8] flex items-center gap-0.5"><ArrowRight size={12} /> Leader</span>,
      scrollTarget: 'section-category-region',
    },
    {
      title: 'Best Region',
      value: summary ? summary.bestPerformingRegion : 'N/A',
      icon: <MapPin className="text-[#C6A96B]" size={18} />,
      insight: 'Click to view region chart',
      trend: <span className="text-[#B8B2A8] flex items-center gap-0.5"><ArrowRight size={12} /> Peak</span>,
      scrollTarget: 'section-category-region',
    },
  ];

  if (error) {
    return (
      <div className="gold-card p-6 mb-6 border-red-950 bg-[#141414] text-center text-red-400">
        <p className="font-semibold mb-1">Failed to load statistics</p>
        <p className="text-xs text-[#7E786F]">{error}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
      {cardData.map((card, index) => (
        <div
          key={index}
          onClick={() => scrollTo(card.scrollTarget)}
          className="gold-card-clickable p-5 flex flex-col justify-between"
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
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-bold text-[#7E786F] tracking-wider uppercase">
                  {card.title}
                </span>
                <div className="p-1.5 rounded bg-[#1A1A1A] border border-white/5">
                  {card.icon}
                </div>
              </div>
              
              <div className="mb-2">
                <span className="text-2xl font-extrabold tracking-tight text-[#F5F1E8] break-words">
                  {card.value}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] border-t border-white/5 pt-2 mt-1">
                <span className="text-[#B8B2A8] font-medium truncate max-w-[70%]">
                  {card.insight}
                </span>
                {card.trend}
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
};
