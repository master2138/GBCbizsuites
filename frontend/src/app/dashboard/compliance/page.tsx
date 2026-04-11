'use client';
import { useState } from 'react';

const MONTHS = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];

type Deadline = { date: string; task: string; client: string; form: string; status: 'done' | 'due' | 'overdue' | 'upcoming'; };

const DEADLINES: Deadline[] = [
    { date: 'Apr 07', task: 'TDS Deposit — March', client: 'All Deductors', form: 'Challan 281', status: 'done' },
    { date: 'Apr 11', task: 'GSTR-1 — March', client: '22 GST Clients', form: 'GSTR-1', status: 'due' },
    { date: 'Apr 13', task: 'GSTR-1 (QRMP) — Q4', client: '8 QRMP Clients', form: 'GSTR-1', status: 'upcoming' },
    { date: 'Apr 18', task: 'Advance Tax Q1', client: '8 Assessees', form: 'Challan 280', status: 'upcoming' },
    { date: 'Apr 20', task: 'GSTR-3B — March', client: '22 GST Clients', form: 'GSTR-3B', status: 'upcoming' },
    { date: 'Apr 30', task: 'TDS Return — Q4 (24Q/26Q)', client: '15 Deductors', form: '24Q/26Q', status: 'upcoming' },
    { date: 'May 15', task: 'TDS Certificate 16A', client: 'Bulk', form: 'Form 16A', status: 'upcoming' },
    { date: 'May 30', task: 'GST Annual Return', client: '38 Clients', form: 'GSTR-9', status: 'upcoming' },
    { date: 'Jun 07', task: 'TDS Deposit — May', client: 'All Deductors', form: 'Challan 281', status: 'upcoming' },
    { date: 'Jun 15', task: 'Advance Tax Q1 — Corporates', client: '5 Companies', form: 'Challan 280', status: 'upcoming' },
    { date: 'Jul 15', task: 'TDS Return — Q1 (FY 26-27)', client: '15 Deductors', form: '24Q/26Q', status: 'upcoming' },
    { date: 'Jul 31', task: 'ITR Filing Deadline', client: '247 Assessees', form: 'ITR 1-7', status: 'upcoming' },
    { date: 'Sep 30', task: 'Tax Audit Report', client: '44 Assessees', form: 'Form 3CA/3CB/3CD', status: 'upcoming' },
    { date: 'Oct 31', task: 'ITR — Audit Cases', client: '44 Assessees', form: 'ITR', status: 'upcoming' },
    { date: 'Nov 30', task: 'Transfer Pricing Report', client: '3 Companies', form: 'Form 3CEB', status: 'upcoming' },
];

const statusColor = { done: '#22c55e', due: '#f59e0b', overdue: '#ef4444', upcoming: '#60a5fa' };

export default function CompliancePage() {
    const [filter, setFilter] = useState<string>('all');
    const filtered = filter === 'all' ? DEADLINES : DEADLINES.filter(d => d.status === filter);

    return (
        <div className="animate-fadeIn">
            <div style={{ marginBottom: 20 }}>
                <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }} className="gradient-text">Compliance Calendar</h1>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>FY 2025-26 · All Statutory Due Dates · {DEADLINES.length} deadlines</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10, marginBottom: 16 }}>
                {(['done', 'due', 'overdue', 'upcoming'] as const).map(s => (
                    <div key={s} className="glass-card" style={{ padding: 14, borderLeft: `3px solid ${statusColor[s]}`, cursor: 'pointer' }} onClick={() => setFilter(f => f === s ? 'all' : s)}>
                        <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'monospace', color: statusColor[s] }}>{DEADLINES.filter(d => d.status === s).length}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{s}</div>
                    </div>
                ))}
            </div>

            {/* Timeline */}
            <div className="glass-card" style={{ padding: 20 }}>
                {filtered.map((d, i) => (
                    <div key={i} style={{ display: 'flex', gap: 14, padding: '12px 0', borderBottom: i < filtered.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: statusColor[d.status], marginTop: 4, flexShrink: 0 }} />
                        <div style={{ width: 60, fontSize: 12, fontFamily: 'monospace', fontWeight: 700, color: statusColor[d.status] }}>{d.date}</div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 600 }}>{d.task}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>{d.client} · {d.form}</div>
                        </div>
                        <span style={{
                            padding: '3px 10px', borderRadius: 12, fontSize: 10, fontWeight: 700, height: 'fit-content',
                            background: `${statusColor[d.status]}20`, color: statusColor[d.status], textTransform: 'capitalize'
                        }}>{d.status}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
