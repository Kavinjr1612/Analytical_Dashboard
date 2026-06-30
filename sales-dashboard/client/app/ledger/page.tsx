'use client';

import React, { useState } from 'react';
import { 
  ArrowLeft, ArrowRight, ChevronDown, ChevronUp, 
  Search, Eye, HelpCircle, FileText 
} from 'lucide-react';
import { useDashboardContext } from '../../context/DashboardContext';
import { EmptyStateWrapper } from '../../components/EmptyState';

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

export default function LedgerPage() {
  const { 
    transactionsResponse, loading, errors, pagination, 
    sorting, setSorting, setPage, setLimit, filters 
  } = useDashboardContext();

  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  const transactions = transactionsResponse?.transactions || [];
  const totalCount = transactionsResponse?.totalCount || 0;
  const totalPages = transactionsResponse?.totalPages || 1;

  const handleRowClick = (id: string) => {
    setExpandedRowId(prev => (prev === id ? null : id));
  };

  const handleSortToggle = (field: string) => {
    const isCurrent = sorting.sortBy === field;
    setSorting({
      sortBy: field,
      sortOrder: isCurrent && sorting.sortOrder === 'desc' ? 'asc' : 'desc'
    });
  };

  const getSortIcon = (field: string) => {
    if (sorting.sortBy !== field) return <ChevronDown size={11} className="opacity-30" />;
    return sorting.sortOrder === 'desc' 
      ? <ChevronDown size={11} className="text-[var(--accent-color)]" /> 
      : <ChevronUp size={11} className="text-[var(--accent-color)]" />;
  };

  return (
    <EmptyStateWrapper>
      <div className="shell-container tab-transition max-w-[1700px] mx-auto flex flex-col gap-6">
        
        {/* Ledger Card Container */}
        <div className="fintech-card flex flex-col gap-4">
          <div className="flex justify-between items-center pb-3 border-b border-[var(--border-color)]">
            <div>
              <h3 className="text-sm font-extrabold text-[var(--text-primary)]">Transaction Ledger</h3>
              <p className="text-[10px] text-[var(--text-secondary)] font-semibold uppercase tracking-wider">
                Full-width transaction ledger with expandable rows
              </p>
            </div>
            <span className="text-[10px] font-bold text-[var(--text-secondary)] bg-[var(--bg-color)] px-2.5 py-1 rounded border border-[var(--border-color)]">
              {totalCount.toLocaleString()} Total Records
            </span>
          </div>

          {/* Table area */}
          <div className="overflow-x-auto border border-[var(--border-color)] rounded-xl custom-scrollbar">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="sticky top-0 bg-[var(--surface-color)] z-10">
                <tr className="bg-[var(--bg-color)] border-b border-[var(--border-color)]">
                  <th className="py-3.5 px-4 font-bold text-[var(--text-secondary)] uppercase tracking-wide">Customer</th>
                  <th className="py-3.5 px-4 font-bold text-[var(--text-secondary)] uppercase tracking-wide">Product</th>
                  <th className="py-3.5 px-4 font-bold text-[var(--text-secondary)] uppercase tracking-wide">Category</th>
                  <th className="py-3.5 px-4 font-bold text-[var(--text-secondary)] uppercase tracking-wide">Region</th>
                  <th 
                    onClick={() => handleSortToggle('amount')}
                    className="py-3.5 px-4 font-bold text-[var(--text-secondary)] uppercase tracking-wide cursor-pointer hover:text-[var(--text-primary)] select-none transition"
                  >
                    <div className="flex items-center gap-1">
                      Revenue {getSortIcon('amount')}
                    </div>
                  </th>
                  <th className="py-3.5 px-4 font-bold text-[var(--text-secondary)] uppercase tracking-wide">Status</th>
                  <th 
                    onClick={() => handleSortToggle('transactionDate')}
                    className="py-3.5 px-4 font-bold text-[var(--text-secondary)] uppercase tracking-wide cursor-pointer hover:text-[var(--text-primary)] select-none transition"
                  >
                    <div className="flex items-center gap-1">
                      Date {getSortIcon('transactionDate')}
                    </div>
                  </th>
                  <th className="py-3.5 px-4 font-bold text-[var(--text-secondary)] uppercase tracking-wide text-center">Inspect</th>
                </tr>
              </thead>
              <tbody>
                {loading.transactions ? (
                  Array.from({ length: pagination.limit }).map((_, rIdx) => (
                    <tr key={rIdx} className="border-b border-[var(--border-color)]">
                      {Array.from({ length: 8 }).map((_, cIdx) => (
                        <td key={cIdx} className="py-3.5 px-4 animate-pulse">
                          <div className="h-3.5 bg-[var(--border-color)] rounded w-3/4"></div>
                        </td>
                      ))}
                    </tr>
                  ))
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-xs text-[var(--text-secondary)]">
                      No records matched the current search criteria.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => {
                    const isExpanded = expandedRowId === tx.id;
                    return (
                      <React.Fragment key={tx.id}>
                        {/* Main row */}
                        <tr 
                          onClick={() => handleRowClick(tx.id)}
                          className={`border-b border-[var(--border-color)] hover:bg-[var(--bg-color)]/50 transition-colors cursor-pointer ${
                            isExpanded ? 'bg-[var(--accent-glow)]' : ''
                          }`}
                        >
                          <td className="py-3.5 px-4 font-bold text-[var(--text-primary)]">{tx.customerName}</td>
                          <td className="py-3.5 px-4 text-[var(--text-secondary)] font-medium truncate max-w-[140px]">{tx.productName}</td>
                          <td className="py-3.5 px-4 text-[var(--text-secondary)] font-medium">{tx.category}</td>
                          <td className="py-3.5 px-4 text-[var(--text-secondary)] font-medium">{tx.region}</td>
                          <td className="py-3.5 px-4 font-extrabold text-[var(--text-primary)]">
                            {formatCurrency(Number(tx.amount))}
                          </td>
                          <td className="py-3.5 px-4 font-semibold">
                            <span className={`px-2 py-0.5 rounded text-[9px] uppercase tracking-wide ${
                              tx.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-500' :
                              tx.status === 'Pending' ? 'bg-amber-500/10 text-amber-500' :
                              'bg-red-500/10 text-red-500'
                            }`}>
                              {tx.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-[var(--text-secondary)] font-medium">
                            {new Date(tx.transactionDate).toLocaleDateString()}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <button className="text-[var(--text-secondary)] hover:text-[var(--accent-color)] transition cursor-pointer">
                              <Eye size={13} />
                            </button>
                          </td>
                        </tr>
                        
                        {/* Expanded details panel */}
                        {isExpanded && (
                          <tr className="bg-[var(--bg-color)]/30 border-b border-[var(--border-color)]">
                            <td colSpan={8} className="py-4 px-6">
                              <div className="p-4 rounded-xl bg-[var(--surface-color)] border border-[var(--border-color)] shadow-inner grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="flex flex-col gap-1">
                                  <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Transaction UID</span>
                                  <span className="font-mono text-xs text-[var(--text-primary)] break-all">{tx.id}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                  <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">System Date</span>
                                  <span className="text-xs text-[var(--text-primary)]">
                                    {new Date(tx.transactionDate).toUTCString()}
                                  </span>
                                </div>
                                <div className="flex flex-col gap-1">
                                  <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Product Item</span>
                                  <span className="text-xs text-[var(--text-primary)]">{tx.productName}</span>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-[var(--border-color)]">
            {/* Page limit */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Page Size</span>
              <select
                value={pagination.limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="fintech-select py-1 px-2.5 text-xs font-semibold"
              >
                {[10, 20, 25, 50].map((size) => (
                  <option key={size} value={size}>
                    {size} Rows
                  </option>
                ))}
              </select>
            </div>

            {/* Pagination keys */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setPage(pagination.page - 1)}
                disabled={pagination.page === 1 || loading.transactions}
                className="btn-secondary py-1.5 px-3 flex items-center gap-1 text-[11px] font-bold cursor-pointer disabled:opacity-40"
              >
                <ArrowLeft size={11} /> Previous
              </button>
              
              <span className="text-xs text-[var(--text-secondary)] font-medium">
                Page <strong className="text-[var(--text-primary)]">{pagination.page}</strong> of <strong className="text-[var(--text-primary)]">{totalPages}</strong>
              </span>

              <button
                onClick={() => setPage(pagination.page + 1)}
                disabled={pagination.page >= totalPages || loading.transactions}
                className="btn-secondary py-1.5 px-3 flex items-center gap-1 text-[11px] font-bold cursor-pointer disabled:opacity-40"
              >
                Next <ArrowRight size={11} />
              </button>
            </div>
          </div>
        </div>

      </div>
    </EmptyStateWrapper>
  );
}
