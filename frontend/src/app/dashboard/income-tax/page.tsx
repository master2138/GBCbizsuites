'use client';
import { useState, useMemo } from 'react';

// IT Act 2025 — New Regime Tax Slabs (FY 2025-26)
const NEW_SLABS = [
    { from: 0, to: 400000, rate: 0 },
    { from: 400000, to: 800000, rate: 0.05 },
    { from: 800000, to: 1200000, rate: 0.10 },
    { from: 1200000, to: 1600000, rate: 0.15 },
    { from: 1600000, to: 2000000, rate: 0.20 },
    { from: 2000000, to: 2400000, rate: 0.25 },
    { from: 2400000, to: Infinity, rate: 0.30 },
];
const OLD_SLABS = [
    { from: 0, to: 250000, rate: 0 },
    { from: 250000, to: 500000, rate: 0.05 },
    { from: 500000, to: 1000000, rate: 0.20 },
    { from: 1000000, to: Infinity, rate: 0.30 },
];
const STD_DED_NEW = 75000;
const STD_DED_OLD = 50000;
const CESS = 0.04;
const ITR_FORMS = ['ITR-1', 'ITR-2', 'ITR-3', 'ITR-4', 'ITR-5', 'ITR-6', 'ITR-7'];
const ASSESSEE_TYPES = ['Individual', 'HUF', 'Firm', 'Company', 'LLP', 'AOP/BOI', 'Trust'];
const AY_OPTIONS = ['2026-27', '2025-26', '2024-25'];

function calcTax(income: number, slabs: typeof NEW_SLABS) {
    let tax = 0;
    for (const s of slabs) {
        if (income <= s.from) break;
        const taxable = Math.min(income, s.to) - s.from;
        tax += taxable * s.rate;
    }
    return Math.round(tax);
}

function fmt(n: number) {
    return n.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
}

type IncomeState = {
    salary: number; hra: number; lta: number; otherAllowances: number;
    hpIncome: number; hpInterest: number;
    businessIncome: number; presumptiveRate: number;
    ltcg112A: number; stcg111A: number; otherLtcg: number; otherStcg: number;
    otherSources: number; savingsInterest: number; fdInterest: number;
    sec80C: number; sec80D: number; sec80CCD: number; sec80G: number; sec80E: number; sec80TTA: number;
    tdsCredit: number; advanceTax: number; selfAssessment: number;
};

const defaults: IncomeState = {
    salary: 0, hra: 0, lta: 0, otherAllowances: 0,
    hpIncome: 0, hpInterest: 0,
    businessIncome: 0, presumptiveRate: 8,
    ltcg112A: 0, stcg111A: 0, otherLtcg: 0, otherStcg: 0,
    otherSources: 0, savingsInterest: 0, fdInterest: 0,
    sec80C: 0, sec80D: 0, sec80CCD: 0, sec80G: 0, sec80E: 0, sec80TTA: 0,
    tdsCredit: 0, advanceTax: 0, selfAssessment: 0,
};

