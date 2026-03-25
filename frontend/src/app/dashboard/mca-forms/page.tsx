'use client';
import { useState } from 'react';

const MCA_FORMS = [
    // Company Registration & Incorporation
    { form: 'INC-2', name: 'Application for Incorporation (OPC)', cat: 'Incorporation', due: 'At incorporation' },
    { form: 'INC-7', name: 'Application for Incorporation of Company', cat: 'Incorporation', due: 'At incorporation' },
    { form: 'INC-9', name: 'Declaration by Subscribers & Directors', cat: 'Incorporation', due: 'At incorporation' },
    { form: 'INC-20A', name: 'Declaration for Commencement of Business', cat: 'Incorporation', due: '180 days from incorporation' },
    { form: 'INC-22', name: 'Notice of Registered Office', cat: 'Incorporation', due: '30 days from incorporation' },
    { form: 'INC-33', name: 'Particulars of e-Stamp Certificate', cat: 'Incorporation', due: 'At incorporation' },
    { form: 'SPICe+ Part A', name: 'Name Reservation', cat: 'Incorporation', due: 'Valid 20 days' },
    { form: 'SPICe+ Part B', name: 'Incorporation + PAN/TAN/GST/EPFO/ESIC', cat: 'Incorporation', due: 'At incorporation' },
    { form: 'AGILE-PRO-S', name: 'Application for GSTIN/EPFO/ESIC/Bank A/c', cat: 'Incorporation', due: 'At incorporation' },
    // Annual Filing
    { form: 'AOC-4', name: 'Filing of Financial Statements', cat: 'Annual Filing', due: '30 days from AGM' },
    { form: 'AOC-4 CFS', name: 'Filing of Consolidated Financial Statements', cat: 'Annual Filing', due: '30 days from AGM' },
    { form: 'AOC-4 XBRL', name: 'Filing of Financial Statements (XBRL)', cat: 'Annual Filing', due: '30 days from AGM' },
    { form: 'MGT-7', name: 'Annual Return (Companies)', cat: 'Annual Filing', due: '60 days from AGM' },
    { form: 'MGT-7A', name: 'Annual Return (OPC/Small Company)', cat: 'Annual Filing', due: '60 days from AGM' },
    { form: 'ADT-1', name: 'Appointment of Auditor', cat: 'Annual Filing', due: '15 days from AGM' },
    { form: 'MSC-1', name: 'Application for Active Company Status', cat: 'Annual Filing', due: 'As applicable' },
    { form: 'MSC-3', name: 'Objection to Strike Off Notice', cat: 'Annual Filing', due: '30 days of notice' },
    // Director & KMP
    { form: 'DIR-3 KYC', name: 'Director KYC (Annual)', cat: 'Director/KMP', due: '30 Sep every year' },
    { form: 'DIR-3 KYC Web', name: 'Director KYC (Web-based)', cat: 'Director/KMP', due: '30 Sep every year' },
    { form: 'DIR-6', name: 'Intimation of Change in Director Details', cat: 'Director/KMP', due: '30 days of change' },
    { form: 'DIR-11', name: 'Notice of Resignation of Director', cat: 'Director/KMP', due: '30 days of resignation' },
    { form: 'DIR-12', name: 'Appointment/Cessation of Director/KMP', cat: 'Director/KMP', due: '30 days of change' },
    { form: 'MBP-1', name: 'Disclosure of Interest by Director', cat: 'Director/KMP', due: 'At first board meeting' },
    { form: 'MGT-14', name: 'Filing of Resolutions/Agreements', cat: 'Director/KMP', due: '30 days from passing' },
    // Charge Related
    { form: 'CHG-1', name: 'Creation/Modification of Charge', cat: 'Charge', due: '30 days of creation' },
    { form: 'CHG-4', name: 'Satisfaction of Charge', cat: 'Charge', due: '30 days of satisfaction' },
    { form: 'CHG-9', name: 'Application for Registration of Charge', cat: 'Charge', due: '300 days' },
    // Share Capital & Allotment
    { form: 'PAS-3', name: 'Return of Allotment', cat: 'Share Capital', due: '30 days of allotment' },
    { form: 'SH-7', name: 'Notice of Alteration of Share Capital', cat: 'Share Capital', due: '30 days of alteration' },
    { form: 'SH-8', name: 'Letter of Offer for Buy Back', cat: 'Share Capital', due: 'As applicable' },
    { form: 'SH-11', name: 'Return re: Buy Back of Securities', cat: 'Share Capital', due: '30 days of completion' },
    { form: 'MGT-6', name: 'Filing of Return of Deposit', cat: 'Share Capital', due: '30 Jun every year' },
    // Change & Conversion
    { form: 'INC-23', name: 'Application for License u/s 8', cat: 'Change/Conversion', due: 'At application' },
    { form: 'INC-24', name: 'Application for Conversion (Sec 18)', cat: 'Change/Conversion', due: 'At conversion' },
    { form: 'INC-27', name: 'Conversion of Section 8 Company', cat: 'Change/Conversion', due: '30 days' },
    { form: 'INC-28', name: 'Notice of Order of Court/CLB/RD', cat: 'Change/Conversion', due: '30 days of order' },
    { form: 'MGT-15', name: 'Report on Annual General Meeting', cat: 'Change/Conversion', due: '30 days from AGM' },
    // LLP Forms
    { form: 'FiLLiP', name: 'Application for Incorporation of LLP', cat: 'LLP', due: 'At incorporation' },
    { form: 'Form 3', name: 'Information about LLP Agreement', cat: 'LLP', due: '30 days of incorporation' },
    { form: 'Form 4', name: 'Notice of Appointment of Designated Partner', cat: 'LLP', due: '30 days of change' },
    { form: 'Form 8', name: 'Statement of Account & Solvency (LLP)', cat: 'LLP', due: '30 Oct every year' },
    { form: 'Form 11', name: 'Annual Return of LLP', cat: 'LLP', due: '30 May every year' },
    // Winding Up & Strike Off
    { form: 'STK-2', name: 'Application for Strike Off (Company)', cat: 'Winding Up', due: 'As applicable' },
    { form: 'STK-5A', name: 'Application for Strike Off (LLP)', cat: 'Winding Up', due: 'As applicable' },
    { form: 'GNL-2', name: 'Designated Authority Form under MCA', cat: 'Winding Up', due: 'As applicable' },
    // DPT & Compliance
    { form: 'DPT-3', name: 'Return of Deposits', cat: 'Compliance', due: '30 Jun every year' },
    { form: 'MSME-1', name: 'Return to MSME Half-Yearly', cat: 'Compliance', due: '31 Oct & 30 Apr' },
    { form: 'BEN-2', name: 'Declaration of Significant Beneficial Owner', cat: 'Compliance', due: '30 days of declaration' },
    { form: 'NDH-1', name: 'Return of Statutory Particulars (Nidhi)', cat: 'Compliance', due: '30 days from year end' },
    { form: 'NDH-3', name: 'Half-Yearly Return (Nidhi Company)', cat: 'Compliance', due: '31 Oct & 30 Apr' },
    { form: 'CRA-4', name: 'Cost Audit Report', cat: 'Compliance', due: '30 days from receipt' },
    { form: 'CSR-2', name: 'Report on CSR Activities', cat: 'Compliance', due: 'With AOC-4' },
    { form: 'GNL-1', name: 'Particulars of Person Charged', cat: 'Compliance', due: '15 days' },
    { form: 'RD GNL-5', name: 'Application to Regional Director', cat: 'Compliance', due: 'As applicable' },
];

