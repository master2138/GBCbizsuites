const { clerkClient } = require('@clerk/express');
const jwt = require('jsonwebtoken');
const { prisma } = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'ca-mega-suite-jwt-secret-key-2026-gbc';

async function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required. Please provide a valid token.' });
    }

    const token = authHeader.split(' ')[1];

    // Try Clerk token first
    try {
        const { sub: clerkUserId } = await clerkClient.verifyToken(token);

        // Find or create user in our database from Clerk
        let user = await prisma.user.findFirst({ where: { email: clerkUserId } });

        if (!user) {
            // Try to get Clerk user details
            try {
                const clerkUser = await clerkClient.users.getUser(clerkUserId);
                const email = clerkUser.emailAddresses?.[0]?.emailAddress || clerkUserId;
                const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || 'User';

                // Find by email or create
                user = await prisma.user.findFirst({ where: { email } });
                if (!user) {
                    user = await prisma.user.create({
                        data: {
                            email,
                            password: 'clerk-managed',
                            name,
                            firmName: '',
                            phone: clerkUser.phoneNumbers?.[0]?.phoneNumber || '',
                            role: 'ca',
                        },
                    });
                }
            } catch (clerkErr) {
                console.error('Clerk user fetch error:', clerkErr);
                return res.status(401).json({ error: 'Failed to verify user identity.' });
            }
        }

        req.user = { id: user.id, email: user.email, name: user.name, role: user.role };
        return next();
    } catch (clerkErr) {
        // Not a valid Clerk token, try legacy JWT
    }

    // Fallback to legacy JWT
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired. Please log in again.' });
        }
        return res.status(401).json({ error: 'Invalid token. Please log in again.' });
    }
}

function optionalAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            req.user = jwt.verify(token, JWT_SECRET);
        } catch (_) {
            // Token invalid, continue without auth
        }
    }
    next();
}

module.exports = { authMiddleware, optionalAuth };
