import { 
  FilterParams, 
  DashboardSummary, 
  DashboardCharts, 
  Transaction, 
  Dataset 
} from '../types';

export interface ExtendedTransaction extends Transaction {
  datasetId: string;
}

const STORAGE_KEY_DATASETS = 'analytics_client_datasets';
const STORAGE_KEY_TRANSACTIONS = 'analytics_client_transactions';

// Simple UUID generator for browser environment
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Generate realistic initial seed dataset if client storage is empty
function createDefaultSeedData(): { dataset: Dataset; transactions: ExtendedTransaction[] } {
  const datasetId = 'default-sample-dataset-uuid';
  const defaultDataset: Dataset = {
    id: datasetId,
    name: 'Sample Enterprise Sales Dataset',
    importedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    rowCount: 350
  };

  const categories = ['Cloud Services', 'Hardware', 'Software Subscriptions', 'Consulting', 'Cybersecurity'];
  const regions = ['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East'];
  const statuses: ('Completed' | 'Pending' | 'Cancelled')[] = ['Completed', 'Completed', 'Completed', 'Completed', 'Pending', 'Cancelled'];
  
  const customers = [
    'Acme Corp', 'Global Logistics Inc', 'Apex Technologies', 'Nexus Health', 'Starlight Media',
    'Vanguard Systems', 'Hyperion Dynamics', 'Pulse Financial', 'Horizon Cloud', 'Quantum Retail',
    'Zenith Robotics', 'Summit Energy', 'BioHealth Labs', 'Titan Software', 'Beacon Security',
    'Atlas Mobility', 'Pinnacle Capital', 'Vector Manufacturing', 'Omni Interactive', 'Echo Telecom'
  ];

  const products: Record<string, string[]> = {
    'Cloud Services': ['AWS Enterprise Node', 'Azure Hybrid Cluster', 'Cloudflare CDN Enterprise', 'Google Cloud Compute'],
    'Hardware': ['Dell PowerEdge R750', 'Cisco Catalyst 9300', 'Apple MacBook Pro M3', 'HP Enterprise Storage Unit'],
    'Software Subscriptions': ['Salesforce Enterprise License', 'Jira Software Premium', 'Slack Enterprise Grid', 'Office 365 E5'],
    'Consulting': ['Security Audit & Compliance', 'Cloud Migration Strategy', 'Data Engineering Sprint', 'AI Implementation Workshop'],
    'Cybersecurity': ['Palo Alto Next-Gen Firewall', 'CrowdStrike Falcon Suite', 'Okta Identity Cloud', 'Splunk Enterprise SIEM']
  };

  const transactions: ExtendedTransaction[] = [];
  const now = new Date();

  for (let i = 0; i < 350; i++) {
    const cat = categories[i % categories.length];
    const reg = regions[(i * 3) % regions.length];
    const status = statuses[(i * 7) % statuses.length];
    const cust = customers[i % customers.length];
    const prodList = products[cat];
    const prod = prodList[i % prodList.length];

    // Spread dates across the last 12 months
    const daysAgo = Math.floor(Math.random() * 365);
    const txDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

    // Base price per category + variation
    const baseAmounts: Record<string, number> = {
      'Cloud Services': 3500,
      'Hardware': 4800,
      'Software Subscriptions': 1200,
      'Consulting': 8500,
      'Cybersecurity': 6200
    };
    const variation = (Math.random() * 0.6 + 0.7); // 70% to 130%
    const amount = Math.round(baseAmounts[cat] * variation * 100) / 100;

    transactions.push({
      id: generateUUID(),
      customerName: cust,
      productName: prod,
      category: cat,
      region: reg,
      amount,
      status,
      transactionDate: txDate.toISOString(),
      datasetId
    });
  }

  return { dataset: defaultDataset, transactions };
}

// In-Memory fallback cache for SSR or when storage is empty
let cachedDatasets: Dataset[] | null = null;
let cachedTransactions: ExtendedTransaction[] | null = null;

function loadStoredData(): { datasets: Dataset[]; transactions: ExtendedTransaction[] } {
  if (typeof window === 'undefined') {
    const seed = createDefaultSeedData();
    return { datasets: [seed.dataset], transactions: seed.transactions };
  }

  if (cachedDatasets && cachedTransactions) {
    return { datasets: cachedDatasets, transactions: cachedTransactions };
  }

  try {
    const dsRaw = localStorage.getItem(STORAGE_KEY_DATASETS);
    const txRaw = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);

    if (dsRaw && txRaw) {
      cachedDatasets = JSON.parse(dsRaw);
      cachedTransactions = JSON.parse(txRaw);
      return { datasets: cachedDatasets!, transactions: cachedTransactions! };
    }
  } catch (e) {
    console.error('Error loading client analytics storage:', e);
  }

  // Seed default data if none exists
  const seed = createDefaultSeedData();
  cachedDatasets = [seed.dataset];
  cachedTransactions = seed.transactions;
  saveStoredData(cachedDatasets, cachedTransactions);
  return { datasets: cachedDatasets, transactions: cachedTransactions };
}

