import { FilterParams, DashboardSummary, DashboardCharts, Transaction, Dataset } from '../types';

function getApiUrl(path: string): string {
  let base = 'http://127.0.0.1:5000/api';
  
  if (typeof window !== 'undefined') {
    let hostname = window.location.hostname;
    if (hostname === 'localhost') {
      hostname = '127.0.0.1';
    }
    base = `http://${hostname}:5000/api`;
  }
  
  // If env variable is explicitly provided, honor it
  if (process.env.NEXT_PUBLIC_API_URL) {
    base = process.env.NEXT_PUBLIC_API_URL;
  }

  // Force-swap localhost to 127.0.0.1 to avoid Windows DNS resolution bugs
  if (base.includes('localhost')) {
    base = base.replace('localhost', '127.0.0.1');
  }
  
  return `${base}${path}`;
}

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
  const res = await fetch(getApiUrl(`/dashboard/summary${query}`));
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to fetch summary metrics.');
  }
  return res.json();
}

export async function fetchDashboardCharts(filters: FilterParams): Promise<DashboardCharts> {
  const query = buildQueryParams(filters);
  const res = await fetch(getApiUrl(`/dashboard/charts${query}`));
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
  const res = await fetch(getApiUrl(`/transactions${query}`));
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to fetch transaction logs.');
  }
  return res.json();
}

export function getExportUrl(filters: FilterParams): string {
  const query = buildQueryParams(filters);
  return getApiUrl(`/transactions/export${query}`);
}

export async function fetchDatasets(): Promise<Dataset[]> {
  const res = await fetch(getApiUrl('/datasets'));
  if (!res.ok) {
    throw new Error('Failed to fetch datasets list.');
  }
  return res.json();
}

export async function importDataset(name: string, transactions: any[]): Promise<Dataset> {
  const res = await fetch(getApiUrl('/datasets/import'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, transactions })
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to import dataset.');
  }
  return res.json();
}

export async function deleteDataset(id: string): Promise<{ success: boolean }> {
  const res = await fetch(getApiUrl(`/datasets/${id}`), {
    method: 'DELETE'
  });
  if (!res.ok) {
    throw new Error('Failed to delete dataset.');
  }
  return res.json();
}
