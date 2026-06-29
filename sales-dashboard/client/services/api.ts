import { FilterParams, DashboardSummary, DashboardCharts, Transaction } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function buildQueryParams(params: Record<string, any>): string {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      query.append(key, String(val));
    }
  });
  const str = query.toString();
  return str ? `?${str}` : '';
}

export async function fetchDashboardSummary(filters: FilterParams): Promise<DashboardSummary> {
  const query = buildQueryParams(filters);
  const res = await fetch(`${API_BASE_URL}/dashboard/summary${query}`);
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to fetch summary metrics.');
  }
  return res.json();
}

export async function fetchDashboardCharts(filters: FilterParams): Promise<DashboardCharts> {
  const query = buildQueryParams(filters);
  const res = await fetch(`${API_BASE_URL}/dashboard/charts${query}`);
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to fetch visualization charts.');
  }
  return res.json();
}

export interface PaginatedTransactionsResponse {
  transactions: Transaction[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FetchTransactionsParams extends FilterParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export async function fetchTransactions(params: FetchTransactionsParams): Promise<PaginatedTransactionsResponse> {
  const query = buildQueryParams(params);
  const res = await fetch(`${API_BASE_URL}/transactions${query}`);
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to fetch transaction logs.');
  }
  return res.json();
}

export function getExportUrl(filters: FilterParams): string {
  const query = buildQueryParams(filters);
  return `${API_BASE_URL}/transactions/export${query}`;
}
