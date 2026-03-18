'use client';
import { useState } from 'react';

const GEM_CATEGORIES = [
    { name: 'IT Hardware & Software', icon: '💻', count: 1245, code: 'IT' },
    { name: 'Office Supplies & Stationery', icon: '📎', count: 892, code: 'OFFICE' },
    { name: 'Furniture & Fixtures', icon: '🪑', count: 634, code: 'FURN' },
    { name: 'Construction & Civil Works', icon: '🏗️', count: 2103, code: 'CONST' },
    { name: 'Medical Equipment', icon: '🏥', count: 456, code: 'MED' },
    { name: 'Vehicles & Transport', icon: '🚗', count: 321, code: 'VEHC' },
    { name: 'Electrical & Electronics', icon: '⚡', count: 789, code: 'ELEC' },
    { name: 'Security Services', icon: '🔐', count: 245, code: 'SEC' },
    { name: 'Cleaning & Housekeeping', icon: '🧹', count: 178, code: 'CLEAN' },
    { name: 'Consulting & Professional', icon: '📋', count: 567, code: 'CONSULT' },
];

// Simulated bid data
const SAMPLE_BIDS = [
    { id: 'GEM/2026/B/4123456', title: 'Supply of Desktop Computers and Monitors', org: 'Ministry of Defence', category: 'IT', value: '₹45,00,000', deadline: '2026-04-15', status: 'Active', type: 'Bid', items: 50 },
    { id: 'GEM/2026/B/4123457', title: 'Annual Maintenance Contract for CCTV Systems', org: 'Indian Railways', category: 'SEC', value: '₹12,50,000', deadline: '2026-04-10', status: 'Active', type: 'Bid', items: 1 },
    { id: 'GEM/2026/RA/812345', title: 'Office Furniture - Ergonomic Chairs & Tables', org: 'NITI Aayog', category: 'FURN', value: '₹8,90,000', deadline: '2026-04-08', status: 'Active', type: 'Reverse Auction', items: 200 },
    { id: 'GEM/2026/B/4123458', title: 'Cloud Hosting & Managed Services (3 Years)', org: 'Ministry of Electronics & IT', category: 'IT', value: '₹1,20,00,000', deadline: '2026-04-20', status: 'Active', type: 'Bid', items: 1 },
    { id: 'GEM/2026/B/4123459', title: 'Construction of Government School Building', org: 'Ministry of Education', category: 'CONST', value: '₹3,50,00,000', deadline: '2026-04-25', status: 'Active', type: 'Bid', items: 1 },
    { id: 'GEM/2026/RA/812346', title: 'LED Street Lights Procurement — 5000 Units', org: 'Smart Cities Mission', category: 'ELEC', value: '₹2,25,00,000', deadline: '2026-04-12', status: 'Active', type: 'Reverse Auction', items: 5000 },
    { id: 'GEM/2026/B/4123460', title: 'Medical Ventilators & ICU Equipment', org: 'AIIMS Delhi', category: 'MED', value: '₹89,00,000', deadline: '2026-04-18', status: 'Active', type: 'Bid', items: 25 },
    { id: 'GEM/2026/B/4123461', title: 'Consulting Services for Digital Transformation', org: 'Ministry of Finance', category: 'CONSULT', value: '₹65,00,000', deadline: '2026-04-22', status: 'Active', type: 'Bid', items: 1 },
    { id: 'GEM/2026/RA/812347', title: 'Vehicle Fleet — Maruti Suzuki Ertiga (10 Units)', org: 'State Transport Authority', category: 'VEHC', value: '₹95,00,000', deadline: '2026-04-14', status: 'Active', type: 'Reverse Auction', items: 10 },
    { id: 'GEM/2026/B/4123462', title: 'Housekeeping & Cleaning Services (12 Months)', org: 'CPWD', category: 'CLEAN', value: '₹18,00,000', deadline: '2026-04-11', status: 'Active', type: 'Bid', items: 1 },
];

