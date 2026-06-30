'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, RefreshCw } from 'lucide-react';
import { DashboardProvider, useDashboardContext } from '../context/DashboardContext';
import { NavigationRail } from './NavigationRail';
import { FilterBar } from './FilterBar';
import { ErrorBoundary } from './ErrorBoundary';

const Header: React.FC = () => {
  const { loading, refetchAll } = useDashboardContext();
  const pathname = usePathname();

  const getPageTitle = () => {
    switch (pathname) {
      case '/revenue':
        return 'Revenue Intelligence';
      case '/markets':
        return 'Market Dominance';
      case '/fulfillment':
        return 'Fulfillment Operations';
      case '/transactions':
        return 'Transaction Ledger';
      case '/':
      default:
        return 'Executive Overview';
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0e1524]/90 backdrop-blur-md h-16 dashboard-content">
      <div className="h-full w-full shell-container flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-[#3b82f6]/10 border border-[#3b82f6]/15 text-[#3b82f6]">
            <LayoutDashboard size={18} />
          </div>
          <div>
            <h1 className="text-sm font-bold text-[#f8fafc] tracking-tight">Sales Analytics</h1>
            <p className="text-[9px] text-[#3b82f6] font-bold uppercase tracking-wider">{getPageTitle()}</p>
          </div>
        </div>
        <button
          onClick={refetchAll}
          className="flex items-center gap-2 text-[11px] font-semibold px-3 py-1.5 rounded border border-white/5 hover:border-white/10 bg-[#1e293b] hover:bg-[#2563eb] text-[#94a3b8] hover:text-white transition duration-200 active:scale-95 cursor-pointer"
          title="Refresh all metrics"
        >
          <RefreshCw size={13} className={loading.summary || loading.charts || loading.transactions ? 'animate-spin' : ''} />
          <span className="hidden sm:inline">Sync</span>
        </button>
      </div>
    </header>
  );
};

const ShellContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    filters, searchVal, setSearchVal,
    setCategoryFilter, setRegionFilter, setStatusFilter,
    setDateRangeFilter, resetFilters, handleExport
  } = useDashboardContext();

  return (
    <div className="min-h-screen bg-[#0b0f19] flex flex-col">
      <Header />
      <NavigationRail />
      
      {/* Global Filter Bar Persistent below Header with shell-container */}
      <div className="dashboard-content shell-container pt-6 pb-2 bg-[#0b0f19] sticky top-16 z-40">
        <FilterBar
          filters={filters}
          searchVal={searchVal}
          setSearchVal={setSearchVal}
          setCategoryFilter={setCategoryFilter}
          setRegionFilter={setRegionFilter}
          setStatusFilter={setStatusFilter}
          setDateRangeFilter={setDateRangeFilter}
          resetFilters={resetFilters}
          handleExport={handleExport}
        />
      </div>

      <div className="flex-1 flex flex-col">
        {children}
      </div>

      <footer className="dashboard-content py-8 border-t border-white/5 text-center bg-[#0b0f19] mt-auto">
        <p className="text-[11px] text-[#64748b]">
          Sales Analytics Dashboard &copy; {new Date().getFullYear()} Auro Studios. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ErrorBoundary>
      <DashboardProvider>
        <ShellContent>{children}</ShellContent>
      </DashboardProvider>
    </ErrorBoundary>
  );
};
