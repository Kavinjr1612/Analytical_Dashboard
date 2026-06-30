'use client';

import React from 'react';
import { LayoutDashboard, RefreshCw } from 'lucide-react';
import { DashboardProvider, useDashboardContext } from '../context/DashboardContext';
import { NavigationRail } from './NavigationRail';
import { ErrorBoundary } from './ErrorBoundary';

const Header: React.FC = () => {
  const { loading, refetchAll } = useDashboardContext();

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0A0A0A]/90 backdrop-blur-md h-16 dashboard-content">
      <div className="h-full w-full px-6 lg:px-8 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-[#C6A96B]/10 border border-[#C6A96B]/15 text-[#C6A96B]">
            <LayoutDashboard size={18} />
          </div>
          <div>
            <h1 className="text-sm font-bold text-[#F5F1E8] tracking-tight">Sales Analytics</h1>
            <p className="text-[9px] text-[#7E786F] font-bold uppercase tracking-wider">Executive Intelligence</p>
          </div>
        </div>
        <button
          onClick={refetchAll}
          className="flex items-center gap-2 text-[11px] font-semibold px-3 py-1.5 rounded border border-white/5 hover:border-white/10 bg-[#141414] hover:bg-[#1A1A1A] text-[#B8B2A8] hover:text-white transition duration-200 active:scale-95 cursor-pointer"
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
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col">
      <Header />
      <NavigationRail />
      <div className="flex-1 flex flex-col">
        {children}
      </div>
      <footer className="dashboard-content py-8 border-t border-white/5 text-center bg-[#0A0A0A] mt-auto">
        <p className="text-[11px] text-[#7E786F]">
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
