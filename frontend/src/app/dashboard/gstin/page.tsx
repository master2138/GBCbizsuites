'use client';
import { useState } from 'react';

const DEMO_RESULTS: Record<string, any> = {
    '27AABCF5678K1ZR': { gstin: '27AABCF5678K1ZR', legalName: 'FRESH FOODS PRIVATE LIMITED', tradeName: 'Fresh Foods', status: 'Active', type: 'Regular', regDate: '2017-07-01', state: 'Maharashtra', address: '101 Trade Centre, Andheri East, Mumbai 400069', lastFiled: 'GSTR-3B — Mar 2026', filingStatus: 'Up to date' },
    '27AABCT4567J1ZS': { gstin: '27AABCT4567J1ZS', legalName: 'TECH SOLUTIONS LLP', tradeName: 'TechSol', status: 'Active', type: 'Regular', regDate: '2018-04-01', state: 'Maharashtra', address: '502 IT Park, Powai, Mumbai 400076', lastFiled: 'GSTR-3B — Mar 2026', filingStatus: 'Up to date' },
    '29BCDXE5678K1ZR': { gstin: '29BCDXE5678K1ZR', legalName: 'XYZ ENTERPRISES', tradeName: 'XYZ', status: 'Active', type: 'Composition', regDate: '2019-01-15', state: 'Karnataka', address: '34 MG Road, Bengaluru 560001', lastFiled: 'CMP-08 — Q4 2025-26', filingStatus: 'Up to date' },
};

export default function GSTINPage() {
    const [gstin, setGstin] = useState('');
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState<any[]>([]);

    const verify = () => {
        if (!gstin.trim() || gstin.length !== 15) { setError('Enter valid 15-character GSTIN'); return; }
        setLoading(true); setError(''); setResult(null);
        setTimeout(() => {
            const data = DEMO_RESULTS[gstin.toUpperCase()] || {
                gstin: gstin.toUpperCase(), legalName: 'SAMPLE BUSINESS PVT LTD', tradeName: 'Sample Biz',
                status: 'Active', type: 'Regular', regDate: '2020-01-01', state: gstin.slice(0, 2) === '27' ? 'Maharashtra' : 'Other',
                address: 'Demo Address', lastFiled: 'GSTR-3B — Feb 2026', filingStatus: 'Up to date'
            };
            setResult(data);
            setHistory(prev => [data, ...prev.filter(h => h.gstin !== data.gstin)].slice(0, 10));
            setLoading(false);
        }, 600);
    };

    return (
        <div className="animate-fadeIn">
            <div style={{ marginBottom: 20 }}>
                <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }} className="gradient-text">🔍 GSTIN Verifier</h1>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Verify GSTIN · Check filing status · Validate supplier details</p>
            </div>

            <div className="glass-card" style={{ padding: 20, marginBottom: 16 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                    <input value={gstin} onChange={e => setGstin(e.target.value.toUpperCase())} onKeyDown={e => e.key === 'Enter' && verify()}
                        placeholder="Enter 15-digit GSTIN (e.g. 27AABCF5678K1ZR)" maxLength={15}
                        style={{ flex: 1, padding: '12px 16px', borderRadius: 10, border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.04)', color: 'var(--text-primary)', fontSize: 15, fontFamily: 'monospace', letterSpacing: 2 }} />
                    <button onClick={verify} disabled={loading} style={{ padding: '12px 24px', borderRadius: 10, border: 'none', background: 'var(--accent-gradient)', color: '#07091A', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                        {loading ? '⏳' : '🔍'} Verify
                    </button>
                </div>
                {error && <div style={{ color: '#ef4444', fontSize: 13, marginTop: 8 }}>⚠️ {error}</div>}
                <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                    {Object.keys(DEMO_RESULTS).map(g => (
                        <button key={g} onClick={() => { setGstin(g); }} style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.04)', color: 'var(--text-secondary)', fontSize: 11, fontFamily: 'monospace', cursor: 'pointer' }}>{g}</button>
                    ))}
                </div>
            </div>

            {result && (
                <div className="glass-card" style={{ padding: 20, marginBottom: 16, borderLeft: `3px solid ${result.status === 'Active' ? '#22c55e' : '#ef4444'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 800, color: '#C9A84C', margin: 0 }}>{result.legalName}</h3>
                        <span style={{
                            padding: '4px 14px', borderRadius: 12, fontSize: 12, fontWeight: 700,
                            background: result.status === 'Active' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                            color: result.status === 'Active' ? '#22c55e' : '#ef4444'
                        }}>{result.status}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 13 }}>
                        {[
                            ['GSTIN', result.gstin], ['Trade Name', result.tradeName], ['Type', result.type],
                            ['Registration Date', result.regDate], ['State', result.state], ['Address', result.address],
                            ['Last Filed', result.lastFiled], ['Filing Status', result.filingStatus],
                        ].map(([label, value]) => (
                            <div key={label} style={{ padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
                                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 2 }}>{label}</div>
                                <div style={{ fontWeight: 600, fontFamily: label === 'GSTIN' ? 'monospace' : undefined }}>{value}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {history.length > 0 && (
                <div className="glass-card" style={{ padding: 16 }}>
                    <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 10 }}>📋 Recent Lookups</h3>
                    {history.map(h => (
                        <div key={h.gstin} onClick={() => { setGstin(h.gstin); setResult(h); }} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-color)', cursor: 'pointer', fontSize: 12 }}>
                            <span style={{ fontFamily: 'monospace' }}>{h.gstin}</span>
                            <span>{h.tradeName}</span>
                            <span style={{ color: h.status === 'Active' ? '#22c55e' : '#ef4444' }}>{h.status}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
