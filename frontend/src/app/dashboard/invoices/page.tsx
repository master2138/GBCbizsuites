'use client';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, updateDoc, doc, query, orderBy, serverTimestamp } from 'firebase/firestore';

const fmt = (n: number) => n?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00';
const GST_RATES = [0, 3, 5, 12, 18, 28];
const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
    DRAFT: { bg: 'rgba(156,163,175,0.15)', color: '#9ca3af' }, SENT: { bg: 'rgba(59,130,246,0.15)', color: '#3b82f6' },
    PAID: { bg: 'rgba(16,185,129,0.15)', color: '#10b981' }, OVERDUE: { bg: 'rgba(239,68,68,0.15)', color: '#ef4444' },
};

const SEED_INVOICES = [
    { id: '1', invoice_number: 'INV-2026-001', client_name: 'M/s Fresh Foods Pvt Ltd', client_gstin: '27AABCF5678K1ZR', invoice_date: '2026-03-01', grand_total: 59000, status: 'PAID' },
    { id: '2', invoice_number: 'INV-2026-002', client_name: 'Tech Solutions LLP', client_gstin: '27AABCT4567J1ZS', invoice_date: '2026-03-05', grand_total: 29500, status: 'PAID' },
    { id: '3', invoice_number: 'INV-2026-003', client_name: 'Rajesh Sharma (HUF)', client_gstin: '—', invoice_date: '2026-03-10', grand_total: 9440, status: 'OVERDUE' },
    { id: '4', invoice_number: 'INV-2026-004', client_name: 'Sharma & Sons', client_gstin: '27AADFS7890M1ZT', invoice_date: '2026-03-15', grand_total: 21240, status: 'SENT' },
    { id: '5', invoice_number: 'INV-2026-005', client_name: 'Green Earth NGO', client_gstin: '—', invoice_date: '2026-03-20', grand_total: 14160, status: 'DRAFT' },
];

const emptyItem = () => ({ description: '', hsn: '', quantity: 1, unitPrice: 0, gstRate: 18 });

