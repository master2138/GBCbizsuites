'use client';
import { useState } from 'react';

const TDS_SECTIONS = [
    { sec: '192', desc: 'Salary', rate: 'As per slab', threshold: '₹2,50,000' },
    { sec: '192A', desc: 'PF Premature Withdrawal', rate: '10%', threshold: '₹50,000' },
    { sec: '193', desc: 'Interest on Securities', rate: '10%', threshold: '₹5,000' },
    { sec: '194', desc: 'Dividend', rate: '10%', threshold: '₹5,000' },
    { sec: '194A', desc: 'Interest (Other than Securities)', rate: '10%', threshold: '₹40,000' },
    { sec: '194B', desc: 'Lottery/Crossword/Game', rate: '30%', threshold: '₹10,000' },
    { sec: '194C', desc: 'Contractor Payment', rate: '1%/2%', threshold: '₹30,000' },
    { sec: '194D', desc: 'Insurance Commission', rate: '5%', threshold: '₹15,000' },
    { sec: '194H', desc: 'Commission/Brokerage', rate: '5%', threshold: '₹15,000' },
    { sec: '194I', desc: 'Rent', rate: '2%/10%', threshold: '₹2,40,000' },
    { sec: '194J', desc: 'Professional/Technical Fees', rate: '2%/10%', threshold: '₹30,000' },
    { sec: '194K', desc: 'MF Income', rate: '10%', threshold: '₹5,000' },
    { sec: '194N', desc: 'Cash Withdrawal', rate: '2%/5%', threshold: '₹1 Cr' },
    { sec: '194O', desc: 'E-commerce Operator', rate: '1%', threshold: '₹5,00,000' },
    { sec: '194Q', desc: 'Purchase of Goods', rate: '0.1%', threshold: '₹50,00,000' },
    { sec: '194R', desc: 'Perquisites/Benefits', rate: '10%', threshold: '₹20,000' },
    { sec: '194S', desc: 'Virtual Digital Assets', rate: '1%', threshold: '₹10,000/₹50,000' },
    { sec: '195', desc: 'NRI Payments', rate: '20%/10%', threshold: 'Any amount' },
    { sec: '206C', desc: 'TCS — Various', rate: '0.1-5%', threshold: 'Varies' },
];

const FORM_TYPES = [
    { form: '24Q', desc: 'Salary TDS — Quarterly', due: ['Jul 31', 'Oct 31', 'Jan 31', 'May 31'] },
    { form: '26Q', desc: 'Non-Salary TDS — Quarterly', due: ['Jul 31', 'Oct 31', 'Jan 31', 'May 31'] },
    { form: '27Q', desc: 'NRI TDS — Quarterly', due: ['Jul 31', 'Oct 31', 'Jan 31', 'May 31'] },
    { form: '27EQ', desc: 'TCS Statement', due: ['Jul 15', 'Oct 15', 'Jan 15', 'May 15'] },
];

type Deductee = { name: string; pan: string; section: string; amount: number; tds: number; date: string; status: string };

const DEMO_DEDUCTEES: Deductee[] = [
    { name: 'Rajesh Sharma', pan: 'ABCPS1234D', section: '194J', amount: 250000, tds: 25000, date: '2026-03-15', status: 'Deposited' },
    { name: 'M/s Fresh Foods Pvt Ltd', pan: 'AABCF5678K', section: '194C', amount: 180000, tds: 3600, date: '2026-03-20', status: 'Deposited' },
    { name: 'Priya G (Rent)', pan: 'BCDPG9876H', section: '194I', amount: 300000, tds: 30000, date: '2026-03-25', status: 'Pending' },
    { name: 'Tech Solutions LLC', pan: 'AABCT4567J', section: '194J', amount: 500000, tds: 50000, date: '2026-03-28', status: 'Deposited' },
    { name: 'NRI Holdings Ltd', pan: 'CDEPN2345L', section: '195', amount: 1000000, tds: 200000, date: '2026-03-30', status: 'Pending' },
];