function saveStoredData(datasets: Dataset[], transactions: ExtendedTransaction[]) {
  cachedDatasets = datasets;
  cachedTransactions = transactions;

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY_DATASETS, JSON.stringify(datasets));
      localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(transactions));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }
}

// Filter evaluation engine
function filterTransactions(transactions: ExtendedTransaction[], filters: FilterParams): ExtendedTransaction[] {
  const { startDate, endDate, category, region, search, status, datasetId } = filters;

  return transactions.filter(t => {
    if (datasetId && datasetId !== 'all' && t.datasetId !== datasetId) {
      return false;
    }
    if (category && t.category !== category) {
      return false;
    }
    if (region && t.region !== region) {
      return false;
    }
    if (status && t.status.toLowerCase() !== status.toLowerCase()) {
      return false;
    }
    if (startDate) {
      const tTime = new Date(t.transactionDate).getTime();
      const sTime = new Date(startDate).getTime();
      if (tTime < sTime) return false;
    }
    if (endDate) {
      const tTime = new Date(t.transactionDate).getTime();
      const eDate = new Date(endDate);
      if (!endDate.includes('T')) {
        eDate.setHours(23, 59, 59, 999);
      }
      if (tTime > eDate.getTime()) return false;
    }
    if (search) {
      const q = search.trim().toLowerCase();
      if (q) {
        const custMatch = t.customerName.toLowerCase().includes(q);
        const prodMatch = t.productName.toLowerCase().includes(q);
        if (!custMatch && !prodMatch) return false;
      }
    }
    return true;
  });
}

// API Implementation Functions
export async function clientGetSummary(filters: FilterParams): Promise<DashboardSummary> {
  const { transactions } = loadStoredData();
  const filtered = filterTransactions(transactions, filters);

  if (filtered.length === 0) {
    return {
      totalRevenue: 0,
      totalOrders: 0,
      averageOrderValue: 0,
      totalCustomers: 0,
      topSellingCategory: 'N/A',
      bestPerformingRegion: 'N/A'
    };
  }

  let totalRevenue = 0;
  const uniqueCustomers = new Set<string>();
  const categoryTotals: Record<string, number> = {};
  const regionTotals: Record<string, number> = {};

  filtered.forEach(t => {
    const amt = Number(t.amount) || 0;
    totalRevenue += amt;
    uniqueCustomers.add(t.customerName);

    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + amt;
    regionTotals[t.region] = (regionTotals[t.region] || 0) + amt;
  });

  const totalOrders = filtered.length;
  const averageOrderValue = Math.round((totalRevenue / totalOrders) * 100) / 100;

  // Find top category
  let topSellingCategory = 'N/A';
  let maxCatVal = -1;
  Object.entries(categoryTotals).forEach(([cat, val]) => {
    if (val > maxCatVal) {
      maxCatVal = val;
      topSellingCategory = cat;
    }
  });

  // Find best region
  let bestPerformingRegion = 'N/A';
  let maxRegVal = -1;
  Object.entries(regionTotals).forEach(([reg, val]) => {
    if (val > maxRegVal) {
      maxRegVal = val;
      bestPerformingRegion = reg;
    }
  });

  return {
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    totalOrders,
    averageOrderValue,
    totalCustomers: uniqueCustomers.size,
    topSellingCategory,
    bestPerformingRegion
  };
}

export async function clientGetCharts(filters: FilterParams): Promise<DashboardCharts> {
  const { transactions } = loadStoredData();
  const filtered = filterTransactions(transactions, filters);

  // 1. Revenue Trend (Daily vs Monthly)
  let isDaily = false;
  if (filters.startDate && filters.endDate) {
    const start = new Date(filters.startDate).getTime();
    const end = new Date(filters.endDate).getTime();
    const diffDays = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24));
    if (diffDays <= 31) {
      isDaily = true;
    }
  }

  const trendMap: Record<string, number> = {};
  const categoryMap: Record<string, number> = {};
  const regionMap: Record<string, number> = {};
  const statusMap: Record<string, number> = {};

  filtered.forEach(t => {
    const d = new Date(t.transactionDate);
    const dateKey = isDaily 
      ? d.toISOString().slice(0, 10) 
      : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    
    const amt = Number(t.amount) || 0;

    trendMap[dateKey] = (trendMap[dateKey] || 0) + amt;
    categoryMap[t.category] = (categoryMap[t.category] || 0) + amt;
    regionMap[t.region] = (regionMap[t.region] || 0) + amt;
    statusMap[t.status] = (statusMap[t.status] || 0) + 1;
  });

  const revenueTrend = Object.keys(trendMap)
    .sort()
    .map(date => ({
      date,
      revenue: Math.round(trendMap[date] * 100) / 100
    }));

  const salesByCategory = Object.keys(categoryMap)
    .map(category => ({
      category,
      value: Math.round(categoryMap[category] * 100) / 100
    }))
    .sort((a, b) => b.value - a.value);

  const salesByRegion = Object.keys(regionMap)
    .map(region => ({
      region,
      value: Math.round(regionMap[region] * 100) / 100
    }))
    .sort((a, b) => b.value - a.value);

  const orderStatusDistribution = Object.keys(statusMap)
    .map(status => ({
      status,
      count: statusMap[status]
    }));

  return {
    revenueTrend,
    salesByCategory,
    salesByRegion,
    orderStatusDistribution
  };
}