export default function GeMPortalPage() {
    const [search, setSearch] = useState('');
    const [selectedCat, setSelectedCat] = useState('');
    const [type, setType] = useState('');
    const [selectedBid, setSelectedBid] = useState<any>(null);

    const filtered = SAMPLE_BIDS.filter(b => {
        const matchSearch = !search || b.title.toLowerCase().includes(search.toLowerCase()) || b.org.toLowerCase().includes(search.toLowerCase()) || b.id.includes(search);
        const matchCat = !selectedCat || b.category === selectedCat;
        const matchType = !type || b.type === type;
        return matchSearch && matchCat && matchType;
    });

    const daysLeft = (d: string) => Math.max(0, Math.ceil((new Date(d).getTime() - Date.now()) / 86400000));

    return (
        <div className="animate-fadeIn">
            <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>🌍 GeM Portal — Bid Finder (TradeCA)</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Find and track Government e-Marketplace bids & reverse auctions</p>
            </div>

            {/* Category Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10, marginBottom: 24 }}>
                {GEM_CATEGORIES.map(c => (
                    <button key={c.code} onClick={() => setSelectedCat(selectedCat === c.code ? '' : c.code)} style={{
                        padding: '12px', borderRadius: 10, border: '1px solid',
                        borderColor: selectedCat === c.code ? 'rgba(201,168,76,0.4)' : 'var(--border-color)',
                        background: selectedCat === c.code ? 'rgba(201,168,76,0.1)' : 'var(--bg-secondary)',
                        cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
                    }}>
                        <div style={{ fontSize: 24 }}>{c.icon}</div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: selectedCat === c.code ? '#C9A84C' : 'var(--text-primary)', marginTop: 4 }}>{c.name}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{c.count} active</div>
                    </button>
                ))}
            </div>

            {/* Search + Filters */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search by bid ID, title, or organization..."
                    style={{ flex: 1, padding: '12px 16px', borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 14, outline: 'none' }} />
                <select value={type} onChange={e => setType(e.target.value)} style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 13 }}>
                    <option value="">All Types</option>
                    <option value="Bid">Standard Bid</option>
                    <option value="Reverse Auction">Reverse Auction</option>
                </select>
            </div>

            {/* Bid Results */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {filtered.map(b => {
                    const days = daysLeft(b.deadline);
                    return (
                        <div key={b.id} className="glass-card" style={{ padding: '16px 20px', cursor: 'pointer', borderLeft: `3px solid ${b.type === 'Reverse Auction' ? '#8b5cf6' : '#C9A84C'}` }}
                            onClick={() => setSelectedBid(selectedBid?.id === b.id ? null : b)}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                        <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#C9A84C', fontWeight: 700 }}>{b.id}</span>
                                        <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700, background: b.type === 'Reverse Auction' ? 'rgba(139,92,246,0.15)' : 'rgba(201,168,76,0.15)', color: b.type === 'Reverse Auction' ? '#8b5cf6' : '#C9A84C' }}>{b.type}</span>
                                    </div>
                                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{b.title}</div>
                                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>🏛️ {b.org}</div>
                                </div>
                                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                    <div style={{ fontSize: 16, fontWeight: 800, color: '#C9A84C' }}>{b.value}</div>
                                    <div style={{ fontSize: 11, color: days <= 3 ? '#ef4444' : days <= 7 ? '#f59e0b' : '#10b981', fontWeight: 700, marginTop: 4 }}>
                                        {days === 0 ? '🔴 Today!' : `⏰ ${days} days left`}
                                    </div>
                                </div>
                            </div>
                            {selectedBid?.id === b.id && (
                                <div style={{ marginTop: 12, padding: 14, borderRadius: 10, background: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.15)' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, fontSize: 12 }}>
                                        <div><span style={{ color: 'var(--text-secondary)' }}>Items:</span> <strong>{b.items}</strong></div>
                                        <div><span style={{ color: 'var(--text-secondary)' }}>Deadline:</span> <strong>{new Date(b.deadline).toLocaleDateString('en-IN')}</strong></div>
                                        <div><span style={{ color: 'var(--text-secondary)' }}>Status:</span> <strong style={{ color: '#22c55e' }}>{b.status}</strong></div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                                        <a href="https://gem.gov.in" target="_blank" rel="noopener noreferrer" style={{ padding: '8px 16px', borderRadius: 8, background: 'linear-gradient(135deg, #C9A84C, #E8CC7D)', color: '#0f172a', fontWeight: 700, fontSize: 12, cursor: 'pointer', textDecoration: 'none' }}>🔗 Apply on GeM</a>
                                        <button style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(99,102,241,0.3)', background: 'rgba(99,102,241,0.1)', color: '#6366f1', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>📋 Save to Watchlist</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {filtered.length === 0 && (
                <div className="glass-card" style={{ padding: 40, textAlign: 'center' }}>
                    <div style={{ fontSize: 36, marginBottom: 8 }}>🔍</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>No bids found matching your criteria</div>
                </div>
            )}
        </div>
    );
}
