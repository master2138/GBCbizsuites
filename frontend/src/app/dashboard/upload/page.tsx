'use client';
import { useState, useCallback } from 'react';
import { parseCSV, generateTallyXML, type ParsedTxn } from '@/lib/csv-parser';

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

const DEMO_TXNS: ParsedTxn[] = [
    { date: '2026-03-28', desc: 'NEFT/CR/RAJESH SHARMA — Professional Fee', credit: 150000, debit: 0, balance: 682345.50, category: 'Transfer' },
    { date: '2026-03-27', desc: 'UPI/DR/MSEDCL ELECTRICITY BILL', credit: 0, debit: 4500, balance: 532345.50, category: 'Electricity' },
    { date: '2026-03-25', desc: 'IMPS/CR/FRESH FOODS PVT LTD', credit: 85000, debit: 0, balance: 536845.50, category: 'Transfer' },
    { date: '2026-03-23', desc: 'NEFT/DR/GST CHALLAN — CGST+SGST Q4', credit: 0, debit: 28900, balance: 451845.50, category: 'GST Payment' },
    { date: '2026-03-22', desc: 'UPI/DR/AMAZON PAY SHOPPING', credit: 0, debit: 2499, balance: 480745.50, category: 'E-Commerce' },
    { date: '2026-03-20', desc: 'NEFT/CR/TECH SOLUTIONS LLP — Consulting', credit: 200000, debit: 0, balance: 483244.50, category: 'Transfer' },
    { date: '2026-03-18', desc: 'CHEQUE/DR/OFFICE RENT — MAR 2026', credit: 0, debit: 35000, balance: 283244.50, category: 'Rent' },
    { date: '2026-03-15', desc: 'INTEREST CREDITED — Q4 FY2025-26', credit: 1245.50, debit: 0, balance: 318244.50, category: 'Interest' },
    { date: '2026-03-12', desc: 'EMI/DR/HDFC HOME LOAN — EMI 36/240', credit: 0, debit: 42000, balance: 316999.00, category: 'Loan EMI' },
    { date: '2026-03-10', desc: 'UPI/DR/SALARY NEHA STAFF — MAR', credit: 0, debit: 55000, balance: 358999.00, category: 'Salary' },
    { date: '2026-03-08', desc: 'NEFT/CR/ANITA DESAI TRUST', credit: 30000, debit: 0, balance: 413999.00, category: 'Transfer' },
    { date: '2026-03-05', desc: 'BANK CHARGES — SMS + ANNUAL MAINT', credit: 0, debit: 590, balance: 383999.00, category: 'Bank Charges' },
    { date: '2026-03-03', desc: 'NEFT/DR/ADVANCE INCOME TAX — Q4', credit: 0, debit: 75000, balance: 384589.00, category: 'Tax Payment' },
    { date: '2026-03-01', desc: 'NEFT/CR/M/S GUPTA & CO — Audit Fee', credit: 120000, debit: 0, balance: 459589.00, category: 'Transfer' },
];

