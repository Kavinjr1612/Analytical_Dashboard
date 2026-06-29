import { Router } from 'express';
import {
  getSummary,
  getCharts,
  getTransactions,
  exportTransactions
} from '../controllers/transactionController.js';

const router = Router();

// Dashboard summary stats
router.get('/dashboard/summary', getSummary);

// Dashboard charts data
router.get('/dashboard/charts', getCharts);

// Transactions table routes
router.get('/transactions', getTransactions);
router.get('/transactions/export', exportTransactions);

export default router;
