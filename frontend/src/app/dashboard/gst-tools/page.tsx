'use client';
import { useState } from 'react';

import { HSN_CODES, SAC_CODES } from '@/lib/hsnData';

const STATES = [
    { code: '01', name: 'Jammu & Kashmir' }, { code: '02', name: 'Himachal Pradesh' },
    { code: '03', name: 'Punjab' }, { code: '04', name: 'Chandigarh' },
    { code: '05', name: 'Uttarakhand' }, { code: '06', name: 'Haryana' },
    { code: '07', name: 'Delhi' }, { code: '08', name: 'Rajasthan' },
    { code: '09', name: 'Uttar Pradesh' }, { code: '10', name: 'Bihar' },
    { code: '11', name: 'Sikkim' }, { code: '12', name: 'Arunachal Pradesh' },
    { code: '13', name: 'Nagaland' }, { code: '14', name: 'Manipur' },
    { code: '15', name: 'Mizoram' }, { code: '16', name: 'Tripura' },
    { code: '17', name: 'Meghalaya' }, { code: '18', name: 'Assam' },
    { code: '19', name: 'West Bengal' }, { code: '20', name: 'Jharkhand' },
    { code: '21', name: 'Odisha' }, { code: '22', name: 'Chhattisgarh' },
    { code: '23', name: 'Madhya Pradesh' }, { code: '24', name: 'Gujarat' },
    { code: '27', name: 'Maharashtra' }, { code: '29', name: 'Karnataka' },
    { code: '30', name: 'Goa' }, { code: '32', name: 'Kerala' },
    { code: '33', name: 'Tamil Nadu' }, { code: '34', name: 'Puducherry' },
    { code: '36', name: 'Telangana' }, { code: '37', name: 'Andhra Pradesh' },
];

