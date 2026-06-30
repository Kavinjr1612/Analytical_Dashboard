'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useDashboard } from '../hooks/useDashboard';
import { FilterParams, DashboardSummary, DashboardCharts, Dataset } from '../types';
import { PaginatedTransactionsResponse } from '../services/api';

interface DashboardContextType {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  datasets: Dataset[];
  filters: FilterParams;
  searchVal: string;
  setSearchVal: (val: string) => void;
  pagination: { page: number; limit: number };
  sorting: { sortBy: string; sortOrder: 'asc' | 'desc' };
  setSorting: (sorting: { sortBy: string; sortOrder: 'asc' | 'desc' }) => void;
  summary: DashboardSummary | null;
  charts: DashboardCharts | null;
  transactionsResponse: PaginatedTransactionsResponse | null;
  loading: { summary: boolean; charts: boolean; transactions: boolean; datasets: boolean; importing: boolean };
  errors: { summary: string | null; charts: string | null; transactions: string | null; datasets: string | null };
  uploadDataset: (name: string, transactionsRows: any[]) => Promise<any>;
  removeDataset: (id: string) => Promise<void>;
  setDatasetFilter: (datasetId: string) => void;
  setCategoryFilter: (category: string) => void;
  setRegionFilter: (region: string) => void;
  setStatusFilter: (status: string) => void;
  setDateRangeFilter: (startDate: string, endDate: string) => void;
  resetFilters: () => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  handleExport: () => void;
  refetchAll: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const dashboardState = useDashboard();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);

  const toggleSidebar = React.useCallback(() => {
    setIsSidebarCollapsed(prev => !prev);
  }, []);

  return (
    <DashboardContext.Provider value={{
      ...dashboardState,
      isSidebarCollapsed,
      toggleSidebar
    }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboardContext = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboardContext must be used within a DashboardProvider');
  }
  return context;
};
