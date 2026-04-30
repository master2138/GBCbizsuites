'use client';
import { useState } from 'react';
import * as calc from '@/lib/calculators';

const TABS = ['Income Tax', 'HRA', 'EMI', 'SIP', 'PPF', 'GST', 'TDS', 'Gratuity', 'NPS', 'Capital Gains', 'FD', 'RD', 'Depreciation', 'Regime Optimizer', 'Advance Tax', 'Professional Tax', 'Stamp Duty', 'Crypto/VDA Tax'];

export default function CalculatorsPage() {
    const [activeTab, setActiveTab] = useState(0);
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    return (
        <div className="animate-fadeIn">
            <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>Financial Calculators</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>18 calculators for CA professionals — FY 2025-26 rates</p>

            <div style={{ display: 'flex', gap: 8, marginBottom: 32, flexWrap: 'wrap' }}>
                {TABS.map((tab, i) => (
                    <button key={i} className={`tab-button ${activeTab === i ? 'active' : ''}`} onClick={() => { setActiveTab(i); setResult(null); }}>{tab}</button>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                <div className="glass-card" style={{ padding: 24 }}>
                    {activeTab === 0 && <IncomeTaxForm onResult={setResult} loading={loading} setLoading={setLoading} />}
                    {activeTab === 1 && <HRAForm onResult={setResult} loading={loading} setLoading={setLoading} />}
                    {activeTab === 2 && <EMIForm onResult={setResult} loading={loading} setLoading={setLoading} />}
                    {activeTab === 3 && <SIPForm onResult={setResult} loading={loading} setLoading={setLoading} />}
                    {activeTab === 4 && <PPFForm onResult={setResult} loading={loading} setLoading={setLoading} />}
                    {activeTab === 5 && <GSTForm onResult={setResult} loading={loading} setLoading={setLoading} />}
                    {activeTab === 6 && <TDSForm onResult={setResult} loading={loading} setLoading={setLoading} />}
                    {activeTab === 7 && <GratuityForm onResult={setResult} loading={loading} setLoading={setLoading} />}
                    {activeTab === 8 && <NPSForm onResult={setResult} loading={loading} setLoading={setLoading} />}
                    {activeTab === 9 && <CapitalGainsForm onResult={setResult} loading={loading} setLoading={setLoading} />}
                    {activeTab === 10 && <FDForm onResult={setResult} loading={loading} setLoading={setLoading} />}
                    {activeTab === 11 && <RDForm onResult={setResult} loading={loading} setLoading={setLoading} />}
                    {activeTab === 12 && <DepreciationForm onResult={setResult} loading={loading} setLoading={setLoading} />}
                    {activeTab === 13 && <RegimeForm onResult={setResult} loading={loading} setLoading={setLoading} />}
                    {activeTab === 14 && <AdvanceTaxForm onResult={setResult} loading={loading} setLoading={setLoading} />}
                    {activeTab === 15 && <ProfessionalTaxForm onResult={setResult} loading={loading} setLoading={setLoading} />}
                    {activeTab === 16 && <StampDutyForm onResult={setResult} loading={loading} setLoading={setLoading} />}
                    {activeTab === 17 && <CryptoTaxForm onResult={setResult} loading={loading} setLoading={setLoading} />}
                </div>
                <div className="glass-card" style={{ padding: 24 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>📊 Results</h3>
                    {result ? <ResultDisplay data={result} tab={activeTab} /> : <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: 40 }}>Enter values and calculate to see results.</p>}
                </div>
            </div>
        </div>
    );
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>{label}</label>
            {children}
        </div>
    );
}

function IncomeTaxForm({ onResult, loading, setLoading }: any) {
    const [income, setIncome] = useState('');
    const [deductions, setDeductions] = useState('0');
    const [age, setAge] = useState('below_60');
    const doCalc = () => {
        setLoading(true);
        try { onResult(calc.calcIncomeTax({ gross_salary: +income, section_80c: +deductions, age_group: age })); } catch (e: any) { alert(e.message); }
        setLoading(false);
    };
    return (
        <div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>🏛️ Income Tax Calculator</h3>
            <FieldRow label="Gross Salary (₹/year)"><input className="input-field" type="number" value={income} onChange={e => setIncome(e.target.value)} placeholder="1500000" /></FieldRow>
            <FieldRow label="Deductions u/s 80C (₹)"><input className="input-field" type="number" value={deductions} onChange={e => setDeductions(e.target.value)} placeholder="150000" /></FieldRow>
            <FieldRow label="Age Category">
                <select className="input-field" value={age} onChange={e => setAge(e.target.value)}>
                    <option value="below_60">Below 60</option>
                    <option value="60_to_80">60 to 80</option>
                    <option value="above_80">Above 80</option>
                </select>
            </FieldRow>
            <button className="btn-primary" onClick={doCalc} disabled={loading || !income} style={{ width: '100%', justifyContent: 'center' }}>{loading ? '⏳' : '🧮 Calculate'}</button>
        </div>
    );
}

function HRAForm({ onResult, loading, setLoading }: any) {
    const [basic, setBasic] = useState(''); const [hra, setHra] = useState(''); const [rent, setRent] = useState(''); const [metro, setMetro] = useState(true);
    const doCalc = () => {
        setLoading(true);
        try { onResult(calc.calcHRA({ basic_salary: +basic, da: 0, hra_received: +hra, rent_paid: +rent, is_metro: metro })); } catch (e: any) { alert(e.message); }
        setLoading(false);
    };
    return (
        <div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>🏠 HRA Exemption</h3>
            <FieldRow label="Basic Salary (₹/month)"><input className="input-field" type="number" value={basic} onChange={e => setBasic(e.target.value)} placeholder="50000" /></FieldRow>
            <FieldRow label="HRA Received (₹/month)"><input className="input-field" type="number" value={hra} onChange={e => setHra(e.target.value)} placeholder="20000" /></FieldRow>
            <FieldRow label="Rent Paid (₹/month)"><input className="input-field" type="number" value={rent} onChange={e => setRent(e.target.value)} placeholder="15000" /></FieldRow>
            <FieldRow label="Metro City?">
                <div style={{ display: 'flex', gap: 16 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}><input type="radio" checked={metro} onChange={() => setMetro(true)} /> Yes</label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}><input type="radio" checked={!metro} onChange={() => setMetro(false)} /> No</label>
                </div>
            </FieldRow>
            <button className="btn-primary" onClick={doCalc} disabled={loading || !basic} style={{ width: '100%', justifyContent: 'center' }}>{loading ? '⏳' : '🧮 Calculate'}</button>
        </div>
    );
}

function EMIForm({ onResult, loading, setLoading }: any) {
    const [principal, setPrincipal] = useState(''); const [rate, setRate] = useState(''); const [tenure, setTenure] = useState('');
    const doCalc = () => {
        setLoading(true);
        try { onResult(calc.calcEMI({ principal: +principal, annual_rate: +rate, tenure_months: +tenure })); } catch (e: any) { alert(e.message); }
        setLoading(false);
    };
    return (
        <div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>💰 EMI Calculator</h3>
            <FieldRow label="Loan Amount (₹)"><input className="input-field" type="number" value={principal} onChange={e => setPrincipal(e.target.value)} placeholder="5000000" /></FieldRow>
            <FieldRow label="Annual Interest Rate (%)"><input className="input-field" type="number" step="0.1" value={rate} onChange={e => setRate(e.target.value)} placeholder="8.5" /></FieldRow>
            <FieldRow label="Tenure (months)"><input className="input-field" type="number" value={tenure} onChange={e => setTenure(e.target.value)} placeholder="240" /></FieldRow>
            <button className="btn-primary" onClick={doCalc} disabled={loading || !principal} style={{ width: '100%', justifyContent: 'center' }}>{loading ? '⏳' : '🧮 Calculate'}</button>
        </div>
    );
}

function SIPForm({ onResult, loading, setLoading }: any) {
    const [monthly, setMonthly] = useState(''); const [rate, setRate] = useState(''); const [years, setYears] = useState('');
    const doCalc = () => {
        setLoading(true);
        try { onResult(calc.calcSIP({ monthly_investment: +monthly, expected_return_rate: +rate, tenure_years: +years })); } catch (e: any) { alert(e.message); }
        setLoading(false);
    };
    return (
        <div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>📈 SIP Calculator</h3>
            <FieldRow label="Monthly Investment (₹)"><input className="input-field" type="number" value={monthly} onChange={e => setMonthly(e.target.value)} placeholder="5000" /></FieldRow>
            <FieldRow label="Expected Return (% p.a.)"><input className="input-field" type="number" step="0.1" value={rate} onChange={e => setRate(e.target.value)} placeholder="12" /></FieldRow>
            <FieldRow label="Years"><input className="input-field" type="number" value={years} onChange={e => setYears(e.target.value)} placeholder="10" /></FieldRow>
            <button className="btn-primary" onClick={doCalc} disabled={loading || !monthly} style={{ width: '100%', justifyContent: 'center' }}>{loading ? '⏳' : '🧮 Calculate'}</button>
        </div>
    );
}

function PPFForm({ onResult, loading, setLoading }: any) {
    const [annual, setAnnual] = useState(''); const [years, setYears] = useState('15');
    const doCalc = () => {
        setLoading(true);
        try { onResult(calc.calcPPF({ annual_investment: +annual, tenure_years: +years })); } catch (e: any) { alert(e.message); }
        setLoading(false);
    };
    return (
        <div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>🏦 PPF Calculator</h3>
            <FieldRow label="Annual Deposit (₹)"><input className="input-field" type="number" value={annual} onChange={e => setAnnual(e.target.value)} placeholder="150000" /></FieldRow>
            <FieldRow label="Years (min 15)"><input className="input-field" type="number" min="15" value={years} onChange={e => setYears(e.target.value)} /></FieldRow>
            <button className="btn-primary" onClick={doCalc} disabled={loading || !annual} style={{ width: '100%', justifyContent: 'center' }}>{loading ? '⏳' : '🧮 Calculate'}</button>
        </div>
    );
}

function GSTForm({ onResult, loading, setLoading }: any) {
    const [amount, setAmount] = useState(''); const [rate, setRate] = useState('18'); const [type, setType] = useState('exclusive'); const [inter, setInter] = useState(false);
    const doCalc = () => {
        setLoading(true);
        try { onResult(calc.calcGST({ amount: +amount, gst_rate: +rate, is_inclusive: type === 'inclusive', is_inter_state: inter })); } catch (e: any) { alert(e.message); }
        setLoading(false);
    };
    return (
        <div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>📋 GST Calculator</h3>
            <FieldRow label="Amount (₹)"><input className="input-field" type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="10000" /></FieldRow>
            <FieldRow label="GST Rate (%)">
                <select className="input-field" value={rate} onChange={e => setRate(e.target.value)}>
                    <option value="5">5%</option><option value="12">12%</option><option value="18">18%</option><option value="28">28%</option>
                </select>
            </FieldRow>
            <FieldRow label="Calculation Type">
                <div style={{ display: 'flex', gap: 16 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}><input type="radio" checked={type === 'exclusive'} onChange={() => setType('exclusive')} /> Exclusive</label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}><input type="radio" checked={type === 'inclusive'} onChange={() => setType('inclusive')} /> Inclusive</label>
                </div>
            </FieldRow>
            <FieldRow label="Interstate?">
                <div style={{ display: 'flex', gap: 16 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}><input type="radio" checked={!inter} onChange={() => setInter(false)} /> Intrastate (CGST+SGST)</label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}><input type="radio" checked={inter} onChange={() => setInter(true)} /> Interstate (IGST)</label>
                </div>
            </FieldRow>
            <button className="btn-primary" onClick={doCalc} disabled={loading || !amount} style={{ width: '100%', justifyContent: 'center' }}>{loading ? '⏳' : '🧮 Calculate'}</button>
        </div>
    );
}

function ResultDisplay({ data, tab }: { data: any; tab: number }) {
    if (tab === 0) return <IncomeTaxResult data={data} />;
    if (tab === 1) return <HRAResult data={data} />;
    if (tab === 2) return <EMIResult data={data} />;
    if (tab === 3) return <SIPResult data={data} />;
    if (tab === 4) return <PPFResult data={data} />;
    if (tab === 5) return <GSTResult data={data} />;
    if (tab >= 6 && tab <= 13) return <GenericResult data={data} />;
    return null;
}

function ResultRow({ label, value, color, bold }: { label: string; value: string | number; color?: string; bold?: boolean }) {
    const formatted = typeof value === 'number' ? `₹${value.toLocaleString('en-IN')}` : String(value);
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{label}</span>
            <span style={{ fontWeight: bold ? 700 : 600, fontSize: bold ? 18 : 14, color: color || 'var(--text-primary)' }}>{formatted}</span>
        </div>
    );
}

function SlabTable({ slabs, title }: { slabs: any[]; title: string }) {
    return (
        <div style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 14 }}>{title}</div>
            <table style={{ width: '100%', fontSize: 13 }}>
                <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                        <th style={{ textAlign: 'left', padding: '6px 8px', color: 'var(--text-secondary)' }}>Slab</th>
                        <th style={{ textAlign: 'right', padding: '6px 8px', color: 'var(--text-secondary)' }}>Rate</th>
                        <th style={{ textAlign: 'right', padding: '6px 8px', color: 'var(--text-secondary)' }}>Tax</th>
                    </tr>
                </thead>
                <tbody>
                    {slabs.map((s: any, i: number) => (
                        <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <td style={{ padding: '6px 8px' }}>{s.range}</td>
                            <td style={{ textAlign: 'right', padding: '6px 8px', color: 'var(--text-secondary)' }}>{s.rate}</td>
                            <td style={{ textAlign: 'right', padding: '6px 8px', fontWeight: 600, color: s.tax > 0 ? '#ef4444' : 'var(--text-secondary)' }}>₹{Math.round(s.tax).toLocaleString('en-IN')}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function IncomeTaxResult({ data }: { data: any }) {
    const rec = data.recommendation;
    return (
        <div style={{ fontSize: 14 }}>
            <ResultRow label="Total Income" value={data.totalIncome} bold />
            <div style={{ margin: '16px 0', padding: 12, borderRadius: 12, background: rec === 'new_regime' ? 'rgba(34,197,94,0.1)' : 'rgba(59,130,246,0.1)', border: `1px solid ${rec === 'new_regime' ? 'rgba(34,197,94,0.3)' : 'rgba(59,130,246,0.3)'}`, textAlign: 'center' }}>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>💡 Recommended Regime</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: rec === 'new_regime' ? '#22c55e' : '#3b82f6' }}>{rec === 'new_regime' ? 'New Regime' : 'Old Regime'}</div>
                <div style={{ fontSize: 13 }}>You save <strong style={{ color: '#22c55e' }}>₹{data.savings?.toLocaleString('en-IN')}</strong></div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div style={{ background: 'var(--bg-secondary)', borderRadius: 12, padding: 16, border: rec === 'old_regime' ? '2px solid #3b82f6' : '1px solid var(--border-color)' }}>
                    <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 15 }}>🏛️ Old Regime</div>
                    <ResultRow label="Taxable Income" value={data.old_regime?.taxableIncome} />
                    <ResultRow label="Deductions" value={data.old_regime?.totalDeductions} color="#22c55e" />
                    <ResultRow label="Tax" value={data.old_regime?.tax} color="#ef4444" />
                    <ResultRow label="Cess (4%)" value={data.old_regime?.cess} />
                    <ResultRow label="Total Tax" value={data.old_regime?.totalTax} color="#ef4444" bold />
                    <ResultRow label="Effective Rate" value={`${data.old_regime?.effectiveRate}%`} />
                </div>
                <div style={{ background: 'var(--bg-secondary)', borderRadius: 12, padding: 16, border: rec === 'new_regime' ? '2px solid #22c55e' : '1px solid var(--border-color)' }}>
                    <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 15 }}>✨ New Regime</div>
                    <ResultRow label="Taxable Income" value={data.new_regime?.taxableIncome} />
                    <ResultRow label="Std. Deduction" value={data.new_regime?.standardDeduction} color="#22c55e" />
                    <ResultRow label="Tax" value={data.new_regime?.tax} color="#ef4444" />
                    <ResultRow label="Cess (4%)" value={data.new_regime?.cess} />
                    <ResultRow label="Total Tax" value={data.new_regime?.totalTax} color="#ef4444" bold />
                    <ResultRow label="Effective Rate" value={`${data.new_regime?.effectiveRate}%`} />
                </div>
            </div>

            {data.old_regime?.slabs && <SlabTable slabs={data.old_regime.slabs} title="Old Regime Slabs" />}
            {data.new_regime?.slabs && <SlabTable slabs={data.new_regime.slabs} title="New Regime Slabs" />}
        </div>
    );
}

