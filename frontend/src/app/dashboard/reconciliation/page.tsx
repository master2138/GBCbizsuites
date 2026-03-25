'use client';
import { useState } from 'react';

type InvoiceEntry = { invoiceNo: string; date: string; gstin: string; taxableValue: number; igst: number; cgst: number; sgst: number; source: 'books' | 'gstr' };

export default function ReconciliationPage() {
    const [booksData, setBooksData] = useState('');
    const [gstrData, setGstrData] = useState('');
    const [results, setResults] = useState<{ matched: InvoiceEntry[]; booksOnly: InvoiceEntry[]; gstrOnly: InvoiceEntry[]; mismatched: { books: InvoiceEntry; gstr: InvoiceEntry }[] } | null>(null);

    const parseCSV = (csv: string, source: 'books' | 'gstr'): InvoiceEntry[] => {
        return csv.trim().split('\n').slice(1).map(line => {
            const [invoiceNo, date, gstin, taxableValue, igst, cgst, sgst] = line.split(',').map(s => s.trim());
            return { invoiceNo, date, gstin, taxableValue: Number(taxableValue) || 0, igst: Number(igst) || 0, cgst: Number(cgst) || 0, sgst: Number(sgst) || 0, source };
        }).filter(e => e.invoiceNo);
    };

    const runReconciliation = () => {
        const books = parseCSV(booksData, 'books');
        const gstr = parseCSV(gstrData, 'gstr');
        const matched: InvoiceEntry[] = [];
        const mismatched: { books: InvoiceEntry; gstr: InvoiceEntry }[] = [];
        const usedGstr = new Set<number>();

        books.forEach(b => {
            const gi = gstr.findIndex((g, i) => !usedGstr.has(i) && g.invoiceNo === b.invoiceNo && g.gstin === b.gstin);
            if (gi >= 0) {
                const g = gstr[gi];
                usedGstr.add(gi);
                if (b.taxableValue === g.taxableValue && b.igst === g.igst && b.cgst === g.cgst && b.sgst === g.sgst) {
                    matched.push(b);
                } else {
                    mismatched.push({ books: b, gstr: g });
                }
            }
        });
        const booksOnly = books.filter(b => !matched.find(m => m.invoiceNo === b.invoiceNo) && !mismatched.find(m => m.books.invoiceNo === b.invoiceNo));
        const gstrOnly = gstr.filter((_, i) => !usedGstr.has(i));
        setResults({ matched, booksOnly, gstrOnly, mismatched });
    };

    const sampleBooks = `InvoiceNo,Date,GSTIN,TaxableValue,IGST,CGST,SGST\nINV-001,01-03-2026,27AABCU1234F1ZX,50000,9000,0,0\nINV-002,05-03-2026,29BBCDU5678G1ZY,30000,0,2700,2700\nINV-003,10-03-2026,33CDEFU9012H1ZZ,75000,13500,0,0\nINV-004,15-03-2026,27DEFGU3456I1ZA,20000,0,1800,1800`;
    const sampleGSTR = `InvoiceNo,Date,GSTIN,TaxableValue,IGST,CGST,SGST\nINV-001,01-03-2026,27AABCU1234F1ZX,50000,9000,0,0\nINV-002,05-03-2026,29BBCDU5678G1ZY,30000,0,2500,2500\nINV-005,12-03-2026,24EFGHU7890J1ZB,40000,7200,0,0`;

    const fmt = (n: number) => '₹' + n.toLocaleString('en-IN');

    return (
        <div className="animate-fadeIn">
            <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>🔄 Reconciliation Engine</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Match your books of accounts with GSTR-2B / 2A data — identify mismatches, missing invoices & ITC gaps</p>
            </div>

            {!results ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    <div className="glass-card" style={{ padding: 24 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4, color: '#22c55e' }}>📗 Books of Accounts (Purchase Register)</h3>
                        <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 12 }}>Paste CSV: InvoiceNo, Date, GSTIN, TaxableValue, IGST, CGST, SGST</p>
                        <textarea value={booksData} onChange={e => setBooksData(e.target.value)} rows={10} placeholder={sampleBooks}
                            style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 12, fontFamily: 'monospace', resize: 'vertical' }} />
                        <button onClick={() => setBooksData(sampleBooks)} style={{ marginTop: 8, padding: '6px 14px', borderRadius: 6, border: '1px solid rgba(34,197,94,0.3)', background: 'rgba(34,197,94,0.1)', color: '#22c55e', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>📋 Load Sample Data</button>
                    </div>
                    <div className="glass-card" style={{ padding: 24 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4, color: '#6366f1' }}>📘 GSTR-2B / 2A Data</h3>
                        <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 12 }}>Paste CSV: InvoiceNo, Date, GSTIN, TaxableValue, IGST, CGST, SGST</p>
                        <textarea value={gstrData} onChange={e => setGstrData(e.target.value)} rows={10} placeholder={sampleGSTR}
                            style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 12, fontFamily: 'monospace', resize: 'vertical' }} />
                        <button onClick={() => setGstrData(sampleGSTR)} style={{ marginTop: 8, padding: '6px 14px', borderRadius: 6, border: '1px solid rgba(99,102,241,0.3)', background: 'rgba(99,102,241,0.1)', color: '#6366f1', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>📋 Load Sample Data</button>
                    </div>
                    <div style={{ gridColumn: '1/-1', textAlign: 'center' }}>
                        <button onClick={runReconciliation} style={{ padding: '14px 40px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #C9A84C, #E8CC7D)', color: '#0f172a', fontWeight: 800, fontSize: 15, cursor: 'pointer' }}>🔄 Run Reconciliation</button>
                    </div>
                </div>
            ) : (
                <div>
                    {/* Summary Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
                        {[
                            { label: 'Matched', count: results.matched.length, color: '#22c55e', icon: '✅' },
                            { label: 'Mismatched', count: results.mismatched.length, color: '#f59e0b', icon: '⚠️' },
                            { label: 'In Books Only', count: results.booksOnly.length, color: '#ef4444', icon: '📗' },
                            { label: 'In GSTR Only', count: results.gstrOnly.length, color: '#6366f1', icon: '📘' },
                        ].map(c => (
                            <div key={c.label} className="glass-card" style={{ padding: 18, textAlign: 'center', borderTop: `3px solid ${c.color}` }}>
                                <div style={{ fontSize: 24 }}>{c.icon}</div>
                                <div style={{ fontSize: 28, fontWeight: 800, color: c.color }}>{c.count}</div>
                                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{c.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Mismatched */}
                    {results.mismatched.length > 0 && (
                        <div className="glass-card" style={{ padding: 20, marginBottom: 16 }}>
                            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#f59e0b', marginBottom: 12 }}>⚠️ Value Mismatches</h3>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                                <thead><tr>{['Invoice', 'GSTIN', 'Source', 'Taxable', 'IGST', 'CGST', 'SGST'].map(h => <th key={h} style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid var(--border-color)', color: '#C9A84C', fontSize: 11 }}>{h}</th>)}</tr></thead>
                                <tbody>{results.mismatched.map((m, i) => (
                                    <>
                                        <tr key={`b${i}`} style={{ background: 'rgba(34,197,94,0.05)' }}><td style={{ padding: '6px 8px' }}>{m.books.invoiceNo}</td><td style={{ padding: '6px 8px', fontFamily: 'monospace' }}>{m.books.gstin}</td><td style={{ padding: '6px 8px', color: '#22c55e' }}>Books</td><td style={{ padding: '6px 8px' }}>{fmt(m.books.taxableValue)}</td><td style={{ padding: '6px 8px' }}>{fmt(m.books.igst)}</td><td style={{ padding: '6px 8px' }}>{fmt(m.books.cgst)}</td><td style={{ padding: '6px 8px' }}>{fmt(m.books.sgst)}</td></tr>
                                        <tr key={`g${i}`} style={{ background: 'rgba(99,102,241,0.05)', borderBottom: '2px solid rgba(245,158,11,0.3)' }}><td style={{ padding: '6px 8px' }}>{m.gstr.invoiceNo}</td><td style={{ padding: '6px 8px', fontFamily: 'monospace' }}>{m.gstr.gstin}</td><td style={{ padding: '6px 8px', color: '#6366f1' }}>GSTR</td><td style={{ padding: '6px 8px', color: m.gstr.taxableValue !== m.books.taxableValue ? '#ef4444' : undefined, fontWeight: m.gstr.taxableValue !== m.books.taxableValue ? 700 : undefined }}>{fmt(m.gstr.taxableValue)}</td><td style={{ padding: '6px 8px', color: m.gstr.igst !== m.books.igst ? '#ef4444' : undefined }}>{fmt(m.gstr.igst)}</td><td style={{ padding: '6px 8px', color: m.gstr.cgst !== m.books.cgst ? '#ef4444' : undefined }}>{fmt(m.gstr.cgst)}</td><td style={{ padding: '6px 8px', color: m.gstr.sgst !== m.books.sgst ? '#ef4444' : undefined }}>{fmt(m.gstr.sgst)}</td></tr>
                                    </>
                                ))}</tbody>
                            </table>
                        </div>
                    )}

                    {/* Books Only & GSTR Only */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                        {[{ title: '📗 In Books Only (ITC at Risk)', data: results.booksOnly, color: '#ef4444' }, { title: '📘 In GSTR Only (Not in Books)', data: results.gstrOnly, color: '#6366f1' }].map(sec => (
                            <div key={sec.title} className="glass-card" style={{ padding: 20 }}>
                                <h3 style={{ fontSize: 14, fontWeight: 700, color: sec.color, marginBottom: 12 }}>{sec.title}</h3>
                                {sec.data.length > 0 ? (
                                    <div>{sec.data.map((e, i) => (
                                        <div key={i} style={{ padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: 12 }}>
                                            <span style={{ fontWeight: 700 }}>{e.invoiceNo}</span> · <span style={{ fontFamily: 'monospace', fontSize: 11 }}>{e.gstin}</span> · {fmt(e.taxableValue)}
                                        </div>
                                    ))}</div>
                                ) : <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>None found ✅</p>}
                            </div>
                        ))}
                    </div>
                    <button onClick={() => setResults(null)} style={{ padding: '10px 24px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>← Run New Reconciliation</button>
                </div>
            )}
        </div>
    );
}
