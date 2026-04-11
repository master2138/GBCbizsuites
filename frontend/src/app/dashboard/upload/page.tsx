'use client';
import { useState } from 'react';

const BANKS = [
    { value: '', label: '🔍 Auto-detect bank' },
    { value: 'SBI', label: '🏦 State Bank of India (SBI)' },
    { value: 'HDFC', label: '🏦 HDFC Bank' },
    { value: 'ICICI', label: '🏦 ICICI Bank' },
    { value: 'AXIS', label: '🏦 Axis Bank' },
    { value: 'KOTAK', label: '🏦 Kotak Mahindra Bank' },
    { value: 'BOB', label: '🏦 Bank of Baroda' },
    { value: 'PNB', label: '🏦 Punjab National Bank' },
    { value: 'YES', label: '🏦 Yes Bank' },
    { value: 'INDUSIND', label: '🏦 IndusInd Bank' },
    { value: 'CANARA', label: '🏦 Canara Bank' },
];

const DEMO_TXNS = [
    { date: '2024-03-28', desc: 'NEFT/CR/RAJESH SHARMA', credit: 150000, debit: 0, balance: 682345.50, category: 'Receipt' },
    { date: '2024-03-27', desc: 'UPI/DR/ELECTRICITY BILL', credit: 0, debit: 4500, balance: 532345.50, category: 'Electricity' },
    { date: '2024-03-25', desc: 'IMPS/CR/FRESH FOODS PVT LTD', credit: 85000, debit: 0, balance: 536845.50, category: 'Receipt' },
    { date: '2024-03-23', desc: 'NEFT/DR/GST CHALLAN', credit: 0, debit: 28900, balance: 451845.50, category: 'GST Payment' },
    { date: '2024-03-22', desc: 'UPI/DR/AMAZON PAY', credit: 0, debit: 2499, balance: 480745.50, category: 'E-Commerce' },
    { date: '2024-03-20', desc: 'NEFT/CR/TECH SOLUTIONS LLP', credit: 200000, debit: 0, balance: 483244.50, category: 'Receipt' },
    { date: '2024-03-18', desc: 'CHEQUE/DR/OFFICE RENT', credit: 0, debit: 35000, balance: 283244.50, category: 'Rent' },
    { date: '2024-03-15', desc: 'INTEREST CREDITED', credit: 1245.50, debit: 0, balance: 318244.50, category: 'Interest Received' },
    { date: '2024-03-12', desc: 'EMI/DR/HDFC HOME LOAN', credit: 0, debit: 42000, balance: 316999.00, category: 'Loan EMI' },
    { date: '2024-03-10', desc: 'UPI/DR/SALARY NEHA', credit: 0, debit: 55000, balance: 358999.00, category: 'Salary' },
    { date: '2024-03-08', desc: 'NEFT/CR/ANITA DESAI TRUST', credit: 30000, debit: 0, balance: 413999.00, category: 'Receipt' },
    { date: '2024-03-05', desc: 'BANK CHARGES', credit: 0, debit: 590, balance: 383999.00, category: 'Bank Charges' },
];

