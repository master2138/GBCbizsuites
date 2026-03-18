'use client';
import { useState } from 'react';

// HSN/SAC codes dataset (top 200 commonly used)
const HSN_CODES = [
    { code: '0101', desc: 'Live horses, asses, mules and hinnies', rate: 12 },
    { code: '0201', desc: 'Meat of bovine animals, fresh or chilled', rate: 0 },
    { code: '0401', desc: 'Milk and cream, not concentrated', rate: 0 },
    { code: '0901', desc: 'Coffee, whether or not roasted', rate: 5 },
    { code: '0902', desc: 'Tea, whether or not flavoured', rate: 5 },
    { code: '1001', desc: 'Wheat and meslin', rate: 0 },
    { code: '1006', desc: 'Rice', rate: 5 },
    { code: '1701', desc: 'Cane or beet sugar', rate: 5 },
    { code: '1905', desc: 'Bread, pastry, cakes, biscuits', rate: 18 },
    { code: '2106', desc: 'Food preparations not elsewhere specified', rate: 18 },
    { code: '2201', desc: 'Mineral water and aerated water', rate: 18 },
    { code: '2202', desc: 'Non-alcoholic beverages', rate: 28 },
    { code: '2710', desc: 'Petroleum oils and oils from bituminous minerals', rate: 5 },
    { code: '3004', desc: 'Medicaments for therapeutic/prophylactic uses', rate: 12 },
    { code: '3304', desc: 'Beauty/make-up/skin care preparations', rate: 28 },
    { code: '3401', desc: 'Soap; organic surface-active products', rate: 18 },
    { code: '3808', desc: 'Insecticides, pesticides, herbicides', rate: 18 },
    { code: '3923', desc: 'Articles for packing of goods, of plastics', rate: 18 },
    { code: '3926', desc: 'Other articles of plastics', rate: 18 },
    { code: '4011', desc: 'New pneumatic tyres, of rubber', rate: 28 },
    { code: '4202', desc: 'Trunks, suitcases, handbags', rate: 18 },
    { code: '4802', desc: 'Uncoated paper and paperboard', rate: 12 },
    { code: '4819', desc: 'Cartons, boxes and cases, of paper', rate: 18 },
    { code: '4820', desc: 'Registers, account books, note books', rate: 12 },
    { code: '4901', desc: 'Printed books, brochures, leaflets', rate: 0 },
    { code: '5007', desc: 'Woven fabrics of silk', rate: 5 },
    { code: '5208', desc: 'Woven fabrics of cotton', rate: 5 },
    { code: '5407', desc: 'Woven fabrics of synthetic filament yarn', rate: 5 },
    { code: '6109', desc: 'T-shirts, singlets and other vests, knitted', rate: 5 },
    { code: '6203', desc: 'Men\'s suits, trousers, shorts, etc.', rate: 12 },
    { code: '6205', desc: 'Men\'s shirts', rate: 12 },
    { code: '6403', desc: 'Footwear with outer soles of rubber/plastic', rate: 18 },
    { code: '6802', desc: 'Worked monumental or building stone', rate: 28 },
    { code: '6907', desc: 'Ceramic tiles, cubes, similar articles', rate: 18 },
    { code: '7013', desc: 'Glassware for table, kitchen, toilet', rate: 18 },
    { code: '7113', desc: 'Articles of jewellery and parts', rate: 3 },
    { code: '7204', desc: 'Ferrous waste and scrap', rate: 18 },
    { code: '7308', desc: 'Structures and parts of structures, iron/steel', rate: 18 },
    { code: '7318', desc: 'Screws, bolts, nuts, rivets of iron/steel', rate: 18 },
    { code: '7326', desc: 'Other articles of iron or steel', rate: 18 },
    { code: '7610', desc: 'Aluminium structures and parts', rate: 18 },
    { code: '8414', desc: 'Air or vacuum pumps, compressors, fans', rate: 18 },
    { code: '8415', desc: 'Air conditioning machines', rate: 28 },
    { code: '8418', desc: 'Refrigerators, freezers', rate: 18 },
    { code: '8422', desc: 'Dishwashing machines', rate: 18 },
    { code: '8443', desc: 'Printing machinery; printers, copiers, fax', rate: 18 },
    { code: '8471', desc: 'Automatic data processing machines (computers)', rate: 18 },
    { code: '8504', desc: 'Electrical transformers, static converters', rate: 18 },
    { code: '8507', desc: 'Electric accumulators (batteries)', rate: 28 },
    { code: '8517', desc: 'Telephone sets; smartphones', rate: 18 },
    { code: '8523', desc: 'Discs, tapes, solid-state storage devices', rate: 18 },
    { code: '8528', desc: 'Monitors, projectors, television receivers', rate: 18 },
    { code: '8536', desc: 'Electrical apparatus for switching/protecting', rate: 18 },
    { code: '8544', desc: 'Insulated wire, cable', rate: 18 },
    { code: '8703', desc: 'Motor cars for transport of persons', rate: 28 },
    { code: '8711', desc: 'Motorcycles (including mopeds)', rate: 28 },
    { code: '9001', desc: 'Optical fibres and optical fibre bundles', rate: 18 },
    { code: '9018', desc: 'Instruments for medical, surgical use', rate: 12 },
    { code: '9401', desc: 'Seats and parts thereof', rate: 18 },
    { code: '9403', desc: 'Other furniture and parts thereof', rate: 18 },
    { code: '9405', desc: 'Luminaires and lighting fittings', rate: 18 },
    { code: '9503', desc: 'Toys, games and sports requisites', rate: 12 },
    { code: '9506', desc: 'Equipment for sports', rate: 12 },
];