function HRAResult({ data }: { data: any }) {
    return (
        <div>
            <ResultRow label="Annual Basic + DA" value={data.annual?.basicPlusDa} />
            <ResultRow label="Annual HRA Received" value={data.annual?.hra} />
            <ResultRow label="Annual Rent Paid" value={data.annual?.rent} />
            <div style={{ margin: '16px 0', padding: 2, background: 'var(--border-color)', borderRadius: 8 }} />
            <ResultRow label="① Actual HRA" value={data.calculation?.actualHRA} />
            <ResultRow label={`② Rent - 10% of Basic`} value={data.calculation?.rentMinus10Percent} />
            <ResultRow label={`③ ${data.calculation?.percentUsed} of Basic`} value={data.calculation?.percentOfBasic} />
            <div style={{ margin: '16px 0', padding: 2, background: 'var(--border-color)', borderRadius: 8 }} />
            <ResultRow label="HRA Exemption (Min of above)" value={data.exemption} color="#22c55e" bold />
            <ResultRow label="Taxable HRA" value={data.taxableHRA} color="#ef4444" />
            <ResultRow label="Monthly Savings" value={data.monthlySavings} color="#22c55e" />
        </div>
    );
}

function EMIResult({ data }: { data: any }) {
    return (
        <div>
            <ResultRow label="Monthly EMI" value={data.emi} bold color="#3b82f6" />
            <ResultRow label="Loan Amount" value={data.principal} />
            <ResultRow label="Interest Rate" value={`${data.annualRate}% p.a.`} />
            <ResultRow label="Tenure" value={`${data.tenureMonths} months`} />
            <div style={{ margin: '16px 0', padding: 2, background: 'var(--border-color)', borderRadius: 8 }} />
            <ResultRow label="Total Payment" value={data.totalPayment} />
            <ResultRow label="Total Interest" value={data.totalInterest} color="#ef4444" />
            <ResultRow label="Interest/Loan Ratio" value={`${data.interestToLoanRatio}%`} />
        </div>
    );
}

