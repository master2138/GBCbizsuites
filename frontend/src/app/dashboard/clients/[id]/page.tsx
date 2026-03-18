'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function ClientDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [profile, setProfile] = useState<any>(null);
    const [tab, setTab] = useState('overview');
    const [docs, setDocs] = useState<any[]>([]);
    const [notes, setNotes] = useState<any[]>([]);
    const [timeline, setTimeline] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [noteText, setNoteText] = useState('');
    const [docCategory, setDocCategory] = useState('Other');
    const [docNotes, setDocNotes] = useState('');

    useEffect(() => { loadProfile(); }, [id]);

    const loadProfile = async () => {
        try {
            const data = await api.getClientProfile(id as string);
            setProfile(data);
        } catch { }
        setLoading(false);
    };

    const loadDocs = async () => { try { const d = await api.getClientDocuments(id as string); setDocs(d); } catch { } };
    const loadNotes = async () => { try { const n = await api.getClientNotes(id as string); setNotes(n); } catch { } };
    const loadTimeline = async () => { try { const t = await api.getClientTimeline(id as string); setTimeline(t); } catch { } };

    useEffect(() => {
        if (tab === 'documents') loadDocs();
        else if (tab === 'notes') loadNotes();
        else if (tab === 'timeline') loadTimeline();
    }, [tab]);

    const handleUploadDoc = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            await api.uploadClientDocument(id as string, file, docCategory, docNotes);
            setDocNotes('');
            loadDocs();
        } catch { alert('Upload failed'); }
    };

    const handleDeleteDoc = async (docId: string) => {
        if (!confirm('Delete this document?')) return;
        await api.deleteClientDocument(id as string, docId);
        loadDocs();
    };

    const handleAddNote = async () => {
        if (!noteText.trim()) return;
        await api.createClientNote(id as string, noteText);
        setNoteText('');
        loadNotes();
    };

    const handlePinNote = async (noteId: string) => {
        await api.toggleNotePin(id as string, noteId);
        loadNotes();
    };

    const handleDeleteNote = async (noteId: string) => {
        await api.deleteClientNote(id as string, noteId);
        loadNotes();
    };

    if (loading) return <div className="gradient-text" style={{ fontSize: 18, padding: 40 }}>Loading client...</div>;
    if (!profile) return <div style={{ padding: 40, color: 'var(--text-secondary)' }}>Client not found. <button onClick={() => router.push('/dashboard/clients')} style={{ color: 'var(--accent-primary)', background: 'none', border: 'none', cursor: 'pointer' }}>← Back</button></div>;

    const client = profile.client;
    const stats = profile.stats;
    const tabs = ['overview', 'documents', 'notes', 'timeline'];
    const catIcon: Record<string, string> = { UPLOAD: '📤', CREATE: '➕', DELETE: '🗑️', UPDATE: '✏️' };

    return (
        <div className="animate-fadeIn">
            <button onClick={() => router.push('/dashboard/clients')} style={{ fontSize: 12, color: 'var(--accent-primary)', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 12 }}>← Back to Clients</button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                <div style={{ width: 56, height: 56, borderRadius: 14, background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 800, color: '#fff' }}>
                    {client.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 800 }}>{client.name}</h1>
                    <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                        {client.business_type && <span>{client.business_type} · </span>}
                        {client.gstin && <span>GSTIN: {client.gstin} · </span>}
                        {client.pan && <span>PAN: {client.pan}</span>}
                    </div>
                </div>
                <span style={{ marginLeft: 'auto', padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: client.status === 'active' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)', color: client.status === 'active' ? '#22c55e' : '#ef4444' }}>
                    {client.status?.toUpperCase()}
                </span>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 20 }}>
                {[
                    { label: 'Statements', value: stats.statements, icon: '📄', color: '#8b5cf6' },
                    { label: 'Documents', value: stats.documents, icon: '📁', color: '#3b82f6' },
                    { label: 'Notes', value: stats.notes, icon: '📝', color: '#f59e0b' },
                    { label: 'Invoices', value: stats.invoices, icon: '🧾', color: '#10b981' },
                ].map(s => (
                    <div key={s.label} className="stat-card" style={{ padding: 14 }}>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{s.icon} {s.label}</div>
                        <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid var(--border-color)', paddingBottom: 8 }}>
                {tabs.map(t => (
                    <button key={t} onClick={() => setTab(t)} style={{ padding: '6px 16px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', background: tab === t ? 'var(--accent-primary)' : 'transparent', color: tab === t ? '#fff' : 'var(--text-secondary)' }}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                ))}
            </div>

            {/* Overview */}
            {tab === 'overview' && (
                <div className="glass-card" style={{ padding: 20 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Client Details</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        {[
                            ['Name', client.name], ['Email', client.email], ['Phone', client.phone],
                            ['GSTIN', client.gstin], ['PAN', client.pan], ['Address', client.address],
                            ['Business Type', client.business_type], ['Member Since', new Date(client.created_at).toLocaleDateString('en-IN')],
                        ].filter(([, v]) => v).map(([label, value]) => (
                            <div key={label as string} style={{ padding: 10, borderRadius: 8, background: 'var(--bg-secondary)' }}>
                                <div style={{ fontSize: 10, color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: 0.5 }}>{label}</div>
                                <div style={{ fontSize: 14, fontWeight: 500 }}>{value}</div>
                            </div>
                        ))}
                    </div>
                    {client.notes && <div style={{ marginTop: 12, padding: 12, borderRadius: 8, background: 'rgba(245,158,11,0.08)', fontSize: 13, color: 'var(--text-secondary)' }}>📝 {client.notes}</div>}
                </div>
            )}

            {/* Documents */}
            {tab === 'documents' && (
                <div>
                    <div className="glass-card" style={{ padding: 16, marginBottom: 16 }}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                            <select value={docCategory} onChange={e => setDocCategory(e.target.value)} className="form-input" style={{ width: 'auto', minWidth: 140 }}>
                                {(profile.categories || []).map((c: string) => <option key={c}>{c}</option>)}
                            </select>
                            <input type="text" placeholder="Notes (optional)" value={docNotes} onChange={e => setDocNotes(e.target.value)} className="form-input" style={{ flex: 1, minWidth: 140 }} />
                            <label className="btn-primary" style={{ cursor: 'pointer', fontSize: 12 }}>
                                📤 Upload
                                <input type="file" hidden onChange={handleUploadDoc} />
                            </label>
                        </div>
                    </div>
                    {docs.length === 0 ? (
                        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: 32 }}>No documents yet. Upload the first one above.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {docs.map((d: any) => (
                                <div key={d.id} className="glass-card" style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <span style={{ fontSize: 20 }}>📄</span>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 13, fontWeight: 600 }}>{d.file_name}</div>
                                        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{d.category} · {(d.file_size / 1024).toFixed(0)} KB · {new Date(d.uploaded_at).toLocaleDateString('en-IN')}</div>
                                    </div>
                                    <a href={api.getClientDocumentUrl(id as string, d.id)} target="_blank" style={{ fontSize: 11, color: 'var(--accent-primary)', cursor: 'pointer', textDecoration: 'none' }}>⬇ Download</a>
                                    <button onClick={() => handleDeleteDoc(d.id)} style={{ fontSize: 11, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>🗑️</button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Notes */}
            {tab === 'notes' && (
                <div>
                    <div className="glass-card" style={{ padding: 14, marginBottom: 16, display: 'flex', gap: 8 }}>
                        <textarea value={noteText} onChange={e => setNoteText(e.target.value)} placeholder="Add a note about this client..." className="form-input" style={{ flex: 1, minHeight: 50, resize: 'vertical' }} />
                        <button className="btn-primary" onClick={handleAddNote} disabled={!noteText.trim()} style={{ alignSelf: 'flex-end' }}>Add</button>
                    </div>
                    {notes.length === 0 ? (
                        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: 32 }}>No notes yet.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {notes.map((n: any) => (
                                <div key={n.id} className="glass-card" style={{ padding: 14, borderLeft: n.is_pinned ? '3px solid #f59e0b' : '3px solid transparent' }}>
                                    <div style={{ fontSize: 13, lineHeight: 1.6, marginBottom: 6, whiteSpace: 'pre-wrap' }}>{n.content}</div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{new Date(n.created_at).toLocaleString('en-IN')}</span>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <button onClick={() => handlePinNote(n.id)} style={{ fontSize: 11, color: n.is_pinned ? '#f59e0b' : 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer' }}>{n.is_pinned ? '📌 Unpin' : '📌 Pin'}</button>
                                            <button onClick={() => handleDeleteNote(n.id)} style={{ fontSize: 11, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>🗑️ Delete</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Timeline */}
            {tab === 'timeline' && (
                <div className="glass-card" style={{ padding: 20 }}>
                    {timeline.length === 0 ? (
                        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: 24 }}>No activity recorded yet.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {timeline.map((t: any, i: number) => (
                                <div key={i} style={{ display: 'flex', gap: 12, paddingBottom: 10, borderBottom: i < timeline.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                                    <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>
                                        {catIcon[t.action] || '📋'}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 13, fontWeight: 500 }}>{t.details}</div>
                                        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{new Date(t.created_at).toLocaleString('en-IN')}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
