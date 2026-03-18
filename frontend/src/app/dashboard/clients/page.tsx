'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function ClientsPage() {
    const [clients, setClients] = useState<any[]>([]);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingClient, setEditingClient] = useState<any>(null);
    const [form, setForm] = useState({ name: '', email: '', phone: '', gstin: '', pan: '', address: '', business_type: '' });
    const [pagination, setPagination] = useState<any>({});

    useEffect(() => { loadClients(); }, []);

    const loadClients = async (page = 1) => {
        try {
            const res = await api.getClients({ search, page, limit: 20 });
            setClients(res.clients || []);
            setPagination(res.pagination || {});
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    const handleSearch = (e: React.FormEvent) => { e.preventDefault(); loadClients(); };

    const openNew = () => { setEditingClient(null); setForm({ name: '', email: '', phone: '', gstin: '', pan: '', address: '', business_type: '' }); setShowModal(true); };

    const openEdit = (client: any) => {
        setEditingClient(client);
        setForm({ name: client.name, email: client.email || '', phone: client.phone || '', gstin: client.gstin || '', pan: client.pan || '', address: client.address || '', business_type: client.business_type || '' });
        setShowModal(true);
    };

    const handleSave = async () => {
        try {
            if (editingClient) {
                await api.updateClient(editingClient.id, form);
            } else {
                await api.createClient(form);
            }
            setShowModal(false);
            loadClients();
        } catch (err: any) { alert(err.message); }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Delete client "${name}"?`)) return;
        try { await api.deleteClient(id); loadClients(); } catch (err: any) { alert(err.message); }
    };

    const update = (field: string, value: string) => setForm(p => ({ ...p, [field]: value }));

    if (loading) return <div className="gradient-text" style={{ fontSize: 20, fontWeight: 600, padding: 40 }}>Loading clients...</div>;

    return (
        <div className="animate-fadeIn">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <div>
                    <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 4 }}>Client Management</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>{pagination.total || 0} clients total</p>
                </div>
                <button className="btn-primary" onClick={openNew}>➕ Add Client</button>
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} style={{ marginBottom: 24, display: 'flex', gap: 12 }}>
                <input className="input-field" placeholder="Search by name, GSTIN, PAN, or email..." value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 400 }} />
                <button className="btn-secondary" type="submit">🔍 Search</button>
            </form>

            {/* Table */}
            {clients.length === 0 ? (
                <div className="glass-card" style={{ padding: 48, textAlign: 'center' }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>👥</div>
                    <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>No clients yet</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>Start by adding your first client.</p>
                    <button className="btn-primary" onClick={openNew}>➕ Add First Client</button>
                </div>
            ) : (
                <div className="table-container">
                    <table>
                        <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>GSTIN</th><th>PAN</th><th>Status</th><th>Actions</th></tr></thead>
                        <tbody>
                            {clients.map(c => (
                                <tr key={c.id}>
                                    <td style={{ fontWeight: 600 }}>{c.name}</td>
                                    <td>{c.email || '-'}</td>
                                    <td>{c.phone || '-'}</td>
                                    <td style={{ fontFamily: 'monospace', fontSize: 13 }}>{c.gstin || '-'}</td>
                                    <td style={{ fontFamily: 'monospace', fontSize: 13 }}>{c.pan || '-'}</td>
                                    <td><span className={`badge ${c.status === 'active' ? 'badge-success' : 'badge-warning'}`}>{c.status}</span></td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <button className="btn-primary" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => router.push(`/dashboard/clients/${c.id}`)}>👁️ View</button>
                                            <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => openEdit(c)}>✏️ Edit</button>
                                            <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: 12, borderColor: 'rgba(239,68,68,0.3)' }} onClick={() => handleDelete(c.id, c.name)}>🗑️</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
                    {Array.from({ length: pagination.totalPages }, (_, i) => (
                        <button key={i} className={i + 1 === pagination.page ? 'btn-primary' : 'btn-secondary'} style={{ padding: '8px 14px', fontSize: 13 }} onClick={() => loadClients(i + 1)}>
                            {i + 1}
                        </button>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>{editingClient ? '✏️ Edit Client' : '➕ New Client'}</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div><label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>Name*</label><input className="input-field" value={form.name} onChange={e => update('name', e.target.value)} placeholder="Client name" required /></div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div><label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>Email</label><input className="input-field" type="email" value={form.email} onChange={e => update('email', e.target.value)} /></div>
                                <div><label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>Phone</label><input className="input-field" value={form.phone} onChange={e => update('phone', e.target.value)} /></div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div><label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>GSTIN</label><input className="input-field" value={form.gstin} onChange={e => update('gstin', e.target.value)} placeholder="22AAAAA0000A1Z5" /></div>
                                <div><label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>PAN</label><input className="input-field" value={form.pan} onChange={e => update('pan', e.target.value)} placeholder="AAAAA0000A" /></div>
                            </div>
                            <div><label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>Business Type</label><input className="input-field" value={form.business_type} onChange={e => update('business_type', e.target.value)} placeholder="Pvt Ltd / LLP / Proprietor" /></div>
                            <div><label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>Address</label><textarea className="input-field" rows={2} value={form.address} onChange={e => update('address', e.target.value)} /></div>
                        </div>
                        <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'flex-end' }}>
                            <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                            <button className="btn-primary" onClick={handleSave} disabled={!form.name}>{editingClient ? '💾 Update' : '➕ Create'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
