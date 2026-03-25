'use client';
import { useState } from 'react';

const GEM_CATEGORIES = [
    { name: 'IT & Electronics', icon: '💻', count: '45,000+', color: '#6366f1' },
    { name: 'Office Supplies', icon: '📎', count: '32,000+', color: '#8b5cf6' },
    { name: 'Healthcare & Medical', icon: '🏥', count: '28,000+', color: '#22c55e' },
    { name: 'Construction & Civil', icon: '🏗️', count: '18,000+', color: '#f59e0b' },
    { name: 'Defence & Security', icon: '🛡️', count: '12,000+', color: '#ef4444' },
    { name: 'Agriculture & Farming', icon: '🌾', count: '15,000+', color: '#14b8a6' },
    { name: 'Automotive & Transport', icon: '🚗', count: '9,000+', color: '#ec4899' },
    { name: 'Textiles & Apparel', icon: '👔', count: '7,500+', color: '#C9A84C' },
];

const BID_CHECKLIST = [
    { doc: 'GST Registration Certificate', required: true, desc: 'Valid GSTIN mandatory for all sellers' },
    { doc: 'PAN Card (Company/Proprietor)', required: true, desc: 'PAN of the registered entity' },
    { doc: 'MSME/Udyam Certificate', required: false, desc: 'For MSE benefits (lower EMD, price preference)' },
    { doc: 'Bank Account Details', required: true, desc: 'Account linked to GeM for payments' },
    { doc: 'ITR of Last 3 Years', required: false, desc: 'May be required for high-value tenders' },
    { doc: 'Balance Sheet & P&L', required: false, desc: 'Financial capability proof for large bids' },
    { doc: 'Product Catalogue', required: true, desc: 'With specifications, HSN codes, pricing' },
    { doc: 'Quality Certifications (ISO/BIS)', required: false, desc: 'Preferential scoring in bid evaluation' },
    { doc: 'OEM Authorization Letter', required: false, desc: 'If bidding as authorized reseller' },
    { doc: 'Turnover Certificate from CA', required: true, desc: 'CA-certified annual turnover statement' },
    { doc: 'EMD / Bid Security', required: true, desc: '1-5% of estimated bid value' },
    { doc: 'Performance Security', required: true, desc: '3-10% of contract value (post-award)' },
];

const GEM_LINKS = [
    { label: 'GeM Portal Login', url: 'https://gem.gov.in', icon: '🌐' },
    { label: 'Seller Registration', url: 'https://gem.gov.in/seller', icon: '📝' },
    { label: 'Search Bids', url: 'https://bidplus.gem.gov.in/all-bids', icon: '🔍' },
    { label: 'GeM Training', url: 'https://gem.gov.in/training', icon: '📚' },
    { label: 'Grievance Portal', url: 'https://gem.gov.in/grievance', icon: '📞' },
    { label: 'Seller Dashboard', url: 'https://gem.gov.in/sellerdashboard', icon: '📊' },
];

