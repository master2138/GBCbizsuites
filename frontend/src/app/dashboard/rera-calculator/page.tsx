'use client';
import { useState } from 'react';

const STATES_RERA = [
    { state: 'Maharashtra', portal: 'https://maharera.mahaonline.gov.in', stampDuty: 5, regFee: 1, femaleDiscount: 1 },
    { state: 'Karnataka', portal: 'https://rera.karnataka.gov.in', stampDuty: 5, regFee: 1, femaleDiscount: 0 },
    { state: 'Delhi', portal: 'https://rera.delhi.gov.in', stampDuty: 6, regFee: 1, femaleDiscount: 2 },
    { state: 'Tamil Nadu', portal: 'https://www.tnrera.in', stampDuty: 7, regFee: 1, femaleDiscount: 0 },
    { state: 'Gujarat', portal: 'https://gujrera.gujarat.gov.in', stampDuty: 4.9, regFee: 1, femaleDiscount: 0 },
    { state: 'Uttar Pradesh', portal: 'https://www.up-rera.in', stampDuty: 7, regFee: 1, femaleDiscount: 2 },
    { state: 'Rajasthan', portal: 'https://rera.rajasthan.gov.in', stampDuty: 5, regFee: 1, femaleDiscount: 1 },
    { state: 'West Bengal', portal: 'https://wbhira.gov.in', stampDuty: 6, regFee: 1, femaleDiscount: 0 },
    { state: 'Telangana', portal: 'https://rera.telangana.gov.in', stampDuty: 5, regFee: 0.5, femaleDiscount: 0 },
    { state: 'Kerala', portal: 'https://rera.kerala.gov.in', stampDuty: 8, regFee: 2, femaleDiscount: 0 },
];

