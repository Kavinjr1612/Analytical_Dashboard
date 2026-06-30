'use client';

import React from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef
} from '@tanstack/react-table';
import { ChevronUp, ChevronDown, ChevronsUpDown, List, ArrowLeft, ArrowRight, Table } from 'lucide-react';
import { Transaction } from '../types';

interface TransactionsTableProps {
  transactions: Transaction[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
  sorting: { sortBy: string; sortOrder: 'asc' | 'desc' };
  onSortChange: (sorting: { sortBy: string; sortOrder: 'asc' | 'desc' }) => void;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  isLoading: boolean;
  error: string | null;
  highlightCategory?: string;
  highlightRegion?: string;
  highlightStatus?: string;
}

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
  error,
  highlightCategory = '',
  highlightRegion = '',
  highlightStatus = '',
}) => {
  // Determine table columns
  const columns = React.useMemo<ColumnDef<Transaction>[]>(
    () => [
      {
        accessorKey: 'customerName',
        header: 'Customer',
        cell: (info) => (
          <span className="font-bold text-[#F5F1E8]">{info.getValue() as string}</span>
        )
      },
      {
        accessorKey: 'productName',
        header: 'Product',
        cell: (info) => (
          <span className="font-semibold text-[#B8B2A8]">{info.getValue() as string}</span>
        )
      },
      {
        accessorKey: 'category',
        header: 'Category',
        cell: (info) => (
          <span className="text-xs text-[#7E786F] font-medium">{info.getValue() as string}</span>
        )
      },
      {
        accessorKey: 'region',
        header: 'Region',
        cell: (info) => (
          <span className="text-xs text-[#B8B2A8] font-bold">{info.getValue() as string}</span>
        )
      },
      {
        accessorKey: 'amount',
        header: 'Amount',
        cell: (info) => {
          const amt = Number(info.getValue());
          return (
            <span className="font-bold text-[#C6A96B]">
              ${amt.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          );
        }
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: (info) => {
          const status = info.getValue() as string;
          let badgeClass = '';
          if (status === 'Completed') {
            badgeClass = 'bg-[#C6A96B]/8 text-[#C6A96B] border-[#C6A96B]/15';
          } else if (status === 'Pending') {
            badgeClass = 'bg-[#A88B4A]/8 text-[#A88B4A] border-[#A88B4A]/15';
          } else {
            badgeClass = 'bg-[#7E786F]/8 text-[#7E786F] border-[#7E786F]/15';
          }
          return (
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider border ${badgeClass}`}>
              {status}
            </span>
          );
        }
      },
      {
        accessorKey: 'transactionDate',
        header: 'Date',
        cell: (info) => {
          const dateStr = info.getValue() as string;
          return (
            <span className="text-xs text-[#7E786F]">
              {new Date(dateStr).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </span>
          );
        }
      }
    ],
    []
  );

  const table = useReactTable({
    data: transactions,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true
  });

  const handleSortToggle = (field: string) => {
    if (sorting.sortBy === field) {
      onSortChange({ sortBy: field, sortOrder: sorting.sortOrder === 'asc' ? 'desc' : 'asc' });
    } else {
      const defaultDesc = field === 'amount' || field === 'transactionDate';
      onSortChange({ sortBy: field, sortOrder: defaultDesc ? 'desc' : 'asc' });
    }
  };

  const getSortIcon = (field: string) => {
    if (sorting.sortBy !== field) {
      return <ChevronsUpDown size={12} className="opacity-40" />;
    }
    return sorting.sortOrder === 'desc' 
      ? <ChevronDown size={12} className="text-[#C6A96B]" /> 
      : <ChevronUp size={12} className="text-[#C6A96B]" />;
  };

  if (error) {
    return (
      <div className="gold-card p-6 border-red-950 text-center text-red-400">
        <p className="font-semibold mb-1">Failed to load transactions</p>
        <p className="text-xs text-text-muted">{error}</p>
      </div>
    );
  }

  return (
    <div className="gold-card p-6 bg-[#141414]">
      {/* Title */}
      <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4">
        <div className="flex items-center gap-2.5">
          <Table size={16} className="text-[#C6A96B]" />
          <h3 className="text-sm font-bold tracking-wider uppercase text-[#F5F1E8]">Transaction Ledger</h3>
          <span className="text-[9px] font-bold text-[#7E786F] bg-white/5 px-2 py-0.5 rounded-full">
            {totalCount.toLocaleString()} records
          </span>
        </div>
        <span className="text-[10px] font-bold text-[#7E786F] tracking-wide uppercase">
          Showing {transactions.length} of {totalCount.toLocaleString()} orders
        </span>
      </div>

      {/* Responsive Table Wrapper */}
      <div className="overflow-x-auto w-full mb-4 rounded border border-white/5">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#111111] border-b border-white/5">
              {table.getHeaderGroups()[0].headers.map((header) => {
                const isSortable = header.column.id === 'amount' || header.column.id === 'transactionDate';
                return (
                  <th
                    key={header.id}
                    onClick={() => isSortable && handleSortToggle(header.column.id)}
                    className={`py-3.5 px-4 text-[10px] font-bold text-[#7E786F] uppercase tracking-wider select-none ${isSortable ? 'cursor-pointer hover:text-white transition' : ''}`}
                  >
                    <div className="flex items-center gap-1.5">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {isSortable && getSortIcon(header.column.id)}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              // Skeletons
              Array.from({ length: limit }).map((_, rIdx) => (
                <tr key={rIdx} className="border-b border-white/5">
                  {columns.map((_, cIdx) => (
                    <td key={cIdx} className="py-3.5 px-4 animate-pulse">
                      <div className="h-3 w-3/4 bg-white/5 rounded"></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : transactions.length === 0 ? (
              // Empty state
              <tr>
                <td colSpan={columns.length} className="py-12 text-center text-[#7E786F]">
                  <List className="mx-auto mb-2.5 opacity-40" size={24} />
                  <p className="text-xs">No records found matching current controls</p>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => {
                const tx = row.original;
                const isHighlighted =
                  (highlightCategory && tx.category === highlightCategory) ||
                  (highlightRegion && tx.region === highlightRegion) ||
                  (highlightStatus && tx.status === highlightStatus);
                return (
                  <tr
                    key={row.id}
                    className={`border-b border-white/5 hover:bg-[#1A1A1A] transition-colors duration-150 group ${isHighlighted ? 'row-highlight' : ''}`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="py-3.5 px-4 text-xs">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-white/5">
        {/* Page size drop-down */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-[#7E786F] uppercase tracking-wider">Page Size</span>
          <select
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="rounded bg-[#111111] border border-white/5 px-2 py-1.5 text-xs text-[#F5F1E8] outline-none focus:border-[#A88B4A] cursor-pointer"
          >
            {[10, 20, 25, 50].map((size) => (
              <option key={size} value={size} className="bg-[#111111]">
                {size} Rows
              </option>
            ))}
          </select>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1 || isLoading}
            className="flex items-center gap-1.5 rounded border border-white/5 bg-[#1A1A1A] px-3.5 py-2 text-xs font-bold text-[#B8B2A8] hover:text-white disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
          >
            <ArrowLeft size={12} />
            Previous
          </button>
          
          <span className="text-xs text-[#B8B2A8] font-medium">
            Page <strong className="text-[#F5F1E8]">{page}</strong> of <strong className="text-[#F5F1E8]">{totalPages}</strong>
          </span>

          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages || isLoading}
            className="flex items-center gap-1.5 rounded border border-white/5 bg-[#1A1A1A] px-3.5 py-2 text-xs font-bold text-[#B8B2A8] hover:text-white disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
          >
            Next
            <ArrowRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};
