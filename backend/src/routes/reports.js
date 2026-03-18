const express = require('express');
const { prisma } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// ── Client Summary Report ────────────────────────────
router.get('/client-summary', async (req, res) => {
    try {
        const clients = await prisma.client.findMany({ where: { userId: req.user.id }, orderBy: { name: 'asc' } });

        const clientData = await Promise.all(clients.map(async c => {
            const [statements, documents, notes] = await Promise.all([
                prisma.bankStatement.count({ where: { clientId: c.id } }),
                prisma.clientDocument.count({ where: { clientId: c.id } }),
                prisma.clientNote.count({ where: { clientId: c.id } }),
            ]);

            const agg = await prisma.bankStatement.aggregate({ where: { clientId: c.id }, _sum: { totalDebit: true, totalCredit: true } });

            return {
                id: c.id, name: c.name, email: c.email, phone: c.phone, gstin: c.gstin, pan: c.pan,
                business_type: c.businessType, status: c.status, statements, documents, notes,
                total_debit: agg._sum.totalDebit || 0, total_credit: agg._sum.totalCredit || 0,
            };
        }));

        res.json({ total: clients.length, clients: clientData });
    } catch (err) {
        console.error('Client summary error:', err);
        res.status(500).json({ error: 'Failed to generate client summary.' });
    }
});

// ── Revenue Report ───────────────────────────────────
router.get('/revenue', async (req, res) => {
    try {
        const invoices = await prisma.invoice.findMany({ where: { userId: req.user.id } });

        // By status
        const statusMap = {};
        invoices.forEach(i => {
            if (!statusMap[i.status]) statusMap[i.status] = { status: i.status, count: 0, total: 0 };
            statusMap[i.status].count++;
            statusMap[i.status].total += i.grandTotal;
        });

        // Monthly
        const monthlyMap = {};
        invoices.forEach(i => {
            const d = new Date(i.createdAt);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            if (!monthlyMap[key]) monthlyMap[key] = { month: key, count: 0, total: 0, received: 0 };
            monthlyMap[key].count++;
            monthlyMap[key].total += i.grandTotal;
            if (i.status === 'PAID') monthlyMap[key].received += i.paymentAmount || i.grandTotal;
        });

        // Practice billing
        const workItems = await prisma.workItem.findMany({ where: { userId: req.user.id } });
        const billing = {
            total_items: workItems.length,
            completed: workItems.filter(w => w.status === 'DONE').length,
            total_hours: workItems.reduce((s, w) => s + w.hoursSpent, 0),
            total_billing: workItems.reduce((s, w) => s + (w.hoursSpent * w.billingRate), 0),
        };

        res.json({
            byStatus: Object.values(statusMap),
            monthly: Object.values(monthlyMap).sort((a, b) => a.month.localeCompare(b.month)),
            billing,
        });
    } catch (err) {
        console.error('Revenue report error:', err);
        res.status(500).json({ error: 'Failed to generate revenue report.' });
    }
});

// ── Filing Status Report ─────────────────────────────
router.get('/filing-status', async (req, res) => {
    try {
        const tasks = await prisma.complianceTask.findMany({ where: { userId: req.user.id }, orderBy: { dueDate: 'asc' } });
        const now = new Date();

        const overdue = tasks.filter(t => t.dueDate < now && t.status !== 'COMPLETED').map(t => ({ title: t.title, due_date: t.dueDate.toISOString().split('T')[0], category: t.category, status: t.status }));

        const future = new Date();
        future.setDate(future.getDate() + 30);
        const upcoming = tasks.filter(t => t.dueDate >= now && t.dueDate <= future && t.status !== 'COMPLETED').map(t => ({ title: t.title, due_date: t.dueDate.toISOString().split('T')[0], category: t.category, status: t.status }));

        // By category
        const catMap = {};
        tasks.forEach(t => {
            const key = `${t.category}_${t.status}`;
            if (!catMap[key]) catMap[key] = { category: t.category, status: t.status, count: 0 };
            catMap[key].count++;
        });

        res.json({ overdue, upcoming, compliance: Object.values(catMap) });
    } catch (err) {
        console.error('Filing status error:', err);
        res.status(500).json({ error: 'Failed to generate filing status.' });
    }
});

// ── CSV Exports ──────────────────────────────────────
router.get('/export/:type', async (req, res) => {
    try {
        if (req.params.type === 'clients-csv') {
            const clients = await prisma.client.findMany({ where: { userId: req.user.id }, orderBy: { name: 'asc' } });
            let csv = 'Name,Email,Phone,GSTIN,PAN,Business Type,Status,Created\n';
            clients.forEach(c => {
                csv += `"${c.name}","${c.email}","${c.phone}","${c.gstin}","${c.pan}","${c.businessType}","${c.status}","${c.createdAt.toISOString()}"\n`;
            });
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename="clients_export.csv"');
            return res.send(csv);
        }

        if (req.params.type === 'invoices-csv') {
            const invoices = await prisma.invoice.findMany({ where: { userId: req.user.id }, orderBy: { createdAt: 'desc' } });
            let csv = 'Invoice No,Date,Client,GSTIN,Taxable,CGST,SGST,IGST,Grand Total,Status\n';
            invoices.forEach(i => {
                csv += `"${i.invoiceNumber}","${i.invoiceDate?.toISOString() || ''}","${i.clientName}","${i.clientGstin}",${i.taxableValue},${i.cgst},${i.sgst},${i.igst},${i.grandTotal},"${i.status}"\n`;
            });
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename="invoices_export.csv"');
            return res.send(csv);
        }

        res.status(400).json({ error: 'Unknown export type.' });
    } catch (err) {
        console.error('Export error:', err);
        res.status(500).json({ error: 'Failed to export.' });
    }
});

module.exports = router;