function SIPResult({ data }: { data: any }) {
    return (
        <div>
            <ResultRow label="Future Value" value={data.futureValue} bold color="#22c55e" />
            <ResultRow label="Total Invested" value={data.totalInvested} />
            <ResultRow label="Wealth Gained" value={data.wealthGained} color="#22c55e" />
            <ResultRow label="Monthly Investment" value={data.monthlyInvestment} />
            <ResultRow label="Expected Return" value={`${data.expectedReturnRate}% p.a.`} />
            <ResultRow label="Tenure" value={`${data.tenureYears} years`} />
        </div>
    );
}

function PPFResult({ data }: { data: any }) {
    return (
        <div>
            <ResultRow label="Maturity Value" value={data.maturityValue} bold color="#22c55e" />
            <ResultRow label="Total Invested" value={data.totalInvested} />
            <ResultRow label="Interest Earned" value={data.totalInterest} color="#22c55e" />
            <ResultRow label="Annual Investment" value={data.annualInvestment} />
            <ResultRow label="Interest Rate" value={`${data.interestRate}% p.a.`} />
            <ResultRow label="Tax Saved (80C)" value={data.taxSaved80C} color="#3b82f6" />
        </div>
    );
}

function GSTResult({ data }: { data: any }) {
    return (
        <div>
            <ResultRow label="Base Amount" value={data.baseAmount} />
            <ResultRow label="GST Rate" value={`${data.gstRate}%`} />
            <ResultRow label="GST Amount" value={data.gstAmount} color="#ef4444" bold />
            <ResultRow label="Total Amount" value={data.totalAmount} bold />
            <div style={{ margin: '16px 0', padding: 2, background: 'var(--border-color)', borderRadius: 8 }} />
            <ResultRow label="Type" value={data.isInclusive ? 'Inclusive' : 'Exclusive'} />
            <ResultRow label="Supply" value={data.isInterState ? 'Interstate (IGST)' : 'Intrastate (CGST+SGST)'} />
            {!data.isInterState ? (
                <>
                    <ResultRow label={`CGST (${data.breakdown?.cgstRate}%)`} value={data.breakdown?.cgst} />
                    <ResultRow label={`SGST (${data.breakdown?.sgstRate}%)`} value={data.breakdown?.sgst} />
                </>
            ) : (
                <ResultRow label={`IGST (${data.breakdown?.igstRate}%)`} value={data.breakdown?.igst} />
            )}
        </div>
    );
}

