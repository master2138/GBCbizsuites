const express = require('express');
const { prisma } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// ── List Work Items ──────────────────────────────────
router.get('/work-items', async (req, res) => {
    try {
        const { status, priority, client_id } = req.query;
        const where = { userId: req.user.id };
        if (status) where.status = status;
        if (priority) where.priority = priority;
        if (client_id) where.clientId = client_id;

        const items = await prisma.workItem.findMany({
            where, orderBy: [{ priority: 'asc' }, { createdAt: 'desc' }],
            include: { client: { select: { name: true } } },
        });

        const mapped = items.map(i => ({
            ...i, client_name: i.client?.name || '', due_date: i.dueDate ? i.dueDate.toISOString().split('T')[0] : null,
            hours_spent: i.hoursSpent, billing_rate: i.billingRate, assigned_to: i.assignedTo,
            created_at: i.createdAt, updated_at: i.updatedAt, client_id: i.clientId,
        }));
        res.json(mapped);
    } catch (err) {
        console.error('Work items error:', err);
        res.status(500).json({ error: 'Failed to fetch work items.' });
    }
});

// ── Create Work Item ─────────────────────────────────
router.post('/work-items', async (req, res) => {
    try {
        const { title, category, priority, due_date, client_id, assigned_to, billing_rate, notes } = req.body;
        if (!title) return res.status(400).json({ error: 'Title is required.' });

        const item = await prisma.workItem.create({
            data: {
                userId: req.user.id, title, category: category || 'General', priority: priority || 'MEDIUM',
                dueDate: due_date ? new Date(due_date) : null, clientId: client_id || null,
                assignedTo: assigned_to || '', billingRate: parseFloat(billing_rate) || 0, notes: notes || '',
            },
        });

        res.status(201).json({ message: 'Work item created', item: { ...item, due_date: item.dueDate, hours_spent: item.hoursSpent, billing_rate: item.billingRate } });
    } catch (err) {
        console.error('Create work item error:', err);
        res.status(500).json({ error: 'Failed to create work item.' });
    }
});

// ── Update Work Item ─────────────────────────────────
router.put('/work-items/:id', async (req, res) => {
    try {
        const existing = await prisma.workItem.findFirst({ where: { id: req.params.id, userId: req.user.id } });
        if (!existing) return res.status(404).json({ error: 'Work item not found.' });

        const { title, status, priority, due_date, category, assigned_to, hours_spent, billing_rate, notes } = req.body;
        const data = {};
        if (title) data.title = title;
        if (status) data.status = status;
        if (priority) data.priority = priority;
        if (due_date) data.dueDate = new Date(due_date);
        if (category) data.category = category;
        if (assigned_to !== undefined) data.assignedTo = assigned_to;
        if (hours_spent !== undefined) data.hoursSpent = parseFloat(hours_spent);
        if (billing_rate !== undefined) data.billingRate = parseFloat(billing_rate);
        if (notes !== undefined) data.notes = notes;

        const item = await prisma.workItem.update({ where: { id: req.params.id }, data });
        res.json({ message: 'Work item updated', item: { ...item, due_date: item.dueDate, hours_spent: item.hoursSpent, billing_rate: item.billingRate } });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update work item.' });
    }
});

// ── Delete Work Item ─────────────────────────────────
router.delete('/work-items/:id', async (req, res) => {
    try {
        const existing = await prisma.workItem.findFirst({ where: { id: req.params.id, userId: req.user.id } });
        if (!existing) return res.status(404).json({ error: 'Work item not found.' });
        await prisma.workItem.delete({ where: { id: req.params.id } });
        res.json({ message: 'Work item deleted.' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete work item.' });
    }
});

// ── Practice Stats ───────────────────────────────────
router.get('/stats', async (req, res) => {
    try {
        const items = await prisma.workItem.findMany({ where: { userId: req.user.id } });
        const now = new Date();
        const overdue = items.filter(i => i.dueDate && i.dueDate < now && i.status !== 'DONE').length;
        const categories = [...new Set(items.map(i => i.category))];

        res.json({
            total: items.length,
            todo: items.filter(i => i.status === 'TODO').length,
            inProgress: items.filter(i => i.status === 'IN_PROGRESS').length,
            review: items.filter(i => i.status === 'REVIEW').length,
            done: items.filter(i => i.status === 'DONE').length,
            onHold: items.filter(i => i.status === 'ON_HOLD').length,
            overdue,
            totalHours: items.reduce((s, i) => s + i.hoursSpent, 0),
            totalBilling: items.reduce((s, i) => s + (i.hoursSpent * i.billingRate), 0),
            categories,
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch stats.' });
    }
});

// ── Billing Summary ──────────────────────────────────
router.get('/billing-summary', async (req, res) => {
    try {
        const items = await prisma.workItem.findMany({
            where: { userId: req.user.id, NOT: { clientId: null } },
            include: { client: { select: { name: true } } },
        });

        const summary = {};
        items.forEach(i => {
            const name = i.client?.name || 'Unknown';
            if (!summary[name]) summary[name] = { clientName: name, totalHours: 0, totalBilling: 0, items: 0, completed: 0 };
            summary[name].totalHours += i.hoursSpent;
            summary[name].totalBilling += i.hoursSpent * i.billingRate;
            summary[name].items++;
            if (i.status === 'DONE') summary[name].completed++;
        });

        res.json(Object.values(summary).sort((a, b) => b.totalBilling - a.totalBilling));
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch billing summary.' });
    }
});

module.exports = router;
