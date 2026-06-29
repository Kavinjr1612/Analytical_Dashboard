'use client';

import React from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper
} from '@tanstack/react-table';
import { ChevronUp, ChevronDown, ChevronsUpDown, AlertCircle, HelpCircle } from 'lucide-react';
import { Transaction } from '../types';

interface TransactionsTableProps {
  transactions: Transaction[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
  sorting: { sortBy: string; sortOrder: 'asc' | 'desc' };
  onSortChange: (sort: { sortBy: string; sortOrder: 'asc' | 'desc' }) => void;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  isLoading: boolean;
  error: string | null;
}

const columnHelper = createColumnHelper<Transaction>();

export const TransactionsTable: React.FC<TransactionsTableProps> = ({
  transactions,
  totalCount,
  page,
  limit,
  totalPages,
  sorting,
  onSortChange,
  onPageChange,
  onLimitChange,
  isLoading,
  error
}) => {
  // 1. Column Definition for TanStack Table
  const columns = React.useMemo(() => [
    columnHelper.accessor('id', {
      id: 'id',
      header: 'Transaction ID',
      cell: (info) => (
        <span className="font-mono text-xs text-text-muted select-all hover:text-white transition" title={info.getValue()}>
          {info.getValue().substring(0, 8)}...
        </span>
      ),
    }),
    columnHelper.accessor('customerName', {
      id: 'customerName',
      header: 'Customer Name',
      cell: (info) => <span className="font-medium text-white">{info.getValue()}</span>,
    }),
    columnHelper.accessor('productName', {
      id: 'productName',
      header: 'Product Name',
      cell: (info) => <span className="text-text-muted">{info.getValue()}</span>,
    }),
    columnHelper.accessor('category', {
      id: 'category',
      header: 'Category',
      cell: (info) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-white/5 border border-white/10 text-white">
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor('region', {
      id: 'region',
      header: 'Region',
      cell: (info) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-accent-blue/10 border border-accent-blue/20 text-accent-blue">
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor('amount', {
      id: 'amount',
      header: 'Amount',
      cell: (info) => (
        <span className="font-bold text-white">
          ${Number(info.getValue()).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      ),
    }),
    columnHelper.accessor('status', {
      id: 'status',
      header: 'Status',
      cell: (info) => {
        const status = info.getValue();
        let colorClass = 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
        if (status === 'Pending') colorClass = 'bg-amber-500/10 border-amber-500/20 text-amber-400';
        if (status === 'Cancelled') colorClass = 'bg-red-500/10 border-red-500/20 text-red-400';
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${colorClass}`}>
            {status}
          </span>
        );
      },
    }),
    columnHelper.accessor('transactionDate', {
      id: 'transactionDate',
      header: 'Transaction Date',
      cell: (info) => {
        const date = new Date(info.getValue());
        return (
          <span className="text-text-muted text-xs">
            {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        );
      },
    }),
  ], []);

  // 2. Initialize TanStack Table instance
  const table = useReactTable({
    data: transactions,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
  });

  // Sort Handler
  const handleSort = (columnId: string) => {
    // Avoid sorting on ID column (unnecessary since it is random UUID)
    if (columnId === 'id') return;

    if (sorting.sortBy === columnId) {
      onSortChange({
        sortBy: columnId,
        sortOrder: sorting.sortOrder === 'asc' ? 'desc' : 'asc',
      });
    } else {
      onSortChange({
        sortBy: columnId,
        sortOrder: 'desc',
      });
    }
  };

  // Render Sort Icon on Table Header
  const renderSortIcon = (columnId: string) => {
    if (columnId === 'id') return null;
    if (sorting.sortBy !== columnId) {
      return <ChevronsUpDown size={14} className="text-text-muted opacity-40 ml-1.5" />;
    }
    return sorting.sortOrder === 'asc' 
      ? <ChevronUp size={14} className="text-accent-blue ml-1.5" /> 
      : <ChevronDown size={14} className="text-accent-blue ml-1.5" />;
  };

  // Pagination page buttons generation
  const pageRange = () => {
    const range: number[] = [];
    const maxVisible = 5;
    
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      range.push(i);
    }
    return range;
  };

  if (error) {
    return (
      <div className="glass-panel p-8 text-center text-danger border-danger/30 flex flex-col items-center justify-center">
        <AlertCircle size={36} className="mb-2 text-danger animate-pulse" />
        <p className="font-semibold mb-1">Failed to load transactions table</p>
        <p className="text-xs text-text-muted">{error}</p>
      </div>
    );
  }

  return (
    <div className="glass-panel p-4 md:p-6 flex flex-col">
      <div className="flex justify-between items-center mb-4 pb-3 border-b border-white/5">
        <h3 className="text-sm font-semibold text-white">Recent Transactions</h3>
        <span className="text-xs text-text-muted">
          Showing {transactions.length > 0 ? (page - 1) * limit + 1 : 0}-
          {Math.min(page * limit, totalCount)} of {totalCount.toLocaleString()} records
        </span>
      </div>

      {/* Table responsive viewport */}
      <div className="overflow-x-auto min-h-[300px]">
        <table className="w-full text-left border-collapse">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-white/10">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={() => handleSort(header.id)}
                    className={`py-3.5 px-4 text-xs font-semibold tracking-wider text-text-muted select-none uppercase ${
                      header.id !== 'id' ? 'cursor-pointer hover:text-white transition' : ''
                    }`}
                  >
                    <div className="flex items-center">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {renderSortIcon(header.id)}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {isLoading ? (
              // Pulsing loading skeletons
              Array.from({ length: limit }).map((_, rIdx) => (
                <tr key={rIdx} className="border-b border-white/5 last:border-b-0">
                  {columns.map((_, cIdx) => (
                    <td key={cIdx} className="py-4 px-4">
                      <div className="h-4 bg-white/5 rounded animate-pulse w-full"></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : transactions.length === 0 ? (
              // Empty State
              <tr>
                <td colSpan={columns.length} className="py-12 text-center text-text-muted">
                  <div className="flex flex-col items-center justify-center">
                    <HelpCircle size={32} className="mb-2 opacity-40 text-text-muted" />
                    <p className="text-sm">No transactions found matching the selected filter criteria</p>
                  </div>
                </td>
              </tr>
            ) : (
              // Data Rows
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-white/5 last:border-b-0 hover:bg-white/2 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="py-3 px-4 text-sm font-medium">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-4 border-t border-white/5">
          {/* Items Per Page Select */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted">Rows per page:</span>
            <select
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="rounded-lg bg-black/40 border border-white/10 p-1.5 text-xs text-white outline-none cursor-pointer focus:border-accent-blue/50"
            >
              {[10, 25, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          {/* Page numbers controls */}
          <div className="flex items-center gap-1.5">
            {/* Previous */}
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1 || isLoading}
              className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-white bg-white/5 transition disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/10 cursor-pointer"
            >
              Previous
            </button>

            {/* Truncated page range buttons */}
            {pageRange()[0] > 1 && (
              <>
                <button
                  onClick={() => onPageChange(1)}
                  className={`rounded-lg w-8 h-8 flex items-center justify-center text-xs font-medium border border-white/10 text-white transition hover:bg-white/10 cursor-pointer`}
                >
                  1
                </button>
                {pageRange()[0] > 2 && <span className="text-text-muted px-1 text-xs">...</span>}
              </>
            )}

            {pageRange().map((pNum) => (
              <button
                key={pNum}
                onClick={() => onPageChange(pNum)}
                className={`rounded-lg w-8 h-8 flex items-center justify-center text-xs font-medium border transition cursor-pointer ${
                  page === pNum
                    ? 'bg-accent-blue border-accent-blue text-white shadow-md shadow-accent-blue/20 font-bold'
                    : 'border-white/10 text-white hover:bg-white/10'
                }`}
              >
                {pNum}
              </button>
            ))}

            {pageRange()[pageRange().length - 1] < totalPages && (
              <>
                {pageRange()[pageRange().length - 1] < totalPages - 1 && (
                  <span className="text-text-muted px-1 text-xs">...</span>
                )}
                <button
                  onClick={() => onPageChange(totalPages)}
                  className={`rounded-lg w-8 h-8 flex items-center justify-center text-xs font-medium border border-white/10 text-white transition hover:bg-white/10 cursor-pointer`}
                >
                  {totalPages}
                </button>
              </>
            )}

            {/* Next */}
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages || isLoading}
              className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-white bg-white/5 transition disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/10 cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
