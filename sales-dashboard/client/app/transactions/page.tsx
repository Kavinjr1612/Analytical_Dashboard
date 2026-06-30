'use client';

import React from 'react';
import { useDashboardContext } from '../../context/DashboardContext';
import { TransactionsTable } from '../../components/TransactionsTable';

export default function TransactionsPage() {
  const {
    filters, pagination, sorting, setSorting, transactionsResponse,
    loading, errors, setPage, setLimit
  } = useDashboardContext();

  const currentTransactions = transactionsResponse?.transactions || [];

  return (
    <div className="dashboard-content flex-1 flex flex-col tab-transition">
      {/* ═══════════════════════════════════════════
          ZONE 5: TRANSACTION LEDGER
          ═══════════════════════════════════════════ */}
      <section id="zone-transactions" className="dashboard-zone flex-1 flex flex-col justify-center min-h-[calc(100vh-64px)]">
        <div className="zone-inner shell-container flex-1 flex flex-col justify-between">
          

          <div className="flex-1 flex flex-col justify-center">
            <TransactionsTable
              transactions={currentTransactions}
              totalCount={transactionsResponse?.totalCount || 0}
              page={pagination.page}
              limit={pagination.limit}
              totalPages={transactionsResponse?.totalPages || 0}
              sorting={sorting}
              onSortChange={setSorting}
              onPageChange={setPage}
              onLimitChange={setLimit}
              isLoading={loading.transactions}
              error={errors.transactions}
              highlightCategory={filters.category || ''}
              highlightRegion={filters.region || ''}
              highlightStatus={filters.status || ''}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
