import express from 'express';
import { syncMaxKBData, getCategories } from '../services/maxkb.js';

const router = express.Router();

// Get all categories with agents
router.get('/categories', async (req, res) => {
  try {
    const categories = await getCategories();
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch categories' });
  }
});

// Trigger sync manually
router.post('/sync', async (req, res) => {
  try {
    await syncMaxKBData();
    res.json({ success: true, message: 'Sync completed' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Sync failed' });
  }
});

export default router;
