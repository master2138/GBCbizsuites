'use client';
import { useState } from 'react';

const PURCHASE_REGISTER = [
    { inv: 'INV-001', date: '2025-10-05', supplier: 'M/s ABC Traders', gstin: '27AABCA1234D1ZP', taxable: 50000, igst: 0, cgst: 4500, sgst: 4500, total: 59000, matched: true },
    { inv: 'INV-002', date: '2025-10-08', supplier: 'XYZ Enterprises', gstin: '29BCDXE5678K1ZR', taxable: 120000, igst: 21600, cgst: 0, sgst: 0, total: 141600, matched: true },
    { inv: 'INV-003', date: '2025-10-12', supplier: 'PQR Services', gstin: '27EFGPQ9876H1ZS', taxable: 35000, igst: 0, cgst: 3150, sgst: 3150, total: 41300, matched: false },
    { inv: 'INV-004', date: '2025-10-15', supplier: 'Tech Solutions LLP', gstin: '27AABCT4567J1ZT', taxable: 80000, igst: 0, cgst: 7200, sgst: 7200, total: 94400, matched: true },
    { inv: 'INV-005', date: '2025-10-20', supplier: 'Fresh Foods Pvt Ltd', gstin: '27AABCF5678K1ZR', taxable: 200000, igst: 0, cgst: 18000, sgst: 18000, total: 236000, matched: true },
    { inv: 'INV-006', date: '2025-10-25', supplier: 'Cloud Hosting Inc', gstin: '06HIKCL2345M1ZU', taxable: 15000, igst: 2700, cgst: 0, sgst: 0, total: 17700, matched: false },
];

const GSTR2B = [
    { inv: 'INV-001', supplier: 'M/s ABC Traders', gstin: '27AABCA1234D1ZP', taxable: 50000, igst: 0, cgst: 4500, sgst: 4500, itc: 9000 },
    { inv: 'INV-002', supplier: 'XYZ Enterprises', gstin: '29BCDXE5678K1ZR', taxable: 120000, igst: 21600, cgst: 0, sgst: 0, itc: 21600 },
    { inv: 'INV-004', supplier: 'Tech Solutions LLP', gstin: '27AABCT4567J1ZT', taxable: 80000, igst: 0, cgst: 7200, sgst: 7200, itc: 14400 },
    { inv: 'INV-005', supplier: 'Fresh Foods Pvt Ltd', gstin: '27AABCF5678K1ZR', taxable: 200000, igst: 0, cgst: 18000, sgst: 18000, itc: 36000 },
    { inv: 'INV-007', supplier: 'Unknown Vendor', gstin: '24MNOUV6789N1ZV', taxable: 25000, igst: 4500, cgst: 0, sgst: 0, itc: 4500 },
];

const fmt = (v: number) => v ? `₹${v.toLocaleString('en-IN')}` : '—';

