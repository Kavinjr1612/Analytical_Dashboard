'use client';

import React from 'react';
import { X, TrendingUp, Percent, Users, Package, DollarSign } from 'lucide-react';
import { Transaction } from '../types';

export interface DrilldownData {
  type: 'category' | 'region' | 'status' | 'trend';
  label: string;
  value: number;
  total: number;
  transactions: Transaction[];
}

interface DrilldownDrawerProps {
  data: DrilldownData | null;
  onClose: () => void;
}

export const DrilldownDrawer: React.FC<DrilldownDrawerProps> = ({ data, onClose }) => {
  if (!data) return null;

  const contribution = data.total > 0 ? ((data.value / data.total) * 100).toFixed(1) : '0';

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  // Top 5 transactions sorted by amount descending
  const top5 = [...data.transactions]
    .sort((a, b) => Number(b.amount) - Number(a.amount))
    .slice(0, 5);

  // Unique customers in this slice
  const uniqueCustomers = new Set(data.transactions.map(t => t.customerName)).size;

  // Top product in this slice
  const productCounts: Record<string, number> = {};
  data.transactions.forEach(t => {
    productCounts[t.productName] = (productCounts[t.productName] || 0) + 1;
  });
  const topProduct = Object.entries(productCounts).sort((a, b) => b[1] - a[1])[0];

  const typeLabels: Record<string, string> = {
    category: 'Category Focus',
    region: 'Regional Intelligence',
    status: 'Order Status Drill',
    trend: 'Period Analysis',
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-[60] drawer-backdrop"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-[#111111] border-l border-white/5 z-[70] drawer-slide-in flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div>
            <p className="text-[10px] font-bold text-[#7E786F] uppercase tracking-wider mb-0.5">
              {typeLabels[data.type] || 'Drilldown'}
            </p>
            <h2 className="text-lg font-bold text-[#F5F1E8]">{data.label}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded hover:bg-white/5 text-[#7E786F] hover:text-white transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 p-5 border-b border-white/5">
          <div className="bg-[#141414] border border-white/5 rounded p-3.5">
            <div className="flex items-center gap-1.5 mb-2">
              <DollarSign size={12} className="text-[#C6A96B]" />
              <span className="text-[10px] font-bold text-[#7E786F] uppercase tracking-wider">Value</span>
            </div>
            <p className="text-base font-extrabold text-[#F5F1E8]">{formatCurrency(data.value)}</p>
          </div>

          <div className="bg-[#141414] border border-white/5 rounded p-3.5">
            <div className="flex items-center gap-1.5 mb-2">
              <Percent size={12} className="text-[#C6A96B]" />
              <span className="text-[10px] font-bold text-[#7E786F] uppercase tracking-wider">Contribution</span>
            </div>
            <p className="text-base font-extrabold text-[#C6A96B]">{contribution}%</p>
          </div>

          <div className="bg-[#141414] border border-white/5 rounded p-3.5">
            <div className="flex items-center gap-1.5 mb-2">
              <Users size={12} className="text-[#C6A96B]" />
              <span className="text-[10px] font-bold text-[#7E786F] uppercase tracking-wider">Customers</span>
            </div>
            <p className="text-base font-extrabold text-[#F5F1E8]">{uniqueCustomers}</p>
          </div>

          <div className="bg-[#141414] border border-white/5 rounded p-3.5">
            <div className="flex items-center gap-1.5 mb-2">
              <TrendingUp size={12} className="text-[#C6A96B]" />
              <span className="text-[10px] font-bold text-[#7E786F] uppercase tracking-wider">Orders</span>
            </div>
            <p className="text-base font-extrabold text-[#F5F1E8]">{data.transactions.length}</p>
          </div>
        </div>

        {/* Top Product in Slice */}
        {topProduct && (
          <div className="px-5 pt-4 pb-3 border-b border-white/5">
            <div className="flex items-center gap-1.5 mb-2">
              <Package size={12} className="text-[#C6A96B]" />
              <span className="text-[10px] font-bold text-[#7E786F] uppercase tracking-wider">Top Product in this Segment</span>
            </div>
            <p className="text-sm font-bold text-[#F5F1E8]">{topProduct[0]}</p>
            <p className="text-xs text-[#B8B2A8]">{topProduct[1]} orders</p>
          </div>
        )}

        {/* Top 5 Related Transactions */}
        <div className="flex-1 overflow-y-auto p-5">
          <h3 className="text-[10px] font-bold text-[#7E786F] uppercase tracking-wider mb-3">
            Top 5 Transactions
          </h3>
          {top5.length === 0 ? (
            <p className="text-xs text-[#7E786F] py-4 text-center">No transactions in this segment</p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {top5.map((tx, idx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 rounded bg-[#141414] border border-white/5 hover:border-white/10 transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#1A1A1A] border border-white/5 flex items-center justify-center text-[9px] font-bold text-[#7E786F]">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#F5F1E8] truncate">{tx.customerName}</p>
                      <p className="text-[10px] text-[#7E786F] truncate">{tx.productName}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#C6A96B] flex-shrink-0 ml-2">
                    ${Number(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/5 text-center">
          <p className="text-[10px] text-[#7E786F]">
            Showing top 5 of {data.transactions.length} linked transactions
          </p>
        </div>
      </div>
    </>
  );
};
