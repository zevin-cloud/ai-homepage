import express from 'express';
import { syncMaxKBData, getCategories } from '../services/maxkb.js';
import { syncMaxKBUsers } from '../services/maxkbUserSync.js';
import { authenticate } from '../middleware/auth.js';
const router = express.Router();
// 获取所有分类和助手 - 需要认证
router.get('/categories', authenticate, async (req, res) => {
    try {
        const categories = await getCategories();
        const user = req.user;
        // 如果是管理员，返回所有应用
        if (user.role === 'admin') {
            return res.json({ success: true, data: categories });
        }
        // 普通用户：过滤只返回授权的应用
        const allowedAppIds = user.allowedApps || [];
        const filteredCategories = categories.map((cat) => ({
            ...cat,
            agents: cat.agents.filter((agent) => allowedAppIds.includes(agent.id))
        })).filter((cat) => cat.agents.length > 0); // 移除没有应用的分类
        res.json({ success: true, data: filteredCategories });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch categories' });
    }
});
// 手动触发同步 (Apps/Categories) - 需要认证
router.post('/sync', authenticate, async (req, res) => {
    try {
        await syncMaxKBData();
        res.json({ success: true, message: 'Sync completed' });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Sync failed' });
    }
});
// 手动触发用户同步 - 需要认证和管理员权限
router.post('/sync-users', authenticate, async (req, res) => {
    try {
        const result = await syncMaxKBUsers();
        res.json({ success: true, message: 'User sync completed', count: result.count });
    }
    catch (error) {
        console.error('User sync error:', error);
        res.status(500).json({ success: false, error: 'User sync failed' });
    }
});
export default router;
//# sourceMappingURL=maxkb.js.map