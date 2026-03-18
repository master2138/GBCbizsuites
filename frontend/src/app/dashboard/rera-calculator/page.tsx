'use client';
import { useState } from 'react';

// State-wise circle rates (per sq ft) — approximate averages
const STATE_RATES: Record<string, { residential: number; commercial: number; industrial: number }> = {
    maharashtra: { residential: 5500, commercial: 8200, industrial: 4200 },
    delhi: { residential: 8000, commercial: 12000, industrial: 6500 },
    karnataka: { residential: 4200, commercial: 6800, industrial: 3500 },
    tamil_nadu: { residential: 3800, commercial: 5500, industrial: 3000 },
    gujarat: { residential: 3200, commercial: 5000, industrial: 2800 },
    uttar_pradesh: { residential: 2800, commercial: 4500, industrial: 2200 },
    rajasthan: { residential: 2500, commercial: 4000, industrial: 2000 },
    west_bengal: { residential: 3500, commercial: 5200, industrial: 2800 },
    telangana: { residential: 4500, commercial: 7000, industrial: 3600 },
    kerala: { residential: 3800, commercial: 5800, industrial: 3100 },
    madhya_pradesh: { residential: 2200, commercial: 3500, industrial: 1800 },
    punjab: { residential: 3000, commercial: 4800, industrial: 2500 },
    haryana: { residential: 4000, commercial: 6500, industrial: 3200 },
    andhra_pradesh: { residential: 3200, commercial: 5000, industrial: 2600 },
    goa: { residential: 5000, commercial: 7500, industrial: 4000 },
};

// Construction cost components (per sq ft)
const CONSTRUCTION_COSTS = {
    basic: { min: 1200, max: 1800, label: 'Basic (Economy)' },
    standard: { min: 1800, max: 2800, label: 'Standard (Mid-Range)' },
    premium: { min: 2800, max: 4500, label: 'Premium (High-End)' },
    luxury: { min: 4500, max: 8000, label: 'Luxury (Ultra-Premium)' },
};

const COST_BREAKDOWN = [
    { item: 'Structural Work (RCC, Steel)', pct: 30 },
    { item: 'Brickwork & Plastering', pct: 12 },
    { item: 'Flooring & Tiling', pct: 10 },
    { item: 'Plumbing & Sanitary', pct: 8 },
    { item: 'Electrical Work', pct: 8 },
    { item: 'Doors & Windows', pct: 7 },
    { item: 'Painting & Finishing', pct: 6 },
    { item: 'Kitchen & Fittings', pct: 5 },
    { item: 'Foundation & Excavation', pct: 5 },
    { item: 'Architect & Legal Fees', pct: 4 },
    { item: 'Misc (Lift, Parking, Landscaping)', pct: 5 },
];

