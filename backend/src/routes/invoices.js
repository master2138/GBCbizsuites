const express = require('express');
const router = express.Router();
const { prisma } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// ── Invoice Number Generator ─────────────────────────────
function generateInvoiceNumber(prefix = 'INV') {
    const now = new Date();
    const fy = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
    const seq = Math.floor(Math.random() * 9000) + 1000;
    return `${prefix}/${fy}-${(fy + 1) % 100}/${String(seq)}`;
}

// ── GST Calculation Helper ──────────────────────────────
function calculateGST(items, sellerState, buyerState) {
    const isInterState = sellerState !== buyerState;
    return items.map(item => {
        const rate = item.gstRate || 18;
        const taxable = item.quantity * item.unitPrice;
        const gstAmount = (taxable * rate) / 100;
        return {
            ...item,
            taxableValue: Math.round(taxable * 100) / 100,
            cgst: isInterState ? 0 : Math.round((gstAmount / 2) * 100) / 100,
            sgst: isInterState ? 0 : Math.round((gstAmount / 2) * 100) / 100,
            igst: isInterState ? Math.round(gstAmount * 100) / 100 : 0,
            total: Math.round((taxable + gstAmount) * 100) / 100,
        };
    });
}

// ── Create Invoice ──────────────────────────────────────
router.post('/', async (req, res) => {
    try {
        const { client_name, client_gstin, client_address, client_state,
            seller_gstin, seller_name, seller_address, seller_state,
            items, notes, due_date, invoice_type, prefix } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ error: 'At least one line item is required.' });
        }

        const invoiceNumber = generateInvoiceNumber(prefix || 'INV');
        const calculatedItems = calculateGST(items, seller_state || '27', client_state || '27');

        const totals = calculatedItems.reduce((acc, item) => ({
            taxableValue: acc.taxableValue + item.taxableValue,
            cgst: acc.cgst + item.cgst, sgst: acc.sgst + item.sgst,
            igst: acc.igst + item.igst, total: acc.total + item.total,
        }), { taxableValue: 0, cgst: 0, sgst: 0, igst: 0, total: 0 });

        Object.keys(totals).forEach(k => totals[k] = Math.round(totals[k] * 100) / 100);
        const roundOff = Math.round(totals.total * 100) / 100 - Math.round(totals.total);
        const grandTotal = Math.round(totals.total);

        const invoice = await prisma.invoice.create({
            data: {
                userId: req.user.id, invoiceNumber, invoiceType: invoice_type || 'TAX_INVOICE',
                invoiceDate: new Date(), dueDate: due_date ? new Date(due_date) : null,
                clientName: client_name || '', clientGstin: client_gstin || '', clientAddress: client_address || '', clientState: client_state || '27',
                sellerName: seller_name || '', sellerGstin: seller_gstin || '', sellerAddress: seller_address || '', sellerState: seller_state || '27',
                items: JSON.stringify(calculatedItems), taxableValue: totals.taxableValue,
                cgst: totals.cgst, sgst: totals.sgst, igst: totals.igst,
                roundOff, grandTotal, notes: notes || '', status: 'DRAFT',
            },
        });

        res.json({
            id: invoice.id, invoiceNumber, status: 'DRAFT',
            items: calculatedItems, totals: { ...totals, roundOff, grandTotal },
            message: 'Invoice created successfully.'
        });
    } catch (err) {
        console.error('Create invoice error:', err);
        res.status(500).json({ error: 'Failed to create invoice.' });
    }
});

// ── List Invoices ────────────────────────────────────────
router.get('/', async (req, res) => {
    try {
        const invoices = await prisma.invoice.findMany({
            where: { userId: req.user.id }, orderBy: { createdAt: 'desc' },
            select: { id: true, invoiceNumber: true, invoiceType: true, invoiceDate: true, dueDate: true, clientName: true, clientGstin: true, grandTotal: true, status: true, createdAt: true },
        });
        const mapped = invoices.map(i => ({ ...i, invoice_number: i.invoiceNumber, invoice_type: i.invoiceType, invoice_date: i.invoiceDate, due_date: i.dueDate, client_name: i.clientName, client_gstin: i.clientGstin, grand_total: i.grandTotal, created_at: i.createdAt }));

        // Summary stats
        const allInvoices = await prisma.invoice.findMany({ where: { userId: req.user.id } });
        const stats = {
            total_invoices: allInvoices.length,
            total_received: allInvoices.filter(i => i.status === 'PAID').reduce((s, i) => s + i.grandTotal, 0),
            total_pending: allInvoices.filter(i => ['SENT', 'DRAFT'].includes(i.status)).reduce((s, i) => s + i.grandTotal, 0),
            total_overdue: allInvoices.filter(i => i.status === 'OVERDUE').reduce((s, i) => s + i.grandTotal, 0),
        };

        res.json({ invoices: mapped, stats });
    } catch (err) {
        console.error('List invoices error:', err);
        res.status(500).json({ error: 'Failed to fetch invoices.' });
    }
});

