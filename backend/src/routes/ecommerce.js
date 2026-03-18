const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { parseEcommerceFile, generateEcomTallyXML } = require('../services/ecomParsers');

// Auth middleware
const { authMiddleware } = require('../middleware/auth');
router.use(authMiddleware);

// File upload config
const uploadDir = path.join(__dirname, '../../uploads/ecommerce');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
const upload = multer({
    dest: uploadDir,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
    fileFilter: (req, file, cb) => {
        const allowed = ['.csv', '.xlsx', '.xls'];
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, allowed.includes(ext));
    },
});

// In-memory store (move to DB later)
const reports = new Map();
let reportIdCounter = 1;

// ── Upload & Parse E-Commerce Report ──────────────────────
router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });

        const platform = req.body.platform || null;
        const result = parseEcommerceFile(req.file.path, platform);

        const report = {
            id: reportIdCounter++,
            userId: req.user.id,
            fileName: req.file.originalname,
            platform: result.platform,
            uploadedAt: new Date().toISOString(),
            summary: result.summary,
            transactions: result.transactions,
            gstr1: result.gstr1,
        };

        reports.set(report.id, report);

        // Clean up uploaded file
        fs.unlink(req.file.path, () => { });

        res.json({
            id: report.id,
            platform: report.platform,
            fileName: report.fileName,
            summary: report.summary,
            transactionCount: report.transactions.length,
            gstr1: report.gstr1,
        });
    } catch (err) {
        console.error('E-commerce upload error:', err);
        if (req.file) fs.unlink(req.file.path, () => { });
        res.status(400).json({ error: err.message || 'Failed to parse e-commerce file.' });
    }
});

// ── List Reports ─────────────────────────────────────────
router.get('/reports', (req, res) => {
    const userReports = Array.from(reports.values())
        .filter(r => r.userId === req.user.id)
        .map(r => ({
            id: r.id,
            fileName: r.fileName,
            platform: r.platform,
            uploadedAt: r.uploadedAt,
            summary: r.summary,
        }))
        .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

    res.json(userReports);
});

// ── Get Report Detail ────────────────────────────────────
router.get('/reports/:id', (req, res) => {
    const report = reports.get(parseInt(req.params.id));
    if (!report || report.userId !== req.user.id) {
        return res.status(404).json({ error: 'Report not found.' });
    }
    res.json(report);
});

// ── Get GSTR-1 Summary ──────────────────────────────────
router.get('/reports/:id/gstr1', (req, res) => {
    const report = reports.get(parseInt(req.params.id));
    if (!report || report.userId !== req.user.id) {
        return res.status(404).json({ error: 'Report not found.' });
    }
    res.json(report.gstr1);
});

// ── Export Tally XML ────────────────────────────────────
router.get('/reports/:id/tally-xml', (req, res) => {
    const report = reports.get(parseInt(req.params.id));
    if (!report || report.userId !== req.user.id) {
        return res.status(404).json({ error: 'Report not found.' });
    }

    const xml = generateEcomTallyXML(report.transactions);
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Content-Disposition', `attachment; filename="${report.platform}_tally_${report.id}.xml"`);
    res.send(xml);
});

// ── Export CSV ───────────────────────────────────────────
router.get('/reports/:id/export-csv', (req, res) => {
    const report = reports.get(parseInt(req.params.id));
    if (!report || report.userId !== req.user.id) {
        return res.status(404).json({ error: 'Report not found.' });
    }

    const headers = ['Date', 'Order ID', 'Platform', 'Product', 'HSN', 'GST Rate', 'Qty',
        'Item Price', 'Taxable Value', 'CGST', 'SGST', 'IGST', 'Total Tax',
        'Platform Fees', 'TCS', 'Net Amount', 'Type'];
    const rows = report.transactions.map(t => [
        t.date, t.orderId, t.platform, `"${t.product}"`, t.hsn, t.gstRate, t.quantity,
        t.itemPrice, t.taxableValue, t.cgst, t.sgst, t.igst, t.totalTax,
        t.platformFees, t.tcs, t.netAmount, t.type
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${report.platform}_report_${report.id}.csv"`);
    res.send(csv);
});

// ── Delete Report ───────────────────────────────────────
router.delete('/reports/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const report = reports.get(id);
    if (!report || report.userId !== req.user.id) {
        return res.status(404).json({ error: 'Report not found.' });
    }
    reports.delete(id);
    res.json({ message: 'Report deleted.' });
});

module.exports = router;
