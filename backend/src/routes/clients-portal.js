const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { prisma } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

const DOC_CATEGORIES = ['PAN Card', 'Aadhaar', 'GST Certificate', 'ITR Acknowledgment', 'Balance Sheet', 'Bank Statement', 'Agreement', 'TDS Certificate', 'Other'];

// Multer Config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '..', '..', 'uploads', 'client-docs');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => cb(null, `doc_${Date.now()}_${uuidv4().slice(0, 8)}${path.extname(file.originalname)}`),
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// Helper: add timeline entry
async function addTimeline(clientId, userId, action, entityType, details) {
    await prisma.clientTimeline.create({ data: { clientId, userId, action, entityType, details } });
}

// ── Client Profile ──────────────────────────────────
router.get('/:clientId/profile', async (req, res) => {
    try {
        const client = await prisma.client.findFirst({ where: { id: req.params.clientId, userId: req.user.id } });
        if (!client) return res.status(404).json({ error: 'Client not found.' });

        const [statements, documents, notes, invoices] = await Promise.all([
            prisma.bankStatement.count({ where: { clientId: client.id } }),
            prisma.clientDocument.count({ where: { clientId: client.id } }),
            prisma.clientNote.count({ where: { clientId: client.id } }),
            prisma.invoice.count({ where: { userId: req.user.id, clientName: client.name } }),
        ]);

        res.json({ client: { ...client, business_type: client.businessType, created_at: client.createdAt }, stats: { statements, documents, notes, invoices }, categories: DOC_CATEGORIES });
    } catch (err) {
        console.error('Profile error:', err);
        res.status(500).json({ error: 'Failed to fetch profile.' });
    }
});

// ── Upload Document ─────────────────────────────────
router.post('/:clientId/documents', upload.single('file'), async (req, res) => {
    try {
        const client = await prisma.client.findFirst({ where: { id: req.params.clientId, userId: req.user.id } });
        if (!client) return res.status(404).json({ error: 'Client not found.' });
        if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });

        const doc = await prisma.clientDocument.create({
            data: { clientId: client.id, userId: req.user.id, fileName: req.file.originalname, storedName: req.file.filename, fileSize: req.file.size, category: req.body.category || 'Other', notes: req.body.notes || '' },
        });

        await addTimeline(client.id, req.user.id, 'UPLOAD', 'document', `Uploaded ${req.file.originalname} (${req.body.category || 'Other'})`);
        res.status(201).json({ message: 'Document uploaded', document: { ...doc, file_name: doc.fileName, stored_name: doc.storedName, file_size: doc.fileSize, uploaded_at: doc.uploadedAt } });
    } catch (err) {
        res.status(500).json({ error: 'Failed to upload document.' });
    }
});

// ── List Documents ──────────────────────────────────
router.get('/:clientId/documents', async (req, res) => {
    try {
        const docs = await prisma.clientDocument.findMany({ where: { clientId: req.params.clientId, userId: req.user.id }, orderBy: { uploadedAt: 'desc' } });
        const mapped = docs.map(d => ({ ...d, file_name: d.fileName, stored_name: d.storedName, file_size: d.fileSize, uploaded_at: d.uploadedAt }));
        res.json(mapped);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch documents.' });
    }
});

// ── Download Document ───────────────────────────────
router.get('/:clientId/documents/:docId/download', async (req, res) => {
    try {
        const doc = await prisma.clientDocument.findFirst({ where: { id: req.params.docId, clientId: req.params.clientId, userId: req.user.id } });
        if (!doc) return res.status(404).json({ error: 'Document not found.' });
        const filePath = path.join(__dirname, '..', '..', 'uploads', 'client-docs', doc.storedName);
        if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found on disk.' });
        res.download(filePath, doc.fileName);
    } catch (err) {
        res.status(500).json({ error: 'Download failed.' });
    }
});

// ── Delete Document ─────────────────────────────────
router.delete('/:clientId/documents/:docId', async (req, res) => {
    try {
        const doc = await prisma.clientDocument.findFirst({ where: { id: req.params.docId, clientId: req.params.clientId, userId: req.user.id } });
        if (!doc) return res.status(404).json({ error: 'Document not found.' });

        const filePath = path.join(__dirname, '..', '..', 'uploads', 'client-docs', doc.storedName);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        await prisma.clientDocument.delete({ where: { id: doc.id } });
        await addTimeline(req.params.clientId, req.user.id, 'DELETE', 'document', `Deleted ${doc.fileName}`);
        res.json({ message: 'Document deleted.' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete.' });
    }
});

// ── Notes CRUD ──────────────────────────────────────
router.get('/:clientId/notes', async (req, res) => {
    try {
        const notes = await prisma.clientNote.findMany({ where: { clientId: req.params.clientId, userId: req.user.id }, orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }] });
        const mapped = notes.map(n => ({ ...n, is_pinned: n.isPinned, created_at: n.createdAt }));
        res.json(mapped);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch notes.' });
    }
});

router.post('/:clientId/notes', async (req, res) => {
    try {
        const { content } = req.body;
        if (!content) return res.status(400).json({ error: 'Content is required.' });
        const note = await prisma.clientNote.create({ data: { clientId: req.params.clientId, userId: req.user.id, content } });
        await addTimeline(req.params.clientId, req.user.id, 'CREATE', 'note', `Added note`);
        res.status(201).json({ message: 'Note added', note: { ...note, is_pinned: note.isPinned, created_at: note.createdAt } });
    } catch (err) {
        res.status(500).json({ error: 'Failed to create note.' });
    }
});

router.put('/:clientId/notes/:noteId/pin', async (req, res) => {
    try {
        const note = await prisma.clientNote.findFirst({ where: { id: req.params.noteId, clientId: req.params.clientId } });
        if (!note) return res.status(404).json({ error: 'Note not found.' });
        const updated = await prisma.clientNote.update({ where: { id: note.id }, data: { isPinned: !note.isPinned } });
        res.json({ message: `Note ${updated.isPinned ? 'pinned' : 'unpinned'}`, note: { ...updated, is_pinned: updated.isPinned } });
    } catch (err) {
        res.status(500).json({ error: 'Failed to toggle pin.' });
    }
});

router.delete('/:clientId/notes/:noteId', async (req, res) => {
    try {
        await prisma.clientNote.delete({ where: { id: req.params.noteId } });
        await addTimeline(req.params.clientId, req.user.id, 'DELETE', 'note', 'Deleted a note');
        res.json({ message: 'Note deleted.' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete note.' });
    }
});

// ── Timeline ────────────────────────────────────────
router.get('/:clientId/timeline', async (req, res) => {
    try {
        const timeline = await prisma.clientTimeline.findMany({ where: { clientId: req.params.clientId }, orderBy: { createdAt: 'desc' }, take: 50 });
        const mapped = timeline.map(t => ({ ...t, entity_type: t.entityType, created_at: t.createdAt }));
        res.json(mapped);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch timeline.' });
    }
});

module.exports = router;
