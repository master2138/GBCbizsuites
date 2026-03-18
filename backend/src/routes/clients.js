const express = require('express');
const { prisma } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// ── List Clients ─────────────────────────────────────
router.get('/', async (req, res) => {
    try {
        const { search, status, page = 1, limit = 20 } = req.query;
        const skip = (page - 1) * limit;

        const where = { userId: req.user.id };
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { gstin: { contains: search, mode: 'insensitive' } },
                { pan: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (status) where.status = status;

        const [total, clients] = await Promise.all([
            prisma.client.count({ where }),
            prisma.client.findMany({ where, orderBy: { createdAt: 'desc' }, take: parseInt(limit), skip: parseInt(skip) }),
        ]);

        const mapped = clients.map(c => ({ ...c, business_type: c.businessType, created_at: c.createdAt, updated_at: c.updatedAt, user_id: c.userId }));
        res.json({ clients: mapped, pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / limit) } });
    } catch (err) {
        console.error('List clients error:', err);
        res.status(500).json({ error: 'Failed to fetch clients.' });
    }
});

// ── Get Single Client ────────────────────────────────
router.get('/:id', async (req, res) => {
    const client = await prisma.client.findFirst({ where: { id: req.params.id, userId: req.user.id } });
    if (!client) return res.status(404).json({ error: 'Client not found.' });
    res.json({ client: { ...client, business_type: client.businessType, created_at: client.createdAt } });
});

// ── Create Client ────────────────────────────────────
router.post('/', async (req, res) => {
    try {
        const { name, email, phone, gstin, pan, address, business_type, notes } = req.body;
        if (!name) return res.status(400).json({ error: 'Client name is required.' });

        const client = await prisma.client.create({
            data: { userId: req.user.id, name, email: email || '', phone: phone || '', gstin: gstin || '', pan: pan || '', address: address || '', businessType: business_type || '', notes: notes || '' },
        });

        await prisma.activityLog.create({
            data: { userId: req.user.id, action: 'create', entityType: 'client', entityId: client.id, details: `Created client: ${name}` },
        });

        res.status(201).json({ message: 'Client created successfully', client: { ...client, business_type: client.businessType, created_at: client.createdAt } });
    } catch (err) {
        console.error('Create client error:', err);
        res.status(500).json({ error: 'Failed to create client.' });
    }
});

// ── Update Client ────────────────────────────────────
router.put('/:id', async (req, res) => {
    try {
        const existing = await prisma.client.findFirst({ where: { id: req.params.id, userId: req.user.id } });
        if (!existing) return res.status(404).json({ error: 'Client not found.' });

        const { name, email, phone, gstin, pan, address, business_type, status, notes } = req.body;
        const client = await prisma.client.update({
            where: { id: req.params.id },
            data: {
                name: name || existing.name, email: email !== undefined ? email : existing.email, phone: phone !== undefined ? phone : existing.phone,
                gstin: gstin !== undefined ? gstin : existing.gstin, pan: pan !== undefined ? pan : existing.pan,
                address: address !== undefined ? address : existing.address, businessType: business_type !== undefined ? business_type : existing.businessType,
                status: status || existing.status, notes: notes !== undefined ? notes : existing.notes,
            },
        });

        await prisma.activityLog.create({
            data: { userId: req.user.id, action: 'update', entityType: 'client', entityId: client.id, details: `Updated client: ${client.name}` },
        });

        res.json({ message: 'Client updated successfully', client: { ...client, business_type: client.businessType } });
    } catch (err) {
        console.error('Update client error:', err);
        res.status(500).json({ error: 'Failed to update client.' });
    }
});

// ── Delete Client ────────────────────────────────────
router.delete('/:id', async (req, res) => {
    try {
        const existing = await prisma.client.findFirst({ where: { id: req.params.id, userId: req.user.id } });
        if (!existing) return res.status(404).json({ error: 'Client not found.' });

        await prisma.client.delete({ where: { id: req.params.id } });
        await prisma.activityLog.create({
            data: { userId: req.user.id, action: 'delete', entityType: 'client', entityId: req.params.id, details: `Deleted client: ${existing.name}` },
        });

        res.json({ message: 'Client deleted successfully' });
    } catch (err) {
        console.error('Delete client error:', err);
        res.status(500).json({ error: 'Failed to delete client.' });
    }
});

module.exports = router;
