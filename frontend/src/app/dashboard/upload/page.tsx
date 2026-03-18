'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

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

const CATEGORY_OPTIONS = [
    'General', 'Salary', 'Rent', 'Electricity', 'Telephone', 'Internet',
    'Insurance', 'GST Payment', 'Tax Payment', 'Loan EMI', 'Investment',
    'Fixed Deposit', 'Interest Received', 'Interest Paid', 'Bank Charges',
    'Dividend', 'Commission', 'E-Commerce', 'Fuel', 'Travel', 'Food',
    'Education', 'Medical',
];

function formatCurrency(val: number | undefined) {
    if (val === undefined || val === null) return '₹0';
    return `₹${val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function UploadPage() {
    const [file, setFile] = useState<File | null>(null);
    const [selectedBank, setSelectedBank] = useState('');
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState('');
    const [statements, setStatements] = useState<any[]>([]);
    const [dragOver, setDragOver] = useState(false);
    const [editingTxn, setEditingTxn] = useState<string | null>(null);
    const [editData, setEditData] = useState<any>({});
    const [allTransactions, setAllTransactions] = useState<any[]>([]);
    const [showAllTxns, setShowAllTxns] = useState(false);

    useEffect(() => { loadStatements(); }, []);

    const loadStatements = async () => {
        try {
            const data = await api.getStatements();
            setStatements(data.statements || []);
        } catch (err) { }
    };

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true); setError(''); setResult(null); setAllTransactions([]);
        try {
            const data = await api.uploadStatement(file, undefined, selectedBank || undefined);
            setResult(data);
            setAllTransactions(data.transactions || []);
            loadStatements();
        } catch (err: any) {
            setError(err.message);
        }
        setUploading(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault(); setDragOver(false);
        const f = e.dataTransfer.files[0];
        if (f && /\.(pdf|xlsx|xls|csv)$/i.test(f.name)) setFile(f);
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) setFile(e.target.files[0]);
    };

    const downloadTallyXML = async () => {
        if (!result?.statement?.id) return;
        await api.downloadFile(api.getTallyXmlUrl(result.statement.id), `Tally_${result.statement.bankName}_${result.statement.id.slice(0, 8)}.xml`);
    };

    const downloadExcel = async () => {
        if (!result?.statement?.id) return;
        await api.downloadFile(api.getExcelUrl(result.statement.id), `Statement_${result.statement.bankName}_${result.statement.id.slice(0, 8)}.xlsx`);
    };

    const startEdit = (txn: any) => {
        setEditingTxn(txn.id);
        setEditData({
            description: txn.description,
            debit: txn.debit,
            credit: txn.credit,
            category: txn.category,
            ledger_name: txn.ledger_name,
        });
    };

    const saveEdit = async (txnId: string) => {
        if (!result?.statement?.id) return;
        try {
            const updated = await api.updateTransaction(result.statement.id, txnId, editData);
            setAllTransactions(prev => prev.map(t => t.id === txnId ? { ...t, ...editData } : t));
            setEditingTxn(null);
        } catch (err: any) {
            alert('Failed to save: ' + err.message);
        }
    };

    const loadAllTransactions = async () => {
        if (!result?.statement?.id) return;
        try {
            const data = await api.getStatement(result.statement.id);
            setAllTransactions(data.transactions || []);
            setShowAllTxns(true);
        } catch (err) { }
    };

    const displayedTxns = showAllTxns ? allTransactions : allTransactions.slice(0, 20);

    return (
        <div className="animate-fadeIn">
            <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 4 }}>Bank Statement Upload</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>Upload PDF/Excel statements • Auto-categorize • Export to Tally XML</p>

            {/* Bank Selection */}
            <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, fontSize: 14 }}>
                    🏦 Select Bank (optional — helps with accurate parsing)
                </label>
                <select
                    className="input-field"
                    value={selectedBank}
                    onChange={e => setSelectedBank(e.target.value)}
                    style={{ width: '100%', maxWidth: 400 }}
                >
                    {BANKS.map(b => (
                        <option key={b.value} value={b.value}>{b.label}</option>
                    ))}
                </select>
            </div>

            {/* Upload Zone */}
            <div
                className="glass-card"
                style={{
                    padding: 48, marginBottom: 24, textAlign: 'center', cursor: 'pointer',
                    border: dragOver ? '2px dashed #8b5cf6' : '2px dashed var(--border-color)',
                    background: dragOver ? 'rgba(139,92,246,0.05)' : 'transparent',
                    transition: 'all 0.2s ease',
                }}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => document.getElementById('fileInput')?.click()}
            >
                <input type="file" id="fileInput" accept=".pdf,.xlsx,.xls,.csv" onChange={handleFileInput} style={{ display: 'none' }} />
                <div style={{ fontSize: 48, marginBottom: 16 }}>📄</div>
                <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
                    {file ? file.name : 'Drop your bank statement here or click to browse'}
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                    Supports PDF, Excel (.xlsx, .xls), CSV • Max 20MB
                </div>
                {file && (
                    <div style={{ marginTop: 16, fontSize: 14 }}>
                        <span style={{ color: '#22c55e' }}>📎 {file.name}</span>
                        <span style={{ color: 'var(--text-secondary)', marginLeft: 12 }}>({(file.size / 1024).toFixed(1)} KB)</span>
                        {selectedBank && <span style={{ marginLeft: 12, padding: '4px 10px', borderRadius: 6, background: 'rgba(139,92,246,0.15)', color: '#a78bfa', fontSize: 12 }}>Bank: {selectedBank}</span>}
                    </div>
                )}
            </div>

            {/* Upload Button */}
            {file && (
                <button className="btn-primary" onClick={handleUpload} disabled={uploading} style={{ width: '100%', padding: '16px', fontSize: 16, marginBottom: 24 }}>
                    {uploading ? '⏳ Parsing statement...' : `📤 Upload & Parse ${selectedBank ? `(${selectedBank})` : ''}`}
                </button>
            )}

            {error && <div style={{ padding: 16, borderRadius: 12, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', marginBottom: 24 }}>{error}</div>}

            {/* Results */}
            {result && (
                <div className="glass-card" style={{ padding: 32, marginBottom: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(34,197,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>✅</div>
                        <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Statement Processed Successfully</h2>
                    </div>

                    {/* Summary Stats */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
                        <StatBox label="Bank" value={result.statement?.bankName || 'Unknown'} />
                        <StatBox label="Transactions" value={result.statement?.totalTransactions} />
                        <StatBox label="Total Debit" value={formatCurrency(result.statement?.totalDebit)} color="#ef4444" />
                        <StatBox label="Total Credit" value={formatCurrency(result.statement?.totalCredit)} color="#22c55e" />
                    </div>

                    {/* Export Buttons */}
                    <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
                        <button className="btn-primary" onClick={downloadTallyXML} style={{ padding: '12px 24px' }}>📁 Download Tally XML</button>
                        <button className="btn-secondary" onClick={downloadExcel} style={{ padding: '12px 24px', background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', color: '#60a5fa', cursor: 'pointer', borderRadius: 12, fontWeight: 600 }}>📊 Download Excel</button>
                    </div>

                    {/* Category Breakdown */}
                    {result.summary?.byCategory && (
                        <div style={{ marginBottom: 24 }}>
                            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>📂 Category Breakdown</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
                                {result.summary.byCategory.map((cat: any) => (
                                    <div key={cat.category} style={{ padding: 12, borderRadius: 8, background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', fontSize: 13 }}>
                                        <div style={{ fontWeight: 600, marginBottom: 4 }}>{cat.category}</div>
                                        <div style={{ color: 'var(--text-secondary)' }}>{cat.count} txns • Dr: {formatCurrency(cat.debit)} • Cr: {formatCurrency(cat.credit)}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Transaction Preview with Edit */}
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>
                        📋 Transactions {showAllTxns ? `(All ${allTransactions.length})` : `(First 20 of ${result.statement?.totalTransactions})`}
                        {!showAllTxns && result.statement?.totalTransactions > 20 && (
                            <button onClick={loadAllTransactions} style={{ marginLeft: 12, fontSize: 12, color: '#a78bfa', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                                Show all →
                            </button>
                        )}
                    </h3>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th style={{ width: 90 }}>Date</th>
                                    <th>Description</th>
                                    <th style={{ width: 100, textAlign: 'right' }}>Debit</th>
                                    <th style={{ width: 100, textAlign: 'right' }}>Credit</th>
                                    <th style={{ width: 100, textAlign: 'right' }}>Balance</th>
                                    <th style={{ width: 100 }}>Category</th>
                                    <th style={{ width: 140 }}>Tally Ledger</th>
                                    <th style={{ width: 60 }}>Edit</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayedTxns.map((t: any) => (
                                    editingTxn === t.id ? (
                                        <tr key={t.id} style={{ background: 'rgba(139,92,246,0.05)' }}>
                                            <td>{t.date}</td>
                                            <td><input className="input-field" value={editData.description} onChange={e => setEditData({ ...editData, description: e.target.value })} style={{ fontSize: 12, padding: '4px 8px' }} /></td>
                                            <td><input className="input-field" type="number" value={editData.debit} onChange={e => setEditData({ ...editData, debit: parseFloat(e.target.value) || 0 })} style={{ width: 80, fontSize: 12, padding: '4px 8px', textAlign: 'right' }} /></td>
                                            <td><input className="input-field" type="number" value={editData.credit} onChange={e => setEditData({ ...editData, credit: parseFloat(e.target.value) || 0 })} style={{ width: 80, fontSize: 12, padding: '4px 8px', textAlign: 'right' }} /></td>
                                            <td style={{ textAlign: 'right', fontSize: 13 }}>{formatCurrency(t.balance)}</td>
                                            <td>
                                                <select className="input-field" value={editData.category} onChange={e => setEditData({ ...editData, category: e.target.value })} style={{ fontSize: 11, padding: '4px 4px' }}>
                                                    {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                                                </select>
                                            </td>
                                            <td><input className="input-field" value={editData.ledger_name} onChange={e => setEditData({ ...editData, ledger_name: e.target.value })} style={{ fontSize: 11, padding: '4px 8px' }} /></td>
                                            <td style={{ display: 'flex', gap: 4 }}>
                                                <button onClick={() => saveEdit(t.id)} style={{ background: 'rgba(34,197,94,0.2)', border: 'none', borderRadius: 4, padding: '4px 8px', cursor: 'pointer', fontSize: 12, color: '#22c55e' }}>✓</button>
                                                <button onClick={() => setEditingTxn(null)} style={{ background: 'rgba(239,68,68,0.2)', border: 'none', borderRadius: 4, padding: '4px 8px', cursor: 'pointer', fontSize: 12, color: '#ef4444' }}>✕</button>
                                            </td>
                                        </tr>
                                    ) : (
                                        <tr key={t.id || t.row_number}>
                                            <td style={{ fontSize: 13 }}>{t.date}</td>
                                            <td style={{ fontSize: 12, maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={t.description}>{t.description}</td>
                                            <td style={{ textAlign: 'right', color: t.debit > 0 ? '#ef4444' : 'var(--text-secondary)', fontSize: 13, fontWeight: t.debit > 0 ? 600 : 400 }}>{t.debit > 0 ? formatCurrency(t.debit) : '-'}</td>
                                            <td style={{ textAlign: 'right', color: t.credit > 0 ? '#22c55e' : 'var(--text-secondary)', fontSize: 13, fontWeight: t.credit > 0 ? 600 : 400 }}>{t.credit > 0 ? formatCurrency(t.credit) : '-'}</td>
                                            <td style={{ textAlign: 'right', fontSize: 13 }}>{formatCurrency(t.balance)}</td>
                                            <td><span className="badge badge-info" style={{ fontSize: 11 }}>{t.category}</span></td>
                                            <td style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{t.ledger_name}</td>
                                            <td><button onClick={() => startEdit(t)} style={{ background: 'rgba(139,92,246,0.15)', border: 'none', borderRadius: 4, padding: '4px 8px', cursor: 'pointer', fontSize: 12, color: '#a78bfa' }}>✎</button></td>
                                        </tr>
                                    )
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Statement History */}
            {statements.length > 0 && (
                <div className="glass-card" style={{ padding: 24 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>📚 Previous Statements</h3>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>File</th>
                                    <th>Bank</th>
                                    <th>Transactions</th>
                                    <th>Debit</th>
                                    <th>Credit</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {statements.map(s => (
                                    <tr key={s.id}>
                                        <td style={{ fontSize: 13 }}>{s.original_filename}</td>
                                        <td><span className="badge badge-info">{s.bank_name || 'Unknown'}</span></td>
                                        <td>{s.total_transactions}</td>
                                        <td style={{ color: '#ef4444', fontSize: 13 }}>{formatCurrency(s.total_debit)}</td>
                                        <td style={{ color: '#22c55e', fontSize: 13 }}>{formatCurrency(s.total_credit)}</td>
                                        <td><span className={`badge ${s.status === 'parsed' ? 'badge-success' : 'badge-danger'}`}>{s.status}</span></td>
                                        <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{new Date(s.created_at).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatBox({ label, value, color }: { label: string; value: any; color?: string }) {
    return (
        <div style={{ padding: 16, borderRadius: 12, background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: color || 'var(--text-primary)' }}>{value}</div>
        </div>
    );
}