export default function IncomeTaxPage() {
    const [assesseeName, setAssesseeName] = useState('');
    const [pan, setPan] = useState('');
    const [assesseeType, setAssesseeType] = useState('Individual');
    const [ay, setAy] = useState('2026-27');
    const [itrForm, setItrForm] = useState('ITR-1');
    const [v, setV] = useState<IncomeState>(defaults);
    const [expandedHead, setExpandedHead] = useState<string | null>('salary');

    const upd = (key: keyof IncomeState, val: number) => setV(p => ({ ...p, [key]: val }));

    const comp = useMemo(() => {
        const salaryNet = Math.max(0, v.salary - v.hra - v.lta);
        const hpNet = v.hpIncome - Math.min(v.hpInterest, 200000);
        const businessNet = v.businessIncome;
        const cgTotal = v.ltcg112A + v.stcg111A + v.otherLtcg + v.otherStcg;
        const osTotal = v.otherSources + v.savingsInterest + v.fdInterest;
        const gti = salaryNet + hpNet + businessNet + cgTotal + osTotal;

        // Old regime
        const oldStd = STD_DED_OLD;
        const old80C = Math.min(v.sec80C, 150000);
        const old80D = Math.min(v.sec80D, 100000);
        const old80CCD = Math.min(v.sec80CCD, 50000);
        const oldDed = old80C + old80D + old80CCD + v.sec80G + v.sec80E + Math.min(v.sec80TTA, 10000) + oldStd;
        const oldTaxable = Math.max(0, gti - oldDed);
        const oldTax = calcTax(oldTaxable, OLD_SLABS);
        const oldCess = Math.round(oldTax * CESS);
        const oldTotal = oldTax + oldCess;

        // New regime
        const newStd = STD_DED_NEW;
        const newTaxable = Math.max(0, gti - newStd);
        const newTax = calcTax(newTaxable, NEW_SLABS);
        const newCess = Math.round(newTax * CESS);
        const newTotal = newTax + newCess;

        // 87A rebate (new regime: income <= 12L → 0 tax up to ₹60K)
        const rebate87A = newTaxable <= 1200000 ? Math.min(newTax, 60000) : 0;
        const newFinal = Math.max(0, newTotal - rebate87A);
        const oldRebate = oldTaxable <= 700000 ? Math.min(oldTax, 12500) : 0;
        const oldFinal = Math.max(0, oldTotal - oldRebate);

        const recommended = newFinal <= oldFinal ? 'NEW' : 'OLD';
        const totalCredits = v.tdsCredit + v.advanceTax + v.selfAssessment;
        const netPayableNew = newFinal - totalCredits;
        const netPayableOld = oldFinal - totalCredits;

        return { salaryNet, hpNet, businessNet, cgTotal, osTotal, gti, oldDed, oldTaxable, oldTax, oldCess, oldTotal, oldRebate, oldFinal, newStd, newTaxable, newTax, newCess, newTotal, rebate87A, newFinal, recommended, totalCredits, netPayableNew, netPayableOld };
    }, [v]);

    const Row = ({ label, section, value, color }: { label: string; section: string; value: number; color?: string }) => (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <div>
                <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{label}</span>
                <span style={{ fontSize: 10, color: '#C9A84C', marginLeft: 8, fontFamily: 'monospace' }}>{section}</span>
            </div>
            <span style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 700, color: color || (value < 0 ? '#ef4444' : '#22c55e') }}>{fmt(value)}</span>
        </div>
    );

    const Field = ({ label, field, max }: { label: string; field: keyof IncomeState; max?: number }) => (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', flex: 1 }}>{label}</label>
            <input type="number" value={v[field] || ''} onChange={e => upd(field, Math.min(Number(e.target.value) || 0, max || Infinity))} style={{ width: 140, padding: '6px 10px', borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: 'monospace', fontSize: 12, textAlign: 'right' }} />
        </div>
    );

    const Head = ({ id, icon, label, children }: { id: string; icon: string; label: string; children: React.ReactNode }) => (
        <div style={{ marginBottom: 8 }}>
            <button onClick={() => setExpandedHead(expandedHead === id ? null : id)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: expandedHead === id ? 'rgba(201,168,76,0.08)' : 'var(--bg-secondary)', border: '1px solid', borderColor: expandedHead === id ? 'rgba(201,168,76,0.2)' : 'var(--border-color)', borderRadius: 10, cursor: 'pointer', color: 'var(--text-primary)', fontSize: 13, fontWeight: 700 }}>
                <span>{icon}</span> {label}
                <span style={{ marginLeft: 'auto', fontSize: 10, transition: 'transform 0.2s', transform: expandedHead === id ? 'rotate(180deg)' : '' }}>▼</span>
            </button>
            {expandedHead === id && <div style={{ padding: '12px 14px', border: '1px solid var(--border-color)', borderTop: 'none', borderRadius: '0 0 10px 10px', background: 'var(--bg-secondary)' }}>{children}</div>}
        </div>
    );

    return (
        <div className="animate-fadeIn">
            {/* Assessee Bar */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', padding: '14px 18px', background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 12, marginBottom: 20 }}>
                <input value={assesseeName} onChange={e => setAssesseeName(e.target.value)} placeholder="Assessee Name" style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 13, flex: '1 1 180px' }} />
                <input value={pan} onChange={e => setPan(e.target.value.toUpperCase())} placeholder="PAN" maxLength={10} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: '#C9A84C', fontSize: 13, fontFamily: 'monospace', width: 120 }} />
                <select value={assesseeType} onChange={e => setAssesseeType(e.target.value)} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 12 }}>{ASSESSEE_TYPES.map(t => <option key={t}>{t}</option>)}</select>
                <select value={ay} onChange={e => setAy(e.target.value)} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 12 }}>{AY_OPTIONS.map(a => <option key={a}>{a}</option>)}</select>
                <select value={itrForm} onChange={e => setItrForm(e.target.value)} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: '#C9A84C', fontSize: 12, fontWeight: 700 }}>{ITR_FORMS.map(f => <option key={f}>{f}</option>)}</select>
            </div>

            {/* Regime Comparison Bar */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                <div style={{ padding: 16, borderRadius: 12, background: comp.recommended === 'OLD' ? 'rgba(34,197,94,0.08)' : 'var(--bg-secondary)', border: `2px solid ${comp.recommended === 'OLD' ? '#22c55e' : 'var(--border-color)'}` }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: 'var(--text-secondary)', marginBottom: 4 }}>OLD REGIME</div>
                    <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'monospace', color: comp.recommended === 'OLD' ? '#22c55e' : 'var(--text-primary)' }}>{fmt(comp.oldFinal)}</div>
                    {comp.recommended === 'OLD' && <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: 'rgba(34,197,94,0.15)', color: '#22c55e', fontWeight: 700 }}>✓ RECOMMENDED</span>}
                </div>
                <div style={{ padding: 16, borderRadius: 12, background: comp.recommended === 'NEW' ? 'rgba(34,197,94,0.08)' : 'var(--bg-secondary)', border: `2px solid ${comp.recommended === 'NEW' ? '#22c55e' : 'var(--border-color)'}` }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: 'var(--text-secondary)', marginBottom: 4 }}>NEW REGIME (IT Act 2025)</div>
                    <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'monospace', color: comp.recommended === 'NEW' ? '#22c55e' : 'var(--text-primary)' }}>{fmt(comp.newFinal)}</div>
                    {comp.recommended === 'NEW' && <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: 'rgba(34,197,94,0.15)', color: '#22c55e', fontWeight: 700 }}>✓ RECOMMENDED</span>}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16 }}>
                {/* Income Heads */}
                <div>
                    <Head id="salary" icon="💼" label="Salary Income (Sec 15-17)">
                        <Field label="Gross Salary" field="salary" />
                        <Field label="HRA Exemption (Sec 10(13A))" field="hra" />
                        <Field label="LTA Exemption (Sec 10(5))" field="lta" />
                        <Field label="Other Allowances" field="otherAllowances" />
                    </Head>
                    <Head id="hp" icon="🏠" label="House Property (Sec 22-27)">
                        <Field label="Annual Value / Rental Income" field="hpIncome" />
                        <Field label="Interest on Home Loan (max ₹2L)" field="hpInterest" max={200000} />
                    </Head>
                    <Head id="business" icon="🏢" label="Business/Profession (Sec 28-44)">
                        <Field label="Net Business Income" field="businessIncome" />
                        <Field label="Presumptive Rate % (44AD)" field="presumptiveRate" max={100} />
                    </Head>
                    <Head id="cg" icon="📈" label="Capital Gains (Sec 45-55)">
                        <Field label="LTCG u/s 112A (Equity — 12.5%)" field="ltcg112A" />
                        <Field label="STCG u/s 111A (Equity — 20%)" field="stcg111A" />
                        <Field label="Other LTCG" field="otherLtcg" />
                        <Field label="Other STCG" field="otherStcg" />
                    </Head>
                    <Head id="os" icon="💰" label="Other Sources (Sec 56)">
                        <Field label="Other Income" field="otherSources" />
                        <Field label="Savings Interest" field="savingsInterest" />
                        <Field label="FD Interest" field="fdInterest" />
                    </Head>
                    <Head id="ded" icon="🛡️" label="Deductions — Ch VI-A (Old Regime Only)">
                        <Field label="Sec 80C (PPF, ELSS, LIC — max ₹1.5L)" field="sec80C" max={150000} />
                        <Field label="Sec 80D (Health Insurance — max ₹1L)" field="sec80D" max={100000} />
                        <Field label="Sec 80CCD(1B) (NPS — max ₹50K)" field="sec80CCD" max={50000} />
                        <Field label="Sec 80G (Donations)" field="sec80G" />
                        <Field label="Sec 80E (Education Loan Interest)" field="sec80E" />
                        <Field label="Sec 80TTA (Savings Int — max ₹10K)" field="sec80TTA" max={10000} />
                    </Head>
                    <Head id="credits" icon="📋" label="Tax Credits & TDS">
                        <Field label="TDS Credit (as per 26AS)" field="tdsCredit" />
                        <Field label="Advance Tax Paid" field="advanceTax" />
                        <Field label="Self-Assessment Tax Paid" field="selfAssessment" />
                    </Head>
                </div>

                {/* Computation Summary */}
                <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 14, padding: 18, height: 'fit-content', position: 'sticky', top: 80 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 800, color: '#C9A84C', marginBottom: 12, letterSpacing: 1, textTransform: 'uppercase' }}>📊 Computation Summary</h3>
                    <Row label="Salary Income" section="Sec 15" value={comp.salaryNet} />
                    <Row label="House Property" section="Sec 22" value={comp.hpNet} />
                    <Row label="Business Income" section="Sec 28" value={comp.businessNet} />
                    <Row label="Capital Gains" section="Sec 45" value={comp.cgTotal} />
                    <Row label="Other Sources" section="Sec 56" value={comp.osTotal} />
                    <div style={{ borderTop: '2px solid rgba(201,168,76,0.3)', margin: '8px 0', paddingTop: 8 }}>
                        <Row label="Gross Total Income" section="" value={comp.gti} color="#C9A84C" />
                    </div>

                    <div style={{ marginTop: 12, padding: 12, borderRadius: 8, background: 'rgba(0,0,0,0.3)' }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#C9A84C', marginBottom: 6 }}>OLD REGIME</div>
                        <Row label="Deductions (Ch VI-A)" section="" value={-comp.oldDed} />
                        <Row label="Taxable Income" section="" value={comp.oldTaxable} color="var(--text-primary)" />
                        <Row label="Tax + Cess" section="" value={comp.oldTotal} color="var(--text-primary)" />
                        {comp.oldRebate > 0 && <Row label="87A Rebate" section="" value={-comp.oldRebate} />}
                        <Row label="Net Tax (Old)" section="" value={comp.oldFinal} color={comp.recommended === 'OLD' ? '#22c55e' : 'var(--text-primary)'} />
                    </div>

                    <div style={{ marginTop: 8, padding: 12, borderRadius: 8, background: 'rgba(0,0,0,0.3)' }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#C9A84C', marginBottom: 6 }}>NEW REGIME (2025)</div>
                        <Row label="Std Deduction" section="" value={-comp.newStd} />
                        <Row label="Taxable Income" section="" value={comp.newTaxable} color="var(--text-primary)" />
                        <Row label="Tax + Cess" section="" value={comp.newTotal} color="var(--text-primary)" />
                        {comp.rebate87A > 0 && <Row label="87A Rebate" section="" value={-comp.rebate87A} />}
                        <Row label="Net Tax (New)" section="" value={comp.newFinal} color={comp.recommended === 'NEW' ? '#22c55e' : 'var(--text-primary)'} />
                    </div>

                    <div style={{ borderTop: '2px solid rgba(201,168,76,0.3)', margin: '12px 0', paddingTop: 8 }}>
                        <Row label="TDS + Tax Credits" section="" value={comp.totalCredits} color="#60a5fa" />
                        <div style={{ padding: '10px 14px', borderRadius: 8, marginTop: 8, background: comp.recommended === 'NEW' ? (comp.netPayableNew < 0 ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)') : (comp.netPayableOld < 0 ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)'), textAlign: 'center' }}>
                            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: 'var(--text-secondary)' }}>{comp.recommended === 'NEW' ? (comp.netPayableNew < 0 ? 'REFUND' : 'TAX PAYABLE') : (comp.netPayableOld < 0 ? 'REFUND' : 'TAX PAYABLE')}</div>
                            <div style={{ fontSize: 24, fontWeight: 900, fontFamily: 'monospace', color: comp.recommended === 'NEW' ? (comp.netPayableNew < 0 ? '#22c55e' : '#ef4444') : (comp.netPayableOld < 0 ? '#22c55e' : '#ef4444') }}>
                                {fmt(Math.abs(comp.recommended === 'NEW' ? comp.netPayableNew : comp.netPayableOld))}
                            </div>
                            <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 2 }}>Under {comp.recommended} Regime</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
