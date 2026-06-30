'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  FilterParams, 
  DashboardSummary, 
  DashboardCharts, 
  Dataset
} from '../types';
import { 
  fetchDashboardSummary, 
  fetchDashboardCharts, 
  fetchTransactions,
  getExportUrl,
  fetchDatasets,
  importDataset,
  deleteDataset,
  PaginatedTransactionsResponse
} from '../services/api';

export function useDashboard() {
  // Theme State ('dark' | 'light')
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Datasets list
  const [datasets, setDatasets] = useState<Dataset[]>([]);

  // Filter States
  const [filters, setFilters] = useState<FilterParams>({
    startDate: '',
    endDate: '',
    category: '',
    region: '',
    search: '',
    status: '',
    datasetId: 'all', // 'all' means combine all datasets
  });

  // Search input state before debounce
  const [searchVal, setSearchVal] = useState('');
  const initialMount = useRef(true);

  // Pagination State
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
  });

  // Sorting State
  const [sorting, setSorting] = useState<{ sortBy: string; sortOrder: 'asc' | 'desc' }>({
    sortBy: 'transactionDate',
    sortOrder: 'desc',
  });

  // Data States
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [charts, setCharts] = useState<DashboardCharts | null>(null);
  const [transactionsData, setTransactionsData] = useState<PaginatedTransactionsResponse | null>(null);

  // Loading States
  const [loading, setLoading] = useState({
    summary: false,
    charts: false,
    transactions: false,
    datasets: true,
    importing: false,
  });

  // Error States
  const [errors, setErrors] = useState<{
    summary: string | null;
    charts: string | null;
    transactions: string | null;
    datasets: string | null;
  }>({
    summary: null,
    charts: null,
    transactions: null,
    datasets: null,
  });

  // Theme Sync on Mount
  useEffect(() => {
    // Check manual preference or system default
    const savedTheme = localStorage.getItem('analytics-theme') as 'dark' | 'light';
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
    setTheme(initialTheme);
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add(initialTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('analytics-theme', next);
      document.documentElement.classList.remove('dark', 'light');
      document.documentElement.classList.add(next);
      return next;
    });
  }, []);

  // Debounce searchVal -> filters.search
  useEffect(() => {
    if (initialMount.current) {
      initialMount.current = false;
      return;
    }
    const handler = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchVal }));
      setPagination(prev => ({ ...prev, page: 1 }));
    }, 500);

    return () => clearTimeout(handler);
  }, [searchVal]);

  // Fetch Datasets List
  const loadDatasets = useCallback(async () => {
    setLoading(prev => ({ ...prev, datasets: true }));
    setErrors(prev => ({ ...prev, datasets: null }));
    try {
      const res = await fetchDatasets();
      setDatasets(res);
      // If there's at least one dataset and current selection is 'all' or empty, we can default to 'all'
    } catch (err: any) {
      console.error('Error fetching datasets:', err);
      setErrors(prev => ({ ...prev, datasets: err.message || 'Failed to load datasets.' }));
    } finally {
      setLoading(prev => ({ ...prev, datasets: false }));
    }
  }, []);

  // Fetch summary and charts when filters change
  const loadSummaryAndCharts = useCallback(async () => {
    setLoading(prev => ({ ...prev, summary: true, charts: true }));
    setErrors(prev => ({ ...prev, summary: null, charts: null }));

    try {
      const [sumRes, chartRes] = await Promise.all([
        fetchDashboardSummary(filters),
        fetchDashboardCharts(filters)
      ]);
      setSummary(sumRes);
      setCharts(chartRes);
    } catch (err: any) {
      console.error('Error fetching dashboard summary/charts:', err);
      setErrors(prev => ({
        ...prev,
        summary: err.message || 'Failed to load summary stats.',
        charts: err.message || 'Failed to load dashboard charts.',
      }));
    } finally {
      setLoading(prev => ({ ...prev, summary: false, charts: false }));
    }
  }, [filters]);

  // Fetch transactions when filters, pagination, or sorting change
  const loadTransactions = useCallback(async () => {
    setLoading(prev => ({ ...prev, transactions: true }));
    setErrors(prev => ({ ...prev, transactions: null }));

    try {
      const res = await fetchTransactions({
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
        sortBy: sorting.sortBy,
        sortOrder: sorting.sortOrder,
      });
      setTransactionsData(res);
    } catch (err: any) {
      console.error('Error fetching transactions:', err);
      setErrors(prev => ({
        ...prev,
        transactions: err.message || 'Failed to load transactions.'
      }));
    } finally {
      setLoading(prev => ({ ...prev, transactions: false }));
    }
  }, [filters, pagination.page, pagination.limit, sorting.sortBy, sorting.sortOrder]);

  // Initial load of datasets
  useEffect(() => {
    loadDatasets();
  }, [loadDatasets]);

  // Combined fetch trigger on filter changes
  useEffect(() => {
    loadSummaryAndCharts();
  }, [loadSummaryAndCharts]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  // Upload dynamic file logic
  const uploadDataset = useCallback(async (name: string, transactionsRows: any[]) => {
    setLoading(prev => ({ ...prev, importing: true }));
    try {
      const dataset = await importDataset(name, transactionsRows);
      await loadDatasets();
      // Set active filter to the newly uploaded dataset
      setFilters(prev => ({ ...prev, datasetId: dataset.id }));
      return dataset;
    } catch (err: any) {
      console.error('Upload failed:', err);
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, importing: false }));
    }
  }, [loadDatasets]);

  // Delete dataset logic
  const removeDataset = useCallback(async (id: string) => {
    try {
      await deleteDataset(id);
      await loadDatasets();
      // If deleted active dataset, switch back to 'all'
      setFilters(prev => {
        if (prev.datasetId === id) {
          return { ...prev, datasetId: 'all' };
        }
        return prev;
      });
    } catch (err: any) {
      console.error('Delete failed:', err);
      throw err;
    }
  }, [loadDatasets]);

  // Filter setters
  const setDatasetFilter = useCallback((datasetId: string) => {
    setFilters(prev => ({ ...prev, datasetId }));
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  const setCategoryFilter = useCallback((category: string) => {
    setFilters(prev => ({ ...prev, category }));
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  const setRegionFilter = useCallback((region: string) => {
    setFilters(prev => ({ ...prev, region }));
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  const setStatusFilter = useCallback((status: string) => {
    setFilters(prev => ({ ...prev, status }));
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  const setDateRangeFilter = useCallback((startDate: string, endDate: string) => {
    setFilters(prev => ({ ...prev, startDate, endDate }));
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  const resetFilters = useCallback(() => {
    setSearchVal('');
    setFilters(prev => ({
      startDate: '',
      endDate: '',
      category: '',
      region: '',
      search: '',
      status: '',
      datasetId: prev.datasetId, // retain selected dataset context
    }));
    setPagination({ page: 1, limit: 10 });
    setSorting({ sortBy: 'transactionDate', sortOrder: 'desc' });
  }, []);

  // Pagination helpers
  const setPage = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  const setLimit = useCallback((limit: number) => {
    setPagination(prev => ({ ...prev, limit, page: 1 }));
  }, []);

  // Export helper
  const exportCsvUrl = getExportUrl(filters);

  const handleExport = useCallback(() => {
    window.open(exportCsvUrl, '_blank');
  }, [exportCsvUrl]);

  return {
    theme,
    toggleTheme,
    datasets,
    filters,
    searchVal,
    setSearchVal,
    pagination,
    sorting,
    setSorting,
    summary,
    charts,
    transactionsResponse: transactionsData,
    loading,
    errors,
    uploadDataset,
    removeDataset,
    setDatasetFilter,
    setCategoryFilter,
    setRegionFilter,
    setStatusFilter,
    setDateRangeFilter,
    resetFilters,
    setPage,
    setLimit,
    handleExport,
    refetchAll: useCallback(() => {
      loadDatasets();
      loadSummaryAndCharts();
      loadTransactions();
    }, [loadDatasets, loadSummaryAndCharts, loadTransactions])
  };
}
