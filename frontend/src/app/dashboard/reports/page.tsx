'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export default function ReportsPage() {
    const [tab, setTab] = useState('clients');
    const [clientReport, setClientReport] = useState<any>(null);
    const [revenueReport, setRevenueReport] = useState<any>(null);
    const [filingReport, setFilingReport] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadReport(); }, [tab]);

    const loadReport = async () => {
        setLoading(true);
        try {
            if (tab === 'clients' && !clientReport) {
                const data = await api.getClientSummaryReport();
                setClientReport(data);
            } else if (tab === 'revenue' && !revenueReport) {
                const data = await api.getRevenueReport();
                setRevenueReport(data);
            } else if (tab === 'filing' && !filingReport) {
                const data = await api.getFilingStatusReport();
                setFilingReport(data);
            }
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    const fmt = (n: number) => {
        if (!n) return '₹0';
        if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)}Cr`;
        if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
        if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
        return `₹${n.toFixed(0)}`;
    };

    const downloadCSV = (type: string) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
        const url = api.getExportUrl(type);
        const a = document.createElement('a');
        a.href = url;
        a.setAttribute('download', '');
        // For auth, open in new tab
        window.open(url + `?token=${token}`, '_blank');
    };

    const tabs = [
        { key: 'clients', label: '👥 Clients', desc: 'Client portfolio overview' },
        { key: 'revenue', label: '💰 Revenue', desc: 'Invoice & billing analytics' },
        { key: 'filing', label: '📅 Filing Status', desc: 'Compliance tracking' },
    ];

    return (
        <div className="animate-fadeIn">
            <div style={{ marginBottom: 20 }}>
                <h1 style={{ fontSize: 28, fontWeight: 800 }}>Reports & Analytics</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Insights across your practice</p>
            </div>

            {/* Tab selector */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                {tabs.map(t => (
                    <button key={t.key} onClick={() => setTab(t.key)} style={{ flex: 1, padding: '12px 16px', borderRadius: 12, border: tab === t.key ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)', background: tab === t.key ? 'rgba(99,102,241,0.08)' : 'var(--bg-secondary)', cursor: 'pointer', textAlign: 'left' }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: tab === t.key ? 'var(--accent-primary)' : 'var(--text-primary)' }}>{t.label}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{t.desc}</div>
                    </button>
                ))}
            </div>

            {loading && <div className="gradient-text" style={{ padding: 32, textAlign: 'center' }}>Loading report...</div>}

            {/* Clients Report */}
            {tab === 'clients' && clientReport && !loading && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <span style={{ fontSize: 14, fontWeight: 600 }}>Total Clients: <span style={{ color: 'var(--accent-primary)' }}>{clientReport.total}</span></span>
                        <button className="btn-secondary" onClick={() => downloadCSV('clients-csv')} style={{ fontSize: 11 }}>⬇ Export CSV</button>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                                    {['Name', 'GSTIN', 'PAN', 'Type', 'Statements', 'Documents', 'Total Debit', 'Total Credit', 'Status'].map(h => (
                                        <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: 0.5 }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {clientReport.clients.map((c: any) => (
                                    <tr key={c.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                        <td style={{ padding: '8px 10px', fontWeight: 600 }}>{c.name}</td>
                                        <td style={{ padding: '8px 10px', fontFamily: 'monospace', fontSize: 11 }}>{c.gstin || '—'}</td>
                                        <td style={{ padding: '8px 10px', fontFamily: 'monospace', fontSize: 11 }}>{c.pan || '—'}</td>
                                        <td style={{ padding: '8px 10px' }}>{c.business_type || '—'}</td>
                                        <td style={{ padding: '8px 10px', textAlign: 'center' }}>{c.statements}</td>
                                        <td style={{ padding: '8px 10px', textAlign: 'center' }}>{c.documents}</td>
                                        <td style={{ padding: '8px 10px', color: '#ef4444' }}>{fmt(c.total_debit)}</td>
                                        <td style={{ padding: '8px 10px', color: '#10b981' }}>{fmt(c.total_credit)}</td>
                                        <td style={{ padding: '8px 10px' }}>
                                            <span style={{ padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 700, background: c.status === 'active' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)', color: c.status === 'active' ? '#10b981' : '#ef4444' }}>{c.status}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Revenue Report */}
            {tab === 'revenue' && revenueReport && !loading && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
                        <button className="btn-secondary" onClick={() => downloadCSV('invoices-csv')} style={{ fontSize: 11 }}>⬇ Export Invoices CSV</button>
                    </div>

                    {/* Invoice status summary */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: 20 }}>
                        {(revenueReport.byStatus || []).map((s: any) => (
                            <div key={s.status} className="stat-card" style={{ padding: 12 }}>
                                <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{s.status}</div>
                                <div style={{ fontSize: 18, fontWeight: 800, color: s.status === 'PAID' ? '#10b981' : s.status === 'OVERDUE' ? '#ef4444' : '#6366f1' }}>{s.count}</div>
                                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{fmt(s.total)}</div>
                            </div>
                        ))}
                    </div>

                    {/* Practice billing */}
                    {revenueReport.billing && (
                        <div className="glass-card" style={{ padding: 16, marginBottom: 20 }}>
                            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>📋 Practice Billing Summary</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                                <div><div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Total Items</div><div style={{ fontSize: 20, fontWeight: 800 }}>{revenueReport.billing.total_items}</div></div>
                                <div><div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Completed</div><div style={{ fontSize: 20, fontWeight: 800, color: '#10b981' }}>{revenueReport.billing.completed}</div></div>
                                <div><div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Total Hours</div><div style={{ fontSize: 20, fontWeight: 800, color: '#f59e0b' }}>{revenueReport.billing.total_hours?.toFixed(1)}</div></div>
                                <div><div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Billing</div><div style={{ fontSize: 20, fontWeight: 800, color: '#8b5cf6' }}>{fmt(revenueReport.billing.total_billing)}</div></div>
                            </div>
                        </div>
                    )}

                    {/* Monthly trend */}
                    <div className="glass-card" style={{ padding: 16 }}>
                        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>📊 Monthly Invoice Trend</h3>
                        {(revenueReport.monthly || []).length === 0 ? (
                            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: 16 }}>No invoice data yet</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {revenueReport.monthly.map((m: any) => (
                                    <div key={m.month} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 0', borderBottom: '1px solid var(--border-color)' }}>
                                        <span style={{ fontSize: 12, fontWeight: 600, width: 80 }}>{m.month}</span>
                                        <div style={{ flex: 1, height: 8, borderRadius: 4, background: 'var(--bg-secondary)', overflow: 'hidden' }}>
                                            <div style={{ height: '100%', borderRadius: 4, background: 'linear-gradient(90deg, #6366f1, #8b5cf6)', width: `${Math.min(100, (m.total / Math.max(...revenueReport.monthly.map((x: any) => x.total), 1)) * 100)}%` }} />
                                        </div>
                                        <div style={{ fontSize: 12, fontWeight: 700, color: '#6366f1', minWidth: 80, textAlign: 'right' }}>{fmt(m.total)}</div>
                                        <div style={{ fontSize: 11, color: '#10b981', minWidth: 70, textAlign: 'right' }}>✅ {fmt(m.received)}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Filing Status Report */}
            {tab === 'filing' && filingReport && !loading && (
                <div>
                    {/* Overdue */}
                    {filingReport.overdue?.length > 0 && (
                        <div className="glass-card" style={{ padding: 16, marginBottom: 16, borderLeft: '3px solid #ef4444' }}>
                            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: '#ef4444' }}>⚠️ Overdue ({filingReport.overdue.length})</h3>
                            {filingReport.overdue.map((t: any, i: number) => (
                                <div key={i} style={{ padding: '6px 0', borderBottom: i < filingReport.overdue.length - 1 ? '1px solid var(--border-color)' : 'none', fontSize: 12, display: 'flex', justifyContent: 'space-between' }}>
                                    <span>{t.title}</span>
                                    <span style={{ color: '#ef4444', fontWeight: 600 }}>{t.due_date}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Upcoming */}
                    <div className="glass-card" style={{ padding: 16, marginBottom: 16 }}>
                        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>📅 Upcoming (Next 30 Days)</h3>
                        {(filingReport.upcoming || []).length === 0 ? (
                            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: 16 }}>No upcoming deadlines</p>
                        ) : (
                            filingReport.upcoming.map((t: any, i: number) => {
                                const days = Math.ceil((new Date(t.due_date).getTime() - Date.now()) / 86400000);
                                return (
                                    <div key={i} style={{ padding: '6px 0', borderBottom: '1px solid var(--border-color)', fontSize: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span>{t.title}</span>
                                        <span style={{ fontSize: 11, fontWeight: 700, color: days <= 7 ? '#f59e0b' : '#10b981' }}>{days}d — {t.due_date}</span>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Compliance by category */}
                    <div className="glass-card" style={{ padding: 16 }}>
                        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>📊 Filing by Category</h3>
                        {(filingReport.compliance || []).length === 0 ? (
                            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: 16 }}>No compliance data</p>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 8 }}>
                                {filingReport.compliance.map((c: any, i: number) => (
                                    <div key={i} style={{ padding: 10, borderRadius: 8, background: 'var(--bg-secondary)' }}>
                                        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-primary)' }}>{c.category}</div>
                                        <div style={{ fontSize: 18, fontWeight: 800 }}>{c.count}</div>
                                        <div style={{ fontSize: 10, color: c.status === 'COMPLETED' ? '#10b981' : '#f59e0b' }}>{c.status}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
