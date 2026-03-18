const express = require('express');
const { prisma } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// ── Dashboard Stats ──────────────────────────────────
router.get('/stats', async (req, res) => {
    try {
        const userId = req.user.id;

        const [totalClients, activeClients, totalStatements, parsedStatements, agg, recentStatements] = await Promise.all([
            prisma.client.count({ where: { userId } }),
            prisma.client.count({ where: { userId, status: 'active' } }),
            prisma.bankStatement.count({ where: { userId } }),
            prisma.bankStatement.count({ where: { userId, status: 'parsed' } }),
            prisma.bankStatement.aggregate({ where: { userId }, _sum: { totalDebit: true, totalCredit: true } }),
            prisma.bankStatement.findMany({
                where: { userId }, orderBy: { createdAt: 'desc' }, take: 5,
                select: { id: true, originalFilename: true, bankName: true, totalTransactions: true, totalDebit: true, totalCredit: true, status: true, createdAt: true },
            }),
        ]);

        const totalDebit = agg._sum.totalDebit || 0;
        const totalCredit = agg._sum.totalCredit || 0;
        const mapped = recentStatements.map(s => ({ ...s, original_filename: s.originalFilename, bank_name: s.bankName, total_transactions: s.totalTransactions, total_debit: s.totalDebit, total_credit: s.totalCredit, created_at: s.createdAt }));

        res.json({
            stats: { totalClients, activeClients, totalStatements, parsedStatements, totalDebit: Math.round(totalDebit * 100) / 100, totalCredit: Math.round(totalCredit * 100) / 100 },
            recentStatements: mapped,
        });
    } catch (err) {
        console.error('Dashboard stats error:', err);
        res.status(500).json({ error: 'Failed to fetch dashboard stats.' });
    }
});

// ── Activity Feed ────────────────────────────────────
router.get('/activity', async (req, res) => {
    try {
        const { limit = 20 } = req.query;
        const activities = await prisma.activityLog.findMany({
            where: { userId: req.user.id }, orderBy: { createdAt: 'desc' }, take: parseInt(limit),
        });
        const mapped = activities.map(a => ({ ...a, user_id: a.userId, entity_type: a.entityType, entity_id: a.entityId, created_at: a.createdAt }));
        res.json({ activities: mapped });
    } catch (err) {
        console.error('Activity feed error:', err);
        res.status(500).json({ error: 'Failed to fetch activity.' });
    }
});

module.exports = router;
