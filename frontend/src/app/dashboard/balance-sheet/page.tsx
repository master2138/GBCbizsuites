'use client';
import { useState } from 'react';

const SCHEDULE_III = {
    assets: [
        {
            head: 'Non-Current Assets', items: [
                { name: 'Property, Plant & Equipment', cur: 4500000, prev: 3800000 },
                { name: 'Intangible Assets', cur: 250000, prev: 300000 },
                { name: 'Long-Term Investments', cur: 1200000, prev: 1000000 },
                { name: 'Deferred Tax Asset (Net)', cur: 85000, prev: 70000 },
                { name: 'Long-Term Loans & Advances', cur: 350000, prev: 280000 },
            ]
        },
        {
            head: 'Current Assets', items: [
                { name: 'Inventories', cur: 1800000, prev: 1500000 },
                { name: 'Trade Receivables', cur: 2200000, prev: 1900000 },
                { name: 'Cash & Cash Equivalents', cur: 680000, prev: 520000 },
                { name: 'Short-Term Loans & Advances', cur: 150000, prev: 120000 },
                { name: 'Other Current Assets', cur: 95000, prev: 75000 },
            ]
        },
    ],
    liabilities: [
        {
            head: 'Shareholders Funds', items: [
                { name: 'Share Capital', cur: 2000000, prev: 2000000 },
                { name: 'Reserves & Surplus', cur: 3500000, prev: 2800000 },
            ]
        },
        {
            head: 'Non-Current Liabilities', items: [
                { name: 'Long-Term Borrowings', cur: 2500000, prev: 2200000 },
                { name: 'Long-Term Provisions', cur: 180000, prev: 150000 },
            ]
        },
        {
            head: 'Current Liabilities', items: [
                { name: 'Short-Term Borrowings', cur: 800000, prev: 600000 },
                { name: 'Trade Payables', cur: 1500000, prev: 1200000 },
                { name: 'Other Current Liabilities', cur: 630000, prev: 513000 },
                { name: 'Short-Term Provisions', cur: 200000, prev: 100000 },
            ]
        },
    ],
};

const PNL = [
    {
        head: 'Revenue', items: [
            { name: 'Revenue from Operations', cur: 12500000, prev: 10200000 },
            { name: 'Other Income', cur: 350000, prev: 280000 },
        ]
    },
    {
        head: 'Expenses', items: [
            { name: 'Cost of Materials Consumed', cur: 5200000, prev: 4300000 },
            { name: 'Employee Benefit Expense', cur: 2800000, prev: 2400000 },
            { name: 'Finance Costs', cur: 320000, prev: 280000 },
            { name: 'Depreciation & Amortization', cur: 450000, prev: 380000 },
            { name: 'Other Expenses', cur: 1580000, prev: 1320000 },
        ]
    },
];

const fmt = (n: number) => '₹' + (n / 100000).toFixed(2) + 'L';
const pct = (cur: number, prev: number) => prev ? ((cur - prev) / prev * 100).toFixed(1) : '—';

