'use client';
import { useState } from 'react';

const SAMPLE_ENTRIES = [
    { date: '01-03-2026', ledger: 'Sales A/c', particular: 'ABC Traders', debit: 0, credit: 50000, narration: 'Invoice INV-001' },
    { date: '01-03-2026', ledger: 'ABC Traders', particular: 'Sales A/c', debit: 50000, credit: 0, narration: 'Invoice INV-001' },
    { date: '05-03-2026', ledger: 'Purchase A/c', particular: 'XYZ Suppliers', debit: 30000, credit: 0, narration: 'Bill PUR-101' },
    { date: '05-03-2026', ledger: 'XYZ Suppliers', particular: 'Purchase A/c', debit: 0, credit: 30000, narration: 'Bill PUR-101' },
];

type VoucherEntry = { date: string; ledger: string; particular: string; debit: number; credit: number; narration: string };

export default function TallyIntegrationPage() {
    const [entries, setEntries] = useState<VoucherEntry[]>(SAMPLE_ENTRIES);
    const [form, setForm] = useState({ date: '', ledger: '', particular: '', debit: '', credit: '', narration: '' });
    const [companyName, setCompanyName] = useState('GBC Associates');
    const [tab, setTab] = useState('vouchers');

    const addEntry = () => {
        if (!form.date || !form.ledger) return;
        setEntries(prev => [...prev, { ...form, debit: Number(form.debit) || 0, credit: Number(form.credit) || 0 }]);
        setForm({ date: '', ledger: '', particular: '', debit: '', credit: '', narration: '' });
    };

    const generateTallyXML = () => {
        const vouchers = entries.reduce((acc: any[], entry, i) => {
            if (i % 2 === 0 && i + 1 < entries.length) {
                const dr = entries[i].debit > 0 ? entries[i] : entries[i + 1];
                const cr = entries[i].credit > 0 ? entries[i] : entries[i + 1];
                acc.push({ date: dr.date, dr, cr, narration: dr.narration });
            }
            return acc;
        }, []);

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<ENVELOPE>
  <HEADER><TALLYREQUEST>Import Data</TALLYREQUEST></HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC><REPORTNAME>Vouchers</REPORTNAME><STATICVARIABLES><SVCURRENTCOMPANY>${companyName}</SVCURRENTCOMPANY></STATICVARIABLES></REQUESTDESC>
      <REQUESTDATA>
${vouchers.map((v, i) => `        <TALLYMESSAGE xmlns:UDF="TallyUDF">
          <VOUCHER VCHTYPE="Journal" ACTION="Create" OBJCLS="Voucher" REMOTEID="JV-${String(i + 1).padStart(4, '0')}">
            <DATE>${v.date.split('-').reverse().join('')}</DATE>
            <NARRATION>${v.narration}</NARRATION>
            <VOUCHERTYPENAME>Journal</VOUCHERTYPENAME>
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>${v.dr.ledger}</LEDGERNAME>
              <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
              <AMOUNT>-${v.dr.debit.toFixed(2)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>${v.cr.ledger}</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>${v.cr.credit.toFixed(2)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
          </VOUCHER>
        </TALLYMESSAGE>`).join('\n')}
      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>`;
        const blob = new Blob([xml], { type: 'application/xml' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `Tally_Import_${companyName.replace(/\s/g, '_')}.xml`;
        a.click();
        URL.revokeObjectURL(a.href);
    };

    const tabs = [
        { id: 'vouchers', label: 'Voucher Entry', icon: '📝' },
        { id: 'guide', label: 'Import Guide', icon: '📚' },
    ];

    return (
        <div className="animate-fadeIn">
            <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>🔗 Tally Integration</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Generate Tally-compatible XML vouchers for direct import into Tally ERP 9 / Tally Prime</p>
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

            {tab === 'vouchers' && (
                <>
                    <div className="glass-card" style={{ padding: 20, marginBottom: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Company:</label>
                            <input value={companyName} onChange={e => setCompanyName(e.target.value)} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 13, width: 250 }} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr 120px 120px 1fr auto', gap: 8, alignItems: 'end' }}>
                            {[{ label: 'Date', key: 'date', ph: 'DD-MM-YYYY', w: 120 }, { label: 'Ledger Name', key: 'ledger', ph: 'Sales A/c' }, { label: 'Particular', key: 'particular', ph: 'Party Name' }, { label: 'Debit (₹)', key: 'debit', ph: '0', type: 'number' }, { label: 'Credit (₹)', key: 'credit', ph: '0', type: 'number' }, { label: 'Narration', key: 'narration', ph: 'Invoice No...' }].map(f => (
                                <div key={f.key}>
                                    <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 2 }}>{f.label}</label>
                                    <input type={f.type || 'text'} value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.ph} style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 12 }} />
                                </div>
                            ))}
                            <div><button onClick={addEntry} style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: 'linear-gradient(135deg, #C9A84C, #E8CC7D)', color: '#0f172a', fontWeight: 700, fontSize: 12, cursor: 'pointer', marginTop: 14 }}>➕</button></div>
                        </div>
                    </div>

                    <div className="glass-card" style={{ padding: 0, overflow: 'hidden', marginBottom: 16 }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead><tr>{['Date', 'Ledger', 'Particular', 'Debit', 'Credit', 'Narration'].map(h => <th key={h} style={{ textAlign: h === 'Debit' || h === 'Credit' ? 'right' : 'left', padding: '10px 12px', borderBottom: '1px solid var(--border-color)', fontSize: 11, fontWeight: 700, color: '#C9A84C', background: 'rgba(201,168,76,0.05)' }}>{h}</th>)}</tr></thead>
                            <tbody>{entries.map((e, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                    <td style={{ padding: '8px 12px', fontSize: 12 }}>{e.date}</td>
                                    <td style={{ padding: '8px 12px', fontSize: 12, fontWeight: 600 }}>{e.ledger}</td>
                                    <td style={{ padding: '8px 12px', fontSize: 12, color: 'var(--text-secondary)' }}>{e.particular}</td>
                                    <td style={{ padding: '8px 12px', fontSize: 12, textAlign: 'right', color: e.debit > 0 ? '#22c55e' : 'var(--text-secondary)' }}>{e.debit > 0 ? `₹${e.debit.toLocaleString('en-IN')}` : '-'}</td>
                                    <td style={{ padding: '8px 12px', fontSize: 12, textAlign: 'right', color: e.credit > 0 ? '#ef4444' : 'var(--text-secondary)' }}>{e.credit > 0 ? `₹${e.credit.toLocaleString('en-IN')}` : '-'}</td>
                                    <td style={{ padding: '8px 12px', fontSize: 12, color: 'var(--text-secondary)' }}>{e.narration}</td>
                                </tr>
                            ))}</tbody>
                        </table>
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <button onClick={generateTallyXML} style={{ padding: '12px 28px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #C9A84C, #E8CC7D)', color: '#0f172a', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>📥 Download Tally XML</button>
                        <button onClick={() => setEntries([])} style={{ padding: '12px 28px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>🗑️ Clear All</button>
                    </div>
                </>
            )}

            {tab === 'guide' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    {[
                        { title: '📥 How to Import in Tally Prime', color: '#22c55e', steps: ['Open Tally Prime → Gateway of Tally', 'Go to Import → select "XML (Other Apps)"', 'Browse and select the downloaded XML file', 'Tally will display vouchers for review', 'Click "Accept All" to import vouchers', 'Verify in Day Book or Ledger reports'] },
                        { title: '📥 How to Import in Tally ERP 9', color: '#6366f1', steps: ['Open Tally ERP 9 → Gateway of Tally', 'Press Alt+H → select "Import Data"', 'Browse the downloaded .xml file', 'Select "Vouchers" as import type', 'Review and accept the vouchers', 'Check in Day Book (press D from GoT)'] },
                        { title: '⚠️ Common Issues & Fixes', color: '#f59e0b', steps: ['Ledger not found → Create ledger first in Tally', 'Date format error → Use DD-MM-YYYY format', 'Company mismatch → Set correct company name above', 'Duplicate voucher → Check REMOTEID in XML', 'Amount mismatch → Ensure Dr = Cr for each voucher'] },
                        { title: '✅ Supported Voucher Types', color: '#C9A84C', steps: ['Journal Voucher (JV) — Current', 'Sales Voucher — Coming soon', 'Purchase Voucher — Coming soon', 'Receipt Voucher — Coming soon', 'Payment Voucher — Coming soon', 'Contra Voucher — Coming soon'] },
                    ].map(card => (
                        <div key={card.title} className="glass-card" style={{ padding: 20, borderTop: `3px solid ${card.color}` }}>
                            <h3 style={{ fontSize: 14, fontWeight: 700, color: card.color, marginBottom: 12 }}>{card.title}</h3>
                            <ol style={{ paddingLeft: 16, margin: 0 }}>
                                {card.steps.map((s, i) => <li key={i} style={{ fontSize: 12, padding: '4px 0', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{s}</li>)}
                            </ol>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