// ── NEW CALCULATOR FORMS ─────────────────────────────────

function TDSForm({ onResult, loading, setLoading }: any) {
    const [section, setSection] = useState('194A');
    const [amount, setAmount] = useState(100000);
    const [pan, setPan] = useState(true);
    const doCalc = () => { setLoading(true); try { onResult(calc.calcTDS({ section, amount, pan_available: pan })); } catch { } setLoading(false); };
    return (<div>
        <FieldRow label="TDS Section"><select className="form-input" value={section} onChange={e => setSection(e.target.value)}>
            {['192', '194A', '194C_IND', '194C_OTH', '194H', '194I_LAND', '194I_EQUIP', '194J_TECH', '194J_PROF', '194Q', '194R', '194S'].map(s => <option key={s} value={s}>{s}</option>)}
        </select></FieldRow>
        <FieldRow label="Amount (₹)"><input className="form-input" type="number" value={amount} onChange={e => setAmount(+e.target.value)} /></FieldRow>
        <FieldRow label="PAN Available"><select className="form-input" value={pan ? 'yes' : 'no'} onChange={e => setPan(e.target.value === 'yes')}><option value="yes">Yes</option><option value="no">No (20% rate)</option></select></FieldRow>
        <button className="btn-primary" onClick={doCalc} disabled={loading} style={{ width: '100%', marginTop: 12 }}>{loading ? 'Calculating...' : 'Calculate TDS'}</button>
    </div>);
}