export default function ReconciliationPage() {
    const [tab, setTab] = useState<'summary' | 'matched' | 'unmatched'>('summary');
    const matched = PURCHASE_REGISTER.filter(p => p.matched);
    const unmatchedPR = PURCHASE_REGISTER.filter(p => !p.matched);
    const unmatchedGSTR = GSTR2B.filter(g => !PURCHASE_REGISTER.some(p => p.inv === g.inv));

    const totalPR_ITC = PURCHASE_REGISTER.reduce((s, p) => s + p.cgst + p.sgst + p.igst, 0);
    const total2B_ITC = GSTR2B.reduce((s, g) => s + g.itc, 0);

    return (
        <div className="animate-fadeIn">
            <div style={{ marginBottom: 20 }}>
                <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }} className="gradient-text">GSTR-2B Reconciliation</h1>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Purchase Register vs GSTR-2B · ITC Matching · Oct 2025</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10, marginBottom: 16 }}>
                {[
                    { label: 'PR Invoices', value: PURCHASE_REGISTER.length, color: '#C9A84C' },
                    { label: 'GSTR-2B Entries', value: GSTR2B.length, color: '#8B5CF6' },
                    { label: 'Matched', value: matched.length, color: '#22c55e' },
                    { label: 'Unmatched (PR)', value: unmatchedPR.length, color: '#ef4444' },
                    { label: 'Unmatched (2B)', value: unmatchedGSTR.length, color: '#f59e0b' },
                    { label: 'ITC Difference', value: fmt(Math.abs(totalPR_ITC - total2B_ITC)), color: '#D4700A' },
                ].map(c => (
                    <div key={c.label} className="glass-card" style={{ padding: 14, borderLeft: `3px solid ${c.color}` }}>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 4 }}>{c.label}</div>
                        <div style={{ fontSize: 20, fontWeight: 800, fontFamily: 'monospace', color: c.color }}>{c.value}</div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
                {(['summary', 'matched', 'unmatched'] as const).map(t => (
                    <button key={t} onClick={() => setTab(t)} style={{
                        padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                        background: tab === t ? 'var(--accent-gradient)' : 'rgba(255,255,255,0.04)',
                        color: tab === t ? '#07091A' : 'var(--text-secondary)',
                    }}>{t === 'summary' ? '📊 Summary' : t === 'matched' ? '✅ Matched' : '⚠️ Unmatched'}</button>
                ))}
            </div>

            {tab === 'summary' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <div className="glass-card" style={{ padding: 20 }}>
                        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#C9A84C', marginBottom: 12 }}>📋 Purchase Register ITC</h3>
                        {PURCHASE_REGISTER.map(p => (
                            <div key={p.inv} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-color)', fontSize: 12 }}>
                                <span>{p.supplier}</span>
                                <span style={{ fontFamily: 'monospace', color: p.matched ? '#22c55e' : '#ef4444' }}>{fmt(p.cgst + p.sgst + p.igst)}</span>
                            </div>
                        ))}
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', fontWeight: 700, fontSize: 13 }}>
                            <span>Total ITC (PR)</span><span style={{ fontFamily: 'monospace', color: '#C9A84C' }}>{fmt(totalPR_ITC)}</span>
                        </div>
                    </div>
                    <div className="glass-card" style={{ padding: 20 }}>
                        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#8B5CF6', marginBottom: 12 }}>📑 GSTR-2B ITC</h3>
                        {GSTR2B.map(g => (
                            <div key={g.inv} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-color)', fontSize: 12 }}>
                                <span>{g.supplier}</span>
                                <span style={{ fontFamily: 'monospace', color: '#8B5CF6' }}>{fmt(g.itc)}</span>
                            </div>
                        ))}
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', fontWeight: 700, fontSize: 13 }}>
                            <span>Total ITC (2B)</span><span style={{ fontFamily: 'monospace', color: '#8B5CF6' }}>{fmt(total2B_ITC)}</span>
                        </div>
                    </div>
                </div>
            )}

            {tab === 'matched' && (
                <div className="glass-card" style={{ padding: 16 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                        <thead><tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                            {['Invoice', 'Supplier', 'GSTIN', 'Taxable', 'CGST', 'SGST', 'IGST', 'Status'].map(h =>
                                <th key={h} style={{ textAlign: 'left', padding: '8px 6px', fontSize: 11, color: 'var(--text-secondary)', fontWeight: 700 }}>{h}</th>
                            )}
                        </tr></thead>
                        <tbody>{matched.map(m => (
                            <tr key={m.inv} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                <td style={{ padding: '8px 6px', fontFamily: 'monospace', fontWeight: 700 }}>{m.inv}</td>
                                <td style={{ padding: '8px 6px' }}>{m.supplier}</td>
                                <td style={{ padding: '8px 6px', fontFamily: 'monospace', fontSize: 10 }}>{m.gstin}</td>
                                <td style={{ padding: '8px 6px', fontFamily: 'monospace' }}>{fmt(m.taxable)}</td>
                                <td style={{ padding: '8px 6px', fontFamily: 'monospace' }}>{fmt(m.cgst)}</td>
                                <td style={{ padding: '8px 6px', fontFamily: 'monospace' }}>{fmt(m.sgst)}</td>
                                <td style={{ padding: '8px 6px', fontFamily: 'monospace' }}>{fmt(m.igst)}</td>
                                <td style={{ padding: '8px 6px' }}><span style={{ padding: '3px 8px', borderRadius: 12, fontSize: 10, fontWeight: 700, background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}>✓ Matched</span></td>
                            </tr>
                        ))}</tbody>
                    </table>
                </div>
            )}

            {tab === 'unmatched' && (
                <div style={{ display: 'grid', gap: 14 }}>
                    <div className="glass-card" style={{ padding: 16 }}>
                        <h3 style={{ fontSize: 13, fontWeight: 700, color: '#ef4444', marginBottom: 10 }}>⚠️ In Purchase Register but NOT in GSTR-2B</h3>
                        {unmatchedPR.map(p => (
                            <div key={p.inv} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-color)', fontSize: 12 }}>
                                <span><strong>{p.inv}</strong> — {p.supplier} ({p.gstin})</span>
                                <span style={{ fontFamily: 'monospace', color: '#ef4444' }}>ITC at risk: {fmt(p.cgst + p.sgst + p.igst)}</span>
                            </div>
                        ))}
                    </div>
                    <div className="glass-card" style={{ padding: 16 }}>
                        <h3 style={{ fontSize: 13, fontWeight: 700, color: '#f59e0b', marginBottom: 10 }}>📌 In GSTR-2B but NOT in Purchase Register</h3>
                        {unmatchedGSTR.map(g => (
                            <div key={g.inv} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-color)', fontSize: 12 }}>
                                <span><strong>{g.inv}</strong> — {g.supplier} ({g.gstin})</span>
                                <span style={{ fontFamily: 'monospace', color: '#f59e0b' }}>Unclaimed ITC: {fmt(g.itc)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
