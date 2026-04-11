'use client';
import { useRouter } from 'next/navigation';

const STATS = [
    { label: 'Total Clients', value: '247', icon: '👥', color: '#C9A84C', change: '+12 this month' },
    { label: 'ITR Pending', value: '38', icon: '📋', color: '#ef4444', change: 'Due by Jul 31' },
    { label: 'GSTR-3B Due', value: '22', icon: '🏛️', color: '#f59e0b', change: 'Due today' },
    { label: 'Revenue MTD', value: '₹1.2L', icon: '💰', color: '#22c55e', change: '+18% vs last month' },
];

const DEADLINES = [
    { date: 'Apr 11', task: 'GSTR-1 Filing — 22 clients', status: 'urgent', color: '#ef4444' },
    { date: 'Apr 18', task: 'Advance Tax Q1 — 8 assessees', status: 'upcoming', color: '#f59e0b' },
    { date: 'Apr 30', task: 'TDS 24Q Q4 Return — 15 deductors', status: 'upcoming', color: '#f59e0b' },
    { date: 'May 15', task: 'TDS Certificate 16A — Bulk Gen', status: 'planned', color: '#60a5fa' },
    { date: 'Jul 31', task: 'ITR Filing Deadline — 247 assessees', status: 'planned', color: '#60a5fa' },
];

const ACTIVITY = [
    { time: '2 min ago', text: 'ITR-3 filed for Rajesh Sharma (ABCPS1234D)', icon: '✅' },
    { time: '15 min ago', text: 'GSTR-3B submitted for M/s Fresh Foods', icon: '📤' },
    { time: '1 hr ago', text: 'Form 16 imported — 45 employees', icon: '📄' },
    { time: '3 hrs ago', text: 'TDS Challan 281 verified — ₹2,34,000', icon: '💳' },
    { time: 'Yesterday', text: 'Balance Sheet generated — ABC Pvt Ltd', icon: '📊' },
];

const QUICK_ACTIONS = [
    { label: 'New ITR', icon: '⚡', path: '/dashboard/income-tax', color: '#1565C0' },
    { label: 'File GSTR', icon: '🏛️', path: '/dashboard/gst-tools', color: '#1B7A5A' },
    { label: 'TDS Return', icon: '📋', path: '/dashboard/compliance', color: '#D4700A' },
    { label: 'New Invoice', icon: '🧾', path: '/dashboard/invoices', color: '#8B5CF6' },
    { label: 'Add Client', icon: '👤', path: '/dashboard/clients', color: '#0D7B7B' },
    { label: 'AI Assistant', icon: '🤖', path: '/dashboard/ai-assistant', color: '#C9A84C' },
];

export default function DashboardPage() {
    const router = useRouter();

    return (
        <div className="animate-fadeIn">
            {/* Header */}
            <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }} className="gradient-text">
                    Good morning, CA Gautam 👋
                </h1>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    GBC & Associates · Mira Road · FY 2025-26 · AY 2026-27
                </p>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14, marginBottom: 24 }}>
                {STATS.map(s => (
                    <div key={s.label} className="glass-card" style={{ padding: 20, borderTop: `3px solid ${s.color}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 6 }}>{s.label}</div>
                                <div style={{ fontSize: 28, fontWeight: 800, fontFamily: 'monospace', color: s.color }}>{s.value}</div>
                            </div>
                            <span style={{ fontSize: 28 }}>{s.icon}</span>
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 8 }}>{s.change}</div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: 'var(--text-secondary)', letterSpacing: 1, textTransform: 'uppercase' }}>Quick Actions</h3>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {QUICK_ACTIONS.map(a => (
                        <button key={a.label} onClick={() => router.push(a.path)} style={{
                            padding: '10px 18px', borderRadius: 10, border: '1px solid var(--border-color)',
                            background: `rgba(${a.color === '#C9A84C' ? '201,168,76' : '255,255,255'},0.06)`,
                            color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                            fontSize: 13, fontWeight: 600, transition: 'all 0.2s'
                        }}>
                            <span style={{ fontSize: 18 }}>{a.icon}</span> {a.label}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {/* Deadlines */}
                <div className="glass-card" style={{ padding: 20 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, color: '#C9A84C' }}>📅 Upcoming Deadlines</h3>
                    {DEADLINES.map((d, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < DEADLINES.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                            <div style={{ fontSize: 12, color: d.color, fontWeight: 700, fontFamily: 'monospace', width: 60 }}>{d.date}</div>
                            <div style={{ fontSize: 13 }}>{d.task}</div>
                        </div>
                    ))}
                </div>

                {/* Activity */}
                <div className="glass-card" style={{ padding: 20 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, color: '#C9A84C' }}>⚡ Recent Activity</h3>
                    {ACTIVITY.map((a, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 0', borderBottom: i < ACTIVITY.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                            <span style={{ fontSize: 16, flexShrink: 0 }}>{a.icon}</span>
                            <div>
                                <div style={{ fontSize: 13 }}>{a.text}</div>
                                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>{a.time}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Filing Progress */}
            <div className="glass-card" style={{ padding: 20, marginTop: 16 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, color: '#C9A84C' }}>📊 Filing Season Progress — AY 2026-27</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                    {[
                        { label: 'ITR Filed', done: 209, total: 247, color: '#22c55e' },
                        { label: 'Tax Audit (3CD)', done: 32, total: 44, color: '#8B5CF6' },
                        { label: 'TDS Returns', done: 48, total: 60, color: '#D4700A' },
                        { label: 'GSTR-9 Annual', done: 15, total: 38, color: '#1B7A5A' },
                    ].map(p => (
                        <div key={p.label}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                                <span>{p.label}</span>
                                <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{p.done}/{p.total}</span>
                            </div>
                            <div style={{ height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.06)' }}>
                                <div style={{ height: '100%', borderRadius: 4, background: p.color, width: `${(p.done / p.total) * 100}%`, transition: 'width 0.6s ease' }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
