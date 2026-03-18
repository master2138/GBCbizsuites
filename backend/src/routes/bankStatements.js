const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const XLSX = require('xlsx');
const { prisma } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
const { parseExcelStatement, parsePDFStatement } = require('../services/bankStatementParser');
const { generateTallyXML, generateExcelData } = require('../services/tallyXmlGenerator');

const router = express.Router();
router.use(authMiddleware);

// ── Multer Config ────────────────────────────────────
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '..', '..', 'uploads');
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `stmt_${Date.now()}_${uuidv4().slice(0, 8)}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 20 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (['.pdf', '.xlsx', '.xls', '.csv'].includes(ext)) cb(null, true);
        else cb(new Error('Only PDF, Excel (.xlsx, .xls), and CSV files are supported.'));
    }
});

// ── Upload & Parse ───────────────────────────────────
router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });

        const fileExt = path.extname(req.file.originalname).toLowerCase().replace('.', '');
        let parseResult;
        try {
            const bankOverride = req.body.bank_name || null;
            if (['xlsx', 'xls', 'csv'].includes(fileExt)) {
                parseResult = parseExcelStatement(req.file.path, bankOverride);
            } else if (fileExt === 'pdf') {
                const pdfParse = require('pdf-parse');
                const pdfBuffer = fs.readFileSync(req.file.path);
                const pdfData = await pdfParse(pdfBuffer);
                parseResult = parsePDFStatement(pdfData.text, bankOverride);
            } else {
                return res.status(400).json({ error: 'Unsupported file format.' });
            }
        } catch (parseError) {
            await prisma.bankStatement.create({
                data: {
                    userId: req.user.id, clientId: req.body.client_id || null,
                    originalFilename: req.file.originalname, storedFilename: req.file.filename,
                    fileType: fileExt, status: 'error', errorMessage: parseError.message,
                },
            });
            return res.status(422).json({ error: `Failed to parse: ${parseError.message}` });
        }

        const statement = await prisma.bankStatement.create({
            data: {
                userId: req.user.id, clientId: req.body.client_id || null,
                originalFilename: req.file.originalname, storedFilename: req.file.filename,
                fileType: fileExt, bankName: parseResult.bankName, accountNumber: parseResult.accountNumber,
                periodFrom: parseResult.periodFrom ? new Date(parseResult.periodFrom) : null,
                periodTo: parseResult.periodTo ? new Date(parseResult.periodTo) : null,
                totalTransactions: parseResult.transactions.length,
                totalDebit: parseResult.totalDebit, totalCredit: parseResult.totalCredit,
                closingBalance: parseResult.closingBalance, status: 'parsed',
            },
        });

        // Insert transactions
        if (parseResult.transactions.length > 0) {
            await prisma.transaction.createMany({
                data: parseResult.transactions.map(t => ({
                    statementId: statement.id,
                    date: new Date(t.date),
                    description: t.description, reference: t.reference || '',
                    debit: t.debit || 0, credit: t.credit || 0, balance: t.balance || 0,
                    category: t.category || 'uncategorized', paymentMode: t.payment_mode || 'other',
                    narration: t.narration || t.description, ledgerName: t.ledger_name || '', rowNumber: t.row_number || 0,
                })),
            });
        }

        await prisma.activityLog.create({
            data: { userId: req.user.id, action: 'upload', entityType: 'bank_statement', entityId: statement.id, details: `Uploaded ${req.file.originalname} — ${parseResult.transactions.length} txns (${parseResult.bankName})` },
        });

        res.status(201).json({
            message: 'Bank statement parsed successfully',
            statement: {
                id: statement.id, originalFilename: req.file.originalname,
                bankName: parseResult.bankName, accountNumber: parseResult.accountNumber,
                totalTransactions: parseResult.transactions.length,
                totalDebit: parseResult.totalDebit, totalCredit: parseResult.totalCredit,
                closingBalance: parseResult.closingBalance,
                periodFrom: parseResult.periodFrom, periodTo: parseResult.periodTo,
            },
            transactions: parseResult.transactions.slice(0, 20),
            summary: { byCategory: getCategorySummary(parseResult.transactions), byPaymentMode: getPaymentModeSummary(parseResult.transactions) }
        });
    } catch (err) {
        console.error('Upload error:', err);
        res.status(500).json({ error: 'Failed to process bank statement.' });
    }
});

// ── List Statements ──────────────────────────────────
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const skip = (page - 1) * limit;
        const [total, statements] = await Promise.all([
            prisma.bankStatement.count({ where: { userId: req.user.id } }),
            prisma.bankStatement.findMany({ where: { userId: req.user.id }, orderBy: { createdAt: 'desc' }, take: parseInt(limit), skip: parseInt(skip) }),
        ]);
        const mapped = statements.map(s => ({ ...s, original_filename: s.originalFilename, stored_filename: s.storedFilename, file_type: s.fileType, bank_name: s.bankName, account_number: s.accountNumber, period_from: s.periodFrom, period_to: s.periodTo, total_transactions: s.totalTransactions, total_debit: s.totalDebit, total_credit: s.totalCredit, closing_balance: s.closingBalance, error_message: s.errorMessage, created_at: s.createdAt, user_id: s.userId, client_id: s.clientId }));
        res.json({ statements: mapped, pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / limit) } });
    } catch (err) {
        console.error('List statements error:', err);
        res.status(500).json({ error: 'Failed to fetch statements.' });
    }
});

// ── Get Statement with Transactions ──────────────────
router.get('/:id', async (req, res) => {
    try {
        const statement = await prisma.bankStatement.findFirst({ where: { id: req.params.id, userId: req.user.id } });
        if (!statement) return res.status(404).json({ error: 'Statement not found.' });
        const transactions = await prisma.transaction.findMany({ where: { statementId: req.params.id }, orderBy: { rowNumber: 'asc' } });
        const mappedStmt = { ...statement, original_filename: statement.originalFilename, bank_name: statement.bankName, total_transactions: statement.totalTransactions, total_debit: statement.totalDebit, total_credit: statement.totalCredit, closing_balance: statement.closingBalance, created_at: statement.createdAt, stored_filename: statement.storedFilename };
        const mappedTxn = transactions.map(t => ({ ...t, statement_id: t.statementId, payment_mode: t.paymentMode, ledger_name: t.ledgerName, row_number: t.rowNumber, created_at: t.createdAt }));
        res.json({ statement: mappedStmt, transactions: mappedTxn, summary: { byCategory: getCategorySummary(mappedTxn), byPaymentMode: getPaymentModeSummary(mappedTxn) } });
    } catch (err) {
        console.error('Get statement error:', err);
        res.status(500).json({ error: 'Failed to fetch statement.' });
    }
});

// ── Export Tally XML ─────────────────────────────────
router.get('/:id/export/tally-xml', async (req, res) => {
    try {
        const statement = await prisma.bankStatement.findFirst({ where: { id: req.params.id, userId: req.user.id } });
        if (!statement) return res.status(404).json({ error: 'Statement not found.' });

        const transactions = await prisma.transaction.findMany({ where: { statementId: req.params.id }, orderBy: { rowNumber: 'asc' } });
        if (transactions.length === 0) return res.status(404).json({ error: 'No transactions found.' });

        const mappedTxn = transactions.map(t => ({ ...t, payment_mode: t.paymentMode, ledger_name: t.ledgerName, row_number: t.rowNumber }));
        const xml = generateTallyXML(mappedTxn, {
            companyName: req.query.company || 'CA Mega Suite Import',
            bankLedgerName: req.query.bank_ledger || `${statement.bankName} Bank Account`,
        });

        const filename = `Tally_Import_${statement.bankName}_${statement.id.slice(0, 8)}.xml`;
        res.setHeader('Content-Type', 'application/xml');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(xml);
    } catch (err) {
        console.error('Tally XML export error:', err);
        res.status(500).json({ error: 'Failed to generate Tally XML.' });
    }
});

// ── Export Excel ─────────────────────────────────────
router.get('/:id/export/excel', async (req, res) => {
    try {
        const statement = await prisma.bankStatement.findFirst({ where: { id: req.params.id, userId: req.user.id } });
        if (!statement) return res.status(404).json({ error: 'Statement not found.' });

        const transactions = await prisma.transaction.findMany({ where: { statementId: req.params.id }, orderBy: { rowNumber: 'asc' } });
        const mappedTxn = transactions.map(t => ({ ...t, payment_mode: t.paymentMode, ledger_name: t.ledgerName, row_number: t.rowNumber }));
        const { headers, rows } = generateExcelData(mappedTxn);

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
        ws['!cols'] = [{ wch: 12 }, { wch: 40 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 20 }];
        XLSX.utils.book_append_sheet(wb, ws, 'Transactions');

        const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
        const filename = `BankStatement_${statement.bankName}_${statement.id.slice(0, 8)}.xlsx`;
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(buffer);
    } catch (err) {
        console.error('Excel export error:', err);
        res.status(500).json({ error: 'Failed to generate Excel export.' });
    }
});

// ── Update Transaction ───────────────────────────────
router.put('/:id/transactions/:txnId', async (req, res) => {
    try {
        const statement = await prisma.bankStatement.findFirst({ where: { id: req.params.id, userId: req.user.id } });
        if (!statement) return res.status(404).json({ error: 'Statement not found.' });

        const txn = await prisma.transaction.findFirst({ where: { id: req.params.txnId, statementId: req.params.id } });
        if (!txn) return res.status(404).json({ error: 'Transaction not found.' });

        const { description, debit, credit, category, ledger_name, narration, date } = req.body;
        const data = {};
        if (description !== undefined) data.description = description;
        if (debit !== undefined) data.debit = parseFloat(debit);
        if (credit !== undefined) data.credit = parseFloat(credit);
        if (category !== undefined) data.category = category;
        if (ledger_name !== undefined) data.ledgerName = ledger_name;
        if (narration !== undefined) data.narration = narration;
        if (date !== undefined) data.date = new Date(date);

        if (Object.keys(data).length === 0) return res.status(400).json({ error: 'No fields to update.' });

        const updated = await prisma.transaction.update({ where: { id: req.params.txnId }, data });

        // Recalculate totals
        const totals = await prisma.transaction.aggregate({ where: { statementId: req.params.id }, _sum: { debit: true, credit: true } });
        await prisma.bankStatement.update({ where: { id: req.params.id }, data: { totalDebit: totals._sum.debit || 0, totalCredit: totals._sum.credit || 0 } });

        res.json({ message: 'Transaction updated', transaction: { ...updated, payment_mode: updated.paymentMode, ledger_name: updated.ledgerName, row_number: updated.rowNumber } });
    } catch (err) {
        console.error('Update transaction error:', err);
        res.status(500).json({ error: 'Failed to update transaction.' });
    }
});

// ── Delete Statement ─────────────────────────────────
router.delete('/:id', async (req, res) => {
    try {
        const statement = await prisma.bankStatement.findFirst({ where: { id: req.params.id, userId: req.user.id } });
        if (!statement) return res.status(404).json({ error: 'Statement not found.' });

        const filePath = path.join(__dirname, '..', '..', 'uploads', statement.storedFilename);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

        await prisma.transaction.deleteMany({ where: { statementId: req.params.id } });
        await prisma.bankStatement.delete({ where: { id: req.params.id } });
        res.json({ message: 'Statement deleted successfully' });
    } catch (err) {
        console.error('Delete statement error:', err);
        res.status(500).json({ error: 'Failed to delete statement.' });
    }
});

function getCategorySummary(transactions) {
    const summary = {};
    transactions.forEach(t => {
        const cat = t.category || 'General';
        if (!summary[cat]) summary[cat] = { count: 0, debit: 0, credit: 0 };
        summary[cat].count++;
        summary[cat].debit += t.debit || 0;
        summary[cat].credit += t.credit || 0;
    });
    return Object.entries(summary).map(([category, data]) => ({ category, ...data })).sort((a, b) => (b.debit + b.credit) - (a.debit + a.credit));
}

function getPaymentModeSummary(transactions) {
    const summary = {};
    transactions.forEach(t => {
        const mode = t.payment_mode || 'OTHER';
        if (!summary[mode]) summary[mode] = { count: 0, debit: 0, credit: 0 };
        summary[mode].count++;
        summary[mode].debit += t.debit || 0;
        summary[mode].credit += t.credit || 0;
    });
    return Object.entries(summary).map(([mode, data]) => ({ mode, ...data })).sort((a, b) => b.count - a.count);
}

module.exports = router;