export default function GemPortalPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [minValue, setMinValue] = useState('');
    const [maxValue, setMaxValue] = useState('');
    const [contractValue, setContractValue] = useState('');
    const [gstRate, setGstRate] = useState('18');
    const [tdsRate, setTdsRate] = useState('2');
    const [perfSecurity, setPerfSecurity] = useState('5');
    const [activeTab, setActiveTab] = useState('search');

    const cv = Number(contractValue) || 0;
    const gstAmt = cv * Number(gstRate) / 100;
    const tdsAmt = cv * Number(tdsRate) / 100;
    const perfAmt = cv * Number(perfSecurity) / 100;
    const totalInvoice = cv + gstAmt;
    const netReceivable = totalInvoice - tdsAmt;

    const tabs = [
        { id: 'search', label: 'Bid Search', icon: '🔍' },
        { id: 'categories', label: 'Categories', icon: '📂' },
        { id: 'checklist', label: 'Bid Preparation', icon: '✅' },
        { id: 'calculator', label: 'Contract Calculator', icon: '🧮' },
    ];

    return (
        <div className="animate-fadeIn">
            <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>🏪 GeM Portal Assistant</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Help your clients search, bid, and win Government e-Marketplace contracts</p>
            </div>

            {/* Quick Links */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
                {GEM_LINKS.map(l => (
                    <a key={l.label} href={l.url} target="_blank" rel="noreferrer"
                        style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: 12, fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, transition: 'all 0.2s' }}>
                        {l.icon} {l.label}
                    </a>
                ))}
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                {tabs.map(t => (
                    <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                        padding: '10px 20px', borderRadius: 10, border: '1px solid', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                        borderColor: activeTab === t.id ? 'rgba(201,168,76,0.4)' : 'var(--border-color)',
                        background: activeTab === t.id ? 'rgba(201,168,76,0.1)' : 'var(--bg-secondary)',
                        color: activeTab === t.id ? '#C9A84C' : 'var(--text-secondary)',
                    }}>{t.icon} {t.label}</button>
                ))}
            </div>

            {/* Bid Search */}
            {activeTab === 'search' && (
                <div className="glass-card" style={{ padding: 24 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>🔍 Search GeM Bids & Tenders</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 150px 150px auto', gap: 12, marginBottom: 16 }}>
                        <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search by product, service, or keyword..."
                            style={{ padding: '12px 16px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 14, outline: 'none' }} />
                        <input type="number" value={minValue} onChange={e => setMinValue(e.target.value)} placeholder="Min ₹"
                            style={{ padding: '12px 16px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 14, outline: 'none' }} />
                        <input type="number" value={maxValue} onChange={e => setMaxValue(e.target.value)} placeholder="Max ₹"
                            style={{ padding: '12px 16px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 14, outline: 'none' }} />
                        <a href={`https://bidplus.gem.gov.in/all-bids?q=${encodeURIComponent(searchQuery)}`} target="_blank" rel="noreferrer"
                            style={{ padding: '12px 24px', borderRadius: 8, background: 'linear-gradient(135deg, #C9A84C, #E8CC7D)', color: '#0f172a', fontWeight: 700, fontSize: 13, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            🔍 Search on GeM
                        </a>
                    </div>
                    <div style={{ padding: 16, borderRadius: 10, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
                        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                            <strong style={{ color: '#6366f1' }}>💡 Pro Tip for CAs:</strong> GeM search opens directly on the official portal. Help your clients filter by:
                            <strong> Ministry/Department</strong> → <strong>Product Category</strong> → <strong>Bid Value Range</strong>.
                            MSE sellers get 25% quantity reservation and 15% price preference.
                        </p>
                    </div>
                </div>
            )}

            {/* Categories */}
            {activeTab === 'categories' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                    {GEM_CATEGORIES.map(c => (
                        <a key={c.name} href={`https://bidplus.gem.gov.in/all-bids?q=${encodeURIComponent(c.name)}`} target="_blank" rel="noreferrer"
                            style={{ padding: 20, borderRadius: 14, border: `1px solid ${c.color}20`, background: `${c.color}08`, textDecoration: 'none', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 14 }}>
                            <div style={{ width: 48, height: 48, borderRadius: 12, background: c.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>{c.icon}</div>
                            <div>
                                <div style={{ fontSize: 14, fontWeight: 700, color: c.color }}>{c.name}</div>
                                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{c.count} active bids</div>
                            </div>
                        </a>
                    ))}
                </div>
            )}

            {/* Bid Preparation Checklist */}
            {activeTab === 'checklist' && (
                <div className="glass-card" style={{ padding: 24 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>✅ Bid Preparation Checklist for Clients</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead><tr>
                            {['#', 'Document', 'Required', 'Description'].map(h => (
                                <th key={h} style={{ textAlign: 'left', padding: '10px 12px', borderBottom: '1px solid var(--border-color)', fontSize: 11, fontWeight: 700, color: '#C9A84C' }}>{h}</th>
                            ))}
                        </tr></thead>
                        <tbody>
                            {BID_CHECKLIST.map((d, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                    <td style={{ padding: '10px 12px', fontSize: 12, color: 'var(--text-secondary)' }}>{i + 1}</td>
                                    <td style={{ padding: '10px 12px', fontSize: 13, fontWeight: 600 }}>{d.doc}</td>
                                    <td style={{ padding: '10px 12px' }}>
                                        <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: d.required ? 'rgba(34,197,94,0.15)' : 'rgba(245,158,11,0.15)', color: d.required ? '#22c55e' : '#f59e0b', fontWeight: 700 }}>
                                            {d.required ? 'Mandatory' : 'Recommended'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '10px 12px', fontSize: 12, color: 'var(--text-secondary)' }}>{d.desc}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Contract Value Calculator */}
            {activeTab === 'calculator' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    <div className="glass-card" style={{ padding: 24 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>🧮 Contract Value Estimator</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div>
                                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Base Contract Value (₹)</label>
                                <input type="number" value={contractValue} onChange={e => setContractValue(e.target.value)} placeholder="1000000"
                                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 14 }} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                                <div><label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>GST Rate %</label>
                                    <select value={gstRate} onChange={e => setGstRate(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 13 }}>
                                        {[0, 5, 12, 18, 28].map(r => <option key={r} value={r}>{r}%</option>)}
                                    </select></div>
                                <div><label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>TDS Rate %</label>
                                    <select value={tdsRate} onChange={e => setTdsRate(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 13 }}>
                                        {[1, 2, 5, 10].map(r => <option key={r} value={r}>{r}%</option>)}
                                    </select></div>
                                <div><label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Perf Security %</label>
                                    <select value={perfSecurity} onChange={e => setPerfSecurity(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 13 }}>
                                        {[3, 5, 10].map(r => <option key={r} value={r}>{r}%</option>)}
                                    </select></div>
                            </div>
                        </div>
                    </div>
                    <div className="glass-card" style={{ padding: 24 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>📊 Breakup</h3>
                        {cv > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {[
                                    { label: 'Base Contract Value', value: cv, color: undefined },
                                    { label: `GST (${gstRate}%)`, value: gstAmt, color: '#f59e0b' },
                                    { label: 'Total Invoice Value', value: totalInvoice, color: '#6366f1' },
                                    { label: `TDS Deducted (${tdsRate}%)`, value: -tdsAmt, color: '#ef4444' },
                                    { label: 'Net Receivable', value: netReceivable, color: '#22c55e' },
                                    { label: `Performance Security (${perfSecurity}%)`, value: perfAmt, color: '#f97316' },
                                ].map(r => (
                                    <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: 13 }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>{r.label}</span>
                                        <span style={{ fontWeight: 700, color: r.color || 'var(--text-primary)' }}>₹{Math.abs(r.value).toLocaleString('en-IN')}</span>
                                    </div>
                                ))}
                            </div>
                        ) : <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: 24 }}>Enter contract value to see breakup</p>}
                    </div>
                </div>
            )}
        </div>
    );
}