const CATEGORIES = [...new Set(MCA_FORMS.map(f => f.cat))];

export default function MCAFormsPage() {
    const [search, setSearch] = useState('');
    const [activeCat, setActiveCat] = useState('All');

    const filtered = MCA_FORMS.filter(f => {
        const matchSearch = !search || f.form.toLowerCase().includes(search.toLowerCase()) || f.name.toLowerCase().includes(search.toLowerCase());
        const matchCat = activeCat === 'All' || f.cat === activeCat;
        return matchSearch && matchCat;
    });

    const getMCAUrl = (form: string) => `https://www.mca.gov.in/content/mca/global/en/e-filing.html`;

    const catColors: Record<string, string> = {
        'Incorporation': '#6366f1', 'Annual Filing': '#22c55e', 'Director/KMP': '#f59e0b',
        'Charge': '#ef4444', 'Share Capital': '#8b5cf6', 'Change/Conversion': '#14b8a6',
        'LLP': '#ec4899', 'Winding Up': '#f97316', 'Compliance': '#3b82f6',
    };

    return (
        <div className="animate-fadeIn">
            <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>🏛️ MCA Forms V3</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>All MCA e-Forms for Company & LLP compliance — searchable with filing deadlines</p>
            </div>

            {/* Search & Filter */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search by form number or name..."
                    style={{ flex: 1, padding: '12px 16px', borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 14, outline: 'none' }} />
                <a href="https://www.mca.gov.in/content/mca/global/en/e-filing.html" target="_blank" rel="noreferrer"
                    style={{ padding: '12px 20px', borderRadius: 10, background: 'linear-gradient(135deg, #C9A84C, #E8CC7D)', color: '#0f172a', fontWeight: 700, fontSize: 13, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
                    🌐 MCA Portal
                </a>
            </div>

            {/* Category Tabs */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
                <button onClick={() => setActiveCat('All')} style={{
                    padding: '6px 14px', borderRadius: 8, border: '1px solid', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    borderColor: activeCat === 'All' ? 'rgba(201,168,76,0.4)' : 'var(--border-color)',
                    background: activeCat === 'All' ? 'rgba(201,168,76,0.1)' : 'var(--bg-secondary)',
                    color: activeCat === 'All' ? '#C9A84C' : 'var(--text-secondary)',
                }}>All ({MCA_FORMS.length})</button>
                {CATEGORIES.map(cat => {
                    const count = MCA_FORMS.filter(f => f.cat === cat).length;
                    return (
                        <button key={cat} onClick={() => setActiveCat(cat)} style={{
                            padding: '6px 14px', borderRadius: 8, border: '1px solid', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                            borderColor: activeCat === cat ? (catColors[cat] || '#C9A84C') + '60' : 'var(--border-color)',
                            background: activeCat === cat ? (catColors[cat] || '#C9A84C') + '15' : 'var(--bg-secondary)',
                            color: activeCat === cat ? (catColors[cat] || '#C9A84C') : 'var(--text-secondary)',
                        }}>{cat} ({count})</button>
                    );
                })}
            </div>

            {/* Results Count */}
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>
                Showing {filtered.length} of {MCA_FORMS.length} forms {search && `matching "${search}"`}
            </div>

            {/* Forms Table */}
            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            {['Form No.', 'Form Name', 'Category', 'Due Date / Deadline', 'Action'].map(h => (
                                <th key={h} style={{ textAlign: 'left', padding: '12px 14px', borderBottom: '1px solid var(--border-color)', fontSize: 11, fontWeight: 700, color: '#C9A84C', letterSpacing: 0.8, textTransform: 'uppercase' as const, background: 'rgba(201,168,76,0.05)' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((f, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                <td style={{ padding: '10px 14px', fontSize: 13, fontWeight: 700, fontFamily: 'monospace', color: catColors[f.cat] || '#C9A84C' }}>{f.form}</td>
                                <td style={{ padding: '10px 14px', fontSize: 13 }}>{f.name}</td>
                                <td style={{ padding: '10px 14px' }}>
                                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: (catColors[f.cat] || '#C9A84C') + '15', color: catColors[f.cat] || '#C9A84C', fontWeight: 600 }}>{f.cat}</span>
                                </td>
                                <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--text-secondary)' }}>{f.due}</td>
                                <td style={{ padding: '10px 14px' }}>
                                    <a href={getMCAUrl(f.form)} target="_blank" rel="noreferrer"
                                        style={{ fontSize: 11, padding: '4px 10px', borderRadius: 6, background: 'rgba(99,102,241,0.15)', color: '#6366f1', fontWeight: 600, textDecoration: 'none' }}>
                                        📥 File on MCA
                                    </a>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Important Deadlines */}
            <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
                {[
                    { title: '📅 Key Annual Deadlines', color: '#22c55e', items: ['DIR-3 KYC — 30 Sep', 'ADT-1 — 15 days from AGM', 'AOC-4 — 30 days from AGM', 'MGT-7 — 60 days from AGM', 'DPT-3 — 30 Jun', 'MSME-1 — 31 Oct & 30 Apr'] },
                    { title: '⚠️ Penalty for Late Filing', color: '#ef4444', items: ['AOC-4/MGT-7: ₹100/day per form', 'DIR-3 KYC: ₹5,000 one-time', 'INC-20A missed: ₹50,000 penalty', 'CHG-1 late: Additional fees apply', 'Strike off if 2+ years default'] },
                    { title: '💡 Pro Tips for CAs', color: '#f59e0b', items: ['File AOC-4 before MGT-7 (sequence matters)', 'DIR-3 KYC Web for existing DIN holders', 'Use SPICe+ for new incorporations', 'BEN-2 mandatory for significant beneficial owners', 'CSR-2 filed as AOC-4 attachment'] },
                ].map((card, i) => (
                    <div key={i} className="glass-card" style={{ padding: 18, borderTop: `3px solid ${card.color}` }}>
                        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10, color: card.color }}>{card.title}</h3>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            {card.items.map((item, j) => (
                                <li key={j} style={{ fontSize: 12, padding: '4px 0', color: 'var(--text-secondary)', borderBottom: '1px solid rgba(255,255,255,0.03)', display: 'flex', gap: 6 }}>
                                    <span style={{ color: card.color }}>→</span> {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
}
