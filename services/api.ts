import { FilterParams, DashboardSummary, DashboardCharts, Transaction, Dataset } from '../types';
import { 
  clientGetSummary, 
  clientGetCharts, 
  clientGetTransactions, 
  clientGetDatasets, 
  clientImportDataset, 
  clientDeleteDataset, 
  clientGetExportUrl 
} from './clientAnalyticsEngine';

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

export async function fetchDashboardSummary(filters: FilterParams): Promise<DashboardSummary> {
  return clientGetSummary(filters);
}

export async function fetchDashboardCharts(filters: FilterParams): Promise<DashboardCharts> {
  return clientGetCharts(filters);
}

export async function fetchTransactions(params: FetchTransactionsParams): Promise<PaginatedTransactionsResponse> {
  return clientGetTransactions(params);
}

export function getExportUrl(filters: FilterParams): string {
  return clientGetExportUrl(filters);
}

export async function fetchDatasets(): Promise<Dataset[]> {
  return clientGetDatasets();
}

export async function importDataset(name: string, transactions: any[]): Promise<Dataset> {
  return clientImportDataset(name, transactions);
}

export async function deleteDataset(id: string): Promise<{ success: boolean }> {
  return clientDeleteDataset(id);
}