export async function clientGetTransactions(params: any): Promise<{
  transactions: Transaction[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  const { page = 1, limit = 10, sortBy = 'transactionDate', sortOrder = 'desc' } = params;
  const { transactions } = loadStoredData();
  const filtered = filterTransactions(transactions, params);

  // Sorting
  const sorted = [...filtered].sort((a: any, b: any) => {
    let valA = a[sortBy];
    let valB = b[sortBy];

    if (sortBy === 'transactionDate') {
      valA = new Date(valA).getTime();
      valB = new Date(valB).getTime();
    } else if (typeof valA === 'string') {
      valA = valA.toLowerCase();
      valB = (valB || '').toLowerCase();
    }

    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const pageNum = Math.max(1, parseInt(String(page)) || 1);
  const limitNum = Math.max(1, parseInt(String(limit)) || 10);
  const offset = (pageNum - 1) * limitNum;

  const paginated = sorted.slice(offset, offset + limitNum);
  const totalCount = sorted.length;
  const totalPages = Math.ceil(totalCount / limitNum);

  return {
    transactions: paginated,
    totalCount,
    page: pageNum,
    limit: limitNum,
    totalPages
  };
}

export async function clientGetDatasets(): Promise<Dataset[]> {
  const { datasets } = loadStoredData();
  return datasets;
}

export async function clientImportDataset(name: string, rawTransactions: any[]): Promise<Dataset> {
  const { datasets, transactions } = loadStoredData();
  const datasetId = generateUUID();

  const newDataset: Dataset = {
    id: datasetId,
    name: name || 'Uploaded Dataset',
    importedAt: new Date().toISOString(),
    rowCount: rawTransactions.length
  };

  const newTransactions: ExtendedTransaction[] = rawTransactions.map(t => ({
    id: generateUUID(),
    customerName: String(t.customerName || t.customer || 'Unknown Customer'),
    productName: String(t.productName || t.product || 'Standard Item'),
    category: String(t.category || 'General'),
    region: String(t.region || 'National'),
    amount: Number(t.amount || t.revenue || 0),
    status: (t.status || 'Completed') as any,
    transactionDate: t.transactionDate ? new Date(t.transactionDate).toISOString() : new Date().toISOString(),
    datasetId
  }));

  const updatedDatasets = [newDataset, ...datasets];
  const updatedTransactions = [...newTransactions, ...transactions];

  saveStoredData(updatedDatasets, updatedTransactions);
  return newDataset;
}

export async function clientDeleteDataset(id: string): Promise<{ success: boolean }> {
  const { datasets, transactions } = loadStoredData();
  const updatedDatasets = datasets.filter(d => d.id !== id);
  const updatedTransactions = transactions.filter(t => t.datasetId !== id);

  saveStoredData(updatedDatasets, updatedTransactions);
  return { success: true };
}

export function clientGetExportUrl(filters: FilterParams): string {
  // Generate CSV text string and encode into a data URI or Blob URL
  const { transactions } = loadStoredData();
  const filtered = filterTransactions(transactions, filters);

  const headers = ['Transaction ID', 'Customer Name', 'Product Name', 'Category', 'Region', 'Amount', 'Status', 'Transaction Date'];
  
  const escapeCSV = (val: any) => {
    const str = String(val ?? '').replace(/"/g, '""');
    return str.includes(',') || str.includes('"') || str.includes('\n') ? `"${str}"` : str;
  };

  const rows = filtered.map(t => [
    t.id,
    t.customerName,
    t.productName,
    t.category,
    t.region,
    t.amount.toString(),
    t.status,
    t.transactionDate
  ].map(escapeCSV).join(','));

  const csvContent = [headers.join(','), ...rows].join('\n');
  return `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`;
}
