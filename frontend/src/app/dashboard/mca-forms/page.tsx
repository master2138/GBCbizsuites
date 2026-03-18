'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const MCA_FORMS = [
    // Annual Compliance
    { form: 'AOC-4', title: 'Financial Statements Filing', category: 'Annual', deadline: '30 Oct', desc: 'File balance sheet, P&L, cash flow with ROC. Due within 30 days of AGM.', fee: '₹200-600' },
    { form: 'MGT-7/7A', title: 'Annual Return', category: 'Annual', deadline: '28 Nov', desc: 'Annual return with details of shareholders, directors, charges. Within 60 days of AGM.', fee: '₹200-600' },
    { form: 'ADT-1', title: 'Auditor Appointment', category: 'Annual', deadline: '15 Oct', desc: 'Inform ROC about appointment of auditor within 15 days of AGM.', fee: '₹200' },
    { form: 'MSC-1', title: 'Application as Dormant Company', category: 'Annual', deadline: 'As needed', desc: 'Apply for Dormant/Active status under Section 455.', fee: '₹5,000' },
    { form: 'MSME-1', title: 'MSME Half-Yearly Return', category: 'Half-Yearly', deadline: '31 Oct / 30 Apr', desc: 'Report outstanding payments to MSME suppliers exceeding 45 days.', fee: 'NIL' },
    // Director KYC
    { form: 'DIR-3 KYC', title: 'Director KYC', category: 'KYC', deadline: '30 Sep', desc: 'Annual KYC for all DIN holders. ₹5000 late fee if missed.', fee: 'NIL (₹5000 late)' },
    // Company Incorporation
    { form: 'SPICe+', title: 'Company Incorporation', category: 'Incorporation', deadline: 'Anytime', desc: 'Single form for name reservation, incorporation, DIN, PAN, TAN, GSTIN, EPFO, ESIC.', fee: '₹500-5000' },
    { form: 'RUN', title: 'Reserve Unique Name', category: 'Incorporation', deadline: 'Anytime', desc: 'Reserve a company name before filing SPICe+. Valid for 20 days.', fee: '₹1,000' },
    { form: 'INC-20A', title: 'Commencement Declaration', category: 'Incorporation', deadline: '180 days', desc: 'Declaration for commencement of business within 180 days of incorporation.', fee: '₹200' },
    { form: 'AGILE-PRO-S', title: 'GST + EPFO + ESIC + Shop Act', category: 'Incorporation', deadline: 'With SPICe+', desc: 'Linked form for GSTIN, EPFO, ESIC, Shops & Establishment registration.', fee: 'NIL' },
    // Changes & Modifications
    { form: 'DIR-12', title: 'Director Appointment/Resignation', category: 'Changes', deadline: '30 days', desc: 'Intimate ROC about appointment, resignation, change of directors.', fee: '₹200' },
    { form: 'SH-7', title: 'Change in Authorized Capital', category: 'Changes', deadline: '30 days', desc: 'File notice of increase in authorized share capital.', fee: 'Based on capital' },
    { form: 'PAS-3', title: 'Return of Allotment', category: 'Changes', deadline: '15 days', desc: 'File return of allotment after issuing shares. Within 15 days.', fee: '₹200-500' },
    { form: 'CHG-1/CHG-9', title: 'Charge Registration/Modification', category: 'Charges', deadline: '30 days', desc: 'Register or modify charge on company assets with ROC.', fee: 'Based on amount' },
    { form: 'MGT-14', title: 'Filing of Resolutions', category: 'Changes', deadline: '30 days', desc: 'File special/board resolutions with ROC within 30 days of passing.', fee: '₹200' },
    { form: 'INC-22', title: 'Registered Office Change', category: 'Changes', deadline: '15 days', desc: 'Intimate ROC about change of registered office address.', fee: '₹200' },
    { form: 'INC-28', title: 'NCLT Order Filing', category: 'Changes', deadline: '30 days', desc: 'File NCLT/CLB orders (merger, amalgamation, compromise).', fee: '₹200' },
    // LLP Forms
    { form: 'FiLLiP', title: 'LLP Incorporation', category: 'LLP', deadline: 'Anytime', desc: 'Form for incorporation of LLP with MCA.', fee: '₹500-5000' },
    { form: 'LLP-11', title: 'LLP Annual Return', category: 'LLP', deadline: '30 May', desc: 'Annual return for LLP within 60 days of FY close.', fee: '₹50-200' },
    { form: 'LLP-8', title: 'LLP Statement of Accounts', category: 'LLP', deadline: '30 Oct', desc: 'Statement of accounts and solvency within 30 days of 6 months from FY end.', fee: '₹50-200' },
    { form: 'LLP-3', title: 'LLP Partner Change', category: 'LLP', deadline: '30 days', desc: 'Inform ROC about change in partners or designated partners.', fee: '₹50' },
    // Winding Up
    { form: 'STK-2', title: 'Strike Off Application', category: 'Closure', deadline: 'Anytime', desc: 'Application for removal of company name from ROC register.', fee: '₹5,000-10,000' },
    { form: 'WIN-1', title: 'Winding Up Statement', category: 'Closure', deadline: 'As per NCLT', desc: 'Statement of affairs in winding up proceedings.', fee: 'As applicable' },
    // CSR & Others
    { form: 'CSR-2', title: 'CSR Reporting', category: 'CSR', deadline: '31 Mar', desc: 'Annual CSR report for companies with CSR obligation (Net Worth >₹500Cr / Turnover >₹1000Cr / Profit >₹5Cr).', fee: 'NIL' },
    { form: 'BEN-2', title: 'Beneficial Ownership', category: 'Compliance', deadline: '30 days', desc: 'Return of significant beneficial owner in shares. File within 30 days.', fee: '₹200' },
    { form: 'DPT-3', title: 'Return of Deposits', category: 'Annual', deadline: '30 Jun', desc: 'Annual return of deposits/transactions NOT considered deposits.', fee: '₹200' },
    { form: 'GNL-3', title: 'Particulars of Legal Suits', category: 'Compliance', deadline: 'As needed', desc: 'Report pending legal cases/suits under Section 455.', fee: '₹200' },
];