function GratuityForm({ onResult, loading, setLoading }: any) {
    const [salary, setSalary] = useState(50000);
    const [years, setYears] = useState(10);
    const [covered, setCovered] = useState(true);
    const doCalc = () => { setLoading(true); try { onResult(calc.calcGratuity({ last_drawn_salary: salary, years_of_service: years, is_covered: covered })); } catch { } setLoading(false); };
    return (<div>
        <FieldRow label="Last Drawn Basic+DA (₹)"><input className="form-input" type="number" value={salary} onChange={e => setSalary(+e.target.value)} /></FieldRow>
        <FieldRow label="Years of Service"><input className="form-input" type="number" value={years} onChange={e => setYears(+e.target.value)} /></FieldRow>
        <FieldRow label="Covered Under Act"><select className="form-input" value={covered ? 'yes' : 'no'} onChange={e => setCovered(e.target.value === 'yes')}><option value="yes">Yes (10+ employees)</option><option value="no">No</option></select></FieldRow>
        <button className="btn-primary" onClick={doCalc} disabled={loading} style={{ width: '100%', marginTop: 12 }}>{loading ? 'Calculating...' : 'Calculate Gratuity'}</button>
    </div>);
}

function NPSForm({ onResult, loading, setLoading }: any) {
    const [monthly, setMonthly] = useState(5000);
    const [employer, setEmployer] = useState(5000);
    const [years, setYears] = useState(25);
    const [rate, setRate] = useState(10);
    const doCalc = () => { setLoading(true); try { onResult(calc.calcNPS({ monthly_contribution: monthly, employer_contribution: employer, years, expected_return: rate })); } catch { } setLoading(false); };
    return (<div>
        <FieldRow label="Monthly Contribution (₹)"><input className="form-input" type="number" value={monthly} onChange={e => setMonthly(+e.target.value)} /></FieldRow>
        <FieldRow label="Employer Contribution (₹)"><input className="form-input" type="number" value={employer} onChange={e => setEmployer(+e.target.value)} /></FieldRow>
        <FieldRow label="Investment Period (yrs)"><input className="form-input" type="number" value={years} onChange={e => setYears(+e.target.value)} /></FieldRow>
        <FieldRow label="Expected Return (%)"><input className="form-input" type="number" step="0.5" value={rate} onChange={e => setRate(+e.target.value)} /></FieldRow>
        <button className="btn-primary" onClick={doCalc} disabled={loading} style={{ width: '100%', marginTop: 12 }}>{loading ? 'Calculating...' : 'Calculate NPS'}</button>
    </div>);
}

function CapitalGainsForm({ onResult, loading, setLoading }: any) {
    const [assetType, setAssetType] = useState('Equity Shares');
    const [buyPrice, setBuyPrice] = useState(100000);
    const [sellPrice, setSellPrice] = useState(200000);
    const [holdMonths, setHoldMonths] = useState(24);
    const doCalc = () => { setLoading(true); try { onResult(calc.calcCapitalGains({ asset_type: assetType, purchase_price: buyPrice, sale_price: sellPrice, holding_period_months: holdMonths })); } catch { } setLoading(false); };
    return (<div>
        <FieldRow label="Asset Type"><select className="form-input" value={assetType} onChange={e => setAssetType(e.target.value)}>
            {['Equity Shares', 'Equity MF', 'Debt MF', 'Real Estate', 'Gold', 'Other'].map(t => <option key={t}>{t}</option>)}
        </select></FieldRow>
        <FieldRow label="Purchase Price (₹)"><input className="form-input" type="number" value={buyPrice} onChange={e => setBuyPrice(+e.target.value)} /></FieldRow>
        <FieldRow label="Sale Price (₹)"><input className="form-input" type="number" value={sellPrice} onChange={e => setSellPrice(+e.target.value)} /></FieldRow>
        <FieldRow label="Holding Period (months)"><input className="form-input" type="number" value={holdMonths} onChange={e => setHoldMonths(+e.target.value)} /></FieldRow>
        <button className="btn-primary" onClick={doCalc} disabled={loading} style={{ width: '100%', marginTop: 12 }}>{loading ? 'Calculating...' : 'Calculate Capital Gains'}</button>
    </div>);
}

