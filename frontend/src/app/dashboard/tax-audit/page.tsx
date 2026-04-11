'use client';
import { useState } from 'react';

const CLAUSES = [
    { no: '1', title: 'Name of Assessee', mandatory: true, group: 'Basic' },
    { no: '2', title: 'Address', mandatory: true, group: 'Basic' },
    { no: '3', title: 'PAN of Assessee', mandatory: true, group: 'Basic' },
    { no: '4', title: 'Previous Year & Assessment Year', mandatory: true, group: 'Basic' },
    { no: '5', title: 'Status of Assessee', mandatory: true, group: 'Basic' },
    { no: '6', title: 'Relevant Clause of Section 44AB', mandatory: true, group: 'Basic' },
    { no: '7', title: 'Whether Assessee Liable to GST', mandatory: true, group: 'Basic' },
    { no: '8', title: 'Books of Account Maintained', mandatory: true, group: 'Accounts' },
    { no: '9', title: 'Whether Books Examined', mandatory: true, group: 'Accounts' },
    { no: '10', title: 'Whether Same Accounting Policies', mandatory: true, group: 'Accounts' },
    { no: '11', title: 'Method of Accounting', mandatory: true, group: 'Accounts' },
    { no: '12', title: 'Method of Valuation of Stock', mandatory: true, group: 'Accounts' },
    { no: '13', title: 'Capital Account of Partner', mandatory: false, group: 'Accounts' },
    { no: '14', title: 'Amounts Credited to P&L Not Income', mandatory: true, group: 'Income' },
    { no: '15', title: 'Section 28 Income Particulars', mandatory: true, group: 'Income' },
    { no: '16', title: 'Depreciation Allowable u/s 32', mandatory: true, group: 'Deductions' },
    { no: '17', title: 'Amounts Admissible as Deduction', mandatory: true, group: 'Deductions' },
    { no: '18', title: 'Section 40 Disallowances', mandatory: true, group: 'Deductions' },
    { no: '19', title: 'Section 40A Disallowances', mandatory: true, group: 'Deductions' },
    { no: '20', title: 'Deemed Profits u/s 33AB/33ABA/33AC', mandatory: false, group: 'Deductions' },
    { no: '21', title: 'TDS/TCS Deducted & Deposited', mandatory: true, group: 'TDS' },
    { no: '22', title: 'TDS Default Details', mandatory: true, group: 'TDS' },
    { no: '23', title: 'Loans/Deposits u/s 269SS/269T', mandatory: true, group: 'Compliance' },
    { no: '24', title: 'Foreign Transactions u/s 92E', mandatory: false, group: 'Compliance' },
    { no: '25', title: 'Deemed Income - Sec 56(2)(viia)', mandatory: false, group: 'Income' },
    { no: '26', title: 'Section 43B — Statutory Dues', mandatory: true, group: 'Deductions' },
    { no: '27', title: 'Amount of Central Subsidy/Grant', mandatory: false, group: 'Income' },
    { no: '28', title: 'Turnover Gross Receipts Details', mandatory: true, group: 'Income' },
    { no: '29', title: 'Breakdown of Total Expenditure', mandatory: true, group: 'Deductions' },
    { no: '30', title: 'Details of Brought Forward Loss', mandatory: true, group: 'Income' },
    { no: '30A', title: 'Section 115JB/115JC Details', mandatory: false, group: 'Income' },
    { no: '30B', title: 'Primary Adjustment u/s 92CE', mandatory: false, group: 'Compliance' },
    { no: '30C', title: 'GAAR Provisions Applied', mandatory: false, group: 'Compliance' },
    { no: '31', title: 'Particulars of Sec 269ST Violations', mandatory: true, group: 'Compliance' },
    { no: '32', title: 'Section 80 Deductions', mandatory: true, group: 'Deductions' },
    { no: '33', title: 'Sec 92E Report Filed', mandatory: false, group: 'Compliance' },
    { no: '34', title: 'GST Compliance — Sec 44AB(e)', mandatory: true, group: 'Compliance' },
    { no: '34A', title: 'Virtual Digital Asset Details', mandatory: false, group: 'Income' },
    { no: '35', title: 'Quantitative Details - Mfg Concerns', mandatory: false, group: 'Accounts' },
    { no: '36', title: 'Cost Audit Compliance', mandatory: false, group: 'Compliance' },
    { no: '36A', title: 'Nature of Business/Profession', mandatory: true, group: 'Basic' },
    { no: '37', title: 'Whether Share Application Money Received', mandatory: false, group: 'Income' },
    { no: '38', title: 'Net Profit/Loss After Adjustments', mandatory: true, group: 'Income' },
    { no: '44', title: 'Auditor Observations/Qualifications', mandatory: true, group: 'Audit' },
];