export default function InvoicesPage() {
    const [invoices, setInvoices] = useState(SEED_INVOICES);
    const [showForm, setShowForm] = useState(false);
    const [firebaseOk, setFirebaseOk] = useState(false);
    const [form, setForm] = useState({
        client_name: '', client_gstin: '', seller_name: 'GBC & Associates', seller_gstin: '27AAAFG1234A1ZP',
        items: [emptyItem()], notes: '', due_date: '',
    });

    useEffect(() => {
        (async () => {
            try {
                const snap = await getDocs(query(collection(db, 'invoices'), orderBy('createdAt', 'desc')));
                if (snap.docs.length > 0) setInvoices(snap.docs.map(d => ({ id: d.id, ...d.data() } as any)));
                setFirebaseOk(true);
            } catch { setFirebaseOk(false); }
        })();
    }, []);

    const addItem = () => setForm(f => ({ ...f, items: [...f.items, emptyItem()] }));
    const removeItem = (idx: number) => setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));
    const updateItem = (idx: number, key: string, val: any) => setForm(f => ({ ...f, items: f.items.map((item, i) => i === idx ? { ...item, [key]: val } : item) }));

    const subtotal = form.items.reduce((s, item) => s + item.quantity * item.unitPrice, 0);
    const totalGST = form.items.reduce((s, item) => s + (item.quantity * item.unitPrice * item.gstRate / 100), 0);
    const grandTotal = Math.round(subtotal + totalGST);

    const handleCreate = async () => {
        if (!form.client_name) return;
        const invNo = `INV-2026-${String(invoices.length + 1).padStart(3, '0')}`;
        const newInv = { invoice_number: invNo, client_name: form.client_name, client_gstin: form.client_gstin || '—', invoice_date: new Date().toISOString().slice(0, 10), grand_total: grandTotal, status: 'DRAFT', items: form.items, seller_name: form.seller_name, notes: form.notes };
        try {
            const docRef = await addDoc(collection(db, 'invoices'), { ...newInv, createdAt: serverTimestamp() });
            setInvoices(prev => [{ ...newInv, id: docRef.id }, ...prev]);
        } catch {
            setInvoices(prev => [{ ...newInv, id: String(Date.now()) }, ...prev]);
        }
        setShowForm(false);
        setForm({ client_name: '', client_gstin: '', seller_name: 'GBC & Associates', seller_gstin: '27AAAFG1234A1ZP', items: [emptyItem()], notes: '', due_date: '' });
    };

    const updateStatus = async (id: string, status: string) => {
        setInvoices(p => p.map(i => i.id === id ? { ...i, status } : i));
        try { await updateDoc(doc(db, 'invoices', id), { status }); } catch { }
    };

    const totalReceived = invoices.filter(i => i.status === 'PAID').reduce((s, i) => s + i.grand_total, 0);
    const totalPending = invoices.filter(i => i.status === 'SENT' || i.status === 'OVERDUE').reduce((s, i) => s + i.grand_total, 0);
    const inputStyle: React.CSSProperties = { width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 13, outline: 'none', marginBottom: 8 };

    return (
        <div className="animate-fadeIn">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }} className="gradient-text">🧾 Invoices & Billing</h1>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                        Create GST invoices · Track payments
                        {firebaseOk && <span style={{ color: '#22c55e', marginLeft: 8 }}>🔥 Firebase</span>}
                    </p>
                </div>
                <button onClick={() => setShowForm(!showForm)} style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: 'var(--accent-gradient)', color: '#07091A', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                    {showForm ? '✕ Cancel' : '+ New Invoice'}
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10, marginBottom: 16 }}>
                {[
                    { label: 'Total Invoices', value: invoices.length, color: '#C9A84C' },
                    { label: 'Received', value: `₹${fmt(totalReceived)}`, color: '#22c55e' },
                    { label: 'Pending', value: `₹${fmt(totalPending)}`, color: '#f59e0b' },
                    { label: 'Overdue', value: `₹${fmt(invoices.filter(i => i.status === 'OVERDUE').reduce((s, i) => s + i.grand_total, 0))}`, color: '#ef4444' },
                ].map(c => (
                    <div key={c.label} className="glass-card" style={{ padding: 14, borderLeft: `3px solid ${c.color}` }}>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 4 }}>{c.label}</div>
                        <div style={{ fontSize: 20, fontWeight: 800, fontFamily: 'monospace', color: c.color }}>{c.value}</div>
                    </div>
                ))}
            </div>

            {showForm && (
                <div className="glass-card" style={{ padding: 20, marginBottom: 16 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Create New Invoice</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                        <div>
                            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>📤 Seller</div>
                            <input value={form.seller_name} onChange={e => setForm(f => ({ ...f, seller_name: e.target.value }))} style={inputStyle} placeholder="Firm Name" />
                            <input value={form.seller_gstin} onChange={e => setForm(f => ({ ...f, seller_gstin: e.target.value }))} style={inputStyle} placeholder="GSTIN" />
                        </div>
                        <div>
                            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>📥 Client</div>
                            <input value={form.client_name} onChange={e => setForm(f => ({ ...f, client_name: e.target.value }))} style={inputStyle} placeholder="Client Name *" />
                            <input value={form.client_gstin} onChange={e => setForm(f => ({ ...f, client_gstin: e.target.value }))} style={inputStyle} placeholder="Client GSTIN" />
                        </div>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, marginBottom: 10 }}>
                        <thead><tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                            {['Description', 'HSN', 'Qty', 'Price', 'GST%', 'Total', ''].map(h => <th key={h} style={{ padding: '6px 4px', textAlign: 'left', color: 'var(--text-secondary)' }}>{h}</th>)}
                        </tr></thead>
                        <tbody>{form.items.map((item, i) => (
                            <tr key={i}><td><input value={item.description} onChange={e => updateItem(i, 'description', e.target.value)} style={{ ...inputStyle, marginBottom: 0 }} placeholder="Item" /></td>
                                <td style={{ width: 70 }}><input value={item.hsn} onChange={e => updateItem(i, 'hsn', e.target.value)} style={{ ...inputStyle, marginBottom: 0, width: 70 }} /></td>
                                <td style={{ width: 50 }}><input type="number" value={item.quantity} onChange={e => updateItem(i, 'quantity', parseInt(e.target.value) || 1)} style={{ ...inputStyle, marginBottom: 0, width: 50 }} /></td>
                                <td style={{ width: 80 }}><input type="number" value={item.unitPrice} onChange={e => updateItem(i, 'unitPrice', parseFloat(e.target.value) || 0)} style={{ ...inputStyle, marginBottom: 0, width: 80 }} /></td>
                                <td style={{ width: 60 }}><select value={item.gstRate} onChange={e => updateItem(i, 'gstRate', parseInt(e.target.value))} style={{ ...inputStyle, marginBottom: 0, width: 60 }}>{GST_RATES.map(r => <option key={r} value={r}>{r}%</option>)}</select></td>
                                <td style={{ fontWeight: 600, padding: '0 6px' }}>₹{fmt(item.quantity * item.unitPrice * (1 + item.gstRate / 100))}</td>
                                <td>{form.items.length > 1 && <button onClick={() => removeItem(i)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>✕</button>}</td>
                            </tr>
                        ))}</tbody>
                    </table>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <button onClick={addItem} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 12, cursor: 'pointer' }}>+ Add Item</button>
                        <div style={{ display: 'flex', gap: 16, fontSize: 13 }}>
                            <span>Subtotal: <strong>₹{fmt(subtotal)}</strong></span>
                            <span style={{ color: '#f59e0b' }}>GST: <strong>₹{fmt(totalGST)}</strong></span>
                            <span style={{ color: '#22c55e', fontWeight: 700 }}>Total: ₹{grandTotal.toLocaleString('en-IN')}</span>
                        </div>
                    </div>
                    <button onClick={handleCreate} disabled={!form.client_name} style={{ marginTop: 12, padding: '10px 24px', borderRadius: 8, border: 'none', background: 'var(--accent-gradient)', color: '#07091A', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>✅ Create Invoice</button>
                </div>
            )}

            <div className="glass-card" style={{ padding: 16 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead><tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                        {['Invoice #', 'Client', 'GSTIN', 'Date', 'Amount', 'Status', 'Actions'].map(h =>
                            <th key={h} style={{ textAlign: h === 'Amount' ? 'right' : 'left', padding: '8px', fontSize: 11, color: 'var(--text-secondary)', fontWeight: 700 }}>{h}</th>
                        )}
                    </tr></thead>
                    <tbody>{invoices.map(inv => (
                        <tr key={inv.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <td style={{ padding: '10px 8px', fontWeight: 700, color: '#C9A84C', fontFamily: 'monospace' }}>{inv.invoice_number}</td>
                            <td style={{ padding: '10px 8px', fontWeight: 600 }}>{inv.client_name}</td>
                            <td style={{ padding: '10px 8px', fontFamily: 'monospace', fontSize: 11 }}>{inv.client_gstin}</td>
                            <td style={{ padding: '10px 8px', fontSize: 12 }}>{inv.invoice_date}</td>
                            <td style={{ padding: '10px 8px', textAlign: 'right', fontFamily: 'monospace' }}>₹{fmt(inv.grand_total)}</td>
                            <td style={{ padding: '10px 8px' }}><span style={{ padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700, background: STATUS_COLORS[inv.status]?.bg, color: STATUS_COLORS[inv.status]?.color }}>{inv.status}</span></td>
                            <td style={{ padding: '10px 8px' }}>
                                <div style={{ display: 'flex', gap: 4 }}>
                                    {inv.status === 'DRAFT' && <button onClick={() => updateStatus(inv.id, 'SENT')} style={{ background: 'none', border: '1px solid var(--border-color)', borderRadius: 4, padding: '2px 8px', fontSize: 11, cursor: 'pointer', color: '#3b82f6' }}>📤 Send</button>}
                                    {inv.status === 'SENT' && <button onClick={() => updateStatus(inv.id, 'PAID')} style={{ background: 'none', border: '1px solid var(--border-color)', borderRadius: 4, padding: '2px 8px', fontSize: 11, cursor: 'pointer', color: '#22c55e' }}>✅ Paid</button>}
                                </div>
                            </td>
                        </tr>
                    ))}</tbody>
                </table>
            </div>
        </div>
    );
}
