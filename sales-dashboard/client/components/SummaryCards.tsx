'use client';

import React from 'react';
import { DollarSign, ShoppingBag, TrendingUp, Users, Tag, MapPin } from 'lucide-react';
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
  // Formatter helpers
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  };

  const formatNumber = (val: number) => {
    return new Intl.NumberFormat('en-US').format(val);
  };

  const cardData = [
    {
      title: 'Total Revenue',
      value: summary ? formatCurrency(summary.totalRevenue) : '$0',
      icon: <DollarSign className="text-blue-400" size={20} />,
      colorClass: 'from-blue-500/10 to-transparent border-blue-500/20',
      textClass: 'text-blue-400',
    },
    {
      title: 'Total Orders',
      value: summary ? formatNumber(summary.totalOrders) : '0',
      icon: <ShoppingBag className="text-purple-400" size={20} />,
      colorClass: 'from-purple-500/10 to-transparent border-purple-500/20',
      textClass: 'text-purple-400',
    },
    {
      title: 'Average Order Value',
      value: summary ? formatCurrency(summary.averageOrderValue) : '$0',
      icon: <TrendingUp className="text-emerald-400" size={20} />,
      colorClass: 'from-emerald-500/10 to-transparent border-emerald-500/20',
      textClass: 'text-emerald-400',
    },
    {
      title: 'Total Customers',
      value: summary ? formatNumber(summary.totalCustomers) : '0',
      icon: <Users className="text-amber-400" size={20} />,
      colorClass: 'from-amber-500/10 to-transparent border-amber-500/20',
      textClass: 'text-amber-400',
    },
    {
      title: 'Top Selling Category',
      value: summary ? summary.topSellingCategory : 'N/A',
      icon: <Tag className="text-pink-400" size={20} />,
      colorClass: 'from-pink-500/10 to-transparent border-pink-500/20',
      textClass: 'text-pink-400',
    },
    {
      title: 'Best Performing Region',
      value: summary ? summary.bestPerformingRegion : 'N/A',
      icon: <MapPin className="text-cyan-400" size={20} />,
      colorClass: 'from-cyan-500/10 to-transparent border-cyan-500/20',
      textClass: 'text-cyan-400',
    },
  ];

  if (error) {
    return (
      <div className="glass-panel p-6 mb-6 border-danger/30 text-center text-danger">
        <p className="font-semibold mb-1">Failed to load statistics</p>
        <p className="text-xs text-text-muted">{error}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
      {cardData.map((card, index) => (
        <div
          key={index}
          className={`glass-panel p-4 flex flex-col justify-between bg-gradient-to-br ${card.colorClass} border`}
        >
          {isLoading ? (
            <div className="animate-pulse space-y-3 w-full">
              <div className="flex justify-between items-center">
                <div className="h-3 w-2/3 bg-white/10 rounded"></div>
                <div className="h-6 w-6 bg-white/10 rounded-full"></div>
              </div>
              <div className="h-6 w-1/2 bg-white/10 rounded"></div>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold text-text-muted tracking-wide uppercase">
                  {card.title}
                </span>
                <div className="p-1.5 rounded-lg bg-black/30 border border-white/5">
                  {card.icon}
                </div>
              </div>
              <div>
                <span className="text-xl font-bold text-white tracking-tight break-words">
                  {card.value}
                </span>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
};