const CATEGORIES = ['All', 'Annual', 'Half-Yearly', 'KYC', 'Incorporation', 'Changes', 'Charges', 'LLP', 'Closure', 'CSR', 'Compliance'];

export default function MCAFormsPage() {
    const [search, setSearch] = useState('');
    const [cat, setCat] = useState('All');
    const router = useRouter();

    const filtered = MCA_FORMS.filter(f => {
        const matchSearch = !search || f.form.toLowerCase().includes(search.toLowerCase()) || f.title.toLowerCase().includes(search.toLowerCase()) || f.desc.toLowerCase().includes(search.toLowerCase());
        const matchCat = cat === 'All' || f.category === cat;
        return matchSearch && matchCat;
    });

    const catColors: Record<string, string> = {
        Annual: '#C9A84C', 'Half-Yearly': '#f59e0b', KYC: '#ef4444', Incorporation: '#22c55e',
        Changes: '#6366f1', Charges: '#8b5cf6', LLP: '#14b8a6', Closure: '#ef4444', CSR: '#3b82f6', Compliance: '#ec4899',
    };

    return (
        <div className="animate-fadeIn">
            <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>🏢 MCA Filing Forms (CorpCA)</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{MCA_FORMS.length} MCA forms with deadlines, fees, and descriptions</p>
            </div>

            {/* Search + Filters */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search by form number, title, or keyword..."
                    style={{ flex: 1, minWidth: 300, padding: '12px 16px', borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 14, outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
                {CATEGORIES.map(c => (
                    <button key={c} onClick={() => setCat(c)} style={{
                        padding: '6px 14px', borderRadius: 8, border: '1px solid',
                        borderColor: cat === c ? 'rgba(201,168,76,0.4)' : 'var(--border-color)',
                        background: cat === c ? 'rgba(201,168,76,0.1)' : 'transparent',
                        color: cat === c ? '#C9A84C' : 'var(--text-secondary)',
                        cursor: 'pointer', fontSize: 12, fontWeight: 600,
                    }}>
                        {c} {c === 'All' ? `(${MCA_FORMS.length})` : `(${MCA_FORMS.filter(f => f.category === c).length})`}
                    </button>
                ))}
            </div>

            {/* Forms Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 12 }}>
                {filtered.map(f => (
                    <div key={f.form} className="glass-card" style={{ padding: '18px 20px', borderLeft: `3px solid ${catColors[f.category] || '#6366f1'}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                            <div>
                                <span style={{ fontSize: 16, fontWeight: 800, color: catColors[f.category] || '#C9A84C', fontFamily: 'monospace' }}>{f.form}</span>
                                <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{f.title}</div>
                            </div>
                            <span style={{ padding: '3px 8px', borderRadius: 6, background: (catColors[f.category] || '#6366f1') + '15', color: catColors[f.category] || '#6366f1', fontSize: 10, fontWeight: 700, whiteSpace: 'nowrap' }}>{f.category}</span>
                        </div>
                        <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 10 }}>{f.desc}</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                            <span style={{ color: 'var(--text-secondary)' }}>📅 Deadline: <strong style={{ color: '#f59e0b' }}>{f.deadline}</strong></span>
                            <span style={{ color: 'var(--text-secondary)' }}>💰 Fee: <strong>{f.fee}</strong></span>
                        </div>
                    </div>
                ))}
            </div>

            {filtered.length === 0 && (
                <div className="glass-card" style={{ padding: 40, textAlign: 'center' }}>
                    <div style={{ fontSize: 36, marginBottom: 8 }}>🔍</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>No forms found matching &quot;{search}&quot;</div>
                </div>
            )}
        </div>
    );
}
