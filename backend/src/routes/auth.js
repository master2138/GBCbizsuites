const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { prisma } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'ca-mega-suite-jwt-secret-key-2026-gbc';

// ── Register ─────────────────────────────────────────
router.post('/register', async (req, res) => {
    try {
        const { email, password, name, firm_name, phone } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ error: 'Email, password, and name are required.' });
        }
        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters.' });
        }

        const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
        if (existing) {
            return res.status(409).json({ error: 'Email already registered.' });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const user = await prisma.user.create({
            data: {
                email: email.toLowerCase(),
                password: hashedPassword,
                name,
                firmName: firm_name || '',
                phone: phone || '',
            },
        });

        await prisma.activityLog.create({
            data: { userId: user.id, action: 'register', entityType: 'user', entityId: user.id, details: `New user registered: ${name}` },
        });

        const token = jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({ message: 'Registration successful', token, user: { id: user.id, email: user.email, name: user.name, firm_name: user.firmName, role: user.role } });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ error: 'Registration failed. Please try again.' });
    }
});

// ── Login ────────────────────────────────────────────
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }

        const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const token = jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

        await prisma.activityLog.create({
            data: { userId: user.id, action: 'login', entityType: 'user', entityId: user.id, details: `User logged in: ${user.name}` },
        });

        res.json({ message: 'Login successful', token, user: { id: user.id, email: user.email, name: user.name, firm_name: user.firmName, role: user.role } });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Login failed. Please try again.' });
    }
});

// ── Get Current User ─────────────────────────────────
router.get('/me', authMiddleware, async (req, res) => {
    const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { id: true, email: true, name: true, firmName: true, phone: true, role: true, createdAt: true },
    });
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json({ user: { ...user, firm_name: user.firmName, created_at: user.createdAt } });
});

module.exports = router;