function FDForm({ onResult, loading, setLoading }: any) {
    const [principal, setPrincipal] = useState(500000);
    const [rate, setRate] = useState(7.5);
    const [months, setMonths] = useState(36);
    const [comp, setComp] = useState('quarterly');
    const doCalc = () => { setLoading(true); try { onResult(calc.calcFD({ principal, annual_rate: rate, tenure_months: months, compounding: comp })); } catch { } setLoading(false); };
    return (<div>
        <FieldRow label="Principal (₹)"><input className="form-input" type="number" value={principal} onChange={e => setPrincipal(+e.target.value)} /></FieldRow>
        <FieldRow label="Annual Rate (%)"><input className="form-input" type="number" step="0.1" value={rate} onChange={e => setRate(+e.target.value)} /></FieldRow>
        <FieldRow label="Tenure (months)"><input className="form-input" type="number" value={months} onChange={e => setMonths(+e.target.value)} /></FieldRow>
        <FieldRow label="Compounding"><select className="form-input" value={comp} onChange={e => setComp(e.target.value)}>
            {['monthly', 'quarterly', 'half-yearly', 'annually'].map(c => <option key={c} value={c}>{c}</option>)}
        </select></FieldRow>
        <button className="btn-primary" onClick={doCalc} disabled={loading} style={{ width: '100%', marginTop: 12 }}>{loading ? 'Calculating...' : 'Calculate FD'}</button>
    </div>);
}

function RDForm({ onResult, loading, setLoading }: any) {
    const [monthly, setMonthly] = useState(5000);
    const [rate, setRate] = useState(7);
    const [months, setMonths] = useState(60);
    const doCalc = () => { setLoading(true); try { onResult(calc.calcRD({ monthly_deposit: monthly, annual_rate: rate, tenure_months: months })); } catch { } setLoading(false); };
    return (<div>
        <FieldRow label="Monthly Deposit (₹)"><input className="form-input" type="number" value={monthly} onChange={e => setMonthly(+e.target.value)} /></FieldRow>
        <FieldRow label="Annual Rate (%)"><input className="form-input" type="number" step="0.1" value={rate} onChange={e => setRate(+e.target.value)} /></FieldRow>
        <FieldRow label="Tenure (months)"><input className="form-input" type="number" value={months} onChange={e => setMonths(+e.target.value)} /></FieldRow>
        <button className="btn-primary" onClick={doCalc} disabled={loading} style={{ width: '100%', marginTop: 12 }}>{loading ? 'Calculating...' : 'Calculate RD'}</button>
    </div>);
}

function DepreciationForm({ onResult, loading, setLoading }: any) {
    const [cost, setCost] = useState(1000000);
    const [assetType, setAssetType] = useState('Computer/Software');
    const [method, setMethod] = useState('WDV');
    const [years, setYears] = useState(5);
    const doCalc = () => { setLoading(true); try { onResult(calc.calcDepreciation({ asset_cost: cost, asset_type: assetType, method, years_to_calculate: years })); } catch { } setLoading(false); };
    return (<div>
        <FieldRow label="Asset Cost (₹)"><input className="form-input" type="number" value={cost} onChange={e => setCost(+e.target.value)} /></FieldRow>
        <FieldRow label="Asset Type"><select className="form-input" value={assetType} onChange={e => setAssetType(e.target.value)}>
            {['Building - Residential', 'Building - Commercial', 'Furniture & Fittings', 'Plant & Machinery (General)', 'Motor Car', 'Computer/Software', 'Books (Annual)', 'Books (Professional)', 'Intangible Assets'].map(t => <option key={t}>{t}</option>)}
        </select></FieldRow>
        <FieldRow label="Method"><select className="form-input" value={method} onChange={e => setMethod(e.target.value)}>
            <option value="WDV">WDV (IT Act)</option><option value="SLM">SLM (Companies Act)</option>
        </select></FieldRow>
        <FieldRow label="Years"><input className="form-input" type="number" value={years} onChange={e => setYears(+e.target.value)} /></FieldRow>
        <button className="btn-primary" onClick={doCalc} disabled={loading} style={{ width: '100%', marginTop: 12 }}>{loading ? 'Calculating...' : 'Calculate Depreciation'}</button>
    </div>);
}