const fmt = (v: number) => v ? `₹${v.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—';

export default function UploadPage() {
    const [file, setFile] = useState<File | null>(null);
    const [bank, setBank] = useState('');
    const [parsed, setParsed] = useState(false);
    const [dragOver, setDragOver] = useState(false);

    const handleUpload = () => {
        if (!file) return;
        // Simulate client-side parsing with demo data
        setTimeout(() => setParsed(true), 800);
    };

    const totalCredit = DEMO_TXNS.reduce((s, t) => s + t.credit, 0);
    const totalDebit = DEMO_TXNS.reduce((s, t) => s + t.debit, 0);

    return (
        <div className="animate-fadeIn">
            <div style={{ marginBottom: 20 }}>
                <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }} className="gradient-text">Bank Statement Upload</h1>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Upload PDF/Excel statements · Auto-categorize · Export to Tally XML</p>
            </div>

            {/* Bank Selector */}
            <div className="glass-card" style={{ padding: 16, marginBottom: 14 }}>
                <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, display: 'block' }}>🏦 Select Bank (optional — helps with accurate parsing)</label>
                <select value={bank} onChange={e => setBank(e.target.value)} style={{
                    padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border-color)',
                    background: 'rgba(255,255,255,0.04)', color: 'var(--text-primary)', fontSize: 13, minWidth: 280
                }}>
                    {BANKS.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
                </select>
            </div>

            {/* Drop Zone */}
            <div className="glass-card" style={{
                padding: 40, textAlign: 'center', marginBottom: 14, cursor: 'pointer',
                border: `2px dashed ${dragOver ? '#C9A84C' : 'var(--border-color)'}`,
                background: dragOver ? 'rgba(201,168,76,0.05)' : undefined,
            }}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) setFile(f); }}
                onClick={() => document.getElementById('fileInput')?.click()}
            >
                {file ? (
                    <div>
                        <div style={{ fontSize: 40, marginBottom: 8 }}>📄</div>
                        <div style={{ fontSize: 16, fontWeight: 700 }}>{file.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                            {(file.size / 1024).toFixed(1)} KB · Click to change
                        </div>
                    </div>
                ) : (
                    <div>
                        <div style={{ fontSize: 40, marginBottom: 8 }}>📁</div>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>Drop file here or click to browse</div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>Supports PDF, Excel (.xlsx, .xls), CSV · Max 20MB</div>
                    </div>
                )}
                <input id="fileInput" type="file" accept=".pdf,.xlsx,.xls,.csv" style={{ display: 'none' }} onChange={e => { if (e.target.files?.[0]) setFile(e.target.files[0]); }} />
            </div>

            {file && !parsed && (
                <button onClick={handleUpload} style={{
                    width: '100%', padding: '14px', borderRadius: 10, border: 'none',
                    background: 'var(--accent-gradient)', color: '#07091A', fontSize: 15, fontWeight: 800, cursor: 'pointer', marginBottom: 14
                }}>🤖 Upload & Parse</button>
            )}

            {/* Parsed Results */}
            {parsed && (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10, marginBottom: 16 }}>
                        {[
                            { label: 'Transactions', value: DEMO_TXNS.length, color: '#C9A84C' },
                            { label: 'Total Credit', value: fmt(totalCredit), color: '#22c55e' },
                            { label: 'Total Debit', value: fmt(totalDebit), color: '#ef4444' },
                            { label: 'Net Flow', value: fmt(totalCredit - totalDebit), color: '#8B5CF6' },
                        ].map(c => (
                            <div key={c.label} className="glass-card" style={{ padding: 14, borderLeft: `3px solid ${c.color}` }}>
                                <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 4 }}>{c.label}</div>
                                <div style={{ fontSize: 20, fontWeight: 800, fontFamily: 'monospace', color: c.color }}>{c.value}</div>
                            </div>
                        ))}
                    </div>

                    <div className="glass-card" style={{ padding: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#C9A84C' }}>📊 Parsed Transactions</h3>
                            <button style={{ padding: '6px 14px', borderRadius: 6, border: 'none', background: 'rgba(34,197,94,0.15)', color: '#22c55e', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>⬇️ Export Tally XML</button>
                        </div>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                            <thead><tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                {['Date', 'Description', 'Credit', 'Debit', 'Balance', 'Category'].map(h =>
                                    <th key={h} style={{ textAlign: 'left', padding: '8px 6px', fontSize: 11, color: 'var(--text-secondary)', fontWeight: 700 }}>{h}</th>
                                )}
                            </tr></thead>
                            <tbody>{DEMO_TXNS.map((t, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '8px 6px', fontFamily: 'monospace', fontSize: 11 }}>{t.date}</td>
                                    <td style={{ padding: '8px 6px', fontSize: 12 }}>{t.desc}</td>
                                    <td style={{ padding: '8px 6px', fontFamily: 'monospace', color: '#22c55e' }}>{t.credit ? fmt(t.credit) : ''}</td>
                                    <td style={{ padding: '8px 6px', fontFamily: 'monospace', color: '#ef4444' }}>{t.debit ? fmt(t.debit) : ''}</td>
                                    <td style={{ padding: '8px 6px', fontFamily: 'monospace', fontSize: 11 }}>{fmt(t.balance)}</td>
                                    <td style={{ padding: '8px 6px' }}>
                                        <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600, background: 'rgba(201,168,76,0.12)' }}>{t.category}</span>
                                    </td>
                                </tr>
                            ))}</tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}