export default function GSTToolsPage() {
    const [activeTab, setActiveTab] = useState('hsn');
    const [hsnSearch, setHsnSearch] = useState('');
    const [supplyFrom, setSupplyFrom] = useState('');
    const [supplyTo, setSupplyTo] = useState('');

    // GSTR-3B helper
    const [g3b, setG3b] = useState({ taxableSupply: '', igst: '', cgst: '', sgst: '', cess: '', itcIgst: '', itcCgst: '', itcSgst: '' });

    // GSTR-1 JSON generator
    const [gstr1Entries, setGstr1Entries] = useState<any[]>([]);
    const [gstr1Form, setGstr1Form] = useState({ gstin: '', invoiceNo: '', date: '', taxableValue: '', rate: '18', pos: '27' });
    const [gstr1Gstin, setGstr1Gstin] = useState('');

    const allCodes = [...HSN_CODES.map(c => ({ ...c, type: 'HSN' })), ...SAC_CODES.map(c => ({ ...c, type: 'SAC' }))];
    const filteredCodes = hsnSearch ? allCodes.filter(c => c.code.includes(hsnSearch) || c.desc.toLowerCase().includes(hsnSearch.toLowerCase())).slice(0, 30) : allCodes.slice(0, 30);

    const g3bTotalTax = (Number(g3b.igst) || 0) + (Number(g3b.cgst) || 0) + (Number(g3b.sgst) || 0) + (Number(g3b.cess) || 0);
    const g3bTotalITC = (Number(g3b.itcIgst) || 0) + (Number(g3b.itcCgst) || 0) + (Number(g3b.itcSgst) || 0);
    const g3bPayable = Math.max(g3bTotalTax - g3bTotalITC, 0);

    const posResult = supplyFrom && supplyTo ? (supplyFrom === supplyTo ? 'Intra-State (CGST + SGST)' : 'Inter-State (IGST)') : '';

    const tabs = [
        { id: 'hsn', label: 'HSN/SAC Search', icon: '🔍' },
        { id: 'gstr1', label: 'GSTR-1 Generator', icon: '📤' },
        { id: 'gstr3b', label: 'GSTR-3B Helper', icon: '📊' },
        { id: 'pos', label: 'Place of Supply', icon: '📍' },
    ];

    const addGstr1Entry = () => {
        if (!gstr1Form.gstin || !gstr1Form.invoiceNo || !gstr1Form.taxableValue) return;
        const tv = Number(gstr1Form.taxableValue);
        const rate = Number(gstr1Form.rate);
        const supplierState = gstr1Gstin.substring(0, 2);
        const isInterState = gstr1Form.pos !== supplierState;
        setGstr1Entries(prev => [...prev, {
            ...gstr1Form,
            taxableValue: tv,
            igst: isInterState ? Math.round(tv * rate / 100) : 0,
            cgst: !isInterState ? Math.round(tv * rate / 200) : 0,
            sgst: !isInterState ? Math.round(tv * rate / 200) : 0,
        }]);
        setGstr1Form({ gstin: '', invoiceNo: '', date: '', taxableValue: '', rate: '18', pos: '27' });
    };

    const downloadGstr1Json = () => {
        const json = {
            gstin: gstr1Gstin,
            fp: new Date().toLocaleDateString('en-IN', { month: '2-digit', year: 'numeric' }).replace('/', ''),
            b2b: Object.values(gstr1Entries.reduce((acc: any, e: any) => {
                if (!acc[e.gstin]) acc[e.gstin] = { ctin: e.gstin, inv: [] };
                acc[e.gstin].inv.push({
                    inum: e.invoiceNo, idt: e.date, val: e.taxableValue + e.igst + e.cgst + e.sgst,
                    pos: e.pos, rchrg: 'N', inv_typ: 'R',
                    itms: [{ num: 1, itm_det: { txval: e.taxableValue, rt: Number(e.rate), iamt: e.igst, camt: e.cgst, samt: e.sgst, csamt: 0 } }],
                });
                return acc;
            }, {})),
        };
        const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `GSTR1_${gstr1Gstin}_${json.fp}.json`;
        a.click();
        URL.revokeObjectURL(a.href);
    };

    return (
        <div className="animate-fadeIn">
            <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>🏛️ GST Tools</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>HSN/SAC code search, GSTR-3B computation, and place of supply determiner</p>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                {tabs.map(t => (
                    <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                        padding: '10px 20px', borderRadius: 10, border: '1px solid',
                        borderColor: activeTab === t.id ? 'rgba(201,168,76,0.4)' : 'var(--border-color)',
                        background: activeTab === t.id ? 'rgba(201,168,76,0.1)' : 'var(--bg-secondary)',
                        color: activeTab === t.id ? '#C9A84C' : 'var(--text-secondary)',
                        cursor: 'pointer', fontSize: 13, fontWeight: 600, transition: 'all 0.2s',
                    }}>
                        {t.icon} {t.label}
                    </button>
                ))}
            </div>

            {/* HSN/SAC Search */}
            {activeTab === 'hsn' && (
                <div className="glass-card" style={{ padding: 24 }}>
                    <input type="text" value={hsnSearch} onChange={e => setHsnSearch(e.target.value)}
                        placeholder="Search by HSN/SAC code or description..."
                        style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 14, marginBottom: 16, outline: 'none' }} />
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>
                        Showing {filteredCodes.length} results {hsnSearch && `for "${hsnSearch}"`}
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th style={{ textAlign: 'left', padding: '10px 12px', borderBottom: '1px solid var(--border-color)', fontSize: 11, fontWeight: 700, color: '#C9A84C', letterSpacing: 0.8, textTransform: 'uppercase' as const }}>Type</th>
                                <th style={{ textAlign: 'left', padding: '10px 12px', borderBottom: '1px solid var(--border-color)', fontSize: 11, fontWeight: 700, color: '#C9A84C', letterSpacing: 0.8, textTransform: 'uppercase' as const }}>Code</th>
                                <th style={{ textAlign: 'left', padding: '10px 12px', borderBottom: '1px solid var(--border-color)', fontSize: 11, fontWeight: 700, color: '#C9A84C', letterSpacing: 0.8, textTransform: 'uppercase' as const }}>Description</th>
                                <th style={{ textAlign: 'right', padding: '10px 12px', borderBottom: '1px solid var(--border-color)', fontSize: 11, fontWeight: 700, color: '#C9A84C', letterSpacing: 0.8, textTransform: 'uppercase' as const }}>GST Rate</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCodes.map(c => (
                                <tr key={c.code + c.type} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                    <td style={{ padding: '10px 12px', fontSize: 11, fontWeight: 700, color: c.type === 'HSN' ? '#6366f1' : '#8b5cf6' }}>
                                        <span style={{ padding: '2px 8px', borderRadius: 4, background: c.type === 'HSN' ? 'rgba(99,102,241,0.15)' : 'rgba(139,92,246,0.15)' }}>{c.type}</span>
                                    </td>
                                    <td style={{ padding: '10px 12px', fontSize: 13, fontWeight: 600, fontFamily: 'monospace' }}>{c.code}</td>
                                    <td style={{ padding: '10px 12px', fontSize: 13, color: 'var(--text-secondary)' }}>{c.desc}</td>
                                    <td style={{ padding: '10px 12px', fontSize: 13, fontWeight: 700, textAlign: 'right', color: c.rate === 0 ? '#10b981' : c.rate >= 28 ? '#ef4444' : '#f59e0b' }}>{c.rate}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* GSTR-3B Helper */}
            {activeTab === 'gstr3b' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    <div className="glass-card" style={{ padding: 24 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>📤 Output Tax (Table 3.1)</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {[
                                { label: 'Total Taxable Supply (₹)', key: 'taxableSupply' },
                                { label: 'IGST (₹)', key: 'igst' },
                                { label: 'CGST (₹)', key: 'cgst' },
                                { label: 'SGST (₹)', key: 'sgst' },
                                { label: 'Cess (₹)', key: 'cess' },
                            ].map(f => (
                                <div key={f.key}>
                                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>{f.label}</label>
                                    <input type="number" value={(g3b as any)[f.key]} onChange={e => setG3b(p => ({ ...p, [f.key]: e.target.value }))}
                                        style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 14 }} />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="glass-card" style={{ padding: 24 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>📥 Input Tax Credit (Table 4A)</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {[
                                { label: 'ITC IGST (₹)', key: 'itcIgst' },
                                { label: 'ITC CGST (₹)', key: 'itcCgst' },
                                { label: 'ITC SGST (₹)', key: 'itcSgst' },
                            ].map(f => (
                                <div key={f.key}>
                                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>{f.label}</label>
                                    <input type="number" value={(g3b as any)[f.key]} onChange={e => setG3b(p => ({ ...p, [f.key]: e.target.value }))}
                                        style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 14 }} />
                                </div>
                            ))}
                        </div>

                        <div style={{ marginTop: 24, padding: 16, borderRadius: 12, background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)' }}>
                            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: '#C9A84C' }}>💰 Tax Summary</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>Total Output Tax</span>
                                    <span style={{ fontWeight: 700, color: '#ef4444' }}>₹{g3bTotalTax.toLocaleString('en-IN')}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>Total ITC Available</span>
                                    <span style={{ fontWeight: 700, color: '#10b981' }}>₹{g3bTotalITC.toLocaleString('en-IN')}</span>
                                </div>
                                <div style={{ borderTop: '1px solid rgba(201,168,76,0.2)', paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontSize: 15 }}>
                                    <span style={{ fontWeight: 700, color: '#C9A84C' }}>Net Tax Payable</span>
                                    <span style={{ fontWeight: 800, color: '#C9A84C', fontSize: 18 }}>₹{g3bPayable.toLocaleString('en-IN')}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Place of Supply */}
            {activeTab === 'pos' && (
                <div className="glass-card" style={{ padding: 24, maxWidth: 600 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>📍 Determine Place of Supply</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div>
                            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>Supplier State</label>
                            <select value={supplyFrom} onChange={e => setSupplyFrom(e.target.value)}
                                style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 14 }}>
                                <option value="">Select state...</option>
                                {STATES.map(s => <option key={s.code} value={s.code}>{s.code} - {s.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>Recipient State</label>
                            <select value={supplyTo} onChange={e => setSupplyTo(e.target.value)}
                                style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 14 }}>
                                <option value="">Select state...</option>
                                {STATES.map(s => <option key={s.code} value={s.code}>{s.code} - {s.name}</option>)}
                            </select>
                        </div>
                        {posResult && (
                            <div style={{ padding: 16, borderRadius: 12, background: supplyFrom === supplyTo ? 'rgba(34,197,94,0.1)' : 'rgba(99,102,241,0.1)', border: `1px solid ${supplyFrom === supplyTo ? 'rgba(34,197,94,0.3)' : 'rgba(99,102,241,0.3)'}`, textAlign: 'center' }}>
                                <div style={{ fontSize: 14, fontWeight: 700, color: supplyFrom === supplyTo ? '#22c55e' : '#6366f1' }}>
                                    {posResult}
                                </div>
                                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                                    {supplyFrom === supplyTo ? 'Split tax equally between CGST and SGST' : 'Full tax amount charged as IGST'}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* GSTR-1 JSON Generator */}
            {activeTab === 'gstr1' && (
                <div className="glass-card" style={{ padding: 24 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>📤 Generate GSTR-1 JSON for GSTN Upload</h3>
                    <div style={{ marginBottom: 16 }}>
                        <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>Your GSTIN</label>
                        <input type="text" value={gstr1Gstin} onChange={e => setGstr1Gstin(e.target.value.toUpperCase())} maxLength={15}
                            placeholder="27AXXXX1234X1ZX" style={{ width: 280, padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 14, fontFamily: 'monospace' }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 80px 80px auto', gap: 8, marginBottom: 12, alignItems: 'end' }}>
                        {[{ label: 'Buyer GSTIN', key: 'gstin', ph: '29BXXXX5678Y1ZZ', maxLen: 15 },
                        { label: 'Invoice No', key: 'invoiceNo', ph: 'INV-001' },
                        { label: 'Invoice Date', key: 'date', ph: '15-03-2026' },
                        { label: 'Taxable Value (₹)', key: 'taxableValue', ph: '50000', type: 'number' },
                        ].map(f => (
                            <div key={f.key}>
                                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 2 }}>{f.label}</label>
                                <input type={f.type || 'text'} value={(gstr1Form as any)[f.key]} onChange={e => setGstr1Form(p => ({ ...p, [f.key]: e.target.value }))} maxLength={f.maxLen}
                                    placeholder={f.ph} style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 12 }} />
                            </div>
                        ))}
                        <div>
                            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 2 }}>Rate</label>
                            <select value={gstr1Form.rate} onChange={e => setGstr1Form(p => ({ ...p, rate: e.target.value }))} style={{ width: '100%', padding: '8px 6px', borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 12 }}>
                                {[0, 0.25, 3, 5, 12, 18, 28].map(r => <option key={r} value={r}>{r}%</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 2 }}>POS</label>
                            <select value={gstr1Form.pos} onChange={e => setGstr1Form(p => ({ ...p, pos: e.target.value }))} style={{ width: '100%', padding: '8px 6px', borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 12 }}>
                                {STATES.map(s => <option key={s.code} value={s.code}>{s.code}</option>)}
                            </select>
                        </div>
                        <div><button onClick={addGstr1Entry} style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: 'linear-gradient(135deg, #C9A84C, #E8CC7D)', color: '#0f172a', fontWeight: 700, fontSize: 12, cursor: 'pointer', marginTop: 14 }}>➕ Add</button></div>
                    </div>

                    {gstr1Entries.length > 0 && (
                        <>
                            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
                                <thead><tr>
                                    {['Buyer GSTIN', 'Invoice', 'Date', 'Taxable', 'IGST', 'CGST', 'SGST', 'Total'].map(h => (
                                        <th key={h} style={{ textAlign: h === 'Buyer GSTIN' || h === 'Invoice' || h === 'Date' ? 'left' : 'right', padding: '8px 10px', borderBottom: '1px solid var(--border-color)', fontSize: 11, fontWeight: 700, color: '#C9A84C' }}>{h}</th>
                                    ))}
                                </tr></thead>
                                <tbody>
                                    {gstr1Entries.map((e, i) => (
                                        <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                            <td style={{ padding: '8px 10px', fontSize: 12, fontFamily: 'monospace' }}>{e.gstin}</td>
                                            <td style={{ padding: '8px 10px', fontSize: 12 }}>{e.invoiceNo}</td>
                                            <td style={{ padding: '8px 10px', fontSize: 12 }}>{e.date}</td>
                                            <td style={{ padding: '8px 10px', fontSize: 12, textAlign: 'right' }}>₹{e.taxableValue.toLocaleString('en-IN')}</td>
                                            <td style={{ padding: '8px 10px', fontSize: 12, textAlign: 'right', color: '#6366f1' }}>₹{e.igst.toLocaleString('en-IN')}</td>
                                            <td style={{ padding: '8px 10px', fontSize: 12, textAlign: 'right', color: '#22c55e' }}>₹{e.cgst.toLocaleString('en-IN')}</td>
                                            <td style={{ padding: '8px 10px', fontSize: 12, textAlign: 'right', color: '#22c55e' }}>₹{e.sgst.toLocaleString('en-IN')}</td>
                                            <td style={{ padding: '8px 10px', fontSize: 12, textAlign: 'right', fontWeight: 700 }}>₹{(e.taxableValue + e.igst + e.cgst + e.sgst).toLocaleString('en-IN')}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div style={{ display: 'flex', gap: 12 }}>
                                <button onClick={downloadGstr1Json} style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #C9A84C, #E8CC7D)', color: '#0f172a', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>📁 Download GSTR-1 JSON</button>
                                <button onClick={() => setGstr1Entries([])} style={{ padding: '10px 24px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>🗑️ Clear All</button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
