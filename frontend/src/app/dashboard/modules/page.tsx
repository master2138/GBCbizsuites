'use client';
import { useState } from 'react';

const MODULES = [
    {
        id: 'corpca', name: 'CorpCA', icon: '🏢', color: '#6366f1', tagline: 'Company Law & Secretarial Compliance',
        features: [
            { name: 'MCA Filing Tracker', desc: 'Track AOC-4, MGT-7, DIR-3 KYC, ADT-1 deadlines per company', status: 'active' },
            { name: 'Board Resolution Templates', desc: '30+ templates: appointment, borrowing, allotment, AGM, EGM', status: 'active' },
            { name: 'AGM/EGM Minutes Generator', desc: 'AI-assisted meeting minutes with attendance & resolution drafts', status: 'coming' },
            { name: 'DIN/DPIN Tracker', desc: 'Track Director Identification Numbers, KYC status, expiry alerts', status: 'active' },
            { name: 'Annual Compliance Calendar', desc: 'Auto-generated calendar per CIN with ROC filing deadlines', status: 'active' },
            { name: 'Company Master Search', desc: 'Search MCA21 for company details, directors, charges, filings', status: 'active' },
        ],
        tools: [
            { name: 'CIN/LLPIN Lookup', desc: 'Verify company/LLP registration details', link: 'https://www.mca.gov.in/mcafoportal/viewCompanyMasterData.do' },
            { name: 'DIN Status Check', desc: 'Check Director Identification Number status', link: 'https://www.mca.gov.in/mcafoportal/checkDinStatusAction.do' },
            { name: 'Name Availability', desc: 'Check proposed company name availability', link: 'https://www.mca.gov.in/mcafoportal/runNameSearch.do' },
            { name: 'Charge Search', desc: 'Search registered charges on a company', link: 'https://www.mca.gov.in/mcafoportal/viewChargeDetails.do' },
        ],
    },
    {
        id: 'cyberca', name: 'CyberCA', icon: '🛡️', color: '#ef4444', tagline: 'Government Certificates & Digital Compliance',
        features: [
            { name: 'DSC Management', desc: 'Track Digital Signature Certificate expiry, renewal reminders for all clients', status: 'active' },
            { name: 'FSSAI License Tracker', desc: 'Food license registration, renewal tracking & compliance', status: 'active' },
            { name: 'MSME/Udyam Registration', desc: 'Udyam registration assistance, certificate tracking', status: 'active' },
            { name: 'Shop & Establishment', desc: 'State-wise S&E license tracking and renewal alerts', status: 'coming' },
            { name: 'Trademark Application', desc: 'TM search, application tracking, renewal monitoring', status: 'coming' },
            { name: 'IEC Code Management', desc: 'Import Export Code application and modification tracking', status: 'active' },
        ],
        tools: [
            { name: 'Udyam Registration', desc: 'Register for MSME certificate', link: 'https://udyamregistration.gov.in/' },
            { name: 'FSSAI Portal', desc: 'Food license application & renewal', link: 'https://foscos.fssai.gov.in/' },
            { name: 'Trademark Search', desc: 'Search existing trademarks', link: 'https://ipindia.gov.in/tmr-public-search.htm' },
            { name: 'IEC Application', desc: 'Apply for Import Export Code', link: 'https://www.dgft.gov.in/' },
        ],
    },
    {
        id: 'tradeca', name: 'TradeCA', icon: '🌍', color: '#f59e0b', tagline: 'Import/Export & International Trade Compliance',
        features: [
            { name: 'IEC Code Application', desc: 'Apply for Import Export Code via DGFT portal integration', status: 'active' },
            { name: 'GeM Bid Assistant', desc: 'Find, prepare and track Government e-Marketplace bids', status: 'active' },
            { name: 'DGFT Scheme Tracker', desc: 'Track MEIS, SEIS, RoDTEP, RoSCTL export incentive schemes', status: 'coming' },
            { name: 'Custom Duty Calculator', desc: 'Calculate import/export customs duty with HS code lookup', status: 'coming' },
            { name: 'ECGC Credit Insurance', desc: 'Export credit guarantee coverage tracking', status: 'coming' },
            { name: 'AD Code Management', desc: 'Authorized Dealer code for bank-wise forex transactions', status: 'active' },
        ],
        tools: [
            { name: 'DGFT Portal', desc: 'Apply for IEC, MEIS, SEIS schemes', link: 'https://www.dgft.gov.in/' },
            { name: 'GeM Portal', desc: 'Government e-Marketplace for bidding', link: 'https://gem.gov.in/' },
            { name: 'ICEGATE', desc: 'Indian Customs EDI Gateway for clearance', link: 'https://www.icegate.gov.in/' },
            { name: 'HS Code Lookup', desc: 'Find Harmonized System codes for products', link: 'https://www.cbic.gov.in/htdocs-cbec/customs/cst-act/formatted-htmls/cst-schdle' },
        ],
    },
];

export default function SpecialModulesPage() {
    const [activeModule, setActiveModule] = useState('corpca');
    const mod = MODULES.find(m => m.id === activeModule)!;

    return (
        <div className="animate-fadeIn">
            <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>🧩 Specialized Modules</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>CorpCA · CyberCA · TradeCA — Company law, government certificates & international trade</p>
            </div>

            {/* Module Tabs */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
                {MODULES.map(m => (
                    <button key={m.id} onClick={() => setActiveModule(m.id)} style={{
                        padding: '12px 20px', borderRadius: 12, border: '2px solid', flex: 1, cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left',
                        borderColor: activeModule === m.id ? m.color : 'var(--border-color)',
                        background: activeModule === m.id ? m.color + '12' : 'var(--bg-secondary)',
                        color: activeModule === m.id ? m.color : 'var(--text-secondary)',
                    }}>
                        <div style={{ fontSize: 20, marginBottom: 4 }}>{m.icon}</div>
                        <div style={{ fontSize: 15, fontWeight: 800 }}>{m.name}</div>
                        <div style={{ fontSize: 11, opacity: 0.7 }}>{m.tagline}</div>
                    </button>
                ))}
            </div>

            {/* Features Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14, marginBottom: 24 }}>
                {mod.features.map((f, i) => (
                    <div key={i} className="glass-card" style={{ padding: 18, borderLeft: `3px solid ${f.status === 'active' ? mod.color : 'var(--border-color)'}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 6 }}>
                            <h3 style={{ fontSize: 14, fontWeight: 700, color: mod.color }}>{f.name}</h3>
                            <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, fontWeight: 700, background: f.status === 'active' ? 'rgba(34,197,94,0.15)' : 'rgba(245,158,11,0.15)', color: f.status === 'active' ? '#22c55e' : '#f59e0b' }}>
                                {f.status === 'active' ? '● Active' : '◐ Coming'}
                            </span>
                        </div>
                        <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{f.desc}</p>
                    </div>
                ))}
            </div>

            {/* Quick Links */}
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, color: mod.color }}>{mod.icon} {mod.name} Quick Links</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
                {mod.tools.map((t, i) => (
                    <a key={i} href={t.link} target="_blank" rel="noreferrer" style={{
                        padding: 16, borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', textDecoration: 'none', transition: 'all 0.2s',
                    }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: mod.color, marginBottom: 4 }}>{t.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{t.desc}</div>
                    </a>
                ))}
            </div>
        </div>
    );
}
