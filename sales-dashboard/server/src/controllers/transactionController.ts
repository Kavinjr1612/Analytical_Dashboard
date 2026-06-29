import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import prisma from '../utils/db.js';

// Helper to build search/filter where clause
const buildFilterWhere = (query: any) => {
  const { startDate, endDate, category, region, search } = query;
  const where: any = {};

  if (category) {
    where.category = String(category);
  }
  
  if (region) {
    where.region = String(region);
  }
  
  if (startDate || endDate) {
    where.transactionDate = {};
    if (startDate) {
      where.transactionDate.gte = new Date(String(startDate));
    }
    if (endDate) {
      const end = new Date(String(endDate));
      // If end date doesn't contain time, filter to the very end of that day
      if (!String(endDate).includes('T')) {
        end.setHours(23, 59, 59, 999);
      }
      where.transactionDate.lte = end;
    }
  }

  if (search) {
    const searchString = String(search).trim();
    if (searchString) {
      where.OR = [
        { customerName: { contains: searchString, mode: 'insensitive' } },
        { productName: { contains: searchString, mode: 'insensitive' } }
      ];
    }
  }

  return where;
};

// GET /api/dashboard/summary
export const getSummary = async (req: Request, res: Response) => {
  try {
    const where = buildFilterWhere(req.query);

    const [aggregate, distinctCustomers, categoryAggregate, regionAggregate] = await Promise.all([
      prisma.transaction.aggregate({
        where,
        _sum: { amount: true },
        _count: { id: true },
        _avg: { amount: true }
      }),
      prisma.transaction.findMany({
        where,
        select: { customerName: true },
        distinct: ['customerName']
      }),
      prisma.transaction.groupBy({
        by: ['category'],
        where,
        _sum: { amount: true },
        orderBy: { _sum: { amount: 'desc' } },
        take: 1
      }),
      prisma.transaction.groupBy({
        by: ['region'],
        where,
        _sum: { amount: true },
        orderBy: { _sum: { amount: 'desc' } },
        take: 1
      })
    ]);

    const totalRevenue = aggregate._sum.amount ? Number(aggregate._sum.amount) : 0;
    const totalOrders = aggregate._count.id || 0;
    const averageOrderValue = aggregate._avg.amount ? Number(aggregate._avg.amount) : 0;
    const totalCustomers = distinctCustomers.length;
    const topSellingCategory = categoryAggregate[0]?.category || 'N/A';
    const bestPerformingRegion = regionAggregate[0]?.region || 'N/A';

    return res.json({
      totalRevenue,
      totalOrders,
      averageOrderValue,
      totalCustomers,
      topSellingCategory,
      bestPerformingRegion
    });
  } catch (error: any) {
    console.error('Error fetching dashboard summary:', error);
    return res.status(500).json({ error: 'Failed to fetch dashboard summary metrics.' });
  }
};

