'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

const fmt = (n: number) => n?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00';

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
    DRAFT: { bg: 'rgba(156,163,175,0.15)', color: '#9ca3af' },
    SENT: { bg: 'rgba(59,130,246,0.15)', color: '#3b82f6' },
    PAID: { bg: 'rgba(16,185,129,0.15)', color: '#10b981' },
    OVERDUE: { bg: 'rgba(239,68,68,0.15)', color: '#ef4444' },
    CANCELLED: { bg: 'rgba(107,114,128,0.15)', color: '#6b7280' },
};

const GST_RATES = [0, 3, 5, 12, 18, 28];

const STATES: Record<string, string> = {
    '01': 'Jammu & Kashmir', '02': 'Himachal Pradesh', '03': 'Punjab', '04': 'Chandigarh',
    '05': 'Uttarakhand', '06': 'Haryana', '07': 'Delhi', '08': 'Rajasthan',
    '09': 'Uttar Pradesh', '10': 'Bihar', '19': 'West Bengal', '21': 'Odisha',
    '23': 'Madhya Pradesh', '24': 'Gujarat', '27': 'Maharashtra', '29': 'Karnataka',
    '30': 'Goa', '32': 'Kerala', '33': 'Tamil Nadu', '36': 'Telangana', '37': 'Andhra Pradesh',
};

const emptyItem = () => ({ description: '', hsn: '', quantity: 1, unitPrice: 0, gstRate: 18 });