type ClauseStatus = Record<string, 'done' | 'wip' | 'pending'>;

export default function TaxAuditPage() {
    const [group, setGroup] = useState<string>('all');
    const [statuses, setStatuses] = useState<ClauseStatus>(() => {
        const s: ClauseStatus = {};
        CLAUSES.forEach((c, i) => { s[c.no] = i < 12 ? 'done' : i < 22 ? 'wip' : 'pending'; });
        return s;
    });

    const groups = ['all', ...Array.from(new Set(CLAUSES.map(c => c.group)))];
    const filtered = group === 'all' ? CLAUSES : CLAUSES.filter(c => c.group === group);
    const done = Object.values(statuses).filter(s => s === 'done').length;
    const wip = Object.values(statuses).filter(s => s === 'wip').length;

    return (
        <div className="animate-fadeIn">
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }} className="gradient-text">Form 3CD — Tax Audit Report</h1>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Section 44AB · {CLAUSES.length} Clauses · Statement of Particulars</p>
            </div>

            {/* Progress */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 20 }}>
                {[
                    { label: 'Completed', value: done, total: CLAUSES.length, color: '#22c55e' },
                    { label: 'In Progress', value: wip, total: CLAUSES.length, color: '#f59e0b' },
                    { label: 'Pending', value: CLAUSES.length - done - wip, total: CLAUSES.length, color: '#ef4444' },
                    { label: 'Mandatory', value: CLAUSES.filter(c => c.mandatory).length, total: CLAUSES.length, color: '#C9A84C' },
                ].map(c => (
                    <div key={c.label} className="glass-card" style={{ padding: 16, borderLeft: `3px solid ${c.color}` }}>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 4 }}>{c.label}</div>
                        <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'monospace', color: c.color }}>
                            {c.value}<span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>/{c.total}</span>
                        </div>
                        <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)', marginTop: 6 }}>
                            <div style={{ height: '100%', borderRadius: 2, background: c.color, width: `${(c.value / c.total) * 100}%` }} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Group Filter */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 16, flexWrap: 'wrap' }}>
                {groups.map(g => (
                    <button key={g} onClick={() => setGroup(g)} style={{
                        padding: '6px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                        background: group === g ? 'var(--accent-gradient)' : 'rgba(255,255,255,0.04)',
                        color: group === g ? '#07091A' : 'var(--text-secondary)',
                    }}>{g.charAt(0).toUpperCase() + g.slice(1)}</button>
                ))}
            </div>

            {/* Clause List */}
            <div className="glass-card" style={{ padding: 20 }}>
                {filtered.map(c => (
                    <div key={c.no} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
                        <button onClick={() => setStatuses(p => ({
                            ...p, [c.no]: p[c.no] === 'pending' ? 'wip' : p[c.no] === 'wip' ? 'done' : 'pending'
                        }))} style={{
                            width: 28, height: 28, borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 14, flexShrink: 0,
                            background: statuses[c.no] === 'done' ? '#22c55e' : statuses[c.no] === 'wip' ? '#f59e0b' : 'rgba(255,255,255,0.06)',
                            color: statuses[c.no] === 'pending' ? 'var(--text-secondary)' : '#fff',
                        }}>{statuses[c.no] === 'done' ? '✓' : statuses[c.no] === 'wip' ? '◐' : '○'}</button>
                        <div style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 700, color: '#C9A84C', width: 40 }}>{c.no}</div>
                        <div style={{ flex: 1 }}>
                            <span style={{ fontSize: 13 }}>{c.title}</span>
                            {c.mandatory && <span style={{ marginLeft: 6, fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 4, background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>REQUIRED</span>}
                        </div>
                        <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: 'rgba(255,255,255,0.04)', color: 'var(--text-secondary)' }}>{c.group}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
