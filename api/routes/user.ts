import { Router, type Request, type Response } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { getUsers, updateUserPermissions } from '../services/user.js';

const router: Router = Router();

// Get all users
router.get('/', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const users = await getUsers();
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch users' });
  }
});

// Update user role
router.put('/:id/role', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    if (!['admin', 'user'].includes(role)) {
      return res.status(400).json({ success: false, error: 'Invalid role' });
    }

    const updatedUser = await updateUserPermissions(id, { role });
    if (!updatedUser) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({ success: true, data: updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update role' });
  }
});

// Update allowed apps
router.put('/:id/apps', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { allowedApps } = req.body;
    
    if (!Array.isArray(allowedApps)) {
      return res.status(400).json({ success: false, error: 'allowedApps must be an array' });
    }

    const updatedUser = await updateUserPermissions(id, { allowedApps });
    if (!updatedUser) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({ success: true, data: updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update apps' });
  }
});

export default router;