export default function BalanceSheetPage() {
    const [tab, setTab] = useState<'bs' | 'pnl' | 'ratios'>('bs');
    const [fy] = useState('2025-26');

    const totalAssets = SCHEDULE_III.assets.flatMap(g => g.items).reduce((s, i) => s + i.cur, 0);
    const totalLiab = SCHEDULE_III.liabilities.flatMap(g => g.items).reduce((s, i) => s + i.cur, 0);
    const revenue = PNL[0].items.reduce((s, i) => s + i.cur, 0);
    const expenses = PNL[1].items.reduce((s, i) => s + i.cur, 0);
    const pbt = revenue - expenses;

    const renderGroup = (groups: typeof SCHEDULE_III.assets, label: string) => (
        <div className="glass-card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#C9A84C', marginBottom: 12 }}>{label}</h3>
            {groups.map(g => (
                <div key={g.head} style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>{g.head}</div>
                    {g.items.map(it => (
                        <div key={it.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-color)', fontSize: 13 }}>
                            <span>{it.name}</span>
                            <div style={{ display: 'flex', gap: 20 }}>
                                <span style={{ fontFamily: 'monospace', width: 90, textAlign: 'right' }}>{fmt(it.cur)}</span>
                                <span style={{ fontFamily: 'monospace', width: 90, textAlign: 'right', color: 'var(--text-secondary)' }}>{fmt(it.prev)}</span>
                                <span style={{ fontFamily: 'monospace', width: 60, textAlign: 'right', color: it.cur >= it.prev ? '#22c55e' : '#ef4444', fontSize: 11 }}>{pct(it.cur, it.prev)}%</span>
                            </div>
                        </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontWeight: 700, fontSize: 13 }}>
                        <span>Sub-total</span>
                        <span style={{ fontFamily: 'monospace', color: '#C9A84C' }}>{fmt(g.items.reduce((s, i) => s + i.cur, 0))}</span>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="animate-fadeIn">
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }} className="gradient-text">Balance Sheet & P&L</h1>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Schedule III · Companies Act 2013 · FY {fy}</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 20 }}>
                {[
                    { label: 'Total Assets', value: fmt(totalAssets), color: '#C9A84C' },
                    { label: 'Total Liabilities', value: fmt(totalLiab), color: '#8B5CF6' },
                    { label: 'Revenue', value: fmt(revenue), color: '#22c55e' },
                    { label: 'PBT', value: fmt(pbt), color: pbt > 0 ? '#22c55e' : '#ef4444' },
                ].map(c => (
                    <div key={c.label} className="glass-card" style={{ padding: 16, borderLeft: `3px solid ${c.color}` }}>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 4 }}>{c.label}</div>
                        <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'monospace', color: c.color }}>{c.value}</div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
                {(['bs', 'pnl', 'ratios'] as const).map(t => (
                    <button key={t} onClick={() => setTab(t)} style={{
                        padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                        background: tab === t ? 'var(--accent-gradient)' : 'rgba(255,255,255,0.04)',
                        color: tab === t ? '#07091A' : 'var(--text-secondary)',
                    }}>{t === 'bs' ? '📊 Balance Sheet' : t === 'pnl' ? '💰 P&L Statement' : '📐 Ratios'}</button>
                ))}
            </div>

            {tab === 'bs' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    {renderGroup(SCHEDULE_III.liabilities, 'Equity & Liabilities')}
                    {renderGroup(SCHEDULE_III.assets, 'Assets')}
                </div>
            )}

            {tab === 'pnl' && renderGroup(PNL, 'Statement of Profit & Loss')}

            {tab === 'ratios' && (
                <div className="glass-card" style={{ padding: 20 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: '#C9A84C', marginBottom: 16 }}>Key Financial Ratios</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
                        {[
                            { name: 'Current Ratio', value: '1.84', benchmark: '> 1.5', ok: true },
                            { name: 'Quick Ratio', value: '1.17', benchmark: '> 1.0', ok: true },
                            { name: 'Debt-Equity Ratio', value: '0.60', benchmark: '< 2.0', ok: true },
                            { name: 'Net Profit Margin', value: '14.2%', benchmark: '> 10%', ok: true },
                            { name: 'ROE', value: '18.5%', benchmark: '> 15%', ok: true },
                            { name: 'ROCE', value: '22.1%', benchmark: '> 15%', ok: true },
                            { name: 'Inventory Turnover', value: '6.9x', benchmark: '> 5x', ok: true },
                            { name: 'Debtors Turnover', value: '5.7x', benchmark: '> 4x', ok: true },
                            { name: 'Interest Coverage', value: '9.3x', benchmark: '> 3x', ok: true },
                        ].map(r => (
                            <div key={r.name} style={{ padding: 14, borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)' }}>
                                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>{r.name}</div>
                                <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'monospace', color: r.ok ? '#22c55e' : '#ef4444' }}>{r.value}</div>
                                <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 2 }}>Benchmark: {r.benchmark}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
