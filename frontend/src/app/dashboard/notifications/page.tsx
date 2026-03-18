'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface Notification {
    id: string;
    type: 'deadline' | 'filing' | 'system' | 'client';
    title: string;
    message: string;
    time: string;
    read: boolean;
    icon: string;
    color: string;
}

// Generate sample notifications based on compliance deadlines
function generateNotifications(): Notification[] {
    const now = new Date();
    return [
        { id: '1', type: 'deadline', title: 'GSTR-1 Due Tomorrow', message: 'Monthly GSTR-1 return filing deadline is tomorrow for all regular taxpayers.', time: new Date(now.getTime() - 2 * 3600000).toISOString(), read: false, icon: '⚠️', color: '#f59e0b' },
        { id: '2', type: 'deadline', title: 'GSTR-3B Due in 5 Days', message: 'GSTR-3B return filing deadline approaching. Ensure ITC reconciliation is complete.', time: new Date(now.getTime() - 5 * 3600000).toISOString(), read: false, icon: '📅', color: '#3b82f6' },
        { id: '3', type: 'filing', title: 'TDS Return Q3 — 26Q', message: 'Q3 TDS return (Form 26Q) has been successfully generated. Review before filing.', time: new Date(now.getTime() - 24 * 3600000).toISOString(), read: true, icon: '✅', color: '#10b981' },
        { id: '4', type: 'client', title: 'New Client Document', message: 'Rajesh Enterprises uploaded their purchase register for March 2026.', time: new Date(now.getTime() - 48 * 3600000).toISOString(), read: true, icon: '📄', color: '#6366f1' },
        { id: '5', type: 'system', title: 'Prisma Schema Updated', message: 'Database migration completed successfully. All 11 models synced with PostgreSQL.', time: new Date(now.getTime() - 72 * 3600000).toISOString(), read: true, icon: '🔧', color: '#8b5cf6' },
        { id: '6', type: 'deadline', title: 'Advance Tax — Q4 Due', message: 'Q4 advance tax instalment due March 15. 100% of estimated liability.', time: new Date(now.getTime() - 96 * 3600000).toISOString(), read: true, icon: '💰', color: '#C9A84C' },
        { id: '7', type: 'filing', title: 'Bank Statement Processed', message: 'HDFC Bank statement for Feb 2026 processed: 142 transactions identified.', time: new Date(now.getTime() - 120 * 3600000).toISOString(), read: true, icon: '📊', color: '#14b8a6' },
        { id: '8', type: 'client', title: 'Invoice Payment Received', message: 'Payment of ₹45,000 received from ABC Enterprises for Invoice #INV-2026-047.', time: new Date(now.getTime() - 144 * 3600000).toISOString(), read: true, icon: '💳', color: '#22c55e' },
    ];
}

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [filter, setFilter] = useState<string>('all');
    const [emailPrefs, setEmailPrefs] = useState({
        deadlines: true, filings: true, clients: false, system: false,
    });

    useEffect(() => { setNotifications(generateNotifications()); }, []);

    const filtered = filter === 'all' ? notifications : filter === 'unread' ? notifications.filter(n => !n.read) : notifications.filter(n => n.type === filter);
    const unreadCount = notifications.filter(n => !n.read).length;

    const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    const toggleRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: !n.read } : n));

    const formatTime = (ts: string) => {
        const d = new Date(ts);
        const diff = Date.now() - d.getTime();
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return `${Math.floor(diff / 86400000)}d ago`;
    };

    const filters = [
        { id: 'all', label: 'All' },
        { id: 'unread', label: `Unread (${unreadCount})` },
        { id: 'deadline', label: 'Deadlines' },
        { id: 'filing', label: 'Filings' },
        { id: 'client', label: 'Clients' },
        { id: 'system', label: 'System' },
    ];

    return (
        <div className="animate-fadeIn">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
                <div>
                    <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>🔔 Notifications</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{unreadCount} unread notifications</p>
                </div>
                <button onClick={markAllRead} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(201,168,76,0.2)', background: 'rgba(201,168,76,0.1)', color: '#C9A84C', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    Mark All Read
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24 }}>
                {/* Notification List */}
                <div>
                    <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
                        {filters.map(f => (
                            <button key={f.id} onClick={() => setFilter(f.id)} style={{
                                padding: '6px 14px', borderRadius: 8, border: '1px solid',
                                borderColor: filter === f.id ? 'rgba(201,168,76,0.4)' : 'var(--border-color)',
                                background: filter === f.id ? 'rgba(201,168,76,0.1)' : 'transparent',
                                color: filter === f.id ? '#C9A84C' : 'var(--text-secondary)',
                                cursor: 'pointer', fontSize: 12, fontWeight: 600,
                            }}>
                                {f.label}
                            </button>
                        ))}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {filtered.length === 0 ? (
                            <div className="glass-card" style={{ padding: 40, textAlign: 'center' }}>
                                <div style={{ fontSize: 36, marginBottom: 8 }}>🎉</div>
                                <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>No notifications to show</div>
                            </div>
                        ) : filtered.map(n => (
                            <div key={n.id} onClick={() => toggleRead(n.id)} className="glass-card" style={{
                                padding: '14px 18px', cursor: 'pointer', display: 'flex', gap: 14, alignItems: 'flex-start',
                                borderLeft: `3px solid ${n.color}`, opacity: n.read ? 0.7 : 1, transition: 'all 0.2s',
                            }}>
                                <div style={{ fontSize: 22, flexShrink: 0 }}>{n.icon}</div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                        <span style={{ fontSize: 14, fontWeight: n.read ? 500 : 700 }}>{n.title}</span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            {!n.read && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#C9A84C' }} />}
                                            <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{formatTime(n.time)}</span>
                                        </div>
                                    </div>
                                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{n.message}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Settings Panel */}
                <div className="glass-card" style={{ padding: 20, height: 'fit-content' }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>📧 Email Preferences</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {[
                            { key: 'deadlines', label: 'Compliance Deadlines', desc: 'GSTR-1, 3B, TDS, ITR due dates' },
                            { key: 'filings', label: 'Filing Status', desc: 'Returns filed, ACK received' },
                            { key: 'clients', label: 'Client Activity', desc: 'Document uploads, payments' },
                            { key: 'system', label: 'System Updates', desc: 'Migrations, new features' },
                        ].map(p => (
                            <div key={p.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                <div>
                                    <div style={{ fontSize: 13, fontWeight: 600 }}>{p.label}</div>
                                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{p.desc}</div>
                                </div>
                                <button onClick={() => setEmailPrefs(prev => ({ ...prev, [p.key]: !(prev as any)[p.key] }))} style={{
                                    width: 40, height: 22, borderRadius: 11, border: 'none', cursor: 'pointer', position: 'relative',
                                    background: (emailPrefs as any)[p.key] ? 'linear-gradient(135deg, #C9A84C, #E8CC7D)' : 'rgba(255,255,255,0.1)',
                                    transition: 'all 0.2s',
                                }}>
                                    <div style={{
                                        width: 16, height: 16, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3,
                                        left: (emailPrefs as any)[p.key] ? 21 : 3, transition: 'left 0.2s',
                                    }} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: 20, padding: 14, borderRadius: 10, background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.15)', fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        💡 <strong style={{ color: '#C9A84C' }}>Pro Tip:</strong> Enable deadline notifications to never miss a GST, TDS, or ITR filing deadline.
                    </div>
                </div>
            </div>
        </div>
    );
}
