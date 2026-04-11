'use client';
import { useState } from 'react';

const ITR_TYPES = [
    { type: 'ITR-1', desc: 'Salary, 1 House Property, Other Sources', limit: '₹50L', status: 'ready' },
    { type: 'ITR-2', desc: 'Capital Gains, Foreign Assets, Multiple HP', limit: 'No limit', status: 'ready' },
    { type: 'ITR-3', desc: 'Business/Profession Income', limit: 'No limit', status: 'ready' },
    { type: 'ITR-4', desc: 'Presumptive (44AD/44ADA/44AE)', limit: '₹50L/₹75L', status: 'ready' },
    { type: 'ITR-5', desc: 'Firms, LLPs, AOPs, BOIs', limit: 'No limit', status: 'beta' },
    { type: 'ITR-6', desc: 'Companies (not 11 exempt)', limit: 'No limit', status: 'beta' },
    { type: 'ITR-7', desc: 'Trusts, Political Parties, Institutions', limit: 'No limit', status: 'planned' },
];

const SAMPLE_JSON = {
    "FormName": "ITR-1",
    "AssessmentYear": "2026-27",
    "Schema": "ITR1_2026",
    "PersonalInfo": {
        "Name": "Rajesh Sharma",
        "PAN": "ABCPS1234D",
        "DOB": "1985-06-15",
        "AadhaarNo": "XXXX-XXXX-4321",
        "Status": "Individual",
        "ResidentialStatus": "Resident"
    },
    "IncomeDetails": {
        "Salary": { "GrossSalary": 1200000, "HRA": 120000, "StdDeduction": 75000, "NetSalary": 1005000 },
        "HouseProperty": { "GrossRent": 0, "NetIncome": 0 },
        "OtherSources": { "Interest": 45000, "Dividend": 8000, "Total": 53000 }
    },
    "GrossTotalIncome": 1058000,
    "Deductions": { "80C": 150000, "80D": 25000, "80TTA": 10000, "Total": 185000 },
    "TotalIncome": 873000,
    "TaxComputation": {
        "OldRegime": { "Tax": 77100, "Cess": 3084, "Total": 80184 },
        "NewRegime": { "Tax": 37400, "Cess": 1496, "Total": 38896 },
        "Recommended": "NewRegime"
    },
    "TDSDetails": [
        { "TAN": "MUMB12345C", "Deductor": "ABC Corp", "Amount": 95000 },
        { "TAN": "DELH67890D", "Deductor": "SBI Interest", "Amount": 4500 }
    ],
    "Verification": { "Place": "Mumbai", "Date": "2026-07-15", "Capacity": "Self" }
};

