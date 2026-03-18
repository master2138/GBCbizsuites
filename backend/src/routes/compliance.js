const express = require('express');
const { prisma } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// ── Get Calendar ─────────────────────────────────────
router.get('/calendar', async (req, res) => {
    try {
        const { month, year, category } = req.query;
        const where = { userId: req.user.id };
        if (category) where.category = category;

        const tasks = await prisma.complianceTask.findMany({ where, orderBy: { dueDate: 'asc' } });
        const mapped = tasks.map(t => ({ ...t, due_date: t.dueDate, completed_at: t.completedAt, created_at: t.createdAt, user_id: t.userId }));

        if (month && year) {
            const m = parseInt(month), y = parseInt(year);
            const filtered = mapped.filter(t => {
                const d = new Date(t.due_date);
                return d.getMonth() + 1 === m && d.getFullYear() === y;
            });
            return res.json({ tasks: filtered });
        }
        res.json({ tasks: mapped });
    } catch (err) {
        console.error('Calendar error:', err);
        res.status(500).json({ error: 'Failed to fetch calendar.' });
    }
});

// ── Upcoming Deadlines ───────────────────────────────
router.get('/upcoming', async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 30;
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() + days);

        const tasks = await prisma.complianceTask.findMany({
            where: { userId: req.user.id, status: { not: 'COMPLETED' }, dueDate: { lte: cutoff } },
            orderBy: { dueDate: 'asc' },
        });
        const mapped = tasks.map(t => ({ ...t, due_date: t.dueDate, created_at: t.createdAt }));
        res.json({ tasks: mapped });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch upcoming deadlines.' });
    }
});

// ── Create Task ──────────────────────────────────────
router.post('/tasks', async (req, res) => {
    try {
        const { title, type, category, due_date, description } = req.body;
        if (!title || !due_date) return res.status(400).json({ error: 'Title and due date are required.' });

        const task = await prisma.complianceTask.create({
            data: { userId: req.user.id, title, type: type || 'CUSTOM', category: category || 'OTHER', dueDate: new Date(due_date), description: description || '' },
        });

        res.status(201).json({ message: 'Task created', task: { ...task, due_date: task.dueDate, created_at: task.createdAt } });
    } catch (err) {
        res.status(500).json({ error: 'Failed to create task.' });
    }
});

// ── Update Task ──────────────────────────────────────
router.put('/tasks/:id', async (req, res) => {
    try {
        const existing = await prisma.complianceTask.findFirst({ where: { id: req.params.id, userId: req.user.id } });
        if (!existing) return res.status(404).json({ error: 'Task not found.' });

        const { title, status, due_date, description, category } = req.body;
        const data = {};
        if (title) data.title = title;
        if (status) data.status = status;
        if (due_date) data.dueDate = new Date(due_date);
        if (description !== undefined) data.description = description;
        if (category) data.category = category;
        if (status === 'COMPLETED') data.completedAt = new Date();

        const task = await prisma.complianceTask.update({ where: { id: req.params.id }, data });
        res.json({ message: 'Task updated', task: { ...task, due_date: task.dueDate, completed_at: task.completedAt, created_at: task.createdAt } });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update task.' });
    }
});

// ── Delete Task ──────────────────────────────────────
router.delete('/tasks/:id', async (req, res) => {
    try {
        const existing = await prisma.complianceTask.findFirst({ where: { id: req.params.id, userId: req.user.id } });
        if (!existing) return res.status(404).json({ error: 'Task not found.' });

        await prisma.complianceTask.delete({ where: { id: req.params.id } });
        res.json({ message: 'Task deleted.' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete task.' });
    }
});

module.exports = router;
