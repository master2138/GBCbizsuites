'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function DashboardPage() {
    const router = useRouter();
    const [stats, setStats] = useState<any>(null);
    const [activities, setActivities] = useState<any[]>([]);
    const [invoiceStats, setInvoiceStats] = useState<any>(null);
    const [upcoming, setUpcoming] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const [statsRes, actRes] = await Promise.all([
                api.getDashboardStats(),
                api.getActivity(10),
            ]);
            setStats(statsRes.stats);
            setActivities(actRes.activities || []);

            // Load invoice stats and compliance (may fail if no data yet)
            try { const inv = await api.getInvoices(); setInvoiceStats(inv.stats || {}); } catch { }
            try { const up = await api.getUpcomingDeadlines(15); setUpcoming(up.slice(0, 5)); } catch { }
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    if (loading) return <div className="gradient-text" style={{ fontSize: 20, fontWeight: 600, padding: 40 }}>Loading dashboard...</div>;

    const statCards = [
        { label: 'Total Clients', value: stats?.totalClients || 0, icon: '👥', color: '#6366f1' },
        { label: 'Statements', value: stats?.totalStatements || 0, icon: '📄', color: '#8b5cf6' },
        { label: 'Debit (₹)', value: formatCurrency(stats?.totalDebit || 0), icon: '📤', color: '#ef4444' },
        { label: 'Credit (₹)', value: formatCurrency(stats?.totalCredit || 0), icon: '📥', color: '#22c55e' },
        { label: 'Invoices', value: invoiceStats?.total_invoices || 0, icon: '🧾', color: '#f59e0b' },
        { label: 'Received (₹)', value: formatCurrency(invoiceStats?.total_received || 0), icon: '✅', color: '#10b981' },
    ];

    const quickLinks = [
        { label: 'Upload Statement', icon: '📄', path: '/dashboard/upload', color: '#6366f1' },
        { label: 'New Invoice', icon: '🧾', path: '/dashboard/invoices', color: '#f59e0b' },
        { label: 'E-Commerce', icon: '🛒', path: '/dashboard/ecommerce', color: '#ec4899' },
        { label: 'Compliance', icon: '📅', path: '/dashboard/compliance', color: '#3b82f6' },
        { label: 'Calculators', icon: '🧮', path: '/dashboard/calculators', color: '#8b5cf6' },
        { label: 'GSTIN Verify', icon: '🔍', path: '/dashboard/gstin', color: '#14b8a6' },
        { label: 'Clients', icon: '👥', path: '/dashboard/clients', color: '#22c55e' },
    ];

    const urgencyColor = (days: number) => days < 0 ? '#ef4444' : days <= 7 ? '#f59e0b' : '#10b981';
    const catIcon: Record<string, string> = { GST: '🏛️', TDS: '📊', INCOME_TAX: '💰', MCA: '🏢', CUSTOM: '📌' };

    return (
        <div className="animate-fadeIn">
            <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 4 }}>Dashboard</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Welcome back! Here&apos;s your practice overview.</p>
            </div>

            {/* Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
                {statCards.map((card, i) => (
                    <div key={i} className="stat-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>{card.label}</span>
                            <span style={{ fontSize: 22 }}>{card.icon}</span>
                        </div>
                        <div style={{ fontSize: 24, fontWeight: 800, color: card.color }}>{card.value}</div>
                    </div>
                ))}
            </div>

            {/* Quick Actions Grid */}
            <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Quick Actions</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
                    {quickLinks.map((link) => (
                        <button key={link.path} onClick={() => router.push(link.path)}
                            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '14px 10px', borderRadius: 12, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', cursor: 'pointer', transition: 'all 0.2s', gap: 4 }}
                            onMouseOver={(e) => { (e.currentTarget.style.borderColor = link.color); (e.currentTarget.style.transform = 'translateY(-2px)'); }}
                            onMouseOut={(e) => { (e.currentTarget.style.borderColor = 'var(--border-color)'); (e.currentTarget.style.transform = 'none'); }}>
                            <span style={{ fontSize: 24 }}>{link.icon}</span>
                            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{link.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                {/* Upcoming Deadlines */}
                <div className="glass-card" style={{ padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>📅 Upcoming Deadlines</h2>
                        <button onClick={() => router.push('/dashboard/compliance')} style={{ fontSize: 11, color: 'var(--accent-primary)', background: 'none', border: 'none', cursor: 'pointer' }}>View All →</button>
                    </div>
                    {upcoming.length === 0 ? (
                        <p style={{ color: 'var(--text-secondary)', fontSize: 13, textAlign: 'center', padding: 16 }}>No upcoming deadlines</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {upcoming.map((t: any, i: number) => {
                                const days = Math.ceil((new Date(t.due_date).getTime() - Date.now()) / 86400000);
                                return (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderRadius: 8, borderLeft: `3px solid ${urgencyColor(days)}`, fontSize: 13 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <span>{catIcon[t.category] || '📋'}</span>
                                            <span style={{ fontWeight: 500 }}>{t.title}</span>
                                        </div>
                                        <span style={{ fontSize: 11, fontWeight: 700, color: urgencyColor(days) }}>
                                            {days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? 'Today!' : `${days}d`}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Invoice Summary */}
                <div className="glass-card" style={{ padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>🧾 Invoice Summary</h2>
                        <button onClick={() => router.push('/dashboard/invoices')} style={{ fontSize: 11, color: 'var(--accent-primary)', background: 'none', border: 'none', cursor: 'pointer' }}>View All →</button>
                    </div>
                    {invoiceStats ? (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                            {[
                                { label: 'Total', value: invoiceStats.total_invoices || 0, icon: '📋', color: '#6366f1' },
                                { label: 'Received', value: `₹${formatCurrency(invoiceStats.total_received || 0)}`, icon: '✅', color: '#10b981' },
                                { label: 'Pending', value: `₹${formatCurrency(invoiceStats.total_pending || 0)}`, icon: '⏳', color: '#f59e0b' },
                                { label: 'Overdue', value: `₹${formatCurrency(invoiceStats.total_overdue || 0)}`, icon: '🔴', color: '#ef4444' },
                            ].map(s => (
                                <div key={s.label} style={{ padding: '10px 12px', borderRadius: 8, background: s.color + '10' }}>
                                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{s.icon} {s.label}</div>
                                    <div style={{ fontSize: 16, fontWeight: 700, color: s.color }}>{s.value}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{ color: 'var(--text-secondary)', fontSize: 13, textAlign: 'center', padding: 16 }}>Create your first invoice to see stats</p>
                    )}
                </div>
            </div>

            {/* Recent Activity */}
            <div className="glass-card" style={{ padding: 20 }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Recent Activity</h2>
                {activities.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: 24, fontSize: 13 }}>No activity yet. Start by uploading a bank statement or adding a client!</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {activities.map((a: any, i: number) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: i < activities.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                                <div style={{ width: 32, height: 32, borderRadius: 8, background: getActionColor(a.action), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>
                                    {getActionIcon(a.action)}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 13, fontWeight: 500 }}>{a.details}</div>
                                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{formatTime(a.created_at)}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function formatCurrency(n: number) {
    if (n >= 10000000) return `${(n / 10000000).toFixed(2)} Cr`;
    if (n >= 100000) return `${(n / 100000).toFixed(2)} L`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)} K`;
    return n.toFixed(0);
}

function getActionIcon(action: string) {
    const icons: Record<string, string> = { upload: '📄', create: '➕', update: '✏️', delete: '🗑️', login: '🔐', register: '🆕' };
    return icons[action] || '📌';
}

function getActionColor(action: string) {
    const colors: Record<string, string> = { upload: 'rgba(99,102,241,0.15)', create: 'rgba(34,197,94,0.15)', delete: 'rgba(239,68,68,0.15)', update: 'rgba(245,158,11,0.15)', login: 'rgba(59,130,246,0.15)' };
    return colors[action] || 'rgba(99,102,241,0.1)';
}

function formatTime(ts: string) {
    if (!ts) return '';
    const d = new Date(ts);
    return d.toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