function RegimeForm({ onResult, loading, setLoading }: any) {
    const [f, setF] = useState({ gross_salary: 1200000, other_income: 0, hra_exemption: 120000, lta: 0, professional_tax: 2400, section_80c: 150000, section_80d_self: 25000, section_80d_parents: 0, section_80e: 0, section_80tta: 10000, home_loan_interest: 0, nps_80ccd: 50000, nps_employer: 0, other_deductions: 0 });
    const set = (k: string, v: number) => setF({ ...f, [k]: v });
    const doCalc = () => { setLoading(true); try { onResult(calc.calcRegimeOptimizer(f)); } catch { } setLoading(false); };
    return (<div style={{ fontSize: 13 }}>
        <FieldRow label="Gross Salary (₹)"><input className="form-input" type="number" value={f.gross_salary} onChange={e => set('gross_salary', +e.target.value)} /></FieldRow>
        <FieldRow label="Other Income (₹)"><input className="form-input" type="number" value={f.other_income} onChange={e => set('other_income', +e.target.value)} /></FieldRow>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-primary)', margin: '8px 0 4px' }}>Old Regime Deductions</div>
        <FieldRow label="HRA Exemption"><input className="form-input" type="number" value={f.hra_exemption} onChange={e => set('hra_exemption', +e.target.value)} /></FieldRow>
        <FieldRow label="Sec 80C"><input className="form-input" type="number" value={f.section_80c} onChange={e => set('section_80c', +e.target.value)} /></FieldRow>
        <FieldRow label="80D (Self)"><input className="form-input" type="number" value={f.section_80d_self} onChange={e => set('section_80d_self', +e.target.value)} /></FieldRow>
        <FieldRow label="80D (Parents)"><input className="form-input" type="number" value={f.section_80d_parents} onChange={e => set('section_80d_parents', +e.target.value)} /></FieldRow>
        <FieldRow label="80TTA"><input className="form-input" type="number" value={f.section_80tta} onChange={e => set('section_80tta', +e.target.value)} /></FieldRow>
        <FieldRow label="Home Loan Int."><input className="form-input" type="number" value={f.home_loan_interest} onChange={e => set('home_loan_interest', +e.target.value)} /></FieldRow>
        <FieldRow label="NPS (80CCD)"><input className="form-input" type="number" value={f.nps_80ccd} onChange={e => set('nps_80ccd', +e.target.value)} /></FieldRow>
        <button className="btn-primary" onClick={doCalc} disabled={loading} style={{ width: '100%', marginTop: 12 }}>{loading ? 'Analyzing...' : '⚡ Compare Old vs New Regime'}</button>
    </div>);
}

function AdvanceTaxForm({ onResult, loading, setLoading }: any) {
    const [liability, setLiability] = useState('');
    const [tds, setTds] = useState('0');
    const doCalc = () => {
        setLoading(true);
        try { onResult(calc.calcAdvanceTax({ total_tax_liability: +liability, tds_deducted: +tds })); } catch (e: any) { alert(e.message); }
        setLoading(false);
    };
    return (<div>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>📅 Advance Tax Calculator</h3>
        <FieldRow label="Total Tax Liability (₹)"><input className="input-field" type="number" value={liability} onChange={e => setLiability(e.target.value)} placeholder="500000" /></FieldRow>
        <FieldRow label="TDS Already Deducted (₹)"><input className="input-field" type="number" value={tds} onChange={e => setTds(e.target.value)} placeholder="120000" /></FieldRow>
        <button className="btn-primary" onClick={doCalc} disabled={loading} style={{ width: '100%', marginTop: 12 }}>{loading ? 'Calculating...' : '📅 Calculate Quarterly Instalments'}</button>
    </div>);
}

function ProfessionalTaxForm({ onResult, loading, setLoading }: any) {
    const [salary, setSalary] = useState('');
    const [state, setState] = useState('maharashtra');
    const doCalc = () => {
        setLoading(true);
        try { onResult(calc.calcProfessionalTax({ monthly_salary: +salary, state })); } catch (e: any) { alert(e.message); }
        setLoading(false);
    };
    return (<div>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>🏢 Professional Tax Calculator</h3>
        <FieldRow label="Monthly Salary (₹)"><input className="input-field" type="number" value={salary} onChange={e => setSalary(e.target.value)} placeholder="50000" /></FieldRow>
        <FieldRow label="State">
            <select className="input-field" value={state} onChange={e => setState(e.target.value)}>
                <option value="maharashtra">Maharashtra</option>
                <option value="karnataka">Karnataka</option>
                <option value="west_bengal">West Bengal</option>
                <option value="tamil_nadu">Tamil Nadu</option>
                <option value="gujarat">Gujarat</option>
            </select>
        </FieldRow>
        <button className="btn-primary" onClick={doCalc} disabled={loading} style={{ width: '100%', marginTop: 12 }}>{loading ? 'Calculating...' : '🏢 Calculate Professional Tax'}</button>
    </div>);
}

function StampDutyForm({ onResult, loading, setLoading }: any) {
    const [value, setValue] = useState('');
    const [state, setState] = useState('maharashtra');
    const [type, setType] = useState('residential');
    const [isFemale, setIsFemale] = useState(false);
    const doCalc = () => {
        setLoading(true);
        try { onResult(calc.calcStampDuty({ property_value: +value, state, property_type: type, is_female: isFemale })); } catch (e: any) { alert(e.message); }
        setLoading(false);
    };
    return (<div>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>🏠 Stamp Duty Calculator</h3>
        <FieldRow label="Property Value (₹)"><input className="input-field" type="number" value={value} onChange={e => setValue(e.target.value)} placeholder="5000000" /></FieldRow>
        <FieldRow label="State">
            <select className="input-field" value={state} onChange={e => setState(e.target.value)}>
                <option value="maharashtra">Maharashtra</option>
                <option value="karnataka">Karnataka</option>
                <option value="delhi">Delhi</option>
                <option value="tamil_nadu">Tamil Nadu</option>
                <option value="uttar_pradesh">Uttar Pradesh</option>
                <option value="gujarat">Gujarat</option>
                <option value="rajasthan">Rajasthan</option>
                <option value="west_bengal">West Bengal</option>
                <option value="telangana">Telangana</option>
                <option value="kerala">Kerala</option>
            </select>
        </FieldRow>
        <FieldRow label="Property Type">
            <select className="input-field" value={type} onChange={e => setType(e.target.value)}>
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
            </select>
        </FieldRow>
        <FieldRow label="Female Buyer">
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="checkbox" checked={isFemale} onChange={e => setIsFemale(e.target.checked)} />
                Yes (get concession where applicable)
            </label>
        </FieldRow>
        <button className="btn-primary" onClick={doCalc} disabled={loading} style={{ width: '100%', marginTop: 12 }}>{loading ? 'Calculating...' : '🏠 Calculate Stamp Duty'}</button>
    </div>);
}

