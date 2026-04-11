'use client';
import { useState } from 'react';

const INVOICES = [
    { id: 'INV-2026-001', client: 'M/s Fresh Foods Pvt Ltd', service: 'GST Annual + Audit', amount: 35000, date: '2026-03-01', due: '2026-03-31', status: 'Paid' },
    { id: 'INV-2026-002', client: 'Tech Solutions LLP', service: 'ITR + Tax Audit', amount: 25000, date: '2026-03-05', due: '2026-04-05', status: 'Paid' },
    { id: 'INV-2026-003', client: 'Rajesh Sharma (HUF)', service: 'ITR Filing + TDS', amount: 8000, date: '2026-03-10', due: '2026-04-10', status: 'Overdue' },
    { id: 'INV-2026-004', client: 'Sharma & Sons Partnership', service: 'GST Returns (12 months)', amount: 18000, date: '2026-03-15', due: '2026-04-15', status: 'Pending' },
    { id: 'INV-2026-005', client: 'Green Earth NGO', service: 'ITR + 12A/80G Compliance', amount: 12000, date: '2026-03-20', due: '2026-04-20', status: 'Pending' },
    { id: 'INV-2026-006', client: 'Priya Gupta', service: 'ITR-2 + Capital Gains', amount: 5000, date: '2026-04-01', due: '2026-05-01', status: 'Draft' },
    { id: 'INV-2026-007', client: 'NRI Holdings Ltd', service: 'Transfer Pricing + ITR', amount: 75000, date: '2026-04-05', due: '2026-05-05', status: 'Draft' },
];

const statusColor: Record<string, string> = { Paid: '#22c55e', Pending: '#f59e0b', Overdue: '#ef4444', Draft: '#6B7A9F' };

export default function PracticePage() {
    const [tab, setTab] = useState<'invoices' | 'services'>('invoices');
    const total = INVOICES.reduce((s, i) => s + i.amount, 0);
    const paid = INVOICES.filter(i => i.status === 'Paid').reduce((s, i) => s + i.amount, 0);
    const pending = INVOICES.filter(i => i.status !== 'Paid' && i.status !== 'Draft').reduce((s, i) => s + i.amount, 0);

    return (
        <div className="animate-fadeIn">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }} className="gradient-text">Practice Management</h1>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Billing · Service Tracking · Fee Collection</p>
                </div>
                <button style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: 'var(--accent-gradient)', color: '#07091A', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>+ New Invoice</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10, marginBottom: 16 }}>
                {[
                    { label: 'Total Billed', value: `₹${(total / 1000).toFixed(0)}K`, color: '#C9A84C' },
                    { label: 'Collected', value: `₹${(paid / 1000).toFixed(0)}K`, color: '#22c55e' },
                    { label: 'Outstanding', value: `₹${(pending / 1000).toFixed(0)}K`, color: '#ef4444' },
                    { label: 'Invoices', value: INVOICES.length, color: '#8B5CF6' },
                ].map(c => (
                    <div key={c.label} className="glass-card" style={{ padding: 14, borderLeft: `3px solid ${c.color}` }}>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 4 }}>{c.label}</div>
                        <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'monospace', color: c.color }}>{c.value}</div>
                    </div>
                ))}
            </div>

            <div className="glass-card" style={{ padding: 16 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead><tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                        {['Invoice #', 'Client', 'Service', 'Amount', 'Date', 'Due', 'Status'].map(h =>
                            <th key={h} style={{ textAlign: 'left', padding: '8px', fontSize: 11, color: 'var(--text-secondary)', fontWeight: 700 }}>{h}</th>
                        )}
                    </tr></thead>
                    <tbody>{INVOICES.map(inv => (
                        <tr key={inv.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <td style={{ padding: '10px 8px', fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color: '#C9A84C' }}>{inv.id}</td>
                            <td style={{ padding: '10px 8px', fontWeight: 600 }}>{inv.client}</td>
                            <td style={{ padding: '10px 8px', fontSize: 12 }}>{inv.service}</td>
                            <td style={{ padding: '10px 8px', fontFamily: 'monospace' }}>₹{inv.amount.toLocaleString()}</td>
                            <td style={{ padding: '10px 8px', fontSize: 12 }}>{inv.date}</td>
                            <td style={{ padding: '10px 8px', fontSize: 12 }}>{inv.due}</td>
                            <td style={{ padding: '10px 8px' }}>
                                <span style={{
                                    padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700,
                                    background: `${statusColor[inv.status]}20`, color: statusColor[inv.status]
                                }}>{inv.status}</span>
                            </td>
                        </tr>
                    ))}</tbody>
                </table>
            </div>
        </div>
    );
}
