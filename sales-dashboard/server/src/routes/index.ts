import { Router } from 'express';
import {
  getSummary,
  getCharts,
  getTransactions,
  exportTransactions,
  getDatasets,
  deleteDataset,
  importDataset
} from '../controllers/transactionController.js';

const router = Router();

// Dataset import & management
router.get('/datasets', getDatasets);
router.post('/datasets/import', importDataset);
router.delete('/datasets/:id', deleteDataset);

// Dashboard summary stats
router.get('/dashboard/summary', getSummary);

// Dashboard charts data
router.get('/dashboard/charts', getCharts);

// Transactions table routes
router.get('/transactions', getTransactions);
router.get('/transactions/export', exportTransactions);

export default router;
