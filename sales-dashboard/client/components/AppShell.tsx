'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { 
  Sun, Moon, Download, Search, Calendar, Database 
} from 'lucide-react';
import { DashboardProvider, useDashboardContext } from '../context/DashboardContext';
import { NavigationRail } from './NavigationRail';
import { ErrorBoundary } from './ErrorBoundary';

const TopContextBar: React.FC = () => {
  const pathname = usePathname();
  const { 
    theme, toggleTheme, datasets, filters, 
    setDatasetFilter, searchVal, setSearchVal, 
    setDateRangeFilter, handleExport 
  } = useDashboardContext();

  // Hide Top Context Bar on the Data Intake (/) upload route
  if (pathname === '/') return null;

  const getPageTitle = () => {
    switch (pathname) {
      case '/overview':
        return 'Overview Cockpit';
      case '/revenue':
        return 'Revenue War Room';
      case '/markets':
        return 'Market Performance';
      case '/regions':
        return 'Regions Analytics';
      case '/customers':
        return 'Client Intelligence';
      case '/risk':
        return 'Risk Analysis';
      case '/ledger':
        return 'Transaction Ledger';
      case '/forecast':
        return 'Predictive Intelligence';
      case '/settings':
        return 'System Settings';
      default:
        return 'Analytical Console';
    }
  };

  const activeDatasetName = filters.datasetId === 'all'
    ? 'All Combined'
    : datasets.find(d => d.id === filters.datasetId)?.name || 'Combined Dataset';

  return (
    <div className="sticky top-0 z-40 bg-[var(--surface-color)] border-b border-[var(--border-color)] h-[72px] flex items-center transition-colors">
      <div className="w-full shell-container flex flex-wrap items-center justify-between gap-4">
        {/* Route Title & Dataset Label */}
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-sm font-extrabold text-[var(--text-primary)] tracking-tight">
              {getPageTitle()}
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Database size={10} className="text-[var(--accent-color)]" />
              <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                Dataset: {activeDatasetName}
              </span>
            </div>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex flex-wrap items-center gap-3.5">
          {/* Dataset Switcher */}
          <div className="flex items-center gap-1.5">
            <select
              value={filters.datasetId || 'all'}
              onChange={(e) => setDatasetFilter(e.target.value)}
              className="fintech-select py-1.5 px-2.5 text-xs font-semibold"
            >
              <option value="all">Combine All Datasets</option>
              {datasets.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.rowCount.toLocaleString()} rows)
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker Range */}
          <div className="flex items-center gap-1">
            <Calendar size={12} className="text-[var(--text-secondary)]" />
            <input
              type="date"
              value={filters.startDate || ''}
              onChange={(e) => setDateRangeFilter(e.target.value, filters.endDate || '')}
              className="fintech-input py-1 px-1.5 text-[11px] font-semibold w-[105px]"
            />
            <span className="text-[var(--text-secondary)] text-[10px]">→</span>
            <input
              type="date"
              value={filters.endDate || ''}
              onChange={(e) => setDateRangeFilter(filters.startDate || '', e.target.value)}
              className="fintech-input py-1 px-1.5 text-[11px] font-semibold w-[105px]"
            />
          </div>

          {/* Search box */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 text-[var(--text-secondary)]" size={13} />
            <input
              type="text"
              placeholder="Search data..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="fintech-input pl-8 py-1.5 w-[140px] text-xs font-semibold"
            />
          </div>

          {/* Theme Toggler */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg border border-[var(--border-color)] hover:bg-[rgba(148,163,184,0.05)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition cursor-pointer"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </button>

          {/* Export Button */}
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-[var(--accent-color)] rounded-lg shadow-sm hover:opacity-90 transition active:scale-95 cursor-pointer"
          >
            <Download size={12} />
            Export
          </button>
        </div>
      </div>
    </div>
  );
};

const ShellContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isSidebarCollapsed } = useDashboardContext();
  const pathname = usePathname();

  // If on home/upload screen, we do not want sidebar offset on desktop, or wait:
  // "Sidebar Persistent. Overview, Revenue, Markets... 72px collapsed, 240px expanded."
  // This means the sidebar is persistent on ALL views. So we keep the offset on all pages!
  const offsetClass = isSidebarCollapsed 
    ? 'main-layout-offset-collapsed' 
    : 'main-layout-offset-expanded';

  return (
    <div className="min-h-screen bg-[var(--bg-color)] flex flex-col transition-colors">
      <NavigationRail />
      
      {/* Container Offset holding Context Bar and Content canvas */}
      <div className={`flex-1 flex flex-col ${offsetClass}`}>
        <TopContextBar />
        
        <main className="flex-1 flex flex-col pt-4 pb-12">
          {children}
        </main>

        <footer className="py-6 border-t border-[var(--border-color)] text-center mt-auto">
          <p className="text-[11px] text-[var(--text-secondary)]">
            Analytical Console &copy; {new Date().getFullYear()} Auro Studios. All rights reserved.
          </p>
        </footer>
      </div>
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