export default function TDSPage() {
    const [tab, setTab] = useState<'deductees' | 'rates' | 'returns'>('deductees');
    const [search, setSearch] = useState('');

    const filteredSections = TDS_SECTIONS.filter(s =>
        s.sec.includes(search) || s.desc.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="animate-fadeIn">
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }} className="gradient-text">TDS / TCS Management</h1>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Form 24Q/26Q/27Q · Deductee Master · Section Rates · Challan 281</p>
            </div>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 20 }}>
                {[
                    { label: 'Total TDS Deducted', value: '₹3,08,600', color: '#C9A84C' },
                    { label: 'Deposited', value: '₹78,600', color: '#22c55e' },
                    { label: 'Pending Deposit', value: '₹2,30,000', color: '#ef4444' },
                    { label: 'Deductees', value: '5', color: '#8B5CF6' },
                    { label: 'Returns Filed', value: '3/4', color: '#0D7B7B' },
                ].map(c => (
                    <div key={c.label} className="glass-card" style={{ padding: 16, borderLeft: `3px solid ${c.color}` }}>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 4 }}>{c.label}</div>
                        <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'monospace', color: c.color }}>{c.value}</div>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
                {(['deductees', 'rates', 'returns'] as const).map(t => (
                    <button key={t} onClick={() => setTab(t)} style={{
                        padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                        background: tab === t ? 'var(--accent-gradient)' : 'rgba(255,255,255,0.04)',
                        color: tab === t ? '#07091A' : 'var(--text-secondary)',
                    }}>{t === 'deductees' ? '👥 Deductee Ledger' : t === 'rates' ? '📊 TDS Rates' : '📋 Returns'}</button>
                ))}
            </div>

            {/* Deductee Ledger */}
            {tab === 'deductees' && (
                <div className="glass-card" style={{ padding: 20 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                {['Deductee', 'PAN', 'Section', 'Amount', 'TDS', 'Date', 'Status'].map(h => (
                                    <th key={h} style={{ textAlign: 'left', padding: '10px 8px', fontSize: 11, color: 'var(--text-secondary)', fontWeight: 700 }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {DEMO_DEDUCTEES.map((d, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '10px 8px', fontWeight: 600 }}>{d.name}</td>
                                    <td style={{ padding: '10px 8px', fontFamily: 'monospace', fontSize: 12 }}>{d.pan}</td>
                                    <td style={{ padding: '10px 8px' }}><span style={{ background: 'rgba(201,168,76,0.15)', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700 }}>{d.section}</span></td>
                                    <td style={{ padding: '10px 8px', fontFamily: 'monospace' }}>₹{d.amount.toLocaleString()}</td>
                                    <td style={{ padding: '10px 8px', fontFamily: 'monospace', color: '#C9A84C' }}>₹{d.tds.toLocaleString()}</td>
                                    <td style={{ padding: '10px 8px', fontSize: 12 }}>{d.date}</td>
                                    <td style={{ padding: '10px 8px' }}>
                                        <span style={{
                                            padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700,
                                            background: d.status === 'Deposited' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                                            color: d.status === 'Deposited' ? '#22c55e' : '#ef4444'
                                        }}>{d.status}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* TDS Rates */}
            {tab === 'rates' && (
                <div className="glass-card" style={{ padding: 20 }}>
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search section or description..."
                        style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.04)', color: 'var(--text-primary)', fontSize: 13, marginBottom: 14 }} />
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                {['Section', 'Description', 'Rate', 'Threshold'].map(h => (
                                    <th key={h} style={{ textAlign: 'left', padding: '8px', fontSize: 11, color: 'var(--text-secondary)', fontWeight: 700 }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSections.map(s => (
                                <tr key={s.sec} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '8px', fontWeight: 700, color: '#C9A84C', fontFamily: 'monospace' }}>{s.sec}</td>
                                    <td style={{ padding: '8px' }}>{s.desc}</td>
                                    <td style={{ padding: '8px', fontFamily: 'monospace' }}>{s.rate}</td>
                                    <td style={{ padding: '8px', fontFamily: 'monospace', fontSize: 12 }}>{s.threshold}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Returns */}
            {tab === 'returns' && (
                <div style={{ display: 'grid', gap: 14 }}>
                    {FORM_TYPES.map(f => (
                        <div key={f.form} className="glass-card" style={{ padding: 20 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                <div>
                                    <span style={{ fontSize: 18, fontWeight: 800, color: '#C9A84C', marginRight: 8 }}>{f.form}</span>
                                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{f.desc}</span>
                                </div>
                                <span style={{ padding: '4px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700, background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}>3/4 Filed</span>
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                                {f.due.map((d, i) => (
                                    <div key={i} style={{
                                        flex: 1, padding: '10px', borderRadius: 8, textAlign: 'center', fontSize: 12,
                                        background: i < 3 ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
                                        border: `1px solid ${i < 3 ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
                                    }}>
                                        <div style={{ fontWeight: 700, marginBottom: 2 }}>Q{i + 1}</div>
                                        <div style={{ color: 'var(--text-secondary)', fontSize: 11 }}>{d}</div>
                                        <div style={{ marginTop: 4, fontSize: 10, fontWeight: 700, color: i < 3 ? '#22c55e' : '#ef4444' }}>{i < 3 ? '✅ Filed' : '⏳ Pending'}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
