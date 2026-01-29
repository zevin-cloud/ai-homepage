import express, { Router } from 'express';
import { syncMaxKBData, getCategories } from '../services/maxkb.js';

const router: Router = express.Router();

// 获取所有分类和助手
router.get('/categories', async (req, res) => {
  try {
    const categories = await getCategories();
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch categories' });
  }
});

// 手动触发同步
router.post('/sync', async (req, res) => {
  try {
    await syncMaxKBData();
    res.json({ success: true, message: 'Sync completed' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Sync failed' });
  }
});

export default router;