export default function RERACalculatorPage() {
    const [tab, setTab] = useState('cost');
    const [propertyValue, setPropertyValue] = useState('');
    const [state, setState] = useState('Maharashtra');
    const [isFemale, setIsFemale] = useState(false);
    const [builtUp, setBuiltUp] = useState('');
    const [convFactor, setConvFactor] = useState('0.75');
    const [loanAmt, setLoanAmt] = useState('');
    const [loanRate, setLoanRate] = useState('8.5');
    const [loanTenure, setLoanTenure] = useState('20');

    const pv = Number(propertyValue) || 0;
    const stateData = STATES_RERA.find(s => s.state === state) || STATES_RERA[0];
    const sdRate = stateData.stampDuty - (isFemale ? stateData.femaleDiscount : 0);
    const stampDuty = Math.round(pv * sdRate / 100);
    const regFee = Math.round(pv * stateData.regFee / 100);
    const gstOnProp = pv <= 4500000 ? Math.round(pv * 1 / 100) : Math.round(pv * 5 / 100);
    const legalFee = Math.round(pv * 0.5 / 100);
    const totalCost = pv + stampDuty + regFee + gstOnProp + legalFee;

    const carpet = Math.round(Number(builtUp) * Number(convFactor));

    const la = Number(loanAmt) || 0;
    const mr = Number(loanRate) / 100 / 12;
    const mn = Number(loanTenure) * 12;
    const emi = la > 0 && mr > 0 ? Math.round(la * mr * Math.pow(1 + mr, mn) / (Math.pow(1 + mr, mn) - 1)) : 0;
    const totalPay = emi * mn;
    const totalInt = totalPay - la;

    const tabs = [
        { id: 'cost', label: 'Cost Breakup', icon: '💰' },
        { id: 'carpet', label: 'Carpet Area', icon: '📐' },
        { id: 'emi', label: 'EMI Calculator', icon: '🏦' },
        { id: 'portals', label: 'State RERA Portals', icon: '🌐' },
    ];

    return (
        <div className="animate-fadeIn">
            <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>🏠 RERA Calculator</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Property cost breakup, carpet area converter, EMI calculator & state RERA portals</p>
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                {tabs.map(t => (
                    <button key={t.id} onClick={() => setTab(t.id)} style={{
                        padding: '10px 20px', borderRadius: 10, border: '1px solid', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                        borderColor: tab === t.id ? 'rgba(201,168,76,0.4)' : 'var(--border-color)',
                        background: tab === t.id ? 'rgba(201,168,76,0.1)' : 'var(--bg-secondary)',
                        color: tab === t.id ? '#C9A84C' : 'var(--text-secondary)',
                    }}>{t.icon} {t.label}</button>
                ))}
            </div>

            {tab === 'cost' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    <div className="glass-card" style={{ padding: 24 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>💰 Property Details</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div><label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Property Value (₹)</label>
                                <input type="number" value={propertyValue} onChange={e => setPropertyValue(e.target.value)} placeholder="5000000" style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 14 }} /></div>
                            <div><label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>State</label>
                                <select value={state} onChange={e => setState(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 14 }}>
                                    {STATES_RERA.map(s => <option key={s.state} value={s.state}>{s.state}</option>)}
                                </select></div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                                <input type="checkbox" checked={isFemale} onChange={e => setIsFemale(e.target.checked)} /> Female buyer (stamp duty concession)
                            </label>
                        </div>
                    </div>
                    <div className="glass-card" style={{ padding: 24 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>📊 Total Cost Breakup</h3>
                        {pv > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {[
                                    { label: 'Property Value', value: pv, color: undefined },
                                    { label: `Stamp Duty (${sdRate}%)`, value: stampDuty, color: '#ef4444' },
                                    { label: `Registration Fee (${stateData.regFee}%)`, value: regFee, color: '#f59e0b' },
                                    { label: `GST (${pv <= 4500000 ? '1%' : '5%'} — ${pv <= 4500000 ? 'affordable' : 'non-affordable'})`, value: gstOnProp, color: '#8b5cf6' },
                                    { label: 'Legal/Brokerage (~0.5%)', value: legalFee, color: '#6366f1' },
                                ].map(r => (
                                    <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: 13 }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>{r.label}</span>
                                        <span style={{ fontWeight: 700, color: r.color || 'var(--text-primary)' }}>₹{r.value.toLocaleString('en-IN')}</span>
                                    </div>
                                ))}
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderTop: '2px solid rgba(201,168,76,0.3)', fontSize: 16 }}>
                                    <span style={{ fontWeight: 700, color: '#C9A84C' }}>Total Cost</span>
                                    <span style={{ fontWeight: 800, color: '#C9A84C' }}>₹{totalCost.toLocaleString('en-IN')}</span>
                                </div>
                            </div>
                        ) : <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: 24 }}>Enter property value</p>}
                    </div>
                </div>
            )}

            {tab === 'carpet' && (
                <div className="glass-card" style={{ padding: 24, maxWidth: 500 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>📐 Built-Up to Carpet Area</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <div><label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Built-Up Area (sq ft)</label>
                            <input type="number" value={builtUp} onChange={e => setBuiltUp(e.target.value)} placeholder="1200" style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 14 }} /></div>
                        <div><label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Conversion Factor</label>
                            <select value={convFactor} onChange={e => setConvFactor(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 14 }}>
                                <option value="0.70">0.70 — Low-rise apartment</option>
                                <option value="0.75">0.75 — Standard apartment</option>
                                <option value="0.80">0.80 — Premium/villa</option>
                            </select></div>
                        {carpet > 0 && (
                            <div style={{ padding: 16, borderRadius: 12, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', textAlign: 'center' }}>
                                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Carpet Area (RERA)</div>
                                <div style={{ fontSize: 28, fontWeight: 800, color: '#22c55e' }}>{carpet} sq ft</div>
                                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>= {builtUp} × {convFactor} conversion factor</div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {tab === 'emi' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    <div className="glass-card" style={{ padding: 24 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>🏦 Home Loan EMI</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div><label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Loan Amount (₹)</label>
                                <input type="number" value={loanAmt} onChange={e => setLoanAmt(e.target.value)} placeholder="4000000" style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 14 }} /></div>
                            <div><label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Interest Rate (% p.a.)</label>
                                <input type="number" step="0.1" value={loanRate} onChange={e => setLoanRate(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 14 }} /></div>
                            <div><label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Tenure (years)</label>
                                <input type="number" value={loanTenure} onChange={e => setLoanTenure(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 14 }} /></div>
                        </div>
                    </div>
                    <div className="glass-card" style={{ padding: 24 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>📊 EMI Breakup</h3>
                        {emi > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                <div style={{ textAlign: 'center', padding: 16, borderRadius: 12, background: 'rgba(201,168,76,0.08)' }}>
                                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Monthly EMI</div>
                                    <div style={{ fontSize: 32, fontWeight: 800, color: '#C9A84C' }}>₹{emi.toLocaleString('en-IN')}</div>
                                </div>
                                {[
                                    { label: 'Principal', value: la, color: '#22c55e' },
                                    { label: 'Total Interest', value: totalInt, color: '#ef4444' },
                                    { label: 'Total Payment', value: totalPay, color: '#6366f1' },
                                ].map(r => (
                                    <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>{r.label}</span>
                                        <span style={{ fontWeight: 700, color: r.color }}>₹{r.value.toLocaleString('en-IN')}</span>
                                    </div>
                                ))}
                            </div>
                        ) : <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: 24 }}>Enter loan details</p>}
                    </div>
                </div>
            )}

            {tab === 'portals' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
                    {STATES_RERA.map(s => (
                        <a key={s.state} href={s.portal} target="_blank" rel="noreferrer"
                            style={{ padding: 18, borderRadius: 12, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', textDecoration: 'none', transition: 'all 0.2s', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>🏛️ {s.state}</div>
                                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>Stamp: {s.stampDuty}% | Reg: {s.regFee}%</div>
                            </div>
                            <span style={{ fontSize: 12, color: '#6366f1', fontWeight: 600 }}>Visit →</span>
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
}