function CryptoTaxForm({ onResult, loading, setLoading }: any) {
    const [buy, setBuy] = useState('');
    const [sell, setSell] = useState('');
    const [qty, setQty] = useState('1');
    const doCalc = () => {
        setLoading(true);
        try { onResult(calc.calcCryptoTax({ buy_price: +buy, sell_price: +sell, quantity: +qty })); } catch (e: any) { alert(e.message); }
        setLoading(false);
    };
    return (<div>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>🪙 Crypto / VDA Tax (Section 115BBH)</h3>
        <FieldRow label="Buy Price per Unit (₹)"><input className="input-field" type="number" value={buy} onChange={e => setBuy(e.target.value)} placeholder="50000" /></FieldRow>
        <FieldRow label="Sell Price per Unit (₹)"><input className="input-field" type="number" value={sell} onChange={e => setSell(e.target.value)} placeholder="80000" /></FieldRow>
        <FieldRow label="Quantity"><input className="input-field" type="number" value={qty} onChange={e => setQty(e.target.value)} placeholder="2" /></FieldRow>
        <button className="btn-primary" onClick={doCalc} disabled={loading} style={{ width: '100%', marginTop: 12 }}>{loading ? 'Calculating...' : '🪙 Calculate Crypto Tax'}</button>
    </div>);
}

function GenericResult({ data }: { data: any }) {
    if (!data) return null;
    // For regime optimizer, show special layout
    if (data.recommended) {
        const rec = data.recommended;
        return (<div>
            <div style={{ marginBottom: 12, padding: 12, borderRadius: 10, background: rec === 'OLD' ? 'rgba(59,130,246,0.1)' : 'rgba(34,197,94,0.1)', border: `1px solid ${rec === 'OLD' ? 'rgba(59,130,246,0.3)' : 'rgba(34,197,94,0.3)'}`, textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>💡 Recommended</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: rec === 'OLD' ? '#3b82f6' : '#22c55e' }}>{rec} REGIME</div>
                <div style={{ fontSize: 13 }}>Save <strong style={{ color: '#22c55e' }}>₹{data.savings?.toLocaleString('en-IN')}</strong></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div style={{ padding: 10, borderRadius: 8, background: 'var(--bg-secondary)', border: rec === 'OLD' ? '2px solid #3b82f6' : '1px solid var(--border-color)' }}>
                    <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 6 }}>🏛️ Old Regime</div>
                    <ResultRow label="Taxable" value={data.oldRegime?.taxableIncome} />
                    <ResultRow label="Deductions" value={data.oldRegime?.deductions} color="#22c55e" />
                    <ResultRow label="Total Tax" value={data.oldRegime?.totalTax} color="#ef4444" bold />
                </div>
                <div style={{ padding: 10, borderRadius: 8, background: 'var(--bg-secondary)', border: rec === 'NEW' ? '2px solid #22c55e' : '1px solid var(--border-color)' }}>
                    <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 6 }}>✨ New Regime</div>
                    <ResultRow label="Taxable" value={data.newRegime?.taxableIncome} />
                    <ResultRow label="Deductions" value={data.newRegime?.deductions} color="#22c55e" />
                    <ResultRow label="Total Tax" value={data.newRegime?.totalTax} color="#ef4444" bold />
                </div>
            </div>
            <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{data.message}</div>
        </div>);
    }
    // Generic key-value display for other calculators
    const skip = ['allSections', 'availableAssets', 'schedule', 'yearlyBreakdown'];
    const entries = Object.entries(data).filter(([k]) => !skip.includes(k) && typeof data[k] !== 'object');
    return (<div>
        {entries.map(([k, v]: [string, any]) => {
            const label = k.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').replace(/^./, s => s.toUpperCase());
            const isNum = typeof v === 'number';
            const isMoney = isNum && v > 100;
            return <ResultRow key={k} label={label} value={isMoney ? v : String(v)} color={k.includes('tax') || k.includes('tds') || k.includes('Tax') ? '#ef4444' : k.includes('net') || k.includes('maturity') || k.includes('gratuity') ? '#22c55e' : undefined} />;
        })}
        {data.schedule && (<div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>📊 Year-wise Schedule</div>
            <table style={{ width: '100%', fontSize: 11, borderCollapse: 'collapse' }}><thead><tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                {Object.keys(data.schedule[0] || {}).map(h => <th key={h} style={{ padding: '4px 6px', textAlign: 'right', color: 'var(--text-secondary)' }}>{h.replace(/([A-Z])/g, ' $1')}</th>)}
            </tr></thead><tbody>
                    {data.schedule.map((row: any, i: number) => <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        {Object.values(row).map((v: any, j: number) => <td key={j} style={{ padding: '4px 6px', textAlign: 'right' }}>{typeof v === 'number' ? v.toLocaleString('en-IN') : v}</td>)}
                    </tr>)}
                </tbody></table>
        </div>)}
    </div>);
}
