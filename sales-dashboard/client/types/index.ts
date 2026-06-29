export interface Transaction {
  id: string;
  customerName: string;
  productName: string;
  category: string;
  region: string;
  amount: number;
  status: 'Completed' | 'Pending' | 'Cancelled';
  transactionDate: string;
}

export interface DashboardSummary {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  totalCustomers: number;
  topSellingCategory: string;
  bestPerformingRegion: string;
}

export interface RevenueTrendPoint {
  date: string;
  revenue: number;
}

export interface SalesByCategoryPoint {
  category: string;
  value: number;
}

export interface SalesByRegionPoint {
  region: string;
  value: number;
}

export interface StatusDistributionPoint {
  status: string;
  count: number;
}

export interface DashboardCharts {
  revenueTrend: RevenueTrendPoint[];
  salesByCategory: SalesByCategoryPoint[];
  salesByRegion: SalesByRegionPoint[];
  orderStatusDistribution: StatusDistributionPoint[];
}

export interface FilterParams {
  startDate?: string;
  endDate?: string;
  category?: string;
  region?: string;
  search?: string;
}