// ── Get Invoice Detail ──────────────────────────────────
router.get('/:id', async (req, res) => {
    try {
        const invoice = await prisma.invoice.findFirst({ where: { id: req.params.id, userId: req.user.id } });
        if (!invoice) return res.status(404).json({ error: 'Invoice not found.' });
        const mapped = { ...invoice, invoice_number: invoice.invoiceNumber, invoice_type: invoice.invoiceType, invoice_date: invoice.invoiceDate, due_date: invoice.dueDate, client_name: invoice.clientName, client_gstin: invoice.clientGstin, client_address: invoice.clientAddress, client_state: invoice.clientState, seller_name: invoice.sellerName, seller_gstin: invoice.sellerGstin, seller_address: invoice.sellerAddress, seller_state: invoice.sellerState, taxable_value: invoice.taxableValue, round_off: invoice.roundOff, grand_total: invoice.grandTotal, payment_amount: invoice.paymentAmount, payment_date: invoice.paymentDate, payment_method: invoice.paymentMethod, payment_reference: invoice.paymentReference, created_at: invoice.createdAt, updated_at: invoice.updatedAt };
        mapped.items = JSON.parse(invoice.items || '[]');
        res.json(mapped);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch invoice.' });
    }
});

// ── Update Invoice ──────────────────────────────────────
router.put('/:id', async (req, res) => {
    try {
        const invoice = await prisma.invoice.findFirst({ where: { id: req.params.id, userId: req.user.id } });
        if (!invoice) return res.status(404).json({ error: 'Invoice not found.' });
        if (invoice.status !== 'DRAFT') return res.status(400).json({ error: 'Only draft invoices can be edited.' });

        const { client_name, client_gstin, client_address, client_state,
            seller_gstin, seller_name, seller_address, seller_state,
            items, notes, due_date } = req.body;

        if (items && items.length > 0) {
            const calculatedItems = calculateGST(items, seller_state || invoice.sellerState, client_state || invoice.clientState);
            const totals = calculatedItems.reduce((acc, item) => ({
                taxableValue: acc.taxableValue + item.taxableValue,
                cgst: acc.cgst + item.cgst, sgst: acc.sgst + item.sgst,
                igst: acc.igst + item.igst, total: acc.total + item.total,
            }), { taxableValue: 0, cgst: 0, sgst: 0, igst: 0, total: 0 });

            Object.keys(totals).forEach(k => totals[k] = Math.round(totals[k] * 100) / 100);
            const grandTotal = Math.round(totals.total);

            await prisma.invoice.update({
                where: { id: req.params.id },
                data: {
                    clientName: client_name || invoice.clientName, clientGstin: client_gstin || '', clientAddress: client_address || '', clientState: client_state || invoice.clientState,
                    sellerName: seller_name || invoice.sellerName, sellerGstin: seller_gstin || '', sellerAddress: seller_address || '', sellerState: seller_state || invoice.sellerState,
                    items: JSON.stringify(calculatedItems), taxableValue: totals.taxableValue,
                    cgst: totals.cgst, sgst: totals.sgst, igst: totals.igst,
                    grandTotal, notes: notes || '', dueDate: due_date ? new Date(due_date) : null, updatedAt: new Date(),
                },
            });
        }

        res.json({ message: 'Invoice updated.', id: req.params.id });
    } catch (err) {
        console.error('Update invoice error:', err);
        res.status(500).json({ error: 'Failed to update invoice.' });
    }
});

// ── Update Invoice Status ───────────────────────────────
router.put('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const valid = ['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED'];
        if (!valid.includes(status)) return res.status(400).json({ error: `Invalid status. Use: ${valid.join(', ')}` });

        const invoice = await prisma.invoice.findFirst({ where: { id: req.params.id, userId: req.user.id } });
        if (!invoice) return res.status(404).json({ error: 'Invoice not found.' });

        await prisma.invoice.update({ where: { id: req.params.id }, data: { status, updatedAt: new Date() } });
        res.json({ message: `Invoice marked as ${status}.` });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update status.' });
    }
});

// ── Record Payment ──────────────────────────────────────
router.post('/:id/payment', async (req, res) => {
    try {
        const { amount, payment_date, payment_method, reference } = req.body;
        const invoice = await prisma.invoice.findFirst({ where: { id: req.params.id, userId: req.user.id } });
        if (!invoice) return res.status(404).json({ error: 'Invoice not found.' });

        await prisma.invoice.update({
            where: { id: req.params.id },
            data: { status: 'PAID', paymentAmount: amount || invoice.grandTotal, paymentDate: payment_date ? new Date(payment_date) : new Date(), paymentMethod: payment_method || '', paymentReference: reference || '', updatedAt: new Date() },
        });

        res.json({ message: 'Payment recorded. Invoice marked as PAID.' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to record payment.' });
    }
});

// ── Delete Invoice ──────────────────────────────────────
router.delete('/:id', async (req, res) => {
    try {
        const invoice = await prisma.invoice.findFirst({ where: { id: req.params.id, userId: req.user.id } });
        if (!invoice) return res.status(404).json({ error: 'Invoice not found.' });

        await prisma.invoice.delete({ where: { id: req.params.id } });
        res.json({ message: 'Invoice deleted.' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete invoice.' });
    }
});

module.exports = router;