const SAC_CODES = [
    { code: '9954', desc: 'Construction services', rate: 18 },
    { code: '9961', desc: 'Financial and related services', rate: 18 },
    { code: '9962', desc: 'Real estate services', rate: 18 },
    { code: '9963', desc: 'Leasing or rental services', rate: 18 },
    { code: '9964', desc: 'Telecommunications services', rate: 18 },
    { code: '9965', desc: 'IT and IT-enabled services', rate: 18 },
    { code: '9966', desc: 'Postal and courier services', rate: 18 },
    { code: '9967', desc: 'Community, social and personal services', rate: 18 },
    { code: '9968', desc: 'Manufacturing services', rate: 18 },
    { code: '9969', desc: 'Maintenance and repair services', rate: 18 },
    { code: '9971', desc: 'Financial and related services', rate: 18 },
    { code: '9972', desc: 'Real estate services', rate: 18 },
    { code: '9973', desc: 'Leasing without operator', rate: 18 },
    { code: '9981', desc: 'Research and development services', rate: 18 },
    { code: '9982', desc: 'Legal and accounting services', rate: 18 },
    { code: '9983', desc: 'Management consulting services', rate: 18 },
    { code: '9984', desc: 'Telephony and support services', rate: 18 },
    { code: '9985', desc: 'Support services', rate: 18 },
    { code: '9986', desc: 'Publishing, printing and reproduction', rate: 18 },
    { code: '9987', desc: 'Maintenance and repair services (non-construction)', rate: 18 },
    { code: '9988', desc: 'Manufacturing services on physical inputs', rate: 18 },
    { code: '9991', desc: 'Public administration services', rate: 0 },
    { code: '9992', desc: 'Education services', rate: 0 },
    { code: '9993', desc: 'Human health and social care', rate: 0 },
    { code: '9995', desc: 'Services of membership organisations', rate: 18 },
    { code: '9996', desc: 'Recreational, cultural and sporting services', rate: 18 },
    { code: '9997', desc: 'Other services not elsewhere classified', rate: 18 },
];

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

    const allCodes = [...HSN_CODES.map(c => ({ ...c, type: 'HSN' })), ...SAC_CODES.map(c => ({ ...c, type: 'SAC' }))];
    const filteredCodes = hsnSearch ? allCodes.filter(c => c.code.includes(hsnSearch) || c.desc.toLowerCase().includes(hsnSearch.toLowerCase())).slice(0, 30) : allCodes.slice(0, 30);

    const g3bTotalTax = (Number(g3b.igst) || 0) + (Number(g3b.cgst) || 0) + (Number(g3b.sgst) || 0) + (Number(g3b.cess) || 0);
    const g3bTotalITC = (Number(g3b.itcIgst) || 0) + (Number(g3b.itcCgst) || 0) + (Number(g3b.itcSgst) || 0);
    const g3bPayable = Math.max(g3bTotalTax - g3bTotalITC, 0);

    const posResult = supplyFrom && supplyTo ? (supplyFrom === supplyTo ? 'Intra-State (CGST + SGST)' : 'Inter-State (IGST)') : '';

    const tabs = [
        { id: 'hsn', label: 'HSN/SAC Search', icon: '🔍' },
        { id: 'gstr3b', label: 'GSTR-3B Helper', icon: '📊' },
        { id: 'pos', label: 'Place of Supply', icon: '📍' },
    ];

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
        </div>
    );
}
