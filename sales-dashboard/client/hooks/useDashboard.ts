'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  FilterParams, 
  DashboardSummary, 
  DashboardCharts, 
} from '../types';
import { 
  fetchDashboardSummary, 
  fetchDashboardCharts, 
  fetchTransactions,
  getExportUrl,
  PaginatedTransactionsResponse
} from '../services/api';

export function useDashboard() {
  // Filter States
  const [filters, setFilters] = useState<FilterParams>({
    startDate: '',
    endDate: '',
    category: '',
    region: '',
    search: '',
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
    summary: true,
    charts: true,
    transactions: true,
  });

  // Error States
  const [errors, setErrors] = useState<{
    summary: string | null;
    charts: string | null;
    transactions: string | null;
  }>({
    summary: null,
    charts: null,
    transactions: null,
  });

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

  // Combined fetch trigger
  useEffect(() => {
    loadSummaryAndCharts();
  }, [loadSummaryAndCharts]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  // Filter setters
  const setCategoryFilter = useCallback((category: string) => {
    setFilters(prev => ({ ...prev, category }));
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  const setRegionFilter = useCallback((region: string) => {
    setFilters(prev => ({ ...prev, region }));
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  const setDateRangeFilter = useCallback((startDate: string, endDate: string) => {
    setFilters(prev => ({ ...prev, startDate, endDate }));
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  const resetFilters = useCallback(() => {
    setSearchVal('');
    setFilters({
      startDate: '',
      endDate: '',
      category: '',
      region: '',
      search: '',
    });
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
    setCategoryFilter,
    setRegionFilter,
    setDateRangeFilter,
    resetFilters,
    setPage,
    setLimit,
    handleExport,
    refetchAll: () => {
      loadSummaryAndCharts();
      loadTransactions();
    }
  };
}
