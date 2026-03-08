import express, { Router } from 'express';
import { getAppStatistics, getChatLogs, getGlobalStatistics, getChatSessionRecords } from '../services/maxkb.js';
import { authenticate, requireAdmin, requireAppAccess } from '../middleware/auth.js';

const router: Router = express.Router();

// 获取全站概览 - 仅管理员
router.get('/overview', authenticate, requireAdmin, async (req, res) => {
    try {
        const stats = await getGlobalStatistics();
        res.json({ success: true, data: stats });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch global overview' });
    }
});

// 获取特定应用统计
router.get('/app/:appId/stats',
    authenticate,
    requireAppAccess(req => req.params.appId),
    async (req, res) => {
        try {
            const { appId } = req.params;
            const stats = await getAppStatistics(appId);
            res.json({ success: true, data: stats });
        } catch (error) {
            res.status(500).json({ success: false, error: 'Failed to fetch app statistics' });
        }
    }
);

// 获取特定应用对话日志
router.get('/app/:appId/logs',
    authenticate,
    requireAppAccess(req => req.params.appId),
    async (req, res) => {
        try {
            const { appId } = req.params;
            const page = parseInt(req.query.page as string) || 1;
            const size = parseInt(req.query.size as string) || 20;

            const logs = await getChatLogs(appId, page, size);
            res.json({ success: true, data: logs });
        } catch (error) {
            res.status(500).json({ success: false, error: 'Failed to fetch chat logs' });
        }
    }
);

// 获取特定应用具体某个会话的聊天记录
router.get('/app/:appId/logs/:chatId',
    authenticate,
    requireAppAccess(req => req.params.appId),
    async (req, res) => {
        try {
            const { appId, chatId } = req.params;
            const page = parseInt(req.query.page as string) || 1;
            const size = parseInt(req.query.size as string) || 50;

            const records = await getChatSessionRecords(appId, chatId, page, size);
            res.json({ success: true, data: records });
        } catch (error) {
            res.status(500).json({ success: false, error: 'Failed to fetch chat session records' });
        }
    }
);

export default router;