// GET /api/dashboard/charts
export const getCharts = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, category, region, search } = req.query;
    const where = buildFilterWhere(req.query);

    // 1. Build revenue trend using SQL group by month/day (PostgreSQL optimized)
    let isDaily = false;
    if (startDate && endDate) {
      const start = new Date(startDate as string);
      const end = new Date(endDate as string);
      const diffDays = Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays <= 31) {
        isDaily = true;
      }
    }

    const dateFormat = isDaily ? 'YYYY-MM-DD' : 'YYYY-MM';
    const dateTrunc = isDaily ? 'day' : 'month';

    // Compile dynamic filters for Raw query (parameterized)
    const whereConditions: Prisma.Sql[] = [];

    if (category) {
      whereConditions.push(Prisma.sql`category = ${category}`);
    }
    if (region) {
      whereConditions.push(Prisma.sql`region = ${region}`);
    }
    if (startDate) {
      whereConditions.push(Prisma.sql`transaction_date >= ${new Date(startDate as string)}`);
    }
    if (endDate) {
      const end = new Date(endDate as string);
      if (!String(endDate).includes('T')) {
        end.setHours(23, 59, 59, 999);
      }
      whereConditions.push(Prisma.sql`transaction_date <= ${end}`);
    }
    if (search) {
      const searchString = `%${String(search).trim()}%`;
      whereConditions.push(Prisma.sql`(customer_name ILIKE ${searchString} OR product_name ILIKE ${searchString})`);
    }

    const whereClause = whereConditions.length > 0 
      ? Prisma.sql`WHERE ${Prisma.join(whereConditions, ' AND ')}` 
      : Prisma.empty;

    const trendRaw = await prisma.$queryRaw<any[]>`
      SELECT TO_CHAR(transaction_date, ${dateFormat}) as date, SUM(amount)::FLOAT as revenue
      FROM transactions
      ${whereClause}
      GROUP BY DATE_TRUNC(${dateTrunc}, transaction_date), TO_CHAR(transaction_date, ${dateFormat})
      ORDER BY DATE_TRUNC(${dateTrunc}, transaction_date) ASC
    `;

    const revenueTrend = trendRaw.map(row => ({
      date: row.date,
      revenue: Number(row.revenue || 0)
    }));

    // 2. Sales by Category (Prisma aggregated)
    const salesByCategoryRaw = await prisma.transaction.groupBy({
      by: ['category'],
      where,
      _sum: { amount: true },
      orderBy: { _sum: { amount: 'desc' } }
    });
    const salesByCategory = salesByCategoryRaw.map(row => ({
      category: row.category,
      value: Number(row._sum.amount || 0)
    }));

    // 3. Sales by Region (Prisma aggregated)
    const salesByRegionRaw = await prisma.transaction.groupBy({
      by: ['region'],
      where,
      _sum: { amount: true },
      orderBy: { _sum: { amount: 'desc' } }
    });
    const salesByRegion = salesByRegionRaw.map(row => ({
      region: row.region,
      value: Number(row._sum.amount || 0)
    }));

    // 4. Order Status Distribution (Prisma aggregated)
    const orderStatusDistributionRaw = await prisma.transaction.groupBy({
      by: ['status'],
      where,
      _count: { id: true }
    });
    const orderStatusDistribution = orderStatusDistributionRaw.map(row => ({
      status: row.status,
      count: row._count.id
    }));

    return res.json({
      revenueTrend,
      salesByCategory,
      salesByRegion,
      orderStatusDistribution
    });
  } catch (error: any) {
    console.error('Error fetching dashboard charts:', error);
    return res.status(500).json({ error: 'Failed to fetch dashboard chart visualization data.' });
  }
};

// GET /api/transactions
export const getTransactions = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, sortBy = 'transactionDate', sortOrder = 'desc' } = req.query;
    const where = buildFilterWhere(req.query);

    const pageNum = Math.max(1, parseInt(String(page)) || 1);
    const limitNum = Math.max(1, parseInt(String(limit)) || 10);
    const offset = (pageNum - 1) * limitNum;

    // Validate sorting parameters to prevent SQL injection or runtime crashes
    const allowedSortFields = ['customerName', 'productName', 'category', 'region', 'amount', 'status', 'transactionDate'];
    const sortByField = allowedSortFields.includes(String(sortBy)) ? String(sortBy) : 'transactionDate';
    const sortOrderDir = String(sortOrder).toLowerCase() === 'asc' ? 'asc' : 'desc';

    const [transactions, totalCount] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { [sortByField]: sortOrderDir },
        take: limitNum,
        skip: offset,
      }),
      prisma.transaction.count({ where })
    ]);

    const totalPages = Math.ceil(totalCount / limitNum);

    return res.json({
      transactions,
      totalCount,
      page: pageNum,
      limit: limitNum,
      totalPages
    });
  } catch (error: any) {
    console.error('Error fetching transactions:', error);
    return res.status(500).json({ error: 'Failed to fetch transaction records.' });
  }
};

// GET /api/transactions/export (Stream CSV)
export const exportTransactions = async (req: Request, res: Response) => {
  try {
    const where = buildFilterWhere(req.query);

    // Fetch matching data sorted by date
    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { transactionDate: 'desc' }
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="transactions_export.csv"');

    // CSV Column headers
    res.write('Transaction ID,Customer Name,Product Name,Category,Region,Amount,Status,Transaction Date\n');

    const escapeCSVValue = (val: any): string => {
      if (val === null || val === undefined) return '';
      const str = String(val).replace(/"/g, '""');
      if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
        return `"${str}"`;
      }
      return str;
    };

    // Write records chunk by chunk into the response stream
    for (const tx of transactions) {
      const row = [
        tx.id,
        tx.customerName,
        tx.productName,
        tx.category,
        tx.region,
        tx.amount.toString(),
        tx.status,
        tx.transactionDate.toISOString()
      ].map(escapeCSVValue).join(',');

      res.write(row + '\n');
    }

    res.end();
  } catch (error: any) {
    console.error('Error exporting transactions:', error);
    return res.status(500).json({ error: 'Failed to export transactions as CSV.' });
  }
};
