'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Sun, Moon, UploadCloud, Search, Calendar, Database, BookOpen 
} from 'lucide-react';
import { DashboardProvider, useDashboardContext } from '../context/DashboardContext';
import { NavigationRail } from './NavigationRail';
import { ErrorBoundary } from './ErrorBoundary';
import { GlossaryDrawer } from './GlossaryDrawer';

const TopContextBar: React.FC<{ onOpenGlossary: () => void }> = ({ onOpenGlossary }) => {
  const pathname = usePathname();
  const { 
    theme, toggleTheme, datasets, filters, 
    setDatasetFilter, searchVal, setSearchVal, 
    setDateRangeFilter, activeSchema 
  } = useDashboardContext();

  const isHome = pathname === '/';

  const getPageTitle = () => {
    switch (pathname) {
      case '/':
        return 'Data Intake Portal';
      case '/overview':
        return 'Overview Cockpit';
      case '/revenue':
        return `${activeSchema.amount || 'Value'} Analysis`;
      case '/markets':
        return `${activeSchema.category || 'Category'} Breakdown`;
      case '/regions':
        return `${activeSchema.region || 'Region'} Distribution`;
      case '/customers':
        return `${activeSchema.customerName || 'Identifier'} Cohorts`;
      case '/risk':
        return `${activeSchema.status || 'Status'} Anomalies`;
      case '/ledger':
        return `${activeSchema.amount || 'Value'} Ledger`;
      case '/forecast':
        return `${activeSchema.amount || 'Value'} Forecast`;
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
    <div className="sticky top-0 z-40 bg-[var(--surface-color)] border-b border-[var(--border-color)] h-[88px] flex items-center transition-colors">
      <div className="w-full shell-container max-w-[1700px] mx-auto flex items-center justify-between gap-6">
        {/* Route Title & Dataset Label */}
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-base font-semibold text-[var(--text-primary)] tracking-tight">
              {getPageTitle()}
            </h2>
            {!isHome && (
              <div className="flex items-center gap-1.5 mt-1">
                <Database size={10} className="text-[var(--accent-color)]" />
                <span className="text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                  Dataset: {activeDatasetName}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-6">
          {!isHome && (
            <>
              {/* Dataset Switcher */}
              <div className="flex items-center">
                <select
                  value={filters.datasetId || 'all'}
                  onChange={(e) => setDatasetFilter(e.target.value)}
                  className="fintech-select h-11 px-4 text-xs font-medium"
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
              <div className="flex items-center gap-3">
                <Calendar size={13} className="text-[var(--text-secondary)] flex-shrink-0" />
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={filters.startDate || ''}
                    onChange={(e) => setDateRangeFilter(e.target.value, filters.endDate || '')}
                    className="fintech-input h-11 px-4 w-[145px] text-xs font-medium"
                    placeholder="dd-mm-yyyy"
                  />
                  <span className="text-[var(--text-secondary)] text-[10px] font-semibold">→</span>
                  <input
                    type="date"
                    value={filters.endDate || ''}
                    onChange={(e) => setDateRangeFilter(filters.startDate || '', e.target.value)}
                    className="fintech-input h-11 px-4 w-[145px] text-xs font-medium"
                    placeholder="dd-mm-yyyy"
                  />
                </div>
              </div>

              {/* Search box */}
              <div className="relative">
                <Search className="absolute left-3.5 top-[15.5px] text-[var(--text-secondary)]" size={13} />
                <input
                  type="text"
                  placeholder={`Search by ${activeSchema.customerName || 'identifier'}...`}
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  style={{ paddingLeft: '40px' }}
                  className="fintech-input pr-4 w-[230px] h-11 text-xs font-medium bg-[var(--bg-color)]/30 border-[var(--border-color)] hover:border-[var(--accent-color)]/35 focus:bg-[var(--surface-color)]"
                />
              </div>

              {/* Data Dictionary Toggler */}
              <button
                onClick={onOpenGlossary}
                className="h-11 inline-flex items-center justify-center gap-2 px-4 rounded-lg border border-[var(--border-color)] hover:bg-[rgba(148,163,184,0.04)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-semibold text-xs transition cursor-pointer"
                title="Open Data Glossary"
              >
                <BookOpen size={13} />
                Dictionary
              </button>

              {/* Import CSV Link Button */}
              <Link
                href="/"
                className="h-11 inline-flex items-center justify-center gap-2 px-5 text-xs font-semibold text-white bg-[var(--accent-color)] rounded-lg shadow-sm hover:opacity-95 transition active:scale-[0.98] cursor-pointer"
                title="Upload / Import CSV Dataset"
              >
                <UploadCloud size={13} />
                Import CSV
              </Link>
            </>
          )}

          {/* Theme Toggler (Always at absolute right) */}
          <button
            onClick={toggleTheme}
            className="h-11 w-11 inline-flex items-center justify-center rounded-lg border border-[var(--border-color)] hover:bg-[rgba(148,163,184,0.04)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition cursor-pointer"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);

  return (
    <ErrorBoundary>
      <DashboardProvider>
        <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-primary)] flex font-sans antialiased selection:bg-[var(--accent-color)] selection:text-white transition-colors">
          {/* Collapsible / Responsive Navigation Rail */}
          <NavigationRail />

          {/* Main Workspace Column */}
          <div className="flex-1 flex flex-col min-w-0">
            <TopContextBar onOpenGlossary={() => setIsGlossaryOpen(true)} />

            <main className="flex-1 pb-16 px-4 sm:px-6 lg:px-8">
              {children}
            </main>

            {/* Global Footer */}
            <footer className="py-6 border-t border-[var(--border-color)] bg-[var(--surface-color)]/50 text-[10px] font-semibold text-[var(--text-secondary)] text-center tracking-widest uppercase transition-colors">
              Analytical Console · © 2026 Executive Analytics. All rights reserved.
            </footer>
          </div>
        </div>

        {/* Global Metric Glossary Drawer */}
        <GlossaryDrawer isOpen={isGlossaryOpen} onClose={() => setIsGlossaryOpen(false)} />
      </DashboardProvider>
    </ErrorBoundary>
  );
};
