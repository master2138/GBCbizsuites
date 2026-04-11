'use client';
import { useState } from 'react';

type Client = { name: string; pan: string; gstin: string; type: string; status: string; filings: number; revenue: string; phone: string; };

const CLIENTS: Client[] = [
    { name: 'Rajesh Sharma (HUF)', pan: 'ABCPS1234D', gstin: '27ABCPS1234D1ZP', type: 'HUF', status: 'Active', filings: 8, revenue: '₹48K', phone: '98765-43210' },
    { name: 'M/s Fresh Foods Pvt Ltd', pan: 'AABCF5678K', gstin: '27AABCF5678K1ZR', type: 'Pvt Ltd', status: 'Active', filings: 12, revenue: '₹1.2L', phone: '98765-11111' },
    { name: 'Priya Gupta', pan: 'BCDPG9876H', gstin: '—', type: 'Individual', status: 'Active', filings: 3, revenue: '₹15K', phone: '98765-22222' },
    { name: 'Tech Solutions LLP', pan: 'AABCT4567J', gstin: '27AABCT4567J1ZS', type: 'LLP', status: 'Active', filings: 10, revenue: '₹85K', phone: '98765-33333' },
    { name: 'NRI Holdings Ltd', pan: 'CDEPN2345L', gstin: '—', type: 'Company', status: 'Inactive', filings: 2, revenue: '₹25K', phone: '98765-44444' },
    { name: 'Sharma & Sons Partnership', pan: 'AADFS7890M', gstin: '27AADFS7890M1ZT', type: 'Firm', status: 'Active', filings: 6, revenue: '₹55K', phone: '98765-55555' },
    { name: 'Anita Desai Trust', pan: 'AAATD3456N', gstin: '—', type: 'Trust', status: 'Active', filings: 4, revenue: '₹30K', phone: '98765-66666' },
    { name: 'Green Earth NGO', pan: 'AAAPG6789P', gstin: '—', type: 'AOP/BOI', status: 'Active', filings: 5, revenue: '₹20K', phone: '98765-77777' },
];

export default function ClientsPage() {
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const types = ['all', ...Array.from(new Set(CLIENTS.map(c => c.type)))];
    const filtered = CLIENTS.filter(c =>
        (typeFilter === 'all' || c.type === typeFilter) &&
        (c.name.toLowerCase().includes(search.toLowerCase()) || c.pan.includes(search.toUpperCase()))
    );

    return (
        <div className="animate-fadeIn">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }} className="gradient-text">Client Master</h1>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{CLIENTS.length} clients · PAN · GSTIN · TAN Registry</p>
                </div>
                <button style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: 'var(--accent-gradient)', color: '#07091A', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>+ Add Client</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10, marginBottom: 16 }}>
                {[
                    { label: 'Total', value: CLIENTS.length, color: '#C9A84C' },
                    { label: 'Active', value: CLIENTS.filter(c => c.status === 'Active').length, color: '#22c55e' },
                    { label: 'Companies', value: CLIENTS.filter(c => ['Pvt Ltd', 'Company', 'LLP'].includes(c.type)).length, color: '#8B5CF6' },
                    { label: 'Individuals', value: CLIENTS.filter(c => c.type === 'Individual' || c.type === 'HUF').length, color: '#0D7B7B' },
                ].map(c => (
                    <div key={c.label} className="glass-card" style={{ padding: 14, borderLeft: `3px solid ${c.color}`, textAlign: 'center' }}>
                        <div style={{ fontSize: 24, fontWeight: 800, fontFamily: 'monospace', color: c.color }}>{c.value}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{c.label}</div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name or PAN..."
                    style={{ flex: 1, padding: '8px 14px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.04)', color: 'var(--text-primary)', fontSize: 13 }} />
                {types.map(t => (
                    <button key={t} onClick={() => setTypeFilter(t)} style={{
                        padding: '6px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600,
                        background: typeFilter === t ? 'var(--accent-gradient)' : 'rgba(255,255,255,0.04)',
                        color: typeFilter === t ? '#07091A' : 'var(--text-secondary)',
                    }}>{t === 'all' ? 'All' : t}</button>
                ))}
            </div>

            <div className="glass-card" style={{ padding: 16 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead><tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                        {['Client', 'PAN', 'GSTIN', 'Type', 'Filings', 'Revenue', 'Status'].map(h =>
                            <th key={h} style={{ textAlign: 'left', padding: '8px', fontSize: 11, color: 'var(--text-secondary)', fontWeight: 700 }}>{h}</th>
                        )}
                    </tr></thead>
                    <tbody>{filtered.map(c => (
                        <tr key={c.pan} style={{ borderBottom: '1px solid var(--border-color)', cursor: 'pointer' }}>
                            <td style={{ padding: '10px 8px', fontWeight: 600 }}>{c.name}</td>
                            <td style={{ padding: '10px 8px', fontFamily: 'monospace', fontSize: 12 }}>{c.pan}</td>
                            <td style={{ padding: '10px 8px', fontFamily: 'monospace', fontSize: 11 }}>{c.gstin}</td>
                            <td style={{ padding: '10px 8px' }}><span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, background: 'rgba(201,168,76,0.12)' }}>{c.type}</span></td>
                            <td style={{ padding: '10px 8px', fontFamily: 'monospace' }}>{c.filings}</td>
                            <td style={{ padding: '10px 8px', fontFamily: 'monospace', color: '#22c55e' }}>{c.revenue}</td>
                            <td style={{ padding: '10px 8px' }}>
                                <span style={{
                                    padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700,
                                    background: c.status === 'Active' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                                    color: c.status === 'Active' ? '#22c55e' : '#ef4444'
                                }}>{c.status}</span>
                            </td>
                        </tr>
                    ))}</tbody>
                </table>
            </div>
        </div>
    );
}
