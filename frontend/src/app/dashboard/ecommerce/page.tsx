'use client';
import { useState } from 'react';

const PLATFORMS = [
    { value: '', label: '🔍 Auto-detect Platform' },
    { value: 'AMAZON', label: '📦 Amazon' },
    { value: 'FLIPKART', label: '🛍️ Flipkart' },
    { value: 'MEESHO', label: '🧵 Meesho' },
    { value: 'MYNTRA', label: '👗 Myntra' },
];

const DEMO_REPORT = {
    platform: 'AMAZON',
    summary: { totalTransactions: 48, totalSales: 385000, totalTaxable: 326271, totalGST: 58729, totalPlatformFees: 42350, totalTCS: 3850, netReceivable: 338800 },
    gstr1: {
        hsnSummary: [
            { hsn: '6109', rate: 5, quantity: 120, taxableValue: 96000, cgst: 2400, sgst: 2400, igst: 0, total: 100800 },
            { hsn: '6205', rate: 12, quantity: 85, taxableValue: 127500, cgst: 7650, sgst: 7650, igst: 0, total: 142800 },
            { hsn: '8471', rate: 18, quantity: 15, taxableValue: 102771, cgst: 9250, sgst: 9250, igst: 0, total: 121271 },
        ],
        totals: { salesCount: 48, totalTaxable: 326271, totalTax: 58729, totalValue: 385000 },
    },
    transactions: Array.from({ length: 12 }, (_, i) => ({
        date: `2026-03-${String(28 - i).padStart(2, '0')}`, orderId: `402-${7890123 + i}-${456 + i}`,
        product: ['Men Cotton T-Shirt', 'Formal Shirt Slim Fit', 'Wireless Mouse USB', 'Laptop Stand Aluminum', 'USB-C Hub 7-in-1', 'Kurti Set Women'][i % 6],
        hsn: ['6109', '6205', '8471', '8304', '8471', '6204'][i % 6], gstRate: [5, 12, 18, 18, 18, 5][i % 6],
        quantity: [2, 1, 1, 1, 1, 3][i % 6], itemPrice: [800, 1500, 2500, 3200, 1800, 650][i % 6] * [2, 1, 1, 1, 1, 3][i % 6],
        totalTax: Math.round([800, 1500, 2500, 3200, 1800, 650][i % 6] * [2, 1, 1, 1, 1, 3][i % 6] * [0.05, 0.12, 0.18, 0.18, 0.18, 0.05][i % 6]),
        platformFees: Math.round([800, 1500, 2500, 3200, 1800, 650][i % 6] * [2, 1, 1, 1, 1, 3][i % 6] * 0.11),
        netAmount: Math.round([800, 1500, 2500, 3200, 1800, 650][i % 6] * [2, 1, 1, 1, 1, 3][i % 6] * 0.94),
        type: i === 4 ? 'RETURN' : 'SALE',
    })),
};

const fmt = (n: number) => n?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00';