const fmt = (v: number) => v ? `₹${v.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—';

const CATEGORIES = ['Transfer', 'Salary', 'Rent', 'GST Payment', 'Tax Payment', 'Loan EMI', 'Interest', 'Bank Charges', 'E-Commerce', 'Electricity', 'Telecom', 'Insurance', 'Investment', 'Fuel', 'Dividend', 'Cheque', 'Cash', 'Other'];

export default function UploadPage() {
    const [file, setFile] = useState<File | null>(null);
    const [bank, setBank] = useState('');
    const [txns, setTxns] = useState<ParsedTxn[]>([]);
    const [dragOver, setDragOver] = useState(false);
    const [parsing, setParsing] = useState(false);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all');
    const [editIdx, setEditIdx] = useState<number | null>(null);

    const handleFile = useCallback((f: File) => {
        setFile(f);
        setError('');
        setTxns([]);
    }, []);

    const handleParse = useCallback(async () => {
        if (!file) return;
        setParsing(true);
        setError('');
        try {
            const ext = file.name.split('.').pop()?.toLowerCase();
            if (ext === 'csv' || ext === 'txt') {
                const text = await file.text();
                const parsed = parseCSV(text);
                if (parsed.length === 0) {
                    setError('Could not parse any transactions. Please ensure CSV has columns: Date, Description, Credit/Debit or Amount.');
                } else {
                    setTxns(parsed);
                }
            } else if (ext === 'xlsx' || ext === 'xls') {
                setError('Excel parsing requires xlsx library. For now, please export your statement as CSV from Excel and upload that.');
            } else if (ext === 'pdf') {
                setError('PDF parsing requires server-side processing. For now, please copy transactions from the PDF into a CSV file.');
            } else {
                setError(`Unsupported format: .${ext}. Please use CSV, XLSX, or PDF.`);
            }
        } catch (e: any) {
            setError(`Parse error: ${e.message}`);
        }
        setParsing(false);
    }, [file]);

    const loadDemo = () => { setTxns(DEMO_TXNS); setFile(null); };

    const updateCategory = (idx: number, cat: string) => {
        setTxns(prev => prev.map((t, i) => i === idx ? { ...t, category: cat } : t));
        setEditIdx(null);
    };

    const exportTallyXML = () => {
        const xml = generateTallyXML(txns, bank || 'HDFC Bank');
        const blob = new Blob([xml], { type: 'application/xml' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `BankStatement_TallyImport_${new Date().toISOString().split('T')[0]}.xml`;
        a.click();
        URL.revokeObjectURL(a.href);
    };

    const exportCSV = () => {
        const header = 'Date,Description,Credit,Debit,Balance,Category\n';
        const rows = txns.map(t => `${t.date},"${t.desc}",${t.credit},${t.debit},${t.balance},${t.category}`).join('\n');
        const blob = new Blob([header + rows], { type: 'text/csv' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `BankStatement_Categorized_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(a.href);
    };

    const totalCredit = txns.reduce((s, t) => s + t.credit, 0);
    const totalDebit = txns.reduce((s, t) => s + t.debit, 0);
    const categories = [...new Set(txns.map(t => t.category))];
    const filtered = filter === 'all' ? txns : txns.filter(t => t.category === filter);

    // Category-wise summary
    const catSummary = categories.map(cat => {
        const items = txns.filter(t => t.category === cat);
        return { cat, count: items.length, credit: items.reduce((s, t) => s + t.credit, 0), debit: items.reduce((s, t) => s + t.debit, 0) };
    }).sort((a, b) => (b.credit + b.debit) - (a.credit + a.debit));

    return (
        <div className="animate-fadeIn">
            <div style={{ marginBottom: 20 }}>
                <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }} className="gradient-text">Bank Statement Upload</h1>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Upload CSV/Excel · Auto-categorize · Export to Tally XML · Category-wise Analysis</p>
            </div>

            {/* Bank Selector + Demo Button */}
            <div className="glass-card" style={{ padding: 16, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                <div>
                    <label style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, display: 'block', color: 'var(--text-secondary)' }}>🏦 Bank</label>
                    <select value={bank} onChange={e => setBank(e.target.value)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.04)', color: 'var(--text-primary)', fontSize: 13, minWidth: 250 }}>
                        {BANKS.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
                    </select>
                </div>
                <button onClick={loadDemo} style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid rgba(201,168,76,0.3)', background: 'rgba(201,168,76,0.08)', color: '#C9A84C', fontSize: 12, fontWeight: 700, cursor: 'pointer', marginTop: 16 }}>
                    📊 Load Demo Statement (14 txns)
                </button>
            </div>

            {/* Drop Zone */}
            {txns.length === 0 && (
                <div className="glass-card" style={{
                    padding: 40, textAlign: 'center', marginBottom: 14, cursor: 'pointer',
                    border: `2px dashed ${dragOver ? '#C9A84C' : 'var(--border-color)'}`,
                    background: dragOver ? 'rgba(201,168,76,0.05)' : undefined,
                }}
                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
                    onClick={() => document.getElementById('fileInput')?.click()}
                >
                    {file ? (
                        <div>
                            <div style={{ fontSize: 40, marginBottom: 8 }}>📄</div>
                            <div style={{ fontSize: 16, fontWeight: 700 }}>{file.name}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{(file.size / 1024).toFixed(1)} KB · Click to change</div>
                        </div>
                    ) : (
                        <div>
                            <div style={{ fontSize: 40, marginBottom: 8 }}>📁</div>
                            <div style={{ fontSize: 14, fontWeight: 600 }}>Drop file here or click to browse</div>
                            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>Supports CSV, Excel (.xlsx) · Max 20MB</div>
                        </div>
                    )}
                    <input id="fileInput" type="file" accept=".csv,.xlsx,.xls,.txt" style={{ display: 'none' }} onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
                </div>
            )}

            {/* Parse Button */}
            {file && txns.length === 0 && (
                <button onClick={handleParse} disabled={parsing} style={{
                    width: '100%', padding: '14px', borderRadius: 10, border: 'none',
                    background: 'var(--accent-gradient)', color: '#07091A', fontSize: 15, fontWeight: 800, cursor: 'pointer', marginBottom: 14
                }}>{parsing ? '⏳ Parsing...' : '🤖 Upload & Parse'}</button>
            )}

            {/* Error */}
            {error && (
                <div style={{ padding: 14, borderRadius: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', fontSize: 13, marginBottom: 14 }}>
                    ⚠️ {error}
                </div>
            )}

            {/* Results */}
            {txns.length > 0 && (
                <>
                    {/* Summary Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10, marginBottom: 16 }}>
                        {[
                            { label: 'Transactions', value: String(txns.length), color: '#C9A84C' },
                            { label: 'Total Credit', value: fmt(totalCredit), color: '#22c55e' },
                            { label: 'Total Debit', value: fmt(totalDebit), color: '#ef4444' },
                            { label: 'Net Flow', value: fmt(totalCredit - totalDebit), color: totalCredit > totalDebit ? '#22c55e' : '#ef4444' },
                            { label: 'Categories', value: String(categories.length), color: '#8B5CF6' },
                        ].map(c => (
                            <div key={c.label} className="glass-card" style={{ padding: 14, borderLeft: `3px solid ${c.color}` }}>
                                <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 4 }}>{c.label}</div>
                                <div style={{ fontSize: 18, fontWeight: 800, fontFamily: 'monospace', color: c.color }}>{c.value}</div>
                            </div>
                        ))}
                    </div>

                    {/* Category Summary */}
                    <div className="glass-card" style={{ padding: 16, marginBottom: 16 }}>
                        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#C9A84C', marginBottom: 12 }}>📊 Category-wise Summary</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
                            {catSummary.map(c => (
                                <div key={c.cat} onClick={() => setFilter(filter === c.cat ? 'all' : c.cat)} style={{
                                    padding: '10px 14px', borderRadius: 8, cursor: 'pointer', transition: 'all 0.2s',
                                    background: filter === c.cat ? 'rgba(201,168,76,0.12)' : 'rgba(255,255,255,0.02)',
                                    border: `1px solid ${filter === c.cat ? 'rgba(201,168,76,0.3)' : 'var(--border-color)'}`,
                                }}>
                                    <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>{c.cat} <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>({c.count})</span></div>
                                    <div style={{ display: 'flex', gap: 12, fontSize: 11, fontFamily: 'monospace' }}>
                                        {c.credit > 0 && <span style={{ color: '#22c55e' }}>+{fmt(c.credit)}</span>}
                                        {c.debit > 0 && <span style={{ color: '#ef4444' }}>-{fmt(c.debit)}</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Transaction Table */}
                    <div className="glass-card" style={{ padding: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                            <div>
                                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#C9A84C' }}>📋 {filter === 'all' ? 'All' : filter} Transactions ({filtered.length})</h3>
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button onClick={exportTallyXML} style={{ padding: '6px 14px', borderRadius: 6, border: 'none', background: 'rgba(34,197,94,0.15)', color: '#22c55e', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>📤 Tally XML</button>
                                <button onClick={exportCSV} style={{ padding: '6px 14px', borderRadius: 6, border: 'none', background: 'rgba(99,102,241,0.15)', color: '#6366f1', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>📥 Export CSV</button>
                                {filter !== 'all' && <button onClick={() => setFilter('all')} style={{ padding: '6px 14px', borderRadius: 6, border: 'none', background: 'rgba(239,68,68,0.15)', color: '#ef4444', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>✕ Clear Filter</button>}
                                <button onClick={() => { setTxns([]); setFile(null); setError(''); }} style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>🔄 New Upload</button>
                            </div>
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                                <thead><tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    {['Date', 'Description', 'Credit', 'Debit', 'Balance', 'Category'].map(h =>
                                        <th key={h} style={{ textAlign: 'left', padding: '8px 6px', fontSize: 11, color: 'var(--text-secondary)', fontWeight: 700 }}>{h}</th>
                                    )}
                                </tr></thead>
                                <tbody>{filtered.map((t, i) => {
                                    const realIdx = txns.indexOf(t);
                                    return (
                                        <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                            <td style={{ padding: '8px 6px', fontFamily: 'monospace', fontSize: 11 }}>{t.date}</td>
                                            <td style={{ padding: '8px 6px', fontSize: 12, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.desc}</td>
                                            <td style={{ padding: '8px 6px', fontFamily: 'monospace', color: '#22c55e' }}>{t.credit ? fmt(t.credit) : ''}</td>
                                            <td style={{ padding: '8px 6px', fontFamily: 'monospace', color: '#ef4444' }}>{t.debit ? fmt(t.debit) : ''}</td>
                                            <td style={{ padding: '8px 6px', fontFamily: 'monospace', fontSize: 11 }}>{t.balance ? fmt(t.balance) : ''}</td>
                                            <td style={{ padding: '8px 6px' }}>
                                                {editIdx === realIdx ? (
                                                    <select autoFocus value={t.category} onChange={e => updateCategory(realIdx, e.target.value)} onBlur={() => setEditIdx(null)} style={{ padding: '2px 6px', borderRadius: 4, border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 11 }}>
                                                        {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                                                    </select>
                                                ) : (
                                                    <span onClick={() => setEditIdx(realIdx)} style={{ padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600, background: 'rgba(201,168,76,0.12)', cursor: 'pointer' }} title="Click to change">{t.category}</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}</tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