export default function InvoicesPage() {
    const [invoices, setInvoices] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({
        client_name: '', client_gstin: '', client_address: '', client_state: '27',
        seller_name: '', seller_gstin: '', seller_address: '', seller_state: '27',
        items: [emptyItem()], notes: '', due_date: '',
    });

    const loadInvoices = async () => {
        try {
            const data = await api.getInvoices();
            setInvoices(data.invoices || []);
            setStats(data.stats || {});
        } catch { }
    };

    useEffect(() => { loadInvoices(); }, []);

    const addItem = () => setForm(f => ({ ...f, items: [...f.items, emptyItem()] }));
    const removeItem = (idx: number) => setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));
    const updateItem = (idx: number, key: string, val: any) => {
        setForm(f => ({ ...f, items: f.items.map((item, i) => i === idx ? { ...item, [key]: val } : item) }));
    };

    const handleCreate = async () => {
        setLoading(true); setError('');
        try {
            await api.createInvoice(form);
            setShowForm(false);
            setForm({ client_name: '', client_gstin: '', client_address: '', client_state: '27', seller_name: '', seller_gstin: '', seller_address: '', seller_state: '27', items: [emptyItem()], notes: '', due_date: '' });
            loadInvoices();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id: string, status: string) => {
        try {
            await api.updateInvoiceStatus(id, status);
            loadInvoices();
        } catch { }
    };

    const deleteInvoice = async (id: string) => {
        try {
            await api.deleteInvoice(id);
            loadInvoices();
        } catch { }
    };

    const subtotal = form.items.reduce((s, item) => s + item.quantity * item.unitPrice, 0);
    const totalGST = form.items.reduce((s, item) => s + (item.quantity * item.unitPrice * item.gstRate / 100), 0);
    const grandTotal = Math.round(subtotal + totalGST);

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
                <div>
                    <h1 className="gradient-text" style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>🧾 Invoices & Billing</h1>
                    <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0', fontSize: 14 }}>Create GST invoices, track payments, manage billing</p>
                </div>
                <button className="btn-primary" onClick={() => setShowForm(!showForm)} style={{ padding: '10px 20px', fontSize: 14 }}>
                    {showForm ? '✕ Cancel' : '+ New Invoice'}
                </button>
            </div>

            {error && <div style={{ background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.3)', borderRadius: 12, padding: '12px 16px', color: '#ff5050', marginBottom: 20, fontSize: 14 }}>⚠️ {error}</div>}

            {/* Stats Cards */}
            {stats && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 24 }}>
                    {[
                        { label: 'Total Invoices', value: stats.total_invoices || 0, icon: '📋', color: '#6366f1' },
                        { label: 'Received', value: `₹${fmt(stats.total_received || 0)}`, icon: '✅', color: '#10b981' },
                        { label: 'Pending', value: `₹${fmt(stats.total_pending || 0)}`, icon: '⏳', color: '#f59e0b' },
                        { label: 'Overdue', value: `₹${fmt(stats.total_overdue || 0)}`, icon: '🔴', color: '#ef4444' },
                    ].map(card => (
                        <div key={card.label} className="glass-card" style={{ padding: '16px 18px' }}>
                            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>{card.icon} {card.label}</div>
                            <div style={{ fontSize: 20, fontWeight: 700, color: card.color }}>{card.value}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Form */}
            {showForm && (
                <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Create New Invoice</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                        <div>
                            <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>📤 Seller Details</h4>
                            <input placeholder="Firm/Seller Name" value={form.seller_name} onChange={e => setForm(f => ({ ...f, seller_name: e.target.value }))} style={inputStyle} />
                            <input placeholder="Seller GSTIN" value={form.seller_gstin} onChange={e => setForm(f => ({ ...f, seller_gstin: e.target.value }))} style={inputStyle} />
                            <select value={form.seller_state} onChange={e => setForm(f => ({ ...f, seller_state: e.target.value }))} style={inputStyle}>
                                {Object.entries(STATES).map(([code, name]) => <option key={code} value={code}>{code} - {name}</option>)}
                            </select>
                        </div>
                        <div>
                            <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>📥 Client Details</h4>
                            <input placeholder="Client Name *" value={form.client_name} onChange={e => setForm(f => ({ ...f, client_name: e.target.value }))} style={inputStyle} />
                            <input placeholder="Client GSTIN" value={form.client_gstin} onChange={e => setForm(f => ({ ...f, client_gstin: e.target.value }))} style={inputStyle} />
                            <select value={form.client_state} onChange={e => setForm(f => ({ ...f, client_state: e.target.value }))} style={inputStyle}>
                                {Object.entries(STATES).map(([code, name]) => <option key={code} value={code}>{code} - {name}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Line Items */}
                    <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>📦 Line Items</h4>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, marginBottom: 12 }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                {['Description', 'HSN', 'Qty', 'Unit Price (₹)', 'GST %', 'Total', ''].map(h => (
                                    <th key={h} style={{ padding: '6px 8px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {form.items.map((item, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '4px 4px' }}><input value={item.description} onChange={e => updateItem(i, 'description', e.target.value)} placeholder="Item description" style={{ ...inputStyle, marginBottom: 0 }} /></td>
                                    <td style={{ padding: '4px 4px', width: 80 }}><input value={item.hsn} onChange={e => updateItem(i, 'hsn', e.target.value)} placeholder="HSN" style={{ ...inputStyle, marginBottom: 0, width: 80 }} /></td>
                                    <td style={{ padding: '4px 4px', width: 60 }}><input type="number" value={item.quantity} onChange={e => updateItem(i, 'quantity', parseInt(e.target.value) || 1)} style={{ ...inputStyle, marginBottom: 0, width: 60 }} /></td>
                                    <td style={{ padding: '4px 4px', width: 100 }}><input type="number" value={item.unitPrice} onChange={e => updateItem(i, 'unitPrice', parseFloat(e.target.value) || 0)} style={{ ...inputStyle, marginBottom: 0, width: 100 }} /></td>
                                    <td style={{ padding: '4px 4px', width: 80 }}>
                                        <select value={item.gstRate} onChange={e => updateItem(i, 'gstRate', parseInt(e.target.value))} style={{ ...inputStyle, marginBottom: 0, width: 80 }}>
                                            {GST_RATES.map(r => <option key={r} value={r}>{r}%</option>)}
                                        </select>
                                    </td>
                                    <td style={{ padding: '4px 8px', fontWeight: 600 }}>₹{fmt(item.quantity * item.unitPrice * (1 + item.gstRate / 100))}</td>
                                    <td style={{ padding: '4px 4px' }}>{form.items.length > 1 && <button onClick={() => removeItem(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: 16 }}>✕</button>}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <button onClick={addItem} className="btn-secondary" style={{ fontSize: 12, padding: '6px 12px', marginBottom: 16 }}>+ Add Item</button>

                    {/* Totals */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 24, padding: '12px 0', borderTop: '2px solid var(--border-color)' }}>
                        <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Subtotal: <strong>₹{fmt(subtotal)}</strong></span>
                        <span style={{ fontSize: 14, color: '#f59e0b' }}>GST: <strong>₹{fmt(totalGST)}</strong></span>
                        <span style={{ fontSize: 16, fontWeight: 700, color: '#10b981' }}>Grand Total: ₹{grandTotal.toLocaleString('en-IN')}</span>
                    </div>

                    <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                        <input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} style={{ ...inputStyle, marginBottom: 0, maxWidth: 200 }} placeholder="Due Date" />
                        <input placeholder="Notes (optional)" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} style={{ ...inputStyle, marginBottom: 0, flex: 1 }} />
                        <button className="btn-primary" onClick={handleCreate} disabled={loading || !form.client_name} style={{ padding: '10px 24px', whiteSpace: 'nowrap' }}>
                            {loading ? '⏳ Creating...' : '✅ Create Invoice'}
                        </button>
                    </div>
                </div>
            )}

            {/* Invoice List */}
            <div className="glass-card" style={{ padding: 24 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>📋 All Invoices</h3>
                {invoices.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: 40 }}>No invoices yet. Create your first GST invoice above.</p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    {['Invoice #', 'Client', 'GSTIN', 'Date', 'Amount', 'Status', 'Actions'].map(h => (
                                        <th key={h} style={{ padding: '8px 12px', textAlign: h === 'Amount' ? 'right' : 'left', fontWeight: 600, color: 'var(--text-secondary)' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {invoices.map((inv: any) => (
                                    <tr key={inv.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                        <td style={{ padding: '10px 12px', fontWeight: 600 }}>{inv.invoice_number}</td>
                                        <td style={{ padding: '10px 12px' }}>{inv.client_name}</td>
                                        <td style={{ padding: '10px 12px', fontSize: 12, fontFamily: 'monospace' }}>{inv.client_gstin || '—'}</td>
                                        <td style={{ padding: '10px 12px' }}>{new Date(inv.invoice_date).toLocaleDateString('en-IN')}</td>
                                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600 }}>₹{fmt(inv.grand_total)}</td>
                                        <td style={{ padding: '10px 12px' }}>
                                            <span style={{ padding: '3px 10px', borderRadius: 8, fontSize: 11, fontWeight: 600, background: STATUS_COLORS[inv.status]?.bg, color: STATUS_COLORS[inv.status]?.color }}>{inv.status}</span>
                                        </td>
                                        <td style={{ padding: '10px 12px' }}>
                                            <div style={{ display: 'flex', gap: 4 }}>
                                                {inv.status === 'DRAFT' && <button onClick={() => updateStatus(inv.id, 'SENT')} style={actionBtn}>📤 Send</button>}
                                                {inv.status === 'SENT' && <button onClick={() => updateStatus(inv.id, 'PAID')} style={{ ...actionBtn, color: '#10b981' }}>✅ Paid</button>}
                                                <button onClick={() => deleteInvoice(inv.id)} style={{ ...actionBtn, color: '#ef4444' }}>🗑️</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

const inputStyle: React.CSSProperties = {
    width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border-color)',
    background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 13, outline: 'none', marginBottom: 8,
};

const actionBtn: React.CSSProperties = {
    background: 'none', border: '1px solid var(--border-color)', borderRadius: 6, padding: '3px 8px',
    cursor: 'pointer', fontSize: 11, color: 'var(--text-secondary)',
};