export default function EcommercePage() {
    const [platform, setPlatform] = useState('');
    const [report, setReport] = useState<typeof DEMO_REPORT | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [gstrView, setGstrView] = useState<'hsn' | 'txns'>('hsn');

    const handleUpload = () => {
        if (!file) return;
        setTimeout(() => setReport(DEMO_REPORT), 600);
    };

    return (
        <div className="animate-fadeIn">
            <div style={{ marginBottom: 20 }}>
                <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }} className="gradient-text">🛒 E-Commerce Reports</h1>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Parse marketplace sales → GSTR-1 summary → Tally export</p>
            </div>

            {!report ? (
                <div className="glass-card" style={{ padding: 24 }}>
                    <div style={{ marginBottom: 14 }}>
                        <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block' }}>Select Platform</label>
                        <select value={platform} onChange={e => setPlatform(e.target.value)} style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.04)', color: 'var(--text-primary)', fontSize: 13, minWidth: 280 }}>
                            {PLATFORMS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                        </select>
                    </div>
                    <div onClick={() => document.getElementById('ecomFile')?.click()} style={{ border: '2px dashed var(--border-color)', borderRadius: 16, padding: 40, textAlign: 'center', cursor: 'pointer' }}>
                        {file ? <><div style={{ fontSize: 40 }}>📄</div><div style={{ fontSize: 14, fontWeight: 600 }}>{file.name}</div></> :
                            <><div style={{ fontSize: 40 }}>📊</div><div style={{ fontSize: 14, fontWeight: 600 }}>Drop marketplace CSV/Excel here</div></>}
                        <input id="ecomFile" type="file" accept=".csv,.xlsx,.xls" style={{ display: 'none' }} onChange={e => { if (e.target.files?.[0]) setFile(e.target.files[0]); }} />
                    </div>
                    {file && <button onClick={handleUpload} style={{ width: '100%', marginTop: 12, padding: 14, borderRadius: 10, border: 'none', background: 'var(--accent-gradient)', color: '#07091A', fontWeight: 800, fontSize: 15, cursor: 'pointer' }}>🤖 Parse & Analyze</button>}
                </div>
            ) : (
                <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                        <span style={{ fontSize: 16, fontWeight: 700 }}>{report.platform} — {report.summary.totalTransactions} transactions</span>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button style={{ padding: '8px 14px', borderRadius: 8, border: 'none', background: 'var(--accent-gradient)', color: '#07091A', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>📥 Tally XML</button>
                            <button onClick={() => setReport(null)} style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 12, cursor: 'pointer' }}>🔄 New</button>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10, marginBottom: 14 }}>
                        {[
                            { label: 'Total Sales', value: `₹${fmt(report.summary.totalSales)}`, color: '#22c55e' },
                            { label: 'Taxable', value: `₹${fmt(report.summary.totalTaxable)}`, color: '#8B5CF6' },
                            { label: 'GST', value: `₹${fmt(report.summary.totalGST)}`, color: '#f59e0b' },
                            { label: 'Platform Fees', value: `₹${fmt(report.summary.totalPlatformFees)}`, color: '#ef4444' },
                            { label: 'TCS', value: `₹${fmt(report.summary.totalTCS)}`, color: '#D4700A' },
                            { label: 'Net Receivable', value: `₹${fmt(report.summary.netReceivable)}`, color: '#C9A84C' },
                        ].map(c => (
                            <div key={c.label} className="glass-card" style={{ padding: 12, borderLeft: `3px solid ${c.color}` }}>
                                <div style={{ fontSize: 10, color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 2 }}>{c.label}</div>
                                <div style={{ fontSize: 16, fontWeight: 800, fontFamily: 'monospace', color: c.color }}>{c.value}</div>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
                        {(['hsn', 'txns'] as const).map(t => (
                            <button key={t} onClick={() => setGstrView(t)} style={{ padding: '6px 16px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, background: gstrView === t ? 'var(--accent-gradient)' : 'rgba(255,255,255,0.04)', color: gstrView === t ? '#07091A' : 'var(--text-secondary)' }}>
                                {t === 'hsn' ? '📋 GSTR-1 HSN' : '📦 Transactions'}
                            </button>
                        ))}
                    </div>

                    {gstrView === 'hsn' && (
                        <div className="glass-card" style={{ padding: 16 }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                                <thead><tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    {['HSN', 'Rate', 'Qty', 'Taxable', 'CGST', 'SGST', 'Total'].map(h => <th key={h} style={{ padding: '8px 6px', textAlign: h === 'HSN' ? 'left' : 'right', color: 'var(--text-secondary)', fontWeight: 700, fontSize: 11 }}>{h}</th>)}
                                </tr></thead>
                                <tbody>{report.gstr1.hsnSummary.map(r => (
                                    <tr key={r.hsn} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                        <td style={{ padding: '8px 6px', fontWeight: 600 }}>{r.hsn}</td>
                                        <td style={{ padding: '8px 6px', textAlign: 'right' }}>{r.rate}%</td>
                                        <td style={{ padding: '8px 6px', textAlign: 'right' }}>{r.quantity}</td>
                                        <td style={{ padding: '8px 6px', textAlign: 'right', fontFamily: 'monospace' }}>₹{fmt(r.taxableValue)}</td>
                                        <td style={{ padding: '8px 6px', textAlign: 'right', fontFamily: 'monospace' }}>₹{fmt(r.cgst)}</td>
                                        <td style={{ padding: '8px 6px', textAlign: 'right', fontFamily: 'monospace' }}>₹{fmt(r.sgst)}</td>
                                        <td style={{ padding: '8px 6px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 700 }}>₹{fmt(r.total)}</td>
                                    </tr>
                                ))}</tbody>
                            </table>
                        </div>
                    )}

                    {gstrView === 'txns' && (
                        <div className="glass-card" style={{ padding: 16 }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                                <thead><tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    {['Date', 'Order ID', 'Product', 'HSN', 'GST%', 'Qty', 'Price', 'Tax', 'Fees', 'Net', 'Type'].map(h => <th key={h} style={{ padding: '6px 4px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 700, fontSize: 10 }}>{h}</th>)}
                                </tr></thead>
                                <tbody>{report.transactions.map((t, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                        <td style={{ padding: '6px 4px' }}>{t.date}</td>
                                        <td style={{ padding: '6px 4px', fontSize: 10, fontFamily: 'monospace' }}>{t.orderId}</td>
                                        <td style={{ padding: '6px 4px', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.product}</td>
                                        <td style={{ padding: '6px 4px' }}>{t.hsn}</td><td style={{ padding: '6px 4px' }}>{t.gstRate}%</td>
                                        <td style={{ padding: '6px 4px' }}>{t.quantity}</td>
                                        <td style={{ padding: '6px 4px', fontFamily: 'monospace' }}>₹{fmt(t.itemPrice)}</td>
                                        <td style={{ padding: '6px 4px', fontFamily: 'monospace', color: '#f59e0b' }}>₹{fmt(t.totalTax)}</td>
                                        <td style={{ padding: '6px 4px', fontFamily: 'monospace', color: '#ef4444' }}>₹{fmt(t.platformFees)}</td>
                                        <td style={{ padding: '6px 4px', fontFamily: 'monospace', color: '#22c55e' }}>₹{fmt(t.netAmount)}</td>
                                        <td style={{ padding: '6px 4px' }}><span style={{ padding: '2px 6px', borderRadius: 4, fontSize: 9, fontWeight: 700, background: t.type === 'SALE' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)', color: t.type === 'SALE' ? '#22c55e' : '#ef4444' }}>{t.type}</span></td>
                                    </tr>
                                ))}</tbody>
                            </table>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
