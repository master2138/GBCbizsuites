require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// ── Middleware ─────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000'],
    credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Static files for uploads
app.use('/uploads', express.static(uploadsDir));

// ── Routes ────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/clients', require('./routes/clients'));
app.use('/api/bank-statements', require('./routes/bankStatements'));
app.use('/api/calculators', require('./routes/calculators'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/gstin', require('./routes/gstin'));
app.use('/api/ecommerce', require('./routes/ecommerce'));
app.use('/api/invoices', require('./routes/invoices'));
app.use('/api/compliance', require('./routes/compliance'));
app.use('/api/clients-portal', require('./routes/clients-portal'));
app.use('/api/practice', require('./routes/practice'));
app.use('/api/reports', require('./routes/reports'));

// ── Health Check ──────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'CA Mega Suite API',
        version: '3.0.0',
        database: 'PostgreSQL (Prisma)',
        timestamp: new Date().toISOString()
    });
});

// ── 404 Handler ──────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// ── Error Handler ────────────────────────────────────
app.use((err, req, res, next) => {
    console.error('Server Error:', err.message);
    res.status(err.status || 500).json({
        error: process.env.NODE_ENV === 'production'
            ? 'Internal server error'
            : err.message
    });
});

// ── Start Server ─────────────────────────────────────
app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════════════╗
║       CA MEGA SUITE v3.0 — API Server            ║
║──────────────────────────────────────────────────║
║  Status:  ✅ Running                             ║
║  Port:    ${PORT}                                    ║
║  URL:     http://localhost:${PORT}                    ║
║  DB:      PostgreSQL (Prisma ORM)                ║
║  Health:  http://localhost:${PORT}/api/health         ║
╚══════════════════════════════════════════════════╝
    `);
});

module.exports = app;