export default function TallyPage() {
    const [tab, setTab] = useState<'itr' | 'tally'>('itr');
    const [selectedITR, setSelectedITR] = useState('ITR-1');
    const [showJSON, setShowJSON] = useState(false);

    return (
        <div className="animate-fadeIn">
            <div style={{ marginBottom: 20 }}>
                <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }} className="gradient-text">ITR JSON & Tally Export</h1>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Schema-compliant ITR JSON · Tally Prime XML · Voucher-level export</p>
            </div>

            <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
                {(['itr', 'tally'] as const).map(t => (
                    <button key={t} onClick={() => setTab(t)} style={{
                        padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                        background: tab === t ? 'var(--accent-gradient)' : 'rgba(255,255,255,0.04)',
                        color: tab === t ? '#07091A' : 'var(--text-secondary)',
                    }}>{t === 'itr' ? '📋 ITR JSON Generator' : '🔗 Tally XML Export'}</button>
                ))}
            </div>

            {tab === 'itr' && (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10, marginBottom: 16 }}>
                        {ITR_TYPES.map(f => (
                            <div key={f.type} className="glass-card" style={{
                                padding: 16, cursor: 'pointer',
                                border: selectedITR === f.type ? '2px solid #C9A84C' : '1px solid var(--border-color)',
                            }} onClick={() => setSelectedITR(f.type)}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                    <span style={{ fontSize: 16, fontWeight: 800, color: '#C9A84C' }}>{f.type}</span>
                                    <span style={{
                                        fontSize: 9, padding: '2px 6px', borderRadius: 4, fontWeight: 700,
                                        background: f.status === 'ready' ? 'rgba(34,197,94,0.15)' : f.status === 'beta' ? 'rgba(245,158,11,0.15)' : 'rgba(107,122,159,0.15)',
                                        color: f.status === 'ready' ? '#22c55e' : f.status === 'beta' ? '#f59e0b' : '#6B7A9F',
                                    }}>{f.status.toUpperCase()}</span>
                                </div>
                                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>{f.desc}</div>
                                <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Limit: {f.limit}</div>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                        <button onClick={() => setShowJSON(!showJSON)} style={{
                            padding: '10px 20px', borderRadius: 8, border: 'none', background: 'var(--accent-gradient)',
                            color: '#07091A', fontWeight: 700, fontSize: 13, cursor: 'pointer'
                        }}>{showJSON ? '🔽 Hide' : '📄 Preview'} ITR-1 JSON</button>
                        <button style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid #22c55e', background: 'rgba(34,197,94,0.08)', color: '#22c55e', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>⬇️ Download JSON</button>
                        <button style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid #8B5CF6', background: 'rgba(139,92,246,0.08)', color: '#8B5CF6', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>✅ Validate Schema</button>
                    </div>

                    {showJSON && (
                        <div className="glass-card" style={{ padding: 16 }}>
                            <pre style={{ fontSize: 12, fontFamily: 'monospace', overflow: 'auto', maxHeight: 400, color: '#22c55e', lineHeight: 1.5 }}>
                                {JSON.stringify(SAMPLE_JSON, null, 2)}
                            </pre>
                        </div>
                    )}
                </>
            )}

            {tab === 'tally' && (
                <div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
                        {[
                            { label: 'Sales Vouchers', value: '156', icon: '📤', desc: 'GSTR-1 mapped sales entries' },
                            { label: 'Purchase Vouchers', value: '89', icon: '📥', desc: 'GSTR-2B matched purchases' },
                            { label: 'Journal Entries', value: '34', icon: '📝', desc: 'Tax & adjustment entries' },
                            { label: 'Bank Entries', value: '245', icon: '🏦', desc: 'From bank statement parser' },
                        ].map(c => (
                            <div key={c.label} className="glass-card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
                                <span style={{ fontSize: 28 }}>{c.icon}</span>
                                <div>
                                    <div style={{ fontSize: 20, fontWeight: 800, fontFamily: 'monospace', color: '#C9A84C' }}>{c.value}</div>
                                    <div style={{ fontSize: 13, fontWeight: 600 }}>{c.label}</div>
                                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{c.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="glass-card" style={{ padding: 16 }}>
                        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#C9A84C', marginBottom: 12 }}>🔗 Tally Prime XML Preview</h3>
                        <pre style={{ fontSize: 11, fontFamily: 'monospace', overflow: 'auto', maxHeight: 300, color: '#60a5fa', lineHeight: 1.5 }}>{`<?xml version="1.0" encoding="UTF-8"?>
<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Import Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC><REPORTNAME>Vouchers</REPORTNAME></REQUESTDESC>
      <REQUESTDATA>
        <TALLYMESSAGE>
          <VOUCHER VCHTYPE="Sales" ACTION="Create">
            <DATE>20260315</DATE>
            <NARRATION>INV-2026-001 / M/s Fresh Foods</NARRATION>
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>Fresh Foods Pvt Ltd</LEDGERNAME>
              <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
              <AMOUNT>-59000.00</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>Sales Account</LEDGERNAME>
              <AMOUNT>50000.00</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>CGST Output</LEDGERNAME>
              <AMOUNT>4500.00</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>SGST Output</LEDGERNAME>
              <AMOUNT>4500.00</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
          </VOUCHER>
        </TALLYMESSAGE>
      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>`}</pre>
                        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                            <button style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: 'var(--accent-gradient)', color: '#07091A', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>⬇️ Download Tally XML (524 vouchers)</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
