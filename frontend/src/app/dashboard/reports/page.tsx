'use client';

export default function ReportsPage() {
    return (
        <div className="animate-fadeIn">
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }} className="gradient-text">MIS Reports</h1>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Practice Analytics · Filing Summary · Staff Productivity</p>
            </div>

            {/* Revenue by Month */}
            <div className="glass-card" style={{ padding: 20, marginBottom: 16 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#C9A84C', marginBottom: 16 }}>📊 Monthly Revenue — FY 2025-26</h3>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 140 }}>
                    {[45, 38, 52, 120, 85, 65, 95, 55, 48, 70, 110, 88].map((v, i) => (
                        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                            <span style={{ fontSize: 9, fontFamily: 'monospace', color: 'var(--text-secondary)' }}>₹{v}K</span>
                            <div style={{
                                width: '100%', borderRadius: '4px 4px 0 0', transition: 'height 0.4s ease',
                                height: `${(v / 120) * 100}px`,
                                background: i === 3 || i === 10 ? 'var(--accent-gradient)' : 'rgba(201,168,76,0.25)',
                            }} />
                            <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'][i]}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
                {/* Filing Summary */}
                <div className="glass-card" style={{ padding: 20 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: '#C9A84C', marginBottom: 14 }}>📋 Filing Summary</h3>
                    {[
                        { type: 'ITR', filed: 209, total: 247, color: '#22c55e' },
                        { type: 'GSTR-3B', filed: 264, total: 264, color: '#8B5CF6' },
                        { type: 'GSTR-1', filed: 252, total: 264, color: '#0D7B7B' },
                        { type: 'TDS Returns', filed: 48, total: 60, color: '#D4700A' },
                        { type: 'Tax Audit', filed: 32, total: 44, color: '#ef4444' },
                        { type: 'GSTR-9', filed: 15, total: 38, color: '#f59e0b' },
                    ].map(f => (
                        <div key={f.type} style={{ marginBottom: 10 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                                <span>{f.type}</span>
                                <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{f.filed}/{f.total}</span>
                            </div>
                            <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)' }}>
                                <div style={{ height: '100%', borderRadius: 3, background: f.color, width: `${(f.filed / f.total) * 100}%` }} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Staff Productivity */}
                <div className="glass-card" style={{ padding: 20 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: '#C9A84C', marginBottom: 14 }}>👥 Staff Productivity</h3>
                    {[
                        { name: 'CA Gautam (Partner)', tasks: 85, hours: 180, rating: '⭐⭐⭐⭐⭐' },
                        { name: 'Neha (Senior)', tasks: 120, hours: 200, rating: '⭐⭐⭐⭐⭐' },
                        { name: 'Amit (Article)', tasks: 95, hours: 190, rating: '⭐⭐⭐⭐' },
                        { name: 'Riya (Junior)', tasks: 65, hours: 160, rating: '⭐⭐⭐⭐' },
                        { name: 'Vikram (Intern)', tasks: 40, hours: 120, rating: '⭐⭐⭐' },
                    ].map(s => (
                        <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>
                                {s.name[0]}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 13, fontWeight: 600 }}>{s.name}</div>
                                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{s.tasks} tasks · {s.hours} hrs</div>
                            </div>
                            <span style={{ fontSize: 12 }}>{s.rating}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Service-wise Revenue */}
            <div className="glass-card" style={{ padding: 20 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#C9A84C', marginBottom: 14 }}>💰 Service-wise Revenue</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                    {[
                        { service: 'ITR Filing', revenue: '₹4.2L', clients: 209, pct: 35 },
                        { service: 'GST Returns', revenue: '₹3.1L', clients: 38, pct: 26 },
                        { service: 'Tax Audit', revenue: '₹2.2L', clients: 44, pct: 18 },
                        { service: 'TDS/TCS', revenue: '₹1.1L', clients: 15, pct: 9 },
                        { service: 'Company Law', revenue: '₹0.8L', clients: 12, pct: 7 },
                        { service: 'Advisory', revenue: '₹0.6L', clients: 8, pct: 5 },
                    ].map(s => (
                        <div key={s.service} style={{ padding: 14, borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)' }}>
                            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{s.service}</div>
                            <div style={{ fontSize: 20, fontWeight: 800, fontFamily: 'monospace', color: '#C9A84C' }}>{s.revenue}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{s.clients} clients · {s.pct}% of total</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