export default function RERACalculatorPage() {
    const [form, setForm] = useState({
        state: 'maharashtra',
        propertyType: 'residential',
        quality: 'standard',
        area: '',
        floors: '1',
        landArea: '',
        includeInterior: true,
        includeParking: true,
        includeLandscaping: false,
    });
    const [result, setResult] = useState<any>(null);

    const set = (key: string, value: any) => setForm(p => ({ ...p, [key]: value }));

    const calculate = () => {
        const area = Number(form.area) || 0;
        const floors = Number(form.floors) || 1;
        const landArea = Number(form.landArea) || 0;
        if (!area) return;

        const quality = CONSTRUCTION_COSTS[form.quality as keyof typeof CONSTRUCTION_COSTS];
        const costPerSqFt = (quality.min + quality.max) / 2;
        const totalBuildArea = area * floors;

        const stateRate = STATE_RATES[form.state] || STATE_RATES.maharashtra;
        const landRate = stateRate[form.propertyType as keyof typeof stateRate];

        const constructionCost = totalBuildArea * costPerSqFt;
        const landCost = landArea > 0 ? landArea * landRate : 0;
        const interiorCost = form.includeInterior ? totalBuildArea * 450 : 0;
        const parkingCost = form.includeParking ? floors * 200000 : 0;
        const landscapingCost = form.includeLandscaping ? landArea * 150 : 0;

        // Statutory costs
        const stampDuty = (constructionCost + landCost) * 0.05;
        const registrationFee = (constructionCost + landCost) * 0.01;
        const gst = constructionCost * 0.05; // 5% for under-construction
        const reraRegistration = constructionCost > 5000000 ? 50000 : 25000;
        const architectFee = constructionCost * 0.04;
        const legalFee = constructionCost * 0.02;

        const totalProjectCost = constructionCost + landCost + interiorCost + parkingCost + landscapingCost;
        const totalStatutory = stampDuty + registrationFee + gst + reraRegistration + architectFee + legalFee;
        const grandTotal = totalProjectCost + totalStatutory;

        setResult({
            costPerSqFt,
            totalBuildArea,
            constructionCost,
            landCost,
            interiorCost,
            parkingCost,
            landscapingCost,
            stampDuty,
            registrationFee,
            gst,
            reraRegistration,
            architectFee,
            legalFee,
            totalProjectCost,
            totalStatutory,
            grandTotal,
            breakdown: COST_BREAKDOWN.map(b => ({
                item: b.item,
                pct: b.pct,
                amount: Math.round(constructionCost * b.pct / 100),
            })),
        });
    };

    const fmt = (n: number) => {
        if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
        if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
        return `₹${n.toLocaleString('en-IN')}`;
    };

    return (
        <div className="animate-fadeIn">
            <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>🏗️ RERA Construction Cost Calculator</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Estimate construction costs with state-wise rates, RERA fees, GST, and stamp duty</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                {/* Input Form */}
                <div className="glass-card" style={{ padding: 24 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>📐 Project Details</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <div>
                            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>State</label>
                            <select value={form.state} onChange={e => set('state', e.target.value)}
                                style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 14 }}>
                                {Object.entries(STATE_RATES).map(([k]) => (
                                    <option key={k} value={k}>{k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Property Type</label>
                            <div style={{ display: 'flex', gap: 8 }}>
                                {['residential', 'commercial', 'industrial'].map(t => (
                                    <button key={t} onClick={() => set('propertyType', t)} style={{
                                        flex: 1, padding: '8px', borderRadius: 8, border: '1px solid',
                                        borderColor: form.propertyType === t ? 'rgba(201,168,76,0.4)' : 'var(--border-color)',
                                        background: form.propertyType === t ? 'rgba(201,168,76,0.1)' : 'transparent',
                                        color: form.propertyType === t ? '#C9A84C' : 'var(--text-secondary)',
                                        cursor: 'pointer', fontSize: 12, fontWeight: 600, textTransform: 'capitalize',
                                    }}>{t === 'residential' ? '🏠' : t === 'commercial' ? '🏢' : '🏭'} {t}</button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Construction Quality</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                {Object.entries(CONSTRUCTION_COSTS).map(([k, v]) => (
                                    <button key={k} onClick={() => set('quality', k)} style={{
                                        padding: '8px 10px', borderRadius: 8, border: '1px solid',
                                        borderColor: form.quality === k ? 'rgba(201,168,76,0.4)' : 'var(--border-color)',
                                        background: form.quality === k ? 'rgba(201,168,76,0.1)' : 'transparent',
                                        color: form.quality === k ? '#C9A84C' : 'var(--text-secondary)',
                                        cursor: 'pointer', fontSize: 11, fontWeight: 600, textAlign: 'left',
                                    }}>
                                        <div>{v.label}</div>
                                        <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>₹{v.min}–₹{v.max}/sqft</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div>
                                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Built-up Area (sq ft)</label>
                                <input type="number" value={form.area} onChange={e => set('area', e.target.value)} placeholder="2000"
                                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 14 }} />
                            </div>
                            <div>
                                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Number of Floors</label>
                                <input type="number" value={form.floors} onChange={e => set('floors', e.target.value)} placeholder="2"
                                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 14 }} />
                            </div>
                        </div>
                        <div>
                            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Land Area (sq ft) — optional</label>
                            <input type="number" value={form.landArea} onChange={e => set('landArea', e.target.value)} placeholder="1500"
                                style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 14 }} />
                        </div>
                        <div style={{ display: 'flex', gap: 16, fontSize: 13 }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                                <input type="checkbox" checked={form.includeInterior} onChange={e => set('includeInterior', e.target.checked)} />
                                Interior (₹450/sqft)
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                                <input type="checkbox" checked={form.includeParking} onChange={e => set('includeParking', e.target.checked)} />
                                Parking
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                                <input type="checkbox" checked={form.includeLandscaping} onChange={e => set('includeLandscaping', e.target.checked)} />
                                Landscaping
                            </label>
                        </div>
                        <button onClick={calculate} style={{ padding: '12px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #C9A84C, #E8CC7D)', color: '#0f172a', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                            🏗️ Calculate Construction Cost
                        </button>
                    </div>
                </div>

                {/* Results */}
                <div className="glass-card" style={{ padding: 24 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>📊 Cost Estimate</h3>
                    {!result ? (
                        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>
                            <div style={{ fontSize: 36, marginBottom: 8 }}>🏠</div>
                            <p>Enter project details and click Calculate</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {/* Grand Total */}
                            <div style={{ padding: 16, borderRadius: 12, background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)', textAlign: 'center' }}>
                                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Estimated Grand Total</div>
                                <div style={{ fontSize: 28, fontWeight: 800, color: '#C9A84C' }}>{fmt(result.grandTotal)}</div>
                                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                                    ₹{Math.round(result.grandTotal / result.totalBuildArea).toLocaleString('en-IN')}/sqft (all inclusive)
                                </div>
                            </div>

                            {/* Construction Costs */}
                            <div style={{ padding: 14, borderRadius: 10, background: 'var(--bg-secondary)' }}>
                                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: '#22c55e' }}>🔨 Construction Costs</div>
                                {[
                                    { label: `Construction (${result.totalBuildArea} sqft × ₹${result.costPerSqFt})`, value: result.constructionCost, color: '#6366f1' },
                                    result.landCost > 0 ? { label: 'Land Cost', value: result.landCost, color: '#8b5cf6' } : null,
                                    result.interiorCost > 0 ? { label: 'Interior Finishing', value: result.interiorCost, color: '#14b8a6' } : null,
                                    result.parkingCost > 0 ? { label: 'Parking', value: result.parkingCost, color: '#f59e0b' } : null,
                                    result.landscapingCost > 0 ? { label: 'Landscaping', value: result.landscapingCost, color: '#22c55e' } : null,
                                ].filter(Boolean).map((r: any) => (
                                    <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 12 }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>{r.label}</span>
                                        <span style={{ fontWeight: 700, color: r.color }}>{fmt(r.value)}</span>
                                    </div>
                                ))}
                                <div style={{ borderTop: '1px solid var(--border-color)', marginTop: 6, paddingTop: 6, display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                                    <span style={{ fontWeight: 700 }}>Subtotal</span>
                                    <span style={{ fontWeight: 800, color: '#22c55e' }}>{fmt(result.totalProjectCost)}</span>
                                </div>
                            </div>

                            {/* Statutory & Fees */}
                            <div style={{ padding: 14, borderRadius: 10, background: 'var(--bg-secondary)' }}>
                                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: '#ef4444' }}>📋 Statutory & Professional Fees</div>
                                {[
                                    { label: 'Stamp Duty (5%)', value: result.stampDuty },
                                    { label: 'Registration (1%)', value: result.registrationFee },
                                    { label: 'GST (5%)', value: result.gst },
                                    { label: 'RERA Registration', value: result.reraRegistration },
                                    { label: 'Architect Fee (4%)', value: result.architectFee },
                                    { label: 'Legal & Misc (2%)', value: result.legalFee },
                                ].map(r => (
                                    <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 12 }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>{r.label}</span>
                                        <span style={{ fontWeight: 600, color: '#ef4444' }}>{fmt(r.value)}</span>
                                    </div>
                                ))}
                                <div style={{ borderTop: '1px solid var(--border-color)', marginTop: 6, paddingTop: 6, display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                                    <span style={{ fontWeight: 700 }}>Total Fees</span>
                                    <span style={{ fontWeight: 800, color: '#ef4444' }}>{fmt(result.totalStatutory)}</span>
                                </div>
                            </div>

                            {/* Cost Breakdown Chart */}
                            <div style={{ padding: 14, borderRadius: 10, background: 'var(--bg-secondary)' }}>
                                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>📊 Construction Breakdown</div>
                                {result.breakdown.map((b: any) => (
                                    <div key={b.item} style={{ marginBottom: 6 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 2 }}>
                                            <span style={{ color: 'var(--text-secondary)' }}>{b.item}</span>
                                            <span style={{ fontWeight: 600 }}>{fmt(b.amount)} ({b.pct}%)</span>
                                        </div>
                                        <div style={{ height: 6, borderRadius: 3, background: 'rgba(201,168,76,0.1)' }}>
                                            <div style={{ height: '100%', width: `${b.pct * 3.3}%`, borderRadius: 3, background: 'linear-gradient(90deg, #C9A84C, #E8CC7D)', transition: 'width 0.5s ease' }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
