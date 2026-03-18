'use client';
import { useState, useRef, useCallback } from 'react';
import { api } from '@/lib/api';

const PLATFORMS = [
    { value: '', label: '🔍 Auto-detect Platform' },
    { value: 'AMAZON', label: '📦 Amazon' },
    { value: 'FLIPKART', label: '🛍️ Flipkart' },
    { value: 'MEESHO', label: '🧵 Meesho' },
    { value: 'MYNTRA', label: '👗 Myntra' },
];

const fmt = (n: number) => n?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00';

export default function EcommercePage() {
    const [platform, setPlatform] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [report, setReport] = useState<any>(null);
    const [reports, setReports] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'upload' | 'reports'>('upload');
    const [gstrView, setGstrView] = useState<'b2c' | 'hsn' | 'rate'>('hsn');
    const [showAllTxns, setShowAllTxns] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);
    const [dragOver, setDragOver] = useState(false);

    const loadReports = useCallback(async () => {
        try {
            const data = await api.getEcomReports();
            setReports(data);
        } catch { }
    }, []);

    const handleUpload = async (file: File) => {
        setLoading(true); setError('');
        try {
            const data = await api.uploadEcomReport(file, platform || undefined);
            setReport(data);
            loadReports();
        } catch (err: any) {
            setError(err.message || 'Upload failed');
        } finally {
            setLoading(false);
        }
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault(); setDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleUpload(file);
    };

    const handleExport = async (type: 'tally' | 'csv') => {
        if (!report?.id) return;
        const url = type === 'tally' ? api.getEcomTallyXmlUrl(String(report.id)) : api.getEcomCsvUrl(String(report.id));
        const filename = type === 'tally' ? `${report.platform}_tally.xml` : `${report.platform}_report.csv`;
        await api.downloadFile(url, filename);
    };

    const viewReport = async (id: string) => {
        setLoading(true);
        try {
            const data = await api.getEcomReport(id);
            setReport(data);
            setActiveTab('upload');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const visibleTxns = report?.transactions?.slice(0, showAllTxns ? undefined : 20) ?? [];

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
                <div>
                    <h1 className="gradient-text" style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>🛒 E-Commerce Reports</h1>
                    <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0', fontSize: 14 }}>Parse marketplace sales → GSTR-1 summary → Tally export</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button className={activeTab === 'upload' ? 'btn-primary' : 'btn-secondary'} onClick={() => setActiveTab('upload')} style={{ padding: '8px 16px', fontSize: 13 }}>📤 Upload</button>
                    <button className={activeTab === 'reports' ? 'btn-primary' : 'btn-secondary'} onClick={() => { setActiveTab('reports'); loadReports(); }} style={{ padding: '8px 16px', fontSize: 13 }}>📋 History</button>
                </div>
            </div>

            {error && <div style={{ background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.3)', borderRadius: 12, padding: '12px 16px', color: '#ff5050', marginBottom: 20, fontSize: 14 }}>⚠️ {error}</div>}

            {activeTab === 'reports' ? (
                /* ── Reports History ── */
                <div className="glass-card" style={{ padding: 24 }}>
                    <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>📋 Parsed Reports</h2>
                    {reports.length === 0 ? (
                        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: 40 }}>No reports yet. Upload a marketplace CSV/Excel to get started.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {reports.map((r: any) => (
                                <div key={r.id} onClick={() => viewReport(String(r.id))} className="glass-card" style={{ padding: '12px 16px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: 14 }}>{r.platform} — {r.fileName}</div>
                                        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{r.summary?.totalTransactions} transactions • ₹{fmt(r.summary?.totalSales)} sales</div>
                                    </div>
                                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{new Date(r.uploadedAt).toLocaleDateString('en-IN')}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <>
                    {/* ── Upload Section ── */}
                    {!report && (
                        <div className="glass-card" style={{ padding: 32 }}>
                            <div style={{ marginBottom: 20 }}>
                                <label style={{ fontSize: 14, fontWeight: 600, marginBottom: 6, display: 'block' }}>Select Platform</label>
                                <select value={platform} onChange={e => setPlatform(e.target.value)} style={{ width: '100%', maxWidth: 400, padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 14, outline: 'none' }}>
                                    {PLATFORMS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                                </select>
                            </div>
                            <div onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={onDrop} onClick={() => fileRef.current?.click()} style={{ border: `2px dashed ${dragOver ? 'var(--accent-primary)' : 'var(--border-color)'}`, borderRadius: 16, padding: 48, textAlign: 'center', cursor: 'pointer', background: dragOver ? 'rgba(99,102,241,0.05)' : 'transparent', transition: 'all 0.2s' }}>
                                <div style={{ fontSize: 48, marginBottom: 12 }}>📊</div>
                                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>
                                    {loading ? '⏳ Parsing...' : 'Drop marketplace CSV / Excel here'}
                                </div>
                                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Supports Amazon, Flipkart, Meesho settlement/sales reports</div>
                                <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f); }} style={{ display: 'none' }} />
                            </div>
                        </div>
                    )}

                    {/* ── Results ── */}
                    {report && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            {/* Summary Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>{report.platform} Report</h2>
                                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '4px 0 0' }}>{report.fileName} • {report.summary?.totalTransactions} transactions</p>
                                </div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button className="btn-primary" onClick={() => handleExport('tally')} style={{ padding: '8px 14px', fontSize: 13 }}>📥 Tally XML</button>
                                    <button className="btn-secondary" onClick={() => handleExport('csv')} style={{ padding: '8px 14px', fontSize: 13 }}>📊 CSV</button>
                                    <button className="btn-secondary" onClick={() => setReport(null)} style={{ padding: '8px 14px', fontSize: 13 }}>🔄 New Upload</button>
                                </div>
                            </div>

                            {/* Summary Cards */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                                {[
                                    { label: 'Total Sales', value: `₹${fmt(report.summary?.totalSales)}`, icon: '💰', color: '#10b981' },
                                    { label: 'Taxable Value', value: `₹${fmt(report.summary?.totalTaxable)}`, icon: '📊', color: '#6366f1' },
                                    { label: 'Total GST', value: `₹${fmt(report.summary?.totalGST)}`, icon: '🏛️', color: '#f59e0b' },
                                    { label: 'Platform Fees', value: `₹${fmt(report.summary?.totalPlatformFees)}`, icon: '🏪', color: '#ef4444' },
                                    { label: 'TCS Deducted', value: `₹${fmt(report.summary?.totalTCS)}`, icon: '📋', color: '#8b5cf6' },
                                    { label: 'Net Receivable', value: `₹${fmt(report.summary?.netReceivable)}`, icon: '✅', color: '#06b6d4' },
                                ].map(card => (
                                    <div key={card.label} className="glass-card" style={{ padding: '16px 18px' }}>
                                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>{card.icon} {card.label}</div>
                                        <div style={{ fontSize: 18, fontWeight: 700, color: card.color }}>{card.value}</div>
                                    </div>
                                ))}
                            </div>

                            {/* GSTR-1 Summary */}
                            {report.gstr1 && (
                                <div className="glass-card" style={{ padding: 24 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                        <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>📋 GSTR-1 Summary</h3>
                                        <div style={{ display: 'flex', gap: 4 }}>
                                            {(['hsn', 'rate', 'b2c'] as const).map(v => (
                                                <button key={v} onClick={() => setGstrView(v)} style={{ padding: '4px 12px', fontSize: 12, borderRadius: 8, border: '1px solid var(--border-color)', background: gstrView === v ? 'var(--accent-primary)' : 'transparent', color: gstrView === v ? '#fff' : 'var(--text-secondary)', cursor: 'pointer' }}>{v.toUpperCase()}</button>
                                            ))}
                                        </div>
                                    </div>

                                    {gstrView === 'hsn' && (
                                        <div style={{ overflowX: 'auto' }}>
                                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                                                <thead>
                                                    <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                                        {['HSN', 'Rate', 'Qty', 'Taxable', 'CGST', 'SGST', 'IGST', 'Total'].map(h => (
                                                            <th key={h} style={{ padding: '8px 12px', textAlign: h === 'HSN' ? 'left' : 'right', fontWeight: 600, color: 'var(--text-secondary)' }}>{h}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {report.gstr1.hsnSummary?.map((row: any, i: number) => (
                                                        <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                                            <td style={{ padding: '8px 12px', fontWeight: 500 }}>{row.hsn}</td>
                                                            <td style={{ padding: '8px 12px', textAlign: 'right' }}>{row.rate}%</td>
                                                            <td style={{ padding: '8px 12px', textAlign: 'right' }}>{row.quantity}</td>
                                                            <td style={{ padding: '8px 12px', textAlign: 'right' }}>₹{fmt(row.taxableValue)}</td>
                                                            <td style={{ padding: '8px 12px', textAlign: 'right' }}>₹{fmt(row.cgst)}</td>
                                                            <td style={{ padding: '8px 12px', textAlign: 'right' }}>₹{fmt(row.sgst)}</td>
                                                            <td style={{ padding: '8px 12px', textAlign: 'right' }}>₹{fmt(row.igst)}</td>
                                                            <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600 }}>₹{fmt(row.total)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}

                                    {gstrView === 'rate' && (
                                        <div style={{ overflowX: 'auto' }}>
                                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                                                <thead>
                                                    <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                                        {['GST Rate', 'Count', 'Taxable', 'CGST', 'SGST', 'IGST', 'Total'].map(h => (
                                                            <th key={h} style={{ padding: '8px 12px', textAlign: h === 'GST Rate' ? 'left' : 'right', fontWeight: 600, color: 'var(--text-secondary)' }}>{h}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {report.gstr1.rateSummary?.map((row: any, i: number) => (
                                                        <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                                            <td style={{ padding: '8px 12px', fontWeight: 500 }}>{row.rate}%</td>
                                                            <td style={{ padding: '8px 12px', textAlign: 'right' }}>{row.count}</td>
                                                            <td style={{ padding: '8px 12px', textAlign: 'right' }}>₹{fmt(row.taxableValue)}</td>
                                                            <td style={{ padding: '8px 12px', textAlign: 'right' }}>₹{fmt(row.cgst)}</td>
                                                            <td style={{ padding: '8px 12px', textAlign: 'right' }}>₹{fmt(row.sgst)}</td>
                                                            <td style={{ padding: '8px 12px', textAlign: 'right' }}>₹{fmt(row.igst)}</td>
                                                            <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600 }}>₹{fmt(row.total)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}

                                    {gstrView === 'b2c' && (
                                        <div style={{ overflowX: 'auto', maxHeight: 400, overflow: 'auto' }}>
                                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                                                <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-secondary)' }}>
                                                    <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                                        {['Date', 'Invoice No', 'Taxable', 'CGST', 'SGST', 'IGST', 'Total'].map(h => (
                                                            <th key={h} style={{ padding: '8px 12px', textAlign: h === 'Date' || h === 'Invoice No' ? 'left' : 'right', fontWeight: 600, color: 'var(--text-secondary)' }}>{h}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {report.gstr1.b2c?.slice(0, 50).map((row: any, i: number) => (
                                                        <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                                            <td style={{ padding: '8px 12px' }}>{row.date}</td>
                                                            <td style={{ padding: '8px 12px', fontSize: 12 }}>{row.invoiceNo}</td>
                                                            <td style={{ padding: '8px 12px', textAlign: 'right' }}>₹{fmt(row.taxableValue)}</td>
                                                            <td style={{ padding: '8px 12px', textAlign: 'right' }}>₹{fmt(row.cgst)}</td>
                                                            <td style={{ padding: '8px 12px', textAlign: 'right' }}>₹{fmt(row.sgst)}</td>
                                                            <td style={{ padding: '8px 12px', textAlign: 'right' }}>₹{fmt(row.igst)}</td>
                                                            <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600 }}>₹{fmt(row.total)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}

                                    {/* Totals Row */}
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 24, marginTop: 12, padding: '12px 0', borderTop: '2px solid var(--border-color)' }}>
                                        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Sales: <strong>{report.gstr1.totals?.salesCount}</strong></span>
                                        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Taxable: <strong>₹{fmt(report.gstr1.totals?.totalTaxable)}</strong></span>
                                        <span style={{ fontSize: 13, color: '#f59e0b' }}>GST: <strong>₹{fmt(report.gstr1.totals?.totalTax)}</strong></span>
                                        <span style={{ fontSize: 13, color: '#10b981' }}>Total: <strong>₹{fmt(report.gstr1.totals?.totalValue)}</strong></span>
                                    </div>
                                </div>
                            )}

                            {/* Transaction Table */}
                            <div className="glass-card" style={{ padding: 24 }}>
                                <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 16px' }}>📦 Transactions ({report.transactions?.length})</h3>
                                <div style={{ overflowX: 'auto', maxHeight: 500, overflow: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, minWidth: 1000 }}>
                                        <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-secondary)' }}>
                                            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                                {['#', 'Date', 'Order ID', 'Product', 'HSN', 'GST%', 'Qty', 'Price', 'Tax', 'Fees', 'Net', 'Type'].map(h => (
                                                    <th key={h} style={{ padding: '6px 8px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {visibleTxns.map((t: any, i: number) => (
                                                <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                                    <td style={{ padding: '6px 8px', color: 'var(--text-secondary)' }}>{i + 1}</td>
                                                    <td style={{ padding: '6px 8px', whiteSpace: 'nowrap' }}>{t.date}</td>
                                                    <td style={{ padding: '6px 8px', fontSize: 11, maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.orderId}</td>
                                                    <td style={{ padding: '6px 8px', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.product}</td>
                                                    <td style={{ padding: '6px 8px' }}>{t.hsn}</td>
                                                    <td style={{ padding: '6px 8px' }}>{t.gstRate}%</td>
                                                    <td style={{ padding: '6px 8px' }}>{t.quantity}</td>
                                                    <td style={{ padding: '6px 8px', textAlign: 'right' }}>₹{fmt(t.itemPrice)}</td>
                                                    <td style={{ padding: '6px 8px', textAlign: 'right', color: '#f59e0b' }}>₹{fmt(t.totalTax)}</td>
                                                    <td style={{ padding: '6px 8px', textAlign: 'right', color: '#ef4444' }}>₹{fmt(t.platformFees)}</td>
                                                    <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 600, color: '#10b981' }}>₹{fmt(t.netAmount)}</td>
                                                    <td style={{ padding: '6px 8px' }}>
                                                        <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600, background: t.type === 'SALE' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)', color: t.type === 'SALE' ? '#10b981' : '#ef4444' }}>{t.type}</span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {report.transactions?.length > 20 && !showAllTxns && (
                                    <button onClick={() => setShowAllTxns(true)} className="btn-secondary" style={{ marginTop: 12, width: '100%', padding: 10, fontSize: 13 }}>Show all {report.transactions.length} transactions</button>
                                )}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
