'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

const PRIORITY_COLORS: Record<string, string> = { URGENT: '#ef4444', HIGH: '#f59e0b', MEDIUM: '#3b82f6', LOW: '#6b7280' };
const STATUS_COLORS: Record<string, string> = { TODO: '#6b7280', IN_PROGRESS: '#3b82f6', REVIEW: '#f59e0b', DONE: '#10b981', ON_HOLD: '#8b5cf6' };

export default function PracticePage() {
    const [items, setItems] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [clients, setClients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [filterStatus, setFilterStatus] = useState('');
    const [form, setForm] = useState({ title: '', category: 'Other', priority: 'MEDIUM', due_date: '', client_id: '', billing_rate: '', notes: '' });

    useEffect(() => { loadAll(); }, []);

    const loadAll = async () => {
        try {
            const [itemsRes, statsRes] = await Promise.all([api.getWorkItems(), api.getPracticeStats()]);
            setItems(itemsRes);
            setStats(statsRes);
            try { const c = await api.getClients(); setClients(c.clients || []); } catch { }
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    const handleCreate = async () => {
        if (!form.title.trim()) return;
        await api.createWorkItem({ ...form, billing_rate: parseFloat(form.billing_rate) || 0 });
        setForm({ title: '', category: 'Other', priority: 'MEDIUM', due_date: '', client_id: '', billing_rate: '', notes: '' });
        setShowForm(false);
        loadAll();
    };

    const handleStatusChange = async (id: string, status: string) => {
        await api.updateWorkItem(id, { status });
        loadAll();
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this work item?')) return;
        await api.deleteWorkItem(id);
        loadAll();
    };

    const handleLogTime = async (id: string) => {
        const hours = prompt('Enter hours spent:');
        if (!hours) return;
        const item = items.find(i => i.id === id);
        await api.updateWorkItem(id, { hours_spent: (item?.hours_spent || 0) + parseFloat(hours) });
        loadAll();
    };

    if (loading) return <div className="gradient-text" style={{ fontSize: 18, padding: 40 }}>Loading practice...</div>;

    const filtered = filterStatus ? items.filter(i => i.status === filterStatus) : items;
    const fmt = (n: number) => n >= 100000 ? `${(n / 100000).toFixed(1)}L` : n >= 1000 ? `${(n / 1000).toFixed(0)}K` : n.toFixed(0);

    return (
        <div className="animate-fadeIn">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                    <h1 style={{ fontSize: 28, fontWeight: 800 }}>Practice Management</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Track work items, time, and billing</p>
                </div>
                <button className="btn-primary" onClick={() => setShowForm(!showForm)}>＋ New Work Item</button>
            </div>

            {/* Stats */}
            {stats && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10, marginBottom: 20 }}>
                    {[
                        { label: 'Total', value: stats.total, color: '#6366f1', icon: '📋' },
                        { label: 'To Do', value: stats.todo, color: '#6b7280', icon: '📝' },
                        { label: 'In Progress', value: stats.inProgress, color: '#3b82f6', icon: '🔄' },
                        { label: 'Done', value: stats.done, color: '#10b981', icon: '✅' },
                        { label: 'Hours', value: stats.totalHours.toFixed(1), color: '#f59e0b', icon: '⏱️' },
                        { label: 'Billing', value: `₹${fmt(stats.totalBilling)}`, color: '#8b5cf6', icon: '💰' },
                        { label: 'Overdue', value: stats.overdue, color: '#ef4444', icon: '⚠️' },
                    ].map(s => (
                        <div key={s.label} className="stat-card" style={{ padding: 12 }}>
                            <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{s.icon} {s.label}</div>
                            <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Form */}
            {showForm && (
                <div className="glass-card" style={{ padding: 16, marginBottom: 16 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                        <input className="form-input" placeholder="Task title *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} style={{ gridColumn: '1/-1' }} />
                        <select className="form-input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                            {(stats?.categories || ['GST Filing', 'ITR Filing', 'TDS Return', 'Audit', 'MCA Filing', 'Compliance', 'Advisory', 'Bookkeeping', 'Registration', 'Other']).map((c: string) => <option key={c}>{c}</option>)}
                        </select>
                        <select className="form-input" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                            {['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                        <input className="form-input" type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} />
                        <select className="form-input" value={form.client_id} onChange={e => setForm({ ...form, client_id: e.target.value })}>
                            <option value="">No client</option>
                            {clients.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <input className="form-input" type="number" placeholder="Billing rate ₹/hr" value={form.billing_rate} onChange={e => setForm({ ...form, billing_rate: e.target.value })} />
                    </div>
                    <textarea className="form-input" placeholder="Notes..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} style={{ marginBottom: 8, minHeight: 50 }} />
                    <button className="btn-primary" onClick={handleCreate}>Create Work Item</button>
                </div>
            )}

            {/* Filters */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 16, flexWrap: 'wrap' }}>
                <button onClick={() => setFilterStatus('')} style={{ padding: '4px 12px', borderRadius: 20, border: '1px solid var(--border-color)', fontSize: 11, fontWeight: 600, cursor: 'pointer', background: !filterStatus ? 'var(--accent-primary)' : 'transparent', color: !filterStatus ? '#fff' : 'var(--text-secondary)' }}>All ({items.length})</button>
                {Object.entries(STATUS_COLORS).map(([s, c]) => {
                    const count = items.filter(i => i.status === s).length;
                    return <button key={s} onClick={() => setFilterStatus(s)} style={{ padding: '4px 12px', borderRadius: 20, border: `1px solid ${c}44`, fontSize: 11, fontWeight: 600, cursor: 'pointer', background: filterStatus === s ? c + '22' : 'transparent', color: filterStatus === s ? c : 'var(--text-secondary)' }}>{s.replace('_', ' ')} ({count})</button>;
                })}
            </div>

            {/* Work Items */}
            {filtered.length === 0 ? (
                <div className="glass-card" style={{ padding: 32, textAlign: 'center', color: 'var(--text-secondary)' }}>No work items. Create one to get started!</div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {filtered.map((item: any) => {
                        const overdue = item.due_date && new Date(item.due_date) < new Date() && item.status !== 'DONE';
                        return (
                            <div key={item.id} className="glass-card" style={{ padding: '12px 16px', borderLeft: `3px solid ${PRIORITY_COLORS[item.priority] || '#6b7280'}` }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{item.title}</div>
                                        <div style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                            <span style={{ color: PRIORITY_COLORS[item.priority] }}>{item.priority}</span>
                                            <span>{item.category}</span>
                                            {item.client_name && <span>👤 {item.client_name}</span>}
                                            {item.due_date && <span style={{ color: overdue ? '#ef4444' : 'inherit' }}>{overdue ? '⚠️ ' : '📅 '}{item.due_date}</span>}
                                            {item.hours_spent > 0 && <span>⏱️ {item.hours_spent}h</span>}
                                            {item.billing_rate > 0 && <span>💰 ₹{(item.hours_spent * item.billing_rate).toFixed(0)}</span>}
                                        </div>
                                    </div>
                                    <select value={item.status} onChange={e => handleStatusChange(item.id, e.target.value)} style={{ padding: '4px 8px', borderRadius: 6, border: `1px solid ${STATUS_COLORS[item.status]}44`, background: STATUS_COLORS[item.status] + '15', color: STATUS_COLORS[item.status], fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>
                                        {Object.keys(STATUS_COLORS).map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                                    </select>
                                    <button onClick={() => handleLogTime(item.id)} style={{ fontSize: 11, color: '#f59e0b', background: 'none', border: 'none', cursor: 'pointer' }}>⏱️</button>
                                    <button onClick={() => handleDelete(item.id)} style={{ fontSize: 11, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>🗑️</button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
